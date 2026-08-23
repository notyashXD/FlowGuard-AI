import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Database,
  CreditCard,
  Mic,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Award,
  Terminal,
  Activity
} from 'lucide-react';
import FlowGuardLogo from './FlowGuardLogo';

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('yashmishra1246@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-surface/80 via-surface to-surface-secondary backdrop-blur-xl mt-16 transition-colors duration-200 overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-[#1E4BF0]/5 dark:bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top subtle decorative accent bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#1E4BF0] to-[#10B981] opacity-70" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between pb-8 border-b border-border-subtle">
          
          {/* Left: Project Branding & Architecture Synopsis */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <FlowGuardLogo size={32} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-ink font-sans">
                    FlowGuard AI
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E4BF0]/10 dark:bg-[#1E4BF0]/20 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30 font-mono tracking-wider">
                    BUILDATHON 2026
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted font-medium">
                  Autonomous Payments & Revenue Recovery Engine
                </span>
              </div>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed max-w-md">
              Engineered for the <strong>Razorpay Buildathon 2026</strong>. Eliminates payment drop-offs with deterministic safety guardrails, Groq LLM root-cause classification, automated smart retries, dynamic payment links, and multi-channel conversational P2P recovery.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF7F2] dark:bg-[#10B981]/15 text-[#107C55] dark:text-[#34D399] text-[10px] font-semibold border border-[#BFE7D5] dark:border-[#10B981]/30">
                <Award size={11} />
                Official Hackathon Submission
              </span>
              <span className="text-[11px] font-mono text-ink-muted">
                Test Mode Sandbox Ready
              </span>
            </div>
          </div>

          {/* Right: Supreme Creator Profile Spotlight */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row lg:justify-end items-start sm:items-center">
            <div className="w-full sm:w-auto p-4 rounded-2xl bg-surface/90 dark:bg-[#151923] border border-border hover:border-border-strong shadow-card hover:shadow-elevated transition-all duration-300 relative group overflow-hidden">
              
              {/* Card subtle inner glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1E4BF0]/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
                
                {/* Avatar with luxury ring */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden p-[2px] bg-gradient-to-tr from-[#1E4BF0] via-[#8B5CF6] to-[#10B981] shadow-md group-hover:scale-105 transition-transform duration-300">
                    <img
                      src="/yash.jpg"
                      alt="Yash Mishra"
                      className="w-full h-full rounded-[14px] object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://ui-avatars.com/api/?name=Yash+Mishra&background=1E4BF0&color=fff";
                      }}
                    />
                  </div>
                  {/* Status dot */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-surface flex items-center justify-center shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                {/* Profile Identity & Links */}
                <div className="space-y-2 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-ink tracking-tight font-sans">
                        Yash Mishra
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] dark:bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#F59E0B]/30 font-mono shadow-xs">
                        🏆 IBM National Hackathon Winner 2026
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1E4BF0]/10 dark:bg-[#1E4BF0]/20 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30 font-mono">
                        <Sparkles size={10} className="text-[#107C55] dark:text-[#34D399]" />
                        Lead Architect
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Full-Stack & AI Systems Builder · Razorpay Buildathon 2026
                    </p>
                  </div>

                  {/* Interactive Action Hub */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    
                    {/* LinkedIn Button */}
                    <a
                      href="https://linkedin.com/in/ymishra1201"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#0A66C2] dark:text-[#70B5F9] text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-xs"
                      title="Connect on LinkedIn"
                    >
                      <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                      <span>LinkedIn</span>
                    </a>

                    {/* GitHub Button */}
                    <a
                      href="https://github.com/notyashXD"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-tertiary hover:bg-border border border-border text-ink text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-xs"
                      title="Explore GitHub Profile"
                    >
                      <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                      <span>GitHub</span>
                    </a>

                    {/* Gmail Button with Copy action */}
                    <div className="inline-flex items-center rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/30 overflow-hidden shadow-xs">
                      <a
                        href="mailto:yashmishra1246@gmail.com"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#EA4335]/20 text-[#EA4335] dark:text-[#F87171] text-xs font-semibold transition-colors cursor-pointer"
                        title="Send Email"
                      >
                        <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        <span>Gmail</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="px-2 py-1.5 border-l border-[#EA4335]/20 hover:bg-[#EA4335]/20 text-[#EA4335] dark:text-[#F87171] transition-colors cursor-pointer"
                        title="Copy email address"
                      >
                        {copied ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Pills & System Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs text-ink-muted">
          
          {/* Tech Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-secondary mr-1">Architecture:</span>
            
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[11px] font-mono text-ink-secondary shadow-xs">
              <Cpu size={12} className="text-[#1E4BF0] dark:text-[#60A5FA]" />
              Groq allam-2-7b
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[11px] font-mono text-ink-secondary shadow-xs">
              <CreditCard size={12} className="text-[#107C55] dark:text-[#34D399]" />
              Razorpay Test Gateway
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[11px] font-mono text-ink-secondary shadow-xs">
              <Database size={12} className="text-[#B4710A] dark:text-[#F59E0B]" />
              MongoDB Atlas
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[11px] font-mono text-ink-secondary shadow-xs">
              <Mic size={12} className="text-[#8B5CF6]" />
              Edge TTS Voice AI
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[11px] font-mono text-ink-secondary shadow-xs">
              <Code2 size={12} className="text-ink" />
              React 18 + Vite + Framer
            </span>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7F2] dark:bg-[#10B981]/15 border border-[#BFE7D5] dark:border-[#10B981]/30 text-[#107C55] dark:text-[#34D399] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#107C55] dark:bg-[#34D399] pulse-live" />
              <span>Deterministic Bounds Active</span>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">
              v1.0.0 · © 2026 FlowGuard
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
