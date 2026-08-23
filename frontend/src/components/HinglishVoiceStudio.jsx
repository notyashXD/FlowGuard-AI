import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  Play,
  Pause,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Smartphone,
  CalendarCheck,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { formatINR } from '../lib/utils';

export default function HinglishVoiceStudio({ transactions = [] }) {
  const txList = Array.isArray(transactions) ? transactions : [];
  const [selectedTx, setSelectedTx] = useState(txList[0] || null);
  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'connected' | 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [dtmfSelected, setDtmfSelected] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('swara'); // 'swara' | 'neerja'
  const audioRef = useRef(null);

  useEffect(() => {
    if (txList.length > 0 && !selectedTx) {
      setSelectedTx(txList[0]);
    }
  }, [txList, selectedTx]);

  useEffect(() => {
    let timer;
    if (callState === 'connected') {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const customerName = selectedTx?.customerName || 'Aarav Sharma';
  const firstName = customerName.split(' ')[0] || 'Customer';
  const amountStr = formatINR(selectedTx?.amount || 4500);
  const itemDesc = selectedTx?.metadata?.productCategory || selectedTx?.metadata?.planName || 'order';

  const script = `Namaste ${firstName} ji! Main Razorpay Automated Support Desk se Ananya bol rahi hoon. Aapke ${itemDesc} ke liye ${amountStr} ka payment pending reh gaya tha. Kya aap is payment ko complete karna chahte hain? Instant WhatsApp UPI link paane ke liye 1 dabayein, ya payment date commit karne ke liye 2 dabayein. Dhanyawaad!`;

  const handleStartCall = () => {
    setCallState('calling');
    setDtmfSelected(null);
    setTimeout(() => {
      setCallState('connected');
      handleSpeakScript();
    }, 1500);
  };

  const handleEndCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsAudioPlaying(false);
    setCallState('ended');
    setTimeout(() => setCallState('idle'), 2000);
  };

  const handleSpeakScript = () => {
    // 1. Play real Microsoft Neural Indian Female Voice stream from backend
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const audioUrl = `/api/voice/synthesize?text=${encodeURIComponent(script)}&voice=${selectedVoice}&t=${Date.now()}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsAudioPlaying(true);
      audio.onended = () => {
        setIsAudioPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        playWebSpeechFallback();
      };

      audio.play().catch(() => {
        playWebSpeechFallback();
      });
    } catch {
      playWebSpeechFallback();
    }
  };

  const playWebSpeechFallback = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const femaleIndianVoice = voices.find(v =>
          (v.name.includes('Veena') || v.name.includes('Lekha') || v.name.includes('Kalyani') || v.name.includes('Neerja') || v.name.includes('Swara')) ||
          (v.lang.includes('hi') && (v.name.toLowerCase().includes('female') || v.name.includes('Google'))) ||
          (v.lang.includes('IN') && (v.name.toLowerCase().includes('female') || v.name.includes('Google') || v.name.includes('Natural')))
        ) || voices.find(v => v.lang.includes('IN') || v.lang.includes('hi'));

        if (femaleIndianVoice) utterance.voice = femaleIndianVoice;

        utterance.onstart = () => setIsAudioPlaying(true);
        utterance.onend = () => setIsAudioPlaying(false);
        utterance.onerror = () => setIsAudioPlaying(false);

        window.speechSynthesis.speak(utterance);
      } catch {
        setIsAudioPlaying(false);
      }
    }
  };

  const handleDTMF = (key) => {
    setDtmfSelected(key);
  };

  return (
    <div className="luxury-card p-6 bg-surface border-border space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 border border-[#C7D7FE] dark:border-[#1E4BF0]/30 flex items-center justify-center text-[#1E4BF0] dark:text-[#60A5FA]">
            <PhoneCall size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">
                Hinglish Voice Recovery Agent Studio
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-tertiary text-[#107C55] dark:text-[#34D399] font-medium flex items-center gap-1">
                <UserCheck size={11} />
                Microsoft Neural Voice (hi-IN-Swara)
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Hyper-realistic Microsoft Neural Indian female voice speaking native conversational Hinglish
            </p>
          </div>
        </div>

        {/* Controls: Voice Model & Customer Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Voice Model Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-ink-muted text-[11px]">Voice:</span>
            <select
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              className="bg-surface-secondary border border-border rounded-lg px-2 py-1 text-xs text-ink focus:outline-none focus:border-[#1E4BF0] cursor-pointer font-medium"
            >
              <option value="swara">Swara (Natural Hinglish / Hindi Female)</option>
              <option value="neerja">Neerja (Indian English Accent Female)</option>
            </select>
          </div>

          {/* Target Customer */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-ink-muted text-[11px]">Customer:</span>
            <select
              value={selectedTx?.transactionId || ''}
              onChange={e => setSelectedTx(txList.find(t => t.transactionId === e.target.value))}
              className="bg-surface-secondary border border-border rounded-lg px-2 py-1 text-xs text-ink focus:outline-none focus:border-[#1E4BF0] cursor-pointer"
            >
              {txList.slice(0, 10).map(t => (
                <option key={t.transactionId} value={t.transactionId}>
                  {t.customerName} ({formatINR(t.amount)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Phone Interface (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-surface-secondary border border-border flex flex-col justify-between items-center text-center relative overflow-hidden">
          
          <div className="w-full space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface border border-border text-[11px] font-mono text-ink-secondary">
              <Smartphone size={12} />
              <span>Razorpay AI Voice Engine · {selectedVoice === 'swara' ? 'Swara Neural (IN)' : 'Neerja Neural (IN)'}</span>
            </div>

            <div className="pt-2">
              <p className="text-base font-bold text-ink">{customerName}</p>
              <p className="text-xs text-ink-muted font-mono">{selectedTx?.customerContact?.phone || '+91 98765 43210'}</p>
            </div>

            {/* Status indicator */}
            <div className="py-2">
              {callState === 'idle' && (
                <span className="text-xs text-ink-muted">Ready to simulate autonomous call</span>
              )}
              {callState === 'calling' && (
                <span className="text-xs text-[#1E4BF0] dark:text-[#60A5FA] font-medium animate-pulse">
                  Ringing customer line...
                </span>
              )}
              {callState === 'connected' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF7F2] dark:bg-[#10B981]/15 text-[#107C55] dark:text-[#34D399] text-xs font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#107C55] dark:bg-[#34D399] animate-pulse" />
                  Connected · 00:{callDuration < 10 ? `0${callDuration}` : callDuration}s
                </span>
              )}
              {callState === 'ended' && (
                <span className="text-xs text-[#C73535] dark:text-[#EF4444] font-medium">
                  Call Disconnected
                </span>
              )}
            </div>
          </div>

          {/* Audio Waveform visualization */}
          <div className="h-16 flex items-center justify-center gap-1 my-3">
            {callState === 'connected' && isAudioPlaying ? (
              [30, 60, 20, 80, 40, 95, 50, 75, 35, 90, 45, 65, 30].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-[#1E4BF0] dark:bg-[#60A5FA]"
                  animate={{ height: [8, h * 0.45, 8] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.06 }}
                />
              ))
            ) : (
              <div className="w-24 h-0.5 bg-border rounded-full" />
            )}
          </div>

          {/* DTMF Keypad Actions */}
          {callState === 'connected' && (
            <div className="w-full space-y-2 pt-2 border-t border-border-subtle">
              <p className="text-[10px] uppercase font-mono text-ink-muted">Simulate Customer DTMF Keypress:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDTMF('1')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    dtmfSelected === '1'
                      ? 'bg-[#EBF7F2] dark:bg-[#10B981]/20 border-[#BFE7D5] dark:border-[#10B981]/40 text-[#107C55] dark:text-[#34D399]'
                      : 'bg-surface border-border hover:border-border-strong text-ink'
                  }`}
                >
                  <p className="font-bold text-xs">Press 1: Pay via Link</p>
                  <p className="text-[10px] text-ink-muted mt-0.5">Instant WhatsApp UPI link</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDTMF('2')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    dtmfSelected === '2'
                      ? 'bg-[#FEF8EC] dark:bg-[#F59E0B]/20 border-[#F8E3B6] dark:border-[#F59E0B]/40 text-[#B4710A] dark:text-[#F59E0B]'
                      : 'bg-surface border-border hover:border-border-strong text-ink'
                  }`}
                >
                  <p className="font-bold text-xs">Press 2: Promise to Pay</p>
                  <p className="text-[10px] text-ink-muted mt-0.5">Schedule date commitment</p>
                </button>
              </div>

              {dtmfSelected && (
                <div className="p-2 rounded bg-surface border border-border text-[11px] text-[#107C55] dark:text-[#34D399] font-medium">
                  {dtmfSelected === '1' ? '⚡ WhatsApp Payment Link Dispatched Instantly' : '📅 Promise-to-Pay Recorded in Active Ledger'}
                </div>
              )}
            </div>
          )}

          {/* Call / Hangup Button */}
          <div className="pt-4 w-full">
            {callState === 'connected' || callState === 'calling' ? (
              <button
                type="button"
                onClick={handleEndCall}
                className="w-full py-2.5 rounded-xl bg-[#C73535] hover:bg-[#A82828] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <PhoneOff size={14} />
                <span>Hang Up Call</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-2.5 rounded-xl bg-[#107C55] dark:bg-[#059669] hover:bg-[#0B6142] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <PhoneCall size={14} />
                <span>Simulate Neural Indian Female Voice Call</span>
              </button>
            )}
          </div>

        </div>

        {/* Right: Live Script & Conversation Intelligence (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Spoken Dialogue Transcript (Natural Hinglish)
              </span>
              <button
                type="button"
                onClick={handleSpeakScript}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 border border-[#C7D7FE] dark:border-[#1E4BF0]/30 text-xs font-medium text-[#1E4BF0] dark:text-[#60A5FA] cursor-pointer"
              >
                <Volume2 size={13} />
                <span>Play Audio Sample ({selectedVoice === 'swara' ? 'Swara' : 'Neerja'})</span>
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-surface border border-border text-xs text-ink leading-relaxed italic font-serif">
              "{script}"
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-ink-secondary pt-1">
              <div>
                <span className="text-ink-muted text-[11px]">Neural Voice Model:</span>
                <p className="font-semibold text-ink">{selectedVoice === 'swara' ? 'Microsoft hi-IN-SwaraNeural' : 'Microsoft en-IN-NeerjaNeural'}</p>
              </div>
              <div>
                <span className="text-ink-muted text-[11px]">Audio Fidelity:</span>
                <p className="font-semibold text-[#107C55] dark:text-[#34D399]">24kHz Neural Human Voice</p>
              </div>
            </div>
          </div>

          {/* Interventions Matrix */}
          <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Conversational Voice Recovery Capabilities
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-surface border border-border flex items-start gap-2">
                <CheckCircle2 size={13} className="text-[#107C55] dark:text-[#34D399] flex-shrink-0 mt-0.5" />
                <span className="text-ink-secondary">
                  High-fidelity Indian neural voice eliminates robotic artifacting and preserves warm, polite phone inflection.
                </span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-border flex items-start gap-2">
                <CheckCircle2 size={13} className="text-[#107C55] dark:text-[#34D399] flex-shrink-0 mt-0.5" />
                <span className="text-ink-secondary">
                  Directly converts customer response into <strong>Promise-to-Pay</strong> commitments or instant WhatsApp links.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
