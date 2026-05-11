import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, AlertTriangle, Zap, CheckCircle2, Lightbulb, Building2, ArrowRight } from 'lucide-react';
import { PitchFeedback } from '../types';

const EXAMPLES_DATA = {
  costco: {
    ticker: 'COST',
    thesis: `At ~$870, COST trades at 50x forward EPS — a premium that reflects the market's view of membership flywheel value as fully priced in. Consensus expects 6-7% comp growth and 7% EPS CAGR. Our variant view: the e-commerce business is structurally underearning. COST's online runs at <3% of total sales vs. Sam's Club at ~25% and Walmart at ~17%, despite COST having the highest-income, most digitally native customer of the three. Recent investments in app, search, and same-day delivery are showing 20%+ y/y digital comp growth at no margin dilution. We think this drives 100-200bps incremental comp acceleration over 3 years that consensus models don't reflect, plus member upgrade math (Executive tier at higher ARPU) compounding quietly. Re-rating on top of the comp surprise.`,
    catalysts: `1. Q1 FY26 print (December 2025) — first quarter at the higher $65/$130 membership prices flowing through; renewal rate confirms or breaks the fee absorption thesis. Consensus models 60bps drag; we see flat to up.\n2. May 2026 capital return announcement — historically COST has done $7-15/share specials every 2-3 years; cash position supports another in this window.\n3. E-com disclosure inflection — management has hinted at breaking out digital economics in FY26 reporting; once visible, consensus likely revises upward.`,
    risks: `1. GLP-1 / consumer demand deceleration affects bulk-buying behavior. Bear case: comps slip to 3-4% on volume softness, multiple compresses to 35x, equity at ~$580 (-33%).\n2. Membership renewal rate rolls below 90% (currently 93% US/Canada, 90% global) signaling fee absorption fatigue. Would invalidate the structural pricing power thesis.\n3. E-com investment cycle costs more than expected and dilutes operating margin near-term — delays the comp acceleration thesis even if structurally right.`,
    annotations: {
      thesis: "Notice three things: (1) anchors to the current valuation and what consensus expects, (2) articulates a specific variant view (e-com underearning vs. peers, with comparable data points), (3) quantifies the magnitude (100-200bps comp acceleration). This is the structure of every strong pitch — what the market believes, what you believe, and by how much you disagree.",
      catalysts: "Three specific events, each with rough timing and a falsifiable test. Q1 print is in <3 months — near-term. The capital return is calendar-driven. E-com disclosure is the multi-quarter unlock. Each catalyst has a measurable threshold, not just 'positive earnings.'",
      risks: "Three specific failure modes, each tied to a real downside number. The GLP-1 bear case includes the math ($580, -33%). The renewal rate risk specifies the level that would invalidate the thesis. This is what risks look like in a strong pitch — falsifiable, not generic."
    },
    feedback: {
      score: 92,
      strengths: [
        "Clear quantifiable variant perception tying e-commerce under-penetration to a 100-200bps comp acceleration.",
        "Excellent near-term catalysts (Q1 FY26 print, May 2026 capital return) with explicit expected outcomes.",
        "Risks are well-defined and tied to downside price targets (bear case equity ~$580, -33%)."
      ],
      weaknesses: [
        "Capital return catalyst might be fully anticipated given its historical 2-3 year predictable cadence.",
        "Assumes e-com margin dilution is negligible without addressing fulfillment cost pressures on bulk goods."
      ],
      actionableAdvice: "A remarkably strong L/S pod pitch. You've isolated consensus and provided specific variables to drive upside surprise. To make it bulletproof, get deeper on the exact unit economics of digital fulfillment to defend your margin thesis against pushback."
    },
    badge: "Expert Pitch",
    badgeColor: "text-amber-400 bg-amber-400/10 border-amber-500/20 shadow-amber-500/10",
    icon: Lightbulb,
    verdict: "High conviction pitch. Solid fundamental tracking."
  },
  apple: {
    ticker: 'AAPL',
    thesis: "At ~$215, AAPL trades at 28x forward EPS — a premium reflecting the market's view of services growth and Apple Intelligence as fully priced in. Consensus expects 6% revenue growth and 9% EPS growth in FY26, with Services at ~22% of revenue. Our variant view: installed base monetization is structurally underearning. With 2.4B active devices and Services revenue per device still under $35/year (vs. Google's $50+ per Android user), the runway on existing hardware is meaningfully larger than the \"AI upgrade cycle\" narrative captures. We model Services compounding at 12-14% (consensus: 8-10%) over three years, driven by App Store mix shift, Apple Pay/Card economics, and AI-enabled subscription products. With $165B net cash, a 4-5% buyback yield setting a floor, and 28% gross margin protection, asymmetry is favorable — flat-iPhone-cycle scenario still produces 10-12% IRR via capital return + Services compounding; upside in a real upgrade cycle is +30%.",
    catalysts: "1. WWDC June 2026 — first full year of Apple Intelligence in market; iPhone 17 cycle (September) is the tell on whether AI is moving units. Consensus expects 8% iPhone unit growth; we see 12%+ if AI features hold up.\n2. Services disclosure breakdown in FY26 10-K (October 2026) — management has signaled they'll disclose Services component economics; visibility into App Store/Subscriptions margins likely re-rates the segment multiple.\n3. China inflection — recent data shows iPhone share stabilizing after two-year decline. A clean Q1/Q2 China comp print would invalidate the \"structural China loss\" bear case that's been pressuring the multiple.",
    risks: "1. iPhone unit growth disappoints if AI features fail to drive upgrade behavior. Bear case: 0-2% unit growth, Services moderate to 9%, multiple compresses to 22x → equity at ~$155 (-28%). Cash + buyback yield provides ~4% partial offset.\n2. China share continues structural decline (>30% of segment revenue at risk over 3 years). Significant tail risk to top line; partially mitigated by Services and Wearables share gains.\n3. Antitrust — DOJ services case + EU DMA enforcement creates real risk to App Store economics. Worst case takes 100-150bps off Services growth and meaningfully impacts the high-margin mix story.",
    annotations: {
      thesis: "This pitch anchors heavily on valuation and contrasts consensus (8-10% services growth) with a variant view (12-14% growth). Providing the 'IRR floor' using buyback yield and margin protection shows a strong asymmetric risk/reward understanding.",
      catalysts: "Catalysts are well-timed (WWDC June 2026, 10-K October 2026) and tied to measurable outcomes (iPhone 17 cycle, Services component economics disclosure).",
      risks: "Quantified downside: $155 (-28%) equity price in the bear case. Outlines specific regulatory and geographic headwinds (DOJ, China) concisely."
    },
    feedback: {
      score: 88,
      strengths: [
        "Strong fundamental tracking with specific projections for Services growth (12-14%).",
        "Clear downside protection analysis (buyback yield + margins).",
        "Catalysts are tied to verifiable data points (10-K disclosures, Q1/Q2 China comp)."
      ],
      weaknesses: [
        "Does not fully address the risk of how higher prices for hardware might limit Services penetration.",
        "Relies heavily on historic assumptions for the buyback floor. Buybacks don't always floor the stock if topline deteriorates."
      ],
      actionableAdvice: "Very solid fundamental pitch. To improve, add a bit more sensitivity analysis on what happens if the App Store DOJ ruling specifically targets the 30% take rate, as that throws off the 12-14% Services CAGR thesis."
    },
    badge: "Professional Pitch",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-500/20 shadow-blue-500/10",
    icon: Target,
    verdict: "Strong fundamental tracking. Needs more regulatory sensitivity."
  },
  tesla: {
    ticker: 'TSLA',
    thesis: "Tesla is the best company in the world. They make the coolest cars and Elon Musk is a genius. The stock always goes up in the long run.",
    catalysts: "1. Cybertruck is going to be huge.\n2. Robotaxis will disrupt Uber.\n3. Everyone wants an electric car.",
    risks: "1. Maybe a recession?\n2. Legacy automakers trying to compete but they're too slow.",
    annotations: {
      thesis: "This is what NOT to do. This thesis contains zero numbers, no valuation context, and uses emotional language ('best company', 'coolest cars') instead of identifying a variant perception or mispricing in the market.",
      catalysts: "These are narratives, not catalysts. A catalyst needs a specific event and a timeframe. 'Cybertruck is going to be huge' is an opinion. 'Q3 Delivery print showing >100k Cybertrucks' would be a catalyst.",
      risks: "Risks are vague and dismissive. An amateur pitch hand-waves risks. A professional pitch quantifies them and explains exactly what price movement would invalidate the thesis."
    },
    feedback: {
      score: 35,
      strengths: [
        "Identifies broad, long-term themes relevant to the stock (Robotaxi, Cybertruck)."
      ],
      weaknesses: [
        "Complete lack of valuation analysis or quantifiable metrics.",
        "No timeline or specific metrics for catalysts.",
        "Fails to identify what the market currently believes vs what is misunderstood."
      ],
      actionableAdvice: "You must anchor your pitch in numbers and consensus. What is the street predicting for Cybertruck deliveries? What are you predicting? Why are they wrong? Quantify the upside and downside."
    },
    badge: "Amateur Pitch",
    badgeColor: "text-red-400 bg-red-400/10 border-red-500/20 shadow-red-500/10",
    icon: AlertTriangle,
    verdict: "Narrative-driven. Lacks valuation and precise catalysts."
  }
};

function AnnotationCallout({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="relative ml-2 inline-flex items-center align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
    >
      <div className="p-1 bg-amber-500/10 text-amber-500 rounded-md cursor-pointer hover:bg-amber-500/20 transition-colors">
        <Lightbulb size={16} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-72 max-w-[320px] bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 shadow-xl bottom-full mb-2 left-1/2 -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="flex items-center gap-1.5 text-amber-500 font-bold text-xs mb-1.5 uppercase tracking-wider">
              <Lightbulb size={12} fill="currentColor" /> Pro Tip
            </h4>
            <div className="text-xs text-amber-100/90 leading-relaxed font-medium">
              {text}
            </div>
            {/* Caret */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-solid border-t-amber-500/30 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReadOnlyField({ 
  label, annotation, value, rows = 4, isMono = false
}: { 
  label: string, annotation?: string, value: string, rows?: number, isMono?: boolean 
}) {
  return (
    <div className="mb-6 relative">
      <div className="flex items-center mb-2">
        <label className="block text-sm font-medium text-slate-400">{label}</label>
        {annotation && <AnnotationCallout text={annotation} />}
      </div>
      <textarea
        value={value}
        readOnly
        rows={rows}
        className={`w-full bg-[#1A1A1A]/80 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none resize-none custom-scrollbar text-sm md:text-base leading-relaxed ${isMono ? 'font-mono' : 'font-sans'}`}
      />
    </div>
  );
}

export function WorkedExample({ onBack, initialId = 'costco' }: { onBack: () => void, initialId?: 'costco' | 'apple' | 'tesla' }) {
  const [selectedId, setSelectedId] = useState<keyof typeof EXAMPLES_DATA>(initialId);
  const currentExample = EXAMPLES_DATA[selectedId];
  const feedback = currentExample.feedback;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-[#1A1A1A] p-1 rounded-xl inline-flex shadow-sm border border-slate-800">
          <button
            onClick={() => setSelectedId('costco')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedId === 'costco' 
                ? 'bg-amber-500/20 text-amber-500 shadow-md border border-amber-500/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Lightbulb size={16} />
            Costco
          </button>
          <button
            onClick={() => setSelectedId('apple')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedId === 'apple' 
                ? 'bg-blue-500/20 text-blue-400 shadow-md border border-blue-500/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Target size={16} />
            Apple
          </button>
          <button
            onClick={() => setSelectedId('tesla')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedId === 'tesla' 
                ? 'bg-red-500/20 text-red-400 shadow-md border border-red-500/30' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <AlertTriangle size={16} />
            Tesla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Form */}
        <section className="space-y-6">
          <div className="bg-[#111111] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all">
            {/* Subtle watermark / background highlight */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
              <CheckCircle2 size={200} />
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <currentExample.icon className={selectedId === 'costco' ? 'text-amber-500' : selectedId === 'tesla' ? 'text-red-500' : 'text-blue-400'} size={20} />
                Walkthrough: {currentExample.ticker}
              </h2>
              <div className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border ${currentExample.badgeColor}`}>
                <currentExample.icon size={12} fill="currentColor" /> {currentExample.badge}
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <ReadOnlyField 
                label="Ticker Symbol" 
                value={currentExample.ticker} 
                rows={1}
                isMono
              />

              <ReadOnlyField 
                label="Investment Thesis" 
                annotation={currentExample.annotations.thesis}
                value={currentExample.thesis} 
                rows={9}
              />

              <ReadOnlyField 
                label="Catalysts" 
                annotation={currentExample.annotations.catalysts}
                value={currentExample.catalysts} 
                rows={6}
              />

              <ReadOnlyField 
                label="Key Risks" 
                annotation={currentExample.annotations.risks}
                value={currentExample.risks} 
                rows={6}
              />

              <button
                onClick={onBack}
                className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]"
              >
                Now write your own pitch
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Feedback */}
        <section className="h-full">
          <motion.div 
            key={selectedId} /* Force re-animation when switching tabs */
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 sticky top-8"
          >
            {/* Score Card */}
            <div className="flex items-center gap-6 p-6 bg-[#1A1A1A] rounded-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-[120px] font-black text-slate-800/40 select-none pointer-events-none">
                {feedback.score}
              </div>
              <div className="relative flex shrink-0 items-center justify-center w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-800 z-10">
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
              
              <div className="z-10 bg-[#1A1A1A]/80 backdrop-blur-sm p-1">
                <h3 className="text-xl font-bold text-white mb-1">PM Evaluation</h3>
                <p className="text-sm text-slate-400">
                  {currentExample.verdict}
                </p>
                <div className="mt-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 border border-blue-500/20">
                  <Building2 size={12} />
                  L/S pod (Citadel, Millennium, Point72)
                </div>
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
            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden mt-4 shadow-inner shadow-blue-500/5">
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
        </section>
      </div>
    </div>
  );
}
