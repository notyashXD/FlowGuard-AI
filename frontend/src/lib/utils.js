export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatINR(amount) {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function titleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(w => w.length > 0 ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : '')
    .join(' ');
}

export const FAILURE_TYPE_LABELS = {
  payment_degradation: 'Payment Degradation',
  checkout_abandonment: 'Checkout Abandonment',
  subscription_failure: 'Subscription Failure',
  overdue_receivable: 'Overdue Receivable',
};

export const FAILURE_TYPE_SHORT = {
  payment_degradation: 'Degradation',
  checkout_abandonment: 'Abandonment',
  subscription_failure: 'Subscription',
  overdue_receivable: 'Receivable',
};

export const FAILURE_TYPE_BADGE = {
  payment_degradation: 'text-[#8A4A0A] bg-[#FEF6EC] border-[#FADFB8] dark:text-[#FBBF24] dark:bg-[#F59E0B]/15 dark:border-[#F59E0B]/30',
  checkout_abandonment: 'text-[#6938B2] bg-[#F7F2FD] border-[#E5D7FA] dark:text-[#C084FC] dark:bg-[#A855F7]/15 dark:border-[#A855F7]/30',
  subscription_failure: 'text-[#10567A] bg-[#EEF8FC] border-[#C7E9F7] dark:text-[#38BDF8] dark:bg-[#0284C7]/15 dark:border-[#0284C7]/30',
  overdue_receivable: 'text-[#962828] bg-[#FDF3F3] border-[#F6CECE] dark:text-[#F87171] dark:bg-[#EF4444]/15 dark:border-[#EF4444]/30',
};

// Subtle, sophisticated status badges with complete dark mode styles
export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-[#F2F2EE] text-[#60605A] border-[#E2E2DC] dark:bg-[#1E232F] dark:text-[#9DA3B2] dark:border-[#2E3545]',
    dot: 'bg-[#8C8C84] dark:bg-[#646B7D]'
  },
  processing: {
    label: 'Processing',
    badge: 'bg-[#EEF2FF] text-[#1E4BF0] border-[#C7D7FE] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA] dark:border-[#3B82F6]/30',
    dot: 'bg-[#1E4BF0] dark:bg-[#60A5FA] animate-pulse'
  },
  recovered: {
    label: 'Recovered',
    badge: 'bg-[#EBF7F2] text-[#107C55] border-[#BFE7D5] dark:bg-[#10B981]/15 dark:text-[#34D399] dark:border-[#10B981]/30',
    dot: 'bg-[#107C55] dark:bg-[#34D399]'
  },
  exception: {
    label: 'Escalated',
    badge: 'bg-[#FEF8EC] text-[#B4710A] border-[#F8E3B6] dark:bg-[#F59E0B]/15 dark:text-[#FBBF24] dark:border-[#F59E0B]/30',
    dot: 'bg-[#B4710A] dark:bg-[#F59E0B]'
  },
  flagged: {
    label: 'Ambiguous',
    badge: 'bg-[#FDF3F3] text-[#C73535] border-[#F6CECE] dark:bg-[#EF4444]/15 dark:text-[#F87171] dark:border-[#EF4444]/30',
    dot: 'bg-[#C73535] dark:bg-[#EF4444]'
  },
};

export const ACTION_LABELS = {
  retry_payment: 'Smart Retry',
  send_payment_link: 'Send Payment Link',
  escalate_manual: 'Manual Escalation',
  flag_ambiguous: 'Flag for Review',
};

export const ACTION_BADGES = {
  retry_payment: 'text-[#107C55] bg-[#EBF7F2] border-[#BFE7D5] dark:text-[#34D399] dark:bg-[#10B981]/15 dark:border-[#10B981]/30',
  send_payment_link: 'text-[#1E4BF0] bg-[#EEF2FF] border-[#C7D7FE] dark:text-[#60A5FA] dark:bg-[#3B82F6]/15 dark:border-[#3B82F6]/30',
  escalate_manual: 'text-[#B4710A] bg-[#FEF8EC] border-[#F8E3B6] dark:text-[#FBBF24] dark:bg-[#F59E0B]/15 dark:border-[#F59E0B]/30',
  flag_ambiguous: 'text-[#C73535] bg-[#FDF3F3] border-[#F6CECE] dark:text-[#F87171] dark:bg-[#EF4444]/15 dark:border-[#EF4444]/30',
};

export function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
