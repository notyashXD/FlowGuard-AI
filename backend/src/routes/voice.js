const express = require('express');
const router = express.Router();
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const https = require('https');

// Audio cache to serve instant replays
const audioCache = new Map();

const HINGLISH_DICTIONARY = {
  'namaste': 'नमस्ते',
  'namaskar': 'नमस्कार',
  'ji': 'जी',
  'main': 'मैं',
  'hum': 'हम',
  'razorpay': 'रेज़रपे',
  'support': 'सपोर्ट',
  'desk': 'डेस्क',
  'assistant': 'असिस्टेंट',
  'ananya': 'अनन्या',
  'aarav': 'आरव',
  'priya': 'प्रिया',
  'rahul': 'राहुल',
  'sneha': 'स्नेहा',
  'vikram': 'विक्रम',
  'rohan': 'रोहन',
  'kavya': 'काव्या',
  'arjun': 'अर्जुन',
  'divya': 'दिव्या',
  'karthik': 'कार्तिक',
  'neha': 'नेहा',
  'siddharth': 'सिद्धार्थ',
  'riya': 'रिया',
  'aditya': 'आदित्य',
  'shreya': 'श्रेया',
  'manish': 'मनीष',
  'pooja': 'पूजा',
  'akash': 'आकाश',
  'swati': 'स्वाति',
  'rajesh': 'राजेश',
  'meera': 'मीरा',
  'varun': 'वरुण',
  'ishita': 'इशिता',
  'nikhil': 'निखिल',
  'bhavna': 'भावना',
  'tarun': 'तरुण',
  'ankita': 'अंकिता',
  'simran': 'सिमरन',
  'suresh': 'सुरेश',
  'gaurav': 'गौरव',
  'amit': 'अमित',
  'shweta': 'श्वेता',
  'vinod': 'विनोद',
  'deepa': 'दीपा',
  'se': 'से',
  'bol': 'बोल',
  'rahi': 'रही',
  'raha': 'रहा',
  'hoon': 'हूँ',
  'hu': 'हूँ',
  'hai': 'है',
  'hain': 'हैं',
  'ho': 'हो',
  'aapka': 'आपका',
  'aapke': 'आपके',
  'aapki': 'आपकी',
  'apka': 'आपका',
  'apke': 'आपके',
  'apki': 'आपकी',
  'ke': 'के',
  'liye': 'लिए',
  'ka': 'का',
  'ki': 'की',
  'ko': 'को',
  'mein': 'में',
  'me': 'में',
  'order': 'ऑर्डर',
  'payment': 'पेमेंट',
  'pending': 'पेंडिंग',
  'reh': 'रह',
  'gaya': 'गया',
  'gayi': 'गयी',
  'tha': 'था',
  'thi': 'थी',
  'the': 'थे',
  'kya': 'क्या',
  'aap': 'आप',
  'is': 'इस',
  'ise': 'इसे',
  'abhi': 'अभी',
  'complete': 'कम्प्लीट',
  'karna': 'करना',
  'chahte': 'चाहते',
  'chahti': 'चाहती',
  'instant': 'इंस्टेंट',
  'whatsapp': 'व्हाट्सएप्प',
  'upi': 'यू पी आई',
  'link': 'लिंक',
  'paane': 'पाने',
  'pane': 'पाने',
  'bhejne': 'भेजने',
  'dabayein': 'दबाइए',
  'dabaye': 'दबाइए',
  'press': 'दबाइए',
  'ya': 'या',
  'callback': 'कॉल बैक',
  'date': 'तारीख',
  'commit': 'कमिट',
  'karne': 'करने',
  'dhanyawaad': 'धन्यवाद',
  'dhanyavad': 'धन्यवाद',
  'shukriya': 'शुक्रिया',
  'thank': 'थैंक',
  'you': 'यू',
  '1': 'एक',
  '2': 'दो',
  '3': 'तीन',
  'one': 'एक',
  'two': 'दो',
  'three': 'तीन',
  'call': 'कॉल',
  'subscription': 'सब्सक्रिप्शन',
  'invoice': 'इनवॉइस',
  'card': 'कार्ड',
  'bank': 'बैंक',
  'fail': 'फेल',
  'failed': 'फेल',
  'decline': 'डिक्लाइन',
  'timeout': 'टाइमआउट',
  'rupaye': 'रुपये',
  'rupees': 'रुपये',
  'rs': 'रुपये',
  'inr': 'रुपये',
  'hazar': 'हज़ार',
  'sau': 'सौ',
  'service': 'सर्विस',
  'interruption': 'रुकावट',
  'bachne': 'बचने',
  'humne': 'हमने',
  'forward': 'फॉरवर्ड',
  'kiya': 'किया',
  'verify': 'वेरीफाई'
};

function toHinglishPhoneticDevanagari(text) {
  if (!text) return '';
  return text
    .split(/\s+/)
    .map(word => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mapped = HINGLISH_DICTIONARY[clean];
      if (mapped) {
        let punc = '';
        if (word.endsWith('!')) punc = '!';
        else if (word.endsWith('?')) punc = '?';
        else if (word.endsWith(',')) punc = ',';
        else if (word.endsWith('.')) punc = '।';
        return mapped + punc;
      }
      return word;
    })
    .join(' ');
}

/**
 * GET /api/voice/synthesize
 * Synthesizes clear, natural human Indian female voice (hi-IN-SwaraNeural at natural +0% rate)
 */
router.get('/synthesize', async (req, res) => {
  try {
    const rawText = req.query.text || 'नमस्ते जी! मैं रेज़रपे सपोर्ट असिस्टेंट अनन्या बोल रही हूँ।';
    const voiceName = req.query.voice === 'neerja' ? 'en-IN-NeerjaNeural' : 'hi-IN-SwaraNeural';
    // Clear, comfortable human conversational rate (+0% natural pace)
    const speechRate = req.query.rate || '+0%';
    
    // Convert Hinglish transliteration to phonetic Hindi for crystal-clear enunciation
    const phoneticHindi = toHinglishPhoneticDevanagari(rawText);
    const speechText = phoneticHindi || rawText;

    const cacheKey = `${voiceName}:${speechRate}:${speechText}`;
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cached);
    }

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const result = await tts.toStream(speechText, { rate: speechRate, pitch: '+0Hz' });

      const chunks = [];
      result.audioStream.on('data', chunk => chunks.push(chunk));
      result.audioStream.on('end', () => {
        const audioBuffer = Buffer.concat(chunks);
        audioCache.set(cacheKey, audioBuffer);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(audioBuffer);
      });
      result.audioStream.on('error', () => {
        fallbackGoogleTTS(speechText, res);
      });
    } catch (err) {
      fallbackGoogleTTS(speechText, res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function fallbackGoogleTTS(text, res) {
  const cleanText = text.slice(0, 280);
  const encoded = encodeURIComponent(cleanText);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encoded}`;

  https.get(
    ttsUrl,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    },
    (ttsRes) => {
      if (ttsRes.statusCode !== 200) {
        return res.status(500).json({ error: 'TTS provider returned error' });
      }
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      ttsRes.pipe(res);
    }
  ).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
}

module.exports = router;
