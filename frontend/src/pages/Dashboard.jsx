import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  CalendarCheck,
  Shuffle,
  Building,
  PhoneCall,
  Table,
  X
} from 'lucide-react';

import TopNav from '../components/TopNav';
import ExecutiveOverview from '../components/ExecutiveOverview';
import PerformanceChart from '../components/PerformanceChart';
import PipelineWorkflow from '../components/PipelineWorkflow';
import ExecutiveBriefing from '../components/ExecutiveBriefing';
import AutonomousIntelligence from '../components/AutonomousIntelligence';
import RiskExceptionsTable from '../components/RiskExceptionsTable';
import PromiseToPayLedger from '../components/PromiseToPayLedger';
import MandateSequencer from '../components/MandateSequencer';
import B2BReceivablesChaser from '../components/B2BReceivablesChaser';
import HinglishVoiceStudio from '../components/HinglishVoiceStudio';
import AgentFeed from '../components/AgentFeed';
import GuardrailsPanel from '../components/GuardrailsPanel';
import Footer from '../components/Footer';

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  const config = {
    success: {
      icon: CheckCircle2,
      badge: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
      border: 'border-[#10B981]/30'
    },
    error: {
      icon: AlertTriangle,
      badge: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
      border: 'border-[#EF4444]/30'
    },
    info: {
      icon: Activity,
      badge: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30',
      border: 'border-[#3B82F6]/30'
    },
  };

  const item = config[type] || config.info;
  const Icon = item.icon;
  const DURATION_MS = 1600;
  
  useEffect(() => {
    const t = setTimeout(onDismiss, DURATION_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-surface dark:bg-[#161A23] border ${item.border} shadow-elevated text-xs max-w-sm font-sans z-50`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border ${item.badge}`}>
          <Icon size={13} />
        </div>
        <span className="font-medium text-ink leading-snug break-words text-[11px]">{message}</span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-tertiary transition-colors flex-shrink-0 cursor-pointer"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics]           = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading]       = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);
  const [progress, setProgress]         = useState(null);
  const [feedEvents, setFeedEvents]     = useState([]);
  const [toasts, setToasts]             = useState([]);
  const [hasBatch, setHasBatch]         = useState(false);
  const [showGuardrails, setShowGuardrails] = useState(false);
  const [guardrails, setGuardrails]     = useState(null);
  const [resetting, setResetting]       = useState(false);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'p2p' | 'sequencer' | 'b2b' | 'voice' | 'telemetry'

  const pollRef = useRef(null);

  // ── Data Fetching ─────────────────────────────────────────────────────────
  const fetchGuardrails = useCallback(async () => {
    try {
      const r = await fetch('/api/batch/guardrails');
      if (r.ok) {
        const d = await r.json();
        if (d.guardrails) setGuardrails(d.guardrails);
      }
    } catch (e) {
      console.error('guardrails fetch:', e.message);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const r = await fetch('/api/metrics');
      if (!r.ok) throw new Error(`${r.status}`);
      const d = await r.json();
      setMetrics(d);
      if (d.guardrails) setGuardrails(d.guardrails);
      if (d.totalProcessed > 0) setHasBatch(true);
      else setHasBatch(false);
    } catch (e) {
      console.error('metrics fetch:', e.message);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const r = await fetch('/api/transactions');
      if (!r.ok) throw new Error(`${r.status}`);
      const d = await r.json();
      setTransactions(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error('transactions fetch:', e.message);
    } finally {
      setTxLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setMetricsLoading(true);
    await Promise.all([fetchMetrics(), fetchTransactions(), fetchGuardrails()]);
  }, [fetchMetrics, fetchTransactions, fetchGuardrails]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ── Toast Helper ──────────────────────────────────────────────────────────
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
  };

  // ── Live Batch Polling ────────────────────────────────────────────────────
  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const [progRes, metRes, txRes] = await Promise.all([
          fetch('/api/batch/progress'),
          fetch('/api/metrics'),
          fetch('/api/transactions')
        ]);

        if (progRes.ok) {
          const d = await progRes.json();
          if (d.running) {
            setProgress(d);
            if (d.events?.length) {
              setFeedEvents([...d.events]);
            }
          } else {
            stopPolling();
            await refreshAll();
            setBatchRunning(false);
            setProgress(null);
          }
        }

        if (metRes.ok) {
          const metData = await metRes.json();
          setMetrics(metData);
          if (metData.totalProcessed > 0) setHasBatch(true);
        }

        if (txRes.ok) {
          const txData = await txRes.json();
          if (Array.isArray(txData)) setTransactions(txData);
        }
      } catch (err) {
        console.error('Polling tick error:', err);
      }
    }, 700);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => () => stopPolling(), []);

  // ── Batch Execution ───────────────────────────────────────────────────────
  async function runBatch() {
    if (batchRunning) return;

    // If no pending transactions exist, automatically reset and run a fresh batch
    let targetCount = pendingCount;
    if (targetCount === 0) {
      setResetting(true);
      try {
        await fetch('/api/batch/reset', { method: 'POST' });
        await refreshAll();
        targetCount = 54;
      } catch (e) {
        console.error('Auto reset before run error:', e);
      } finally {
        setResetting(false);
      }
    }

    setBatchRunning(true);
    setFeedEvents([]);
    setProgress({ running: true, total: targetCount || 54, processed: 0, recovered: 0, escalated: 0, flagged: 0, events: [] });

    startPolling();

    try {
      const r = await fetch('/api/batch/run', { method: 'POST' });
      const d = await r.json();

      if (r.status === 409) {
        // Batch is already running on server — smoothly join stream
        startPolling();
        setBatchRunning(true);
        return;
      }

      stopPolling();
      setBatchRunning(false);
      setProgress(null);

      if (!r.ok) throw new Error(d.error || `Server error ${r.status}`);

      const { summary } = d;
      setHasBatch(true);
      setFeedEvents(d.results?.map(res => ({
        transactionId: res.transactionId,
        stage: 'done',
        message: `${res.finalAction} → ${res.status}${res.reasoning ? ` — "${res.reasoning.slice(0, 60)}"` : ''}`,
        ts: Date.now()
      })) || []);

      addToast(
        `Batch finished — ${summary.recovered} recovered, ${summary.escalated} escalated, ${summary.flagged} flagged.`,
        'success'
      );

      await refreshAll();
    } catch (err) {
      stopPolling();
      setBatchRunning(false);
      setProgress(null);
      console.error('Batch run error:', err);
      addToast(`Batch notice: ${err.message}`, 'error');
      await refreshAll();
    }
  }

  // ── Demo Reset Pipeline ───────────────────────────────────────────────────
  async function handleResetPipeline() {
    if (batchRunning) return;
    setResetting(true);
    try {
      const res = await fetch('/api/batch/reset', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      await res.json().catch(() => ({}));
      addToast('Pipeline queue reset: 54 transactions ready for fresh evaluation.', 'info');
      setHasBatch(false);
      await refreshAll();
    } catch (err) {
      addToast(`Reset notice: ${err.message}`, 'error');
    } finally {
      setResetting(false);
    }
  }

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: Layers },
    { id: 'telemetry', label: 'Exceptions & Telemetry', icon: Table, count: transactions.length },
    { id: 'p2p', label: 'Promise-to-Pay Tracker', icon: CalendarCheck },
    { id: 'sequencer', label: 'Mandate Retry Sequencer', icon: Shuffle },
    { id: 'b2b', label: 'B2B Receivables Chaser', icon: Building },
    { id: 'voice', label: 'Hinglish Voice Recovery', icon: PhoneCall },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans transition-colors duration-200">
      
      {/* ── Top Navigation Shell ──────────────────────────────────── */}
      <TopNav
        batchRunning={batchRunning}
        pendingCount={pendingCount}
        metricsLoading={metricsLoading}
        resetting={resetting}
        guardrails={metrics?.guardrails}
        onRunBatch={runBatch}
        onOpenGuardrails={() => setShowGuardrails(true)}
        onResetPipeline={handleResetPipeline}
        onRefresh={refreshAll}
      />

      {/* ── Sub Navigation Tabs Bar ───────────────────────────────── */}
      <div className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-16 z-20 transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none" aria-label="Track Navigation">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'text-canvas dark:text-ink font-semibold'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface-secondary/80'
                  }`}
                >
                  {/* Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSectionIndicator"
                      className="absolute inset-0 bg-ink dark:bg-surface-tertiary rounded-lg shadow-sm border border-transparent dark:border-border"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    <Icon
                      size={13}
                      className={isActive ? 'text-canvas dark:text-[#60A5FA]' : 'text-[#1E4BF0] dark:text-[#60A5FA]'}
                    />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-surface-secondary dark:text-ink'
                            : 'bg-surface-tertiary text-ink-secondary border border-border-subtle'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Main Control Center Container ─────────────────────────── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ── Live Agent Feed (Shown during batch execution) ────────── */}
        <AnimatePresence>
          {batchRunning && (
            <AgentFeed
              progress={progress}
              events={feedEvents}
              isRunning={batchRunning}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ── TAB 1: Executive Overview & Pipeline ────────────────── */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <ExecutiveOverview
                metrics={metrics}
                hasBatch={hasBatch || batchRunning || (metrics?.totalProcessed > 0)}
              />

              <PerformanceChart
                metrics={metrics}
                hasBatch={hasBatch || batchRunning || (metrics?.totalProcessed > 0)}
              />

              <PipelineWorkflow
                funnel={metrics?.funnel}
                metrics={metrics}
                hasBatch={hasBatch || batchRunning || (metrics?.totalProcessed > 0)}
                batchRunning={batchRunning}
              />

              {(hasBatch || batchRunning || (metrics?.totalProcessed > 0)) && (
                <ExecutiveBriefing
                  hasBatch={hasBatch || batchRunning || (metrics?.totalProcessed > 0)}
                  metrics={metrics}
                />
              )}

              <AutonomousIntelligence
                metrics={metrics}
                hasBatch={hasBatch || batchRunning || (metrics?.totalProcessed > 0)}
                guardrails={metrics?.guardrails}
              />

              <RiskExceptionsTable
                transactions={transactions}
                loading={txLoading}
                guardrails={guardrails || metrics?.guardrails}
              />
            </motion.div>
          )}

          {/* ── TAB 2: Exceptions & Telemetry ───────────────────────── */}
          {activeSection === 'telemetry' && (
            <motion.div
              key="telemetry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <RiskExceptionsTable
                transactions={transactions}
                loading={txLoading}
                guardrails={guardrails || metrics?.guardrails}
              />
            </motion.div>
          )}

          {/* ── TAB 3: Promise-to-Pay Tracker ─────────────────────────── */}
          {activeSection === 'p2p' && (
            <motion.div
              key="p2p"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <PromiseToPayLedger
                onRefreshMetrics={fetchMetrics}
              />
            </motion.div>
          )}

          {/* ── TAB 4: Mandate Retry Sequencer ────────────────────────── */}
          {activeSection === 'sequencer' && (
            <motion.div
              key="sequencer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <MandateSequencer />
            </motion.div>
          )}

          {/* ── TAB 5: B2B Receivables Chaser ─────────────────────────── */}
          {activeSection === 'b2b' && (
            <motion.div
              key="b2b"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <B2BReceivablesChaser
                transactions={transactions}
              />
            </motion.div>
          )}

          {/* ── TAB 6: Hinglish Voice Recovery Studio ─────────────────── */}
          {activeSection === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <HinglishVoiceStudio
                transactions={transactions}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Footer />

      {/* ── Guardrails Modal Drawer ─────────────────────────────────── */}
      <GuardrailsPanel
        open={showGuardrails}
        onClose={() => setShowGuardrails(false)}
        onSave={(updated) => {
          setGuardrails(updated);
          addToast(`Guardrails saved (Max ₹${(updated.highValueThreshold / 1000).toFixed(0)}k · ${updated.maxRetryAttempts}r · ${updated.maxAgeDays}d)`, 'success');
          refreshAll();
        }}
      />

      {/* ── Toasts Notifications Stack ──────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast
                message={t.message}
                type={t.type}
                onDismiss={() => setToasts(p => p.filter(x => x.id !== t.id))}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
