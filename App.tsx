import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { evaluateStockPitch } from './services/geminiService';
import { StockPitch, PitchFeedback, FirmStyle } from './types';
import { Target, AlertTriangle, Zap, CheckCircle2, TrendingUp, Presentation, Lightbulb, Play, Building2, ArrowRight } from 'lucide-react';
import { GuidedBuilder } from './components/GuidedBuilder';
import { WorkedExample } from './components/WorkedExample';

const FIRM_STYLES: FirmStyle[] = [
  {
    id: "long-only",
    name: "Long-only quality (Capital Group, Lone Pine)",
    description: "Evaluates durable moats, capital allocation, and long-term compounding.",
    promptEmphasis: "Focus on durable competitive advantages (moats), high returns on invested capital (ROIC), management capital allocation skills, and long-term compounding. Ignore short-term noise, focus on terminal value and business quality."
  },
  {
    id: "classic-value",
    name: "Classic value (Baupost, Greenlight)",
    description: "Evaluates margin of safety, tangible asset value, and downside protection.",
    promptEmphasis: "Focus strictly on margin of safety, downside protection, tangible asset value, and replacement cost. Look for 'cigar butts' or extremely cheap cash flows. Penalize aggressive growth assumptions."
  },
  {
    id: "ls-pod",
    name: "L/S pod (Citadel, Millennium, Point72)",
    description: "Evaluates variant view, hard catalysts, and position sizing against consensus.",
    promptEmphasis: "Highly focus on the 'variant perception' (what is the street missing?), upcoming hard catalysts within 1-3 quarters, earnings revisions, and precise exit/stop-loss triggers. Punish long-term 'buy and hold' theses without immediate catalysts."
  },
  {
    id: "tiger-cub",
    name: "Tiger cub / Growth-at-scale (Coatue, Tiger Global, D1)",
    description: "Evaluates TAM expansion, unit economics, and durability of growth.",
    promptEmphasis: "Focus on Total Addressable Market (TAM), network effects, unit economics (LTV/CAC), and secular tailwinds. High tolerance for current losses if long-term free cash flow margins scale massively."
  },
  {
    id: "event-driven",
    name: "Event-driven / Special situations (Third Point, Elliott)",
    description: "Evaluates catalyst clarity, deal mechanics, and sum-of-the-parts.",
    promptEmphasis: "Focus purely on corporate events: spinoffs, mergers, bankruptcies, management changes. Look for deep sum-of-the-parts (SOTP) discounts, deal timelines, and explicit legal/structural mechanics."
  },
  {
    id: "distressed",
    name: "Distressed / Restructuring (Oaktree, Centerbridge)",
    description: "Evaluates capital structure, liquidation waterfalls, and recovery analysis.",
    promptEmphasis: "Focus heavily on the balance sheet, debt covenants, capital structure waterfalls, and liquidation/recovery scenarios. The thesis should be driven by credit metrics, not just equity upside."
  },
  {
    id: "activist",
    name: "Activist (Pershing Square activist, Starboard)",
    description: "Evaluates operational change, board composition, and value creation playbooks.",
    promptEmphasis: "Focus on poor current management/operations, bloated cost structures, and a clear 'playbook' for value creation (e.g., replace CEO, sell non-core assets, lever up for buybacks)."
  }
];

const EXAMPLES = [
  {
    id: 'apple' as const,
    label: "Professional Apple Pitch",
    data: {
      ticker: "AAPL",
      thesis: "At ~$215, AAPL trades at 28x forward EPS — a premium reflecting the market's view of services growth and Apple Intelligence as fully priced in. Consensus expects 6% revenue growth and 9% EPS growth in FY26, with Services at ~22% of revenue. Our variant view: installed base monetization is structurally underearning. With 2.4B active devices and Services revenue per device still under $35/year (vs. Google's $50+ per Android user), the runway on existing hardware is meaningfully larger than the \"AI upgrade cycle\" narrative captures. We model Services compounding at 12-14% (consensus: 8-10%) over three years, driven by App Store mix shift, Apple Pay/Card economics, and AI-enabled subscription products. With $165B net cash, a 4-5% buyback yield setting a floor, and 28% gross margin protection, asymmetry is favorable — flat-iPhone-cycle scenario still produces 10-12% IRR via capital return + Services compounding; upside in a real upgrade cycle is +30%.",
      catalysts: "1. WWDC June 2026 — first full year of Apple Intelligence in market; iPhone 17 cycle (September) is the tell on whether AI is moving units. Consensus expects 8% iPhone unit growth; we see 12%+ if AI features hold up.\n2. Services disclosure breakdown in FY26 10-K (October 2026) — management has signaled they'll disclose Services component economics; visibility into App Store/Subscriptions margins likely re-rates the segment multiple.\n3. China inflection — recent data shows iPhone share stabilizing after two-year decline. A clean Q1/Q2 China comp print would invalidate the \"structural China loss\" bear case that's been pressuring the multiple.",
      risks: "1. iPhone unit growth disappoints if AI features fail to drive upgrade behavior. Bear case: 0-2% unit growth, Services moderate to 9%, multiple compresses to 22x → equity at ~$155 (-28%). Cash + buyback yield provides ~4% partial offset.\n2. China share continues structural decline (>30% of segment revenue at risk over 3 years). Significant tail risk to top line; partially mitigated by Services and Wearables share gains.\n3. Antitrust — DOJ services case + EU DMA enforcement creates real risk to App Store economics. Worst case takes 100-150bps off Services growth and meaningfully impacts the high-margin mix story."
    }
  },
  {
    id: 'tesla' as const,
    label: "Amateur Tesla Pitch",
    data: {
      ticker: "TSLA",
      thesis: "Tesla makes really cool cars and everyone I know wants one. Elon Musk is a genius and they are going to sell millions of cybertrucks, which look awesome.",
      catalysts: "People like the cars. They are very fast and electric is the future.",
      risks: "Other companies make cars too, and batteries could get expensive."
    }
  }
];

interface TooltipTextareaProps {
  label: string;
  subLabel: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  highlightColor?: 'blue' | 'emerald' | 'red';
  tooltipTitle: string;
  tooltipText: string;
  tooltipExample: string;
}

function TooltipTextarea({
  label,
  subLabel,
  placeholder,
  value,
  onChange,
  rows = 3,
  highlightColor = 'blue',
  tooltipTitle,
  tooltipText,
  tooltipExample
}: TooltipTextareaProps) {
  const [show, setShow] = useState(false);

  const ringColors = {
    blue: 'focus:border-blue-500 focus:ring-blue-500',
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500',
    red: 'focus:border-red-500 focus:ring-red-500'
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <p className="text-xs text-slate-500 mb-2">{subLabel}</p>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full bg-[#1A1A1A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all resize-none custom-scrollbar ${ringColors[highlightColor]}`}
      />
      
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-72 bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-xl p-4 shadow-2xl pointer-events-none
                       left-0 bottom-[calc(100%+8px)] lg:left-[calc(100%+16px)] lg:bottom-auto lg:top-0 text-left"
          >
            <h4 className="text-sm font-semibold text-slate-200 mb-1">{tooltipTitle}</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">{tooltipText}</p>
            <div className="bg-slate-900/80 border border-slate-700 rounded-md p-2.5 text-xs text-slate-300">
              <span className="block font-semibold text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Example</span>
              <span className="italic">"{tooltipExample}"</span>
            </div>
            
            {/* Caret for Desktop */}
            <div className="hidden lg:block absolute left-[-6px] top-6 w-3 h-3 bg-slate-800 border-l border-b border-slate-600 rotate-45" />
            {/* Caret for Mobile */}
            <div className="block lg:hidden absolute bottom-[-6px] left-6 w-3 h-3 bg-slate-800 border-r border-b border-slate-600 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'welcome' | 'select-firm' | 'pitch-builder' | 'worked-example'>('welcome');
  const [walkthroughId, setWalkthroughId] = useState<'costco' | 'apple' | 'tesla'>('costco');
  const [selectedFirmId, setSelectedFirmId] = useState<string>(FIRM_STYLES[0].id);
  const [specificFirm, setSpecificFirm] = useState('');

  const [inputMode, setInputMode] = useState<'pro' | 'guided'>(() => {
    return (localStorage.getItem('builderMode') as 'pro' | 'guided') || 'pro';
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<'pro' | 'guided' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('builderMode', inputMode);
  }, [inputMode]);

  const [pitch, setPitch] = useState<StockPitch>({ ticker: '', thesis: '', catalysts: '', risks: '' });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<PitchFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedFirmStyle = FIRM_STYLES.find(f => f.id === selectedFirmId)!;

  const handleToggleMode = (newMode: 'pro' | 'guided') => {
    if (inputMode === newMode) return;
    if (inputMode === 'guided') {
      setPendingMode(newMode);
      setShowConfirmDialog(true);
      return;
    }
    setInputMode(newMode);
  };

  const confirmToggleMode = () => {
    if (pendingMode) {
      setInputMode(pendingMode);
    }
    setShowConfirmDialog(false);
    setPendingMode(null);
  };

  const cancelToggleMode = () => {
    setShowConfirmDialog(false);
    setPendingMode(null);
  };

  const handlePitchSynthesized = (synthesizedPitch: StockPitch, synthesisError?: string) => {
    setPitch(synthesizedPitch);
    setInputMode('pro');
    setFeedback(null);
    setError(null);
    
    if (synthesisError) {
      setToastMessage(synthesisError);
      setTimeout(() => setToastMessage(null), 8000);
    }
  };

  const handleEvaluate = async () => {
    if (!pitch.ticker || !pitch.thesis || !pitch.catalysts || !pitch.risks) {
      setError("All fields are required to evaluate a pitch properly.");
      return;
    }
    setError(null);
    setIsEvaluating(true);
    setFeedback(null);
    try {
      const result = await evaluateStockPitch(pitch, selectedFirmStyle, specificFirm);
      setFeedback(result);
    } catch (err: any) {
      setError(err?.message || "Failed to evaluate pitch. Please try again or check API configuration.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const loadExample = (data: StockPitch) => {
    setPitch(data);
    setFeedback(null);
    setError(null);
  };

  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-slate-200 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-500/30">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-400 rounded-3xl mb-4">
              <Presentation size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Stock Pitch Simulator
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Master the Wall Street pitch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setWalkthroughId('costco');
                setView('worked-example');
              }}
              className="bg-[#111111] border border-slate-800 hover:border-slate-700 rounded-3xl p-8 cursor-pointer transition-colors shadow-2xl flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Learn How to Pitch</h2>
              <p className="text-slate-400 mb-8 flex-1 leading-relaxed">
                First time? Walk through a strong Costco pitch with annotations explaining what makes each section work.
              </p>
              <button className="w-full py-4 bg-slate-800 group-hover:bg-amber-500/10 group-hover:text-amber-500 text-slate-300 rounded-xl font-bold transition-colors">
                Start Walkthrough
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('select-firm')}
              className="bg-[#111111] border border-slate-800 hover:border-slate-700 rounded-3xl p-8 cursor-pointer transition-colors shadow-2xl flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Build Your Pitch</h2>
              <p className="text-slate-400 mb-8 flex-1 leading-relaxed">
                Already know the framework? Pick a firm style and get rigorous PM-style feedback on your own pitch.
              </p>
              <button className="w-full py-4 bg-blue-600 group-hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]">
                Start Pitching
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'select-firm') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-slate-200 flex items-center justify-center p-4 selection:bg-blue-500/30 relative">
        <button 
          onClick={() => setView('welcome')}
          className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
        >
          <div className="p-1.5 bg-slate-800 group-hover:bg-slate-700 rounded-md transition-colors">
            <Presentation size={16} />
          </div>
          Back to home
        </button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-[#111111] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl mb-6">
              <Building2 size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Select Your Target Firm Style</h1>
            <p className="text-slate-400">Different funds evaluate pitches differently. Pick the seat you're interviewing for.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              {FIRM_STYLES.map(firm => (
                <button
                  key={firm.id}
                  onClick={() => setSelectedFirmId(firm.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedFirmId === firm.id 
                      ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500 shadow-sm shadow-blue-500/10' 
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedFirmId === firm.id ? 'border-blue-500' : 'border-slate-600'
                    }`}>
                      {selectedFirmId === firm.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                    <div>
                      <div className={`font-semibold ${selectedFirmId === firm.id ? 'text-blue-100' : 'text-slate-200'}`}>
                        {firm.name}
                      </div>
                      <div className="text-sm text-slate-400 mt-1 leading-snug">
                        {firm.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Specific firm (optional)</label>
              <input
                type="text"
                placeholder="e.g. Citadel Global Equities"
                value={specificFirm}
                onChange={e => setSpecificFirm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
            </div>

            <button
              onClick={() => setView('pitch-builder')}
              className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              Continue to Pitch Builder
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => {
                setWalkthroughId('costco');
                setView('worked-example');
              }}
              className="w-full mt-3 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Lightbulb className="text-amber-400" size={18} />
              First time? See how a pro pitches Costco.
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-lg w-full"
          >
            <AlertTriangle className="shrink-0 text-red-500" size={24} />
            <div className="text-sm font-medium leading-relaxed">{toastMessage}</div>
            <button onClick={() => setToastMessage(null)} className="ml-auto text-red-400 hover:text-red-200">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-3">Leave Guided Builder?</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to switch to Pro Simulator? Your guided progress will be lost.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={cancelToggleMode}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleMode}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                >
                  Switch to Pro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div className="flex-1">
            <button 
              onClick={() => setView('welcome')}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 cursor-pointer transition-colors"
            >
              <Presentation size={14} />
              Stock Pitch Simulator
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Wall Street Pitch</span>
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl">
              Construct your investment thesis, outline catalysts, and identify risks. Get real-time, brutal feedback from our AI Portfolio Manager.
            </p>
          </div>
          {view !== 'worked-example' && (
            <div className="flex gap-2 shrink-0">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setWalkthroughId(ex.id);
                    setView('worked-example');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
                >
                  {ex.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setWalkthroughId('costco');
                  setView('worked-example');
                }}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-sm font-medium rounded-lg transition-colors border border-amber-500/30 whitespace-nowrap flex items-center gap-1.5"
              >
                <Lightbulb size={16} /> Walkthrough: Costco
              </button>
            </div>
          )}
        </header>

        {/* Selected Firm Banner */}
        {view !== 'worked-example' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 mt-0.5">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Reviewing as: <span className="text-blue-400">{selectedFirmStyle.name}</span> {specificFirm && `(${specificFirm})`}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Evaluating for: {selectedFirmStyle.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setView('select-firm')}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Change Firm Style
            </button>
          </motion.div>
        )}

        {/* Mode Toggle */}
        {view !== 'worked-example' && (
          <div className="flex justify-center mt-6 mb-4">
            <div className="bg-[#1A1A1A] p-1 rounded-xl inline-flex shadow-sm border border-slate-800">
              <button
                onClick={() => handleToggleMode('pro')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  inputMode === 'pro' 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pro Simulator
              </button>
              <button
                onClick={() => handleToggleMode('guided')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  inputMode === 'guided' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guided Builder
              </button>
            </div>
          </div>
        )}

        {view === 'worked-example' ? (
          <WorkedExample 
            key={walkthroughId} 
            initialId={walkthroughId} 
            onBack={() => setView('select-firm')} 
          />
        ) : inputMode === 'guided' ? (
          <GuidedBuilder 
            onPitchReady={handlePitchSynthesized} 
            onCancel={() => handleToggleMode('pro')} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Input Form */}
            <section className="space-y-6">
            <div className="bg-[#111111] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Target className="text-blue-400" size={20} />
                Draft Your Pitch
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ticker Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. AAPL"
                    value={pitch.ticker}
                    onChange={e => setPitch({...pitch, ticker: e.target.value.toUpperCase()})}
                    className="w-full bg-[#1A1A1A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono uppercase"
                  />
                </div>

                <TooltipTextarea
                  label="Investment Thesis"
                  subLabel="Why this stock? What is the market missing?"
                  placeholder="The market is misunderstanding..."
                  value={pitch.thesis}
                  onChange={e => setPitch({...pitch, thesis: e.target.value})}
                  rows={4}
                  highlightColor="blue"
                  tooltipTitle="Strong Thesis"
                  tooltipText="Clearly state the variant perception. What does the market misunderstand that you see clearly?"
                  tooltipExample="The street views AAPL as a hardware company, but it's transitioning to a high-margin services ecosystem."
                />

                <TooltipTextarea
                  label="Catalysts"
                  subLabel="What events will drive the stock price?"
                  placeholder="1. Upcoming earnings will easily beat expectations...&#10;2. New product launch in Q3..."
                  value={pitch.catalysts}
                  onChange={e => setPitch({...pitch, catalysts: e.target.value})}
                  rows={3}
                  highlightColor="emerald"
                  tooltipTitle="Strong Catalysts"
                  tooltipText="List specific, time-bound events that will force the market to recognize your thesis."
                  tooltipExample="1. Q3 earnings will reveal >25% services revenue. 2. New product launch in October."
                />

                <TooltipTextarea
                  label="Key Risks"
                  subLabel="What could break your thesis?"
                  placeholder="1. Supply chain disruptions...&#10;2. Competitor pricing..."
                  value={pitch.risks}
                  onChange={e => setPitch({...pitch, risks: e.target.value})}
                  rows={3}
                  highlightColor="red"
                  tooltipTitle="Strong Risks"
                  tooltipText="Acknowledge the bear case and structurally breaking points, and how you monitor them."
                  tooltipExample="If Chinese demand weakens by >10%, services growth won't outpace hardware unit declines."
                />
                
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isEvaluating 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isEvaluating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <TrendingUp size={20} />
                      </motion.div>
                    ) : (
                      <Play size={20} fill="currentColor" />
                    )}
                    {isEvaluating ? 'Evaluating Pitch...' : 'Pitch to PM'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: Feedback */}
          <section className="h-full">
            <AnimatePresence mode="wait">
              {!feedback && !isEvaluating && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-[#111111] border border-slate-800 rounded-2xl border-dashed"
                >
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <Lightbulb className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Waiting for Pitch</h3>
                  <p className="text-slate-500 max-w-sm">
                    Fill out the form on the left and submit your pitch to get professional feedback from our AI Portfolio Manager.
                  </p>
                </motion.div>
              )}

              {isEvaluating && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-[#111111] border border-blue-500/30 rounded-2xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]"
                >
                  <div className="relative mb-6">
                    <motion.div
                      className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-medium text-blue-400 mb-2 animate-pulse">PM is Reviewing...</h3>
                  <p className="text-slate-500 text-sm">Analyzing thesis clarity, catalyst timelines, and risk factors.</p>
                </motion.div>
              )}

              {feedback && !isEvaluating && (
                <motion.div 
                  key="feedback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111111] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
                >
                  {/* Score Card */}
                  <div className="flex items-center gap-6 p-6 bg-[#1A1A1A] rounded-xl border border-slate-800">
                    <div className="relative flex shrink-0 items-center justify-center w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-800">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                        <motion.circle 
                          initial={{ strokeDasharray: "0 300" }}
                          animate={{ strokeDasharray: `${(feedback.score / 100) * 289} 300` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          cx="50" cy="50" r="46" fill="transparent" 
                          stroke="currentColor" strokeWidth="8" strokeLinecap="round" 
                          className={feedback.score >= 80 ? 'text-emerald-500' : feedback.score >= 60 ? 'text-yellow-500' : 'text-red-500'} 
                        />
                      </svg>
                      <div className="text-2xl font-bold text-white z-10 flex flex-col items-center">
                        {feedback.score}
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest -mt-1">Score</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">PM Evaluation</h3>
                      <p className="text-sm text-slate-400">
                        {feedback.score >= 80 ? "High conviction pitch. Solid fundamental tracking." : 
                         feedback.score >= 60 ? "Average pitch. Needs more depth and clear catalysts." : 
                         "Weak pitch. Missing critical Wall Street analysis components."}
                      </p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <CheckCircle2 size={16} /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm border-l-2 border-emerald-500 text-slate-300 bg-emerald-500/5 py-2 pl-4 pr-2 rounded-r-lg">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <AlertTriangle size={16} /> Weaknesses
                    </h4>
                    <ul className="space-y-2">
                      {feedback.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm border-l-2 border-red-500 text-slate-300 bg-red-500/5 py-2 pl-4 pr-2 rounded-r-lg">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Advice */}
                  <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden mt-4">
                    <div className="absolute top-0 right-0 p-4 opacity-10 filter blur-sm">
                      <Zap size={80} className="text-blue-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2 uppercase tracking-wider relative z-10">
                      <Target size={16} /> Actionable Advice
                    </h4>
                    <p className="text-sm text-blue-100/90 relative z-10 leading-relaxed font-medium">
                      {feedback.actionableAdvice}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
        )}
      </div>
    </div>
  );
}
