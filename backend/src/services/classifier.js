const Groq = require('groq-sdk');
const AuditLog = require('../models/AuditLog');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// allam-2-7b: small fast model, low token usage — fits within 8k TPM limit
const GROQ_MODEL = 'allam-2-7b';

// Minimal system prompt — keep token count as low as possible
const SYSTEM_PROMPT = `You are a payment recovery classifier. Respond with ONLY a JSON object, no other text.

Rules:
- If data is unclear or confidence is low, use flag_ambiguous
- retry_payment: transient bank/gateway technical error (timeout, do_not_honour)  
- send_payment_link: checkout abandonment, insufficient funds, expired card, CVV fail
- escalate_manual: B2B overdue invoice, fraud suspected, high complexity
- flag_ambiguous: missing data, contradictory signals, uncertain

JSON format (nothing else):
{"rootCause":"<10 words","confidence":"high|medium|low","recommendedAction":"retry_payment|send_payment_link|escalate_manual|flag_ambiguous","reasoning":"<15 words"}`;

/**
 * Sleep for ms milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Strip think tags and extract JSON from model response
 */
function extractJSON(rawText) {
  // Remove <think>...</think> blocks
  let text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Remove markdown fences
  text = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/gi, '').trim();
  // Extract first {...} block
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return text.trim();
}

/**
 * Call Groq with automatic retry on 429 rate limit errors.
 * Reads the retry-after from the error message and waits.
 */
async function callGroqWithRetry(messages, maxRetries = 5) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: 0.1,
        max_tokens: 256  // Small model, short output — stays well under TPM limit
      });
      return completion.choices[0]?.message?.content || '';
    } catch (err) {
      const is429 = err.status === 429 || (err.message && err.message.includes('rate_limit_exceeded'));
      if (is429 && attempt < maxRetries) {
        // Parse retry-after seconds from error message
        const match = err.message && err.message.match(/Please try again in ([\d.]+)s/);
        const waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : 15000;
        console.log(`[Classifier] Rate limited — waiting ${(waitMs/1000).toFixed(1)}s before retry ${attempt + 1}/${maxRetries}...`);
        await sleep(waitMs);
        attempt++;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded for Groq API');
}

/**
 * Classify a single transaction using Groq
 */
async function classifyTransaction(transaction) {
  const transactionData = {
    id: transaction.transactionId,
    amount: transaction.amount,
    type: transaction.failureType,
    attemptCount: transaction.attemptCount,
    metadata: transaction.metadata
  };

  const auditEntry = new AuditLog({
    transactionId: transaction.transactionId,
    stage: 'classification',
    classifierInput: transactionData
  });

  try {
    const rawText = await callGroqWithRetry([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Classify: ${JSON.stringify(transactionData)}` }
    ]);

    const cleanedText = extractJSON(rawText);
    let parsed;

    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.warn(`[Classifier] Parse failed for ${transaction.transactionId}: ${parseErr.message}`);
      parsed = {
        rootCause: 'Parse error in model response',
        confidence: 'low',
        recommendedAction: 'flag_ambiguous',
        reasoning: 'Response could not be parsed'
      };
    }

    // Sanitize
    const validActions = ['retry_payment', 'send_payment_link', 'escalate_manual', 'flag_ambiguous'];
    const validConf = ['high', 'medium', 'low'];
    if (!validActions.includes(parsed.recommendedAction)) parsed.recommendedAction = 'flag_ambiguous';
    if (!validConf.includes(parsed.confidence)) parsed.confidence = 'low';

    const output = {
      rootCause: String(parsed.rootCause || 'Unknown').slice(0, 120),
      confidence: parsed.confidence,
      recommendedAction: parsed.recommendedAction,
      reasoning: String(parsed.reasoning || '').slice(0, 200)
    };

    auditEntry.classifierOutput = output;
    await auditEntry.save();

    console.log(`[Classifier] ${transaction.transactionId} → ${output.recommendedAction} (${output.confidence})`);
    return output;

  } catch (err) {
    console.error(`[Classifier] Failed for ${transaction.transactionId}: ${err.message}`);
    const fallback = {
      rootCause: 'Classifier service error',
      confidence: 'low',
      recommendedAction: 'flag_ambiguous',
      reasoning: 'API call failed after retries. Manual review required.'
    };
    auditEntry.classifierOutput = fallback;
    auditEntry.classifierError = err.message;
    await auditEntry.save();
    return fallback;
  }
}

module.exports = { classifyTransaction };
