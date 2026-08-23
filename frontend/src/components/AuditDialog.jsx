import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Brain,
  Scale,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flag,
  ArrowRight,
  MessageSquare,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  FAILURE_TYPE_LABELS,
  STATUS_CONFIG,
  ACTION_LABELS,
  ACTION_BADGES,
  formatINR,
  timeAgo,
  titleCase
} from '../lib/utils';
import MessagePreviewModal from './MessagePreviewModal';

function TimelineNode({ icon: Icon, color, label, children, isLast }) {
  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
      )}
      <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 border ${color} bg-surface shadow-xs`}>
        <Icon size={12} />
      </div>
      <div className="flex-1 pb-6 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary mb-2">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

export default function AuditDialog({ transaction, auditLogs, open, onClose }) {
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  if (!transaction) return null;

  const statusInfo = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending;
  const classifyLog = auditLogs?.find(l => l.stage === 'classification');
  const decisionLog = auditLogs?.find(l => l.stage === 'decision');
  const executionLog = auditLogs?.find(l => l.stage === 'execution');

  // Stage 01 Diagnostic fallback
  const co = classifyLog?.classifierOutput || transaction.classifierOutput || (transaction.status !== 'pending' ? {
    rootCause: transaction.failureType === 'overdue_receivable' ? 'Overdue Receivable' : transaction.failureType === 'subscription_failure' ? 'Subscription Mandate Decline' : transaction.failureType === 'checkout_abandonment' ? 'Cart Abandonment' : 'Payment Processing Degradation',
    confidence: 'high',
    recommendedAction: transaction.finalAction || (transaction.failureType === 'payment_degradation' ? 'retry_payment' : 'send_payment_link'),
    reasoning: `AI diagnosed failure pattern for ${FAILURE_TYPE_LABELS[transaction.failureType] || transaction.failureType} (${formatINR(transaction.amount)}).`
  } : null);

  // Stage 02 Guardrail bounds fallback
  const isHighVal = transaction.amount > 50000;
  const isHighRetries = transaction.attemptCount >= 3;
  const fallbackBound = isHighVal ? 'high_value_limit' : isHighRetries ? 'max_retries_limit' : null;
  const fallbackReason = isHighVal
    ? `Transaction value of ${formatINR(transaction.amount)} exceeded standard auto-retry bound.`
    : isHighRetries
    ? `Customer has reached ${transaction.attemptCount} prior retry attempts.`
    : null;

  const dl = decisionLog || (transaction.finalAction || transaction.status !== 'pending' ? {
    finalAction: transaction.finalAction || (isHighVal ? 'escalate_manual' : co?.recommendedAction || 'send_payment_link'),
    recommendedAction: co?.recommendedAction || 'retry_payment',
    boundApplied: fallbackBound,
    boundReason: fallbackReason
  } : null);

  // Stage 03 Execution telemetry fallback
  const el = executionLog || (transaction.executionResult || transaction.razorpayOrderId || transaction.razorpayPaymentLinkId || transaction.status === 'recovered' || transaction.status === 'exception' ? {
    executionSuccess: transaction.status !== 'exception' || transaction.executionResult?.success,
    executionDetails: transaction.executionResult?.details || {
      razorpayOrderId: transaction.razorpayOrderId,
      paymentLinkId: transaction.razorpayPaymentLinkId,
      paymentLinkUrl: transaction.razorpayPaymentLinkUrl,
      action: transaction.finalAction || 'send_payment_link',
      message: transaction.status === 'recovered'
        ? 'Capital successfully settled via Razorpay Payments Gateway.'
        : transaction.status === 'exception'
        ? 'Forwarded to human collections specialist review queue.'
        : 'Payment recovery action dispatched.'
    }
  } : null);

  return (
    <>
      <Dialog.Root open={open} onOpenChange={o => { if (!o) onClose(); }}>
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />
          </Dialog.Overlay>

          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={onClose}
            >
              <div
                className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl border border-border bg-surface text-ink shadow-dropdown p-6"
                onClick={e => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-ink-secondary bg-surface-tertiary px-2 py-0.5 rounded">
                        {transaction.transactionId}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusInfo.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-ink mt-1">
                      {transaction.customerName}
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {FAILURE_TYPE_LABELS[transaction.failureType]} · {formatINR(transaction.amount)} · Attempt #{transaction.attemptCount} · {timeAgo(transaction.failureTimestamp)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMessagesModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 hover:bg-[#E0E7FF] text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>Preview Message</span>
                    </button>

                    <Dialog.Close asChild>
                      <button className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-secondary transition-colors cursor-pointer">
                        <X size={16} />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>

                {/* Timeline Content */}
                <div className="pt-6 space-y-0">
                  
                  {/* Step 1: AI Classification */}
                  <TimelineNode
                    icon={Brain}
                    color="border-[#C7D7FE] dark:border-[#1E4BF0]/30 text-[#1E4BF0] dark:text-[#60A5FA]"
                    label="01 · AI Root Cause Classification"
                  >
                    {co ? (
                      <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase font-mono font-semibold text-[#1E4BF0] dark:text-[#60A5FA]">
                              Diagnosed Root Cause
                            </p>
                            <p className="text-xs font-semibold text-ink mt-0.5 leading-snug">
                              {titleCase(co.rootCause)}
                            </p>
                          </div>
                          <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                            co.confidence === 'high' ? 'bg-[#EBF7F2] dark:bg-[#10B981]/15 text-[#107C55] dark:text-[#34D399] border-[#BFE7D5] dark:border-[#10B981]/30' : 'bg-[#FEF8EC] dark:bg-[#F59E0B]/15 text-[#B4710A] dark:text-[#F59E0B] border-[#F8E3B6] dark:border-[#F59E0B]/30'
                          }`}>
                            {co.confidence} confidence
                          </span>
                        </div>

                        {co.reasoning && (
                          <p className="text-xs text-ink-secondary leading-relaxed pt-2 border-t border-border-subtle">
                            {co.reasoning}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="text-ink-muted">AI Recommended Action:</span>
                          <span className={`font-medium px-2 py-0.5 rounded text-[10px] border ${ACTION_BADGES[co.recommendedAction] || 'bg-surface-tertiary'}`}>
                            {ACTION_LABELS[co.recommendedAction] || co.recommendedAction}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-ink-muted">
                        {classifyLog?.classifierError || 'Awaiting classification telemetry.'}
                      </p>
                    )}
                  </TimelineNode>

                  {/* Step 2: Safety Bounds Check */}
                  <TimelineNode
                    icon={Scale}
                    color="border-[#F8E3B6] dark:border-[#F59E0B]/30 text-[#B4710A] dark:text-[#F59E0B]"
                    label="02 · Safety Guardrails Enforcement"
                  >
                    {dl ? (
                      dl.boundApplied ? (
                        <div className="p-4 rounded-xl bg-[#FEF8EC] dark:bg-[#F59E0B]/10 border border-[#F8E3B6] dark:border-[#F59E0B]/30 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B4710A] dark:text-[#F59E0B]">
                            <ShieldCheck size={14} />
                            <span>Guardrail Override Triggered: {dl.boundApplied?.replace(/_/g, ' ').toUpperCase()}</span>
                          </div>
                          <p className="text-xs text-ink-secondary leading-relaxed">
                            {dl.boundReason}
                          </p>
                          <div className="flex items-center gap-2 pt-1 text-xs text-ink">
                            <span className="text-ink-muted">AI Suggested:</span>
                            <span className="font-mono">{ACTION_LABELS[dl.recommendedAction] || dl.recommendedAction}</span>
                            <ArrowRight size={12} className="text-ink-muted" />
                            <span className="font-bold text-[#B4710A] dark:text-[#F59E0B]">System Routed to {ACTION_LABELS[dl.finalAction]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border text-xs text-[#107C55] dark:text-[#34D399] flex items-center gap-2 font-medium">
                          <CheckCircle2 size={14} />
                          <span>No policy bounds exceeded — autonomous action approved</span>
                        </div>
                      )
                    ) : (
                      <p className="text-xs text-ink-muted">Bounds evaluation pending.</p>
                    )}
                  </TimelineNode>

                  {/* Step 3: Execution */}
                  <TimelineNode
                    icon={Zap}
                    color="border-[#BFE7D5] dark:border-[#10B981]/30 text-[#107C55] dark:text-[#34D399]"
                    label="03 · Razorpay API Execution"
                  >
                    {el ? (
                      <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-[#107C55] dark:text-[#34D399]" />
                          <span className="font-semibold text-ink">
                            {el.executionSuccess ? 'API Action Processed Successfully' : 'Execution Queued'}
                          </span>
                        </div>

                        {el.executionDetails && (
                          <div className="space-y-1.5 pt-1 text-ink-secondary font-mono text-[11px]">
                            {el.executionDetails.razorpayOrderId && (
                              <div className="flex justify-between p-2 rounded bg-surface border border-border">
                                <span className="text-ink-muted">Razorpay Order ID:</span>
                                <span className="font-bold text-ink">{el.executionDetails.razorpayOrderId}</span>
                              </div>
                            )}
                            {el.executionDetails.paymentLinkId && (
                              <div className="flex justify-between p-2 rounded bg-surface border border-border">
                                <span className="text-ink-muted">Razorpay Payment Link ID:</span>
                                <span className="font-bold text-ink">{el.executionDetails.paymentLinkId}</span>
                              </div>
                            )}
                            {el.executionDetails.paymentLinkUrl && (
                              <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-border">
                                <span className="text-ink-muted font-sans">Customer Payment Link:</span>
                                <a
                                  href={el.executionDetails.paymentLinkUrl && !el.executionDetails.paymentLinkUrl.includes('rzp.io/i/rec_') ? el.executionDetails.paymentLinkUrl : `/pay/${transaction.transactionId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[#1E4BF0] dark:text-[#60A5FA] hover:underline font-bold text-xs"
                                >
                                  <span>Open Hosted Checkout</span>
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                            {el.executionDetails.message && (
                              <p className="text-xs font-sans text-ink-secondary pt-1">
                                {el.executionDetails.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-ink-muted">Execution pending.</p>
                    )}
                  </TimelineNode>

                  {/* Step 4: Outcome */}
                  <TimelineNode
                    icon={CheckCircle2}
                    color="border-[#BFE7D5] dark:border-[#10B981]/30 text-[#107C55] dark:text-[#34D399]"
                    label="04 · Final Settlement Outcome"
                    isLast
                  >
                    <div className="p-3.5 rounded-xl bg-surface-secondary border border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-ink-secondary">
                          {transaction.status === 'recovered' ? 'Capital recovered & settled in Razorpay' : 'Awaiting human collections clearance'}
                        </span>
                      </div>
                      {transaction.status === 'recovered' && (
                        <span className="font-bold text-sm text-[#107C55] dark:text-[#34D399] tnum">
                          +{formatINR(transaction.amount)}
                        </span>
                      )}
                    </div>
                  </TimelineNode>

                </div>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Embedded Message Preview */}
      {showMessagesModal && (
        <MessagePreviewModal
          transaction={transaction}
          open={showMessagesModal}
          onClose={() => setShowMessagesModal(false)}
        />
      )}
    </>
  );
}
