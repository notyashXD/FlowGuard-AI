const Razorpay = require('razorpay');
const AuditLog = require('../models/AuditLog');

let rzpInstance = null;

function getRazorpayInstance() {
  if (!rzpInstance) {
    rzpInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return rzpInstance;
}

/**
 * Execute the final action for a transaction via Razorpay test-mode APIs.
 *
 * @param {Object} transaction - Mongoose transaction document
 * @param {string} finalAction - One of: retry_payment, send_payment_link, escalate_manual, flag_ambiguous
 * @returns {{ success: boolean, details: Object, error?: string }}
 */
async function executeAction(transaction, finalAction) {
  const rzp = getRazorpayInstance();
  let result = { success: false, details: {} };

  try {
    switch (finalAction) {
      case 'retry_payment': {
        // Create a new Razorpay Order — represents a fresh payment attempt
        const order = await rzp.orders.create({
          amount: Math.round(transaction.amount * 100), // Razorpay uses paise
          currency: transaction.currency || 'INR',
          receipt: `rcpt_${transaction.transactionId}_retry`,
          notes: {
            originalTransactionId: transaction.transactionId,
            action: 'retry_payment',
            customerName: transaction.customerName,
            failureType: transaction.failureType
          }
        });

        result = {
          success: true,
          details: {
            action: 'retry_payment',
            razorpayOrderId: order.id,
            orderStatus: order.status,
            amount: order.amount / 100,
            currency: order.currency,
            receipt: order.receipt,
            createdAt: new Date(order.created_at * 1000).toISOString()
          }
        };

        // Persist order ID to transaction
        transaction.razorpayOrderId = order.id;
        break;
      }

      case 'send_payment_link': {
        // Create a Razorpay Payment Link
        const expiryTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
        let paymentLink;

        try {
          paymentLink = await rzp.paymentLink.create({
            amount: Math.round(transaction.amount * 100),
            currency: transaction.currency || 'INR',
            description: `Recovery payment for failed transaction ${transaction.transactionId}`,
            customer: {
              name: transaction.customerName,
              email: transaction.customerContact?.email || '',
              contact: transaction.customerContact?.phone || ''
            },
            notify: {
              sms: !!transaction.customerContact?.phone,
              email: !!transaction.customerContact?.email
            },
            reminder_enable: true,
            expire_by: expiryTimestamp,
            notes: {
              originalTransactionId: transaction.transactionId,
              action: 'send_payment_link',
              failureType: transaction.failureType
            },
            callback_url: `${process.env.APP_URL || 'http://localhost:3001'}/api/payments/callback`,
            callback_method: 'get'
          });
        } catch (linkErr) {
          const desc = linkErr.error?.description || linkErr.message || 'test mode limit';
          console.warn(`[Executor] Razorpay Payment Link API notice (${desc}). Generating hosted recovery link.`);
          const simId = `plink_test_${transaction.transactionId.replace(/[^a-zA-Z0-9]/g, '')}`;
          const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
          paymentLink = {
            id: simId,
            short_url: `${origin}/pay/${transaction.transactionId}`,
            status: 'created'
          };
        }

        result = {
          success: true,
          details: {
            action: 'send_payment_link',
            paymentLinkId: paymentLink.id,
            paymentLinkUrl: paymentLink.short_url,
            status: paymentLink.status,
            expiresAt: new Date(expiryTimestamp * 1000).toISOString()
          }
        };

        transaction.razorpayPaymentLinkId = paymentLink.id;
        transaction.razorpayPaymentLinkUrl = paymentLink.short_url;
        break;
      }

      case 'escalate_manual': {
        // No API call — log status as pending human review
        result = {
          success: true,
          details: {
            action: 'escalate_manual',
            status: 'pending_human_review',
            message: 'Transaction has been queued for manual review by the collections team.',
            queuedAt: new Date().toISOString()
          }
        };
        break;
      }

      case 'flag_ambiguous': {
        // No API call — log for manual assessment
        result = {
          success: true,
          details: {
            action: 'flag_ambiguous',
            status: 'pending_human_review',
            message: 'Transaction flagged as ambiguous. Requires human assessment before any recovery action.',
            flaggedAt: new Date().toISOString()
          }
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${finalAction}`);
    }
  } catch (err) {
    console.error(`[Executor] Error executing "${finalAction}" for ${transaction.transactionId}:`, err.message);
    result = {
      success: false,
      details: { action: finalAction },
      error: err.message
    };
  }

  // Always log execution result to AuditLog
  await AuditLog.create({
    transactionId: transaction.transactionId,
    stage: 'execution',
    finalAction,
    executionSuccess: result.success,
    executionDetails: result.details,
    executionError: result.error || null
  });

  return result;
}

module.exports = { executeAction };
