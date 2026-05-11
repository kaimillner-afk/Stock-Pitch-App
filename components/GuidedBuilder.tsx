import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GuidedAnswers, StockPitch } from '../types';
import { synthesizePitch } from '../services/mentorService';
import { Target, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, ArrowLeft, Wand2, Info, Building2, Calculator } from 'lucide-react';

interface GuidedBuilderProps {
  onPitchReady: (pitch: StockPitch, synthesisError?: string) => void;
  onCancel: () => void;
}

const STEPS = [
  {
    id: 'setup',
    title: 'The Setup',
    icon: <Lightbulb size={20} className="text-amber-400" />,
    description: "Start with the basics. What company are you pitching, and why now?",
  },
  {
    id: 'business',
    title: 'Business Quality',
    icon: <Building2 size={20} className="text-blue-400" />,
    description: "Understand the core business model and its competitive position.",
  },
  {
    id: 'edge',
    title: 'The Edge (Variant Perception)',
    icon: <Target size={20} className="text-purple-400" />,
    description: "What the market believes, and why you disagree.",
  },
  {
    id: 'math',
    title: 'The Math (Valuation)',
    icon: <Calculator size={20} className="text-green-400" />,
    description: "Quantify the upside and downside scenarios.",
  },
  {
    id: 'catalysts',
    title: 'Catalysts',
    icon: <TrendingUp size={20} className="text-cyan-400" />,
    description: "What forces the market to re-price the stock?",
  },
  {
    id: 'risks',
    title: 'Risks & Kill Criteria',
    icon: <AlertTriangle size={20} className="text-red-400" />,
    description: "What breaks the thesis, and when do you admit you're wrong?",
  }
];

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div 
      className="relative inline-flex items-center ml-2 align-middle cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <div className="p-1 rounded-md text-blue-400/80 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
        <Info size={16} />
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15, delay: 0.15 }}
            className="absolute z-50 w-72 max-w-[320px] bg-slate-800 backdrop-blur-md border border-slate-600 rounded-lg p-3 shadow-xl bottom-full mb-2 left-1/2 -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-slate-300 leading-relaxed font-sans font-normal whitespace-pre-wrap">
              {text}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-solid border-t-slate-600 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GuidedBuilder({ onPitchReady, onCancel }: GuidedBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const [hintDismissed, setHintDismissed] = useState(() => {
    return localStorage.getItem('guidedBuilderHintDismissed') === 'true';
  });

  const dismissHint = () => {
    localStorage.setItem('guidedBuilderHintDismissed', 'true');
    setHintDismissed(true);
  };

  const [formState, setFormState] = useState<Record<string, string>>({});

  const setVal = (key: string, val: string) => {
    setFormState(prev => ({ ...prev, [key]: val }));
  };
  const getVal = (key: string) => formState[key] || '';

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const handleComplete = async () => {
    setIsSynthesizing(true);
    
    const answersForMentor: GuidedAnswers = {
      ticker: String(getVal('ticker')).toUpperCase(),
      businessQuality: `
Company Do: ${getVal('companyDo')}
Why on radar: ${getVal('radar')}
Revenue Model: ${getVal('revModel')}
Moat: ${getVal('moat')}
Industry structure: ${getVal('industry')}
      `.trim(),
      variantPerception: `
Market Believes: ${getVal('marketBelieve')}
I believe differently: ${getVal('believeDiff')}
Why they are wrong: ${getVal('whyWrong')}
What's it worth: ${getVal('worth')}
Bull vs Base Case: ${getVal('bullBase')}
Bear Downsides: ${getVal('bearDownside')}
      `.trim(),
      catalysts: `
Near-term (90d): ${getVal('nearTerm')}
Med-term (6-18m): ${getVal('medTerm')}
Why not priced in: ${getVal('notPricedIn')}
      `.trim(),
      risks: `
#1 break thesis: ${getVal('breakThesis')}
Other risks: ${getVal('otherRisks')}
Kill Criteria: ${getVal('killCriteria')}
      `.trim()
    };

    try {
      const synthesizedPitch = await synthesizePitch(answersForMentor);
      setTimeout(() => {
        onPitchReady(synthesizedPitch);
      }, 500);
    } catch (err: any) {
      console.error(err);
      const fallbackPitch: StockPitch = {
        ticker: answersForMentor.ticker,
        thesis: `Business Context:\n${answersForMentor.businessQuality}\n\nVariant Perception:\n${answersForMentor.variantPerception}`,
        catalysts: answersForMentor.catalysts,
        risks: answersForMentor.risks
      };
      
      const errorMsg = "Synthesis failed due to a network or AI error. Your raw notes have been imported into the builder. Please refine them manually.";
      onPitchReady(fallbackPitch, errorMsg);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0) return !getVal('ticker').trim() || !getVal('companyDo').trim();
    if (currentStep === 1) return !getVal('revModel').trim();
    if (currentStep === 2) return !getVal('marketBelieve').trim() || !getVal('believeDiff').trim();
    if (currentStep === 3) return !getVal('worth').trim();
    if (currentStep === 4) return !getVal('nearTerm').trim();
    if (currentStep === 5) return !getVal('breakThesis').trim();
    return false;
  };

  const renderField = (
    id: string, 
    label: string, 
    tip?: string, 
    rows: number = 3, 
    isInput: boolean = false, 
    placeholder: string = ""
  ) => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {label}
          {tip && <InfoTooltip text={tip} />}
        </label>
        {isInput ? (
          <input
            type="text"
            placeholder={placeholder}
            value={getVal(id)}
            onChange={e => {
              if (id === 'ticker') {
                setVal(id, e.target.value.toUpperCase());
              } else {
                setVal(id, e.target.value);
              }
            }}
            className={`w-full bg-[#1A1A1A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans ${id === 'ticker' ? 'uppercase font-mono' : ''}`}
          />
        ) : (
          <textarea
            placeholder={placeholder}
            value={getVal(id)}
            onChange={e => setVal(id, e.target.value)}
            rows={rows}
            className="w-full bg-[#1A1A1A] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none custom-scrollbar text-base md:text-lg leading-relaxed"
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#111111] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="text-blue-400" />
            Guided Pitch Builder
          </h2>
        </div>
        
        <div className="flex gap-1 md:gap-2">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${
                idx === currentStep ? 'bg-blue-500' : idx < currentStep ? 'bg-blue-500/40' : 'bg-slate-800'
              }`} />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-12 min-h-[400px] flex flex-col relative">
        <AnimatePresence mode="wait">
          {isSynthesizing ? (
            <motion.div
              key="synthesizing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#111111] z-10 p-8"
            >
              <div className="w-16 h-16 mb-6 relative">
                <motion.div
                  className="absolute inset-0 border-4 border-blue-500/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Synthesizing Notes...</h3>
              <p className="text-slate-400 text-center max-w-md">
                The Senior Analyst is translating your raw thoughts into a structured, professional Wall Street pitch.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-slate-800 rounded-xl">
                  {STEPS[currentStep].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{STEPS[currentStep].title}</h3>
                </div>
              </div>
              <p className="text-slate-400 mb-8">{STEPS[currentStep].description}</p>

              {currentStep === 0 && !hintDismissed && (
                <div className="mb-8 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-3 rounded-xl">
                  <span className="text-xl shrink-0">💡</span>
                  <div className="flex-1 text-sm leading-relaxed">
                    Hover the <div className="inline-flex items-center align-middle bg-blue-500/10 p-0.5 rounded-md text-blue-400 mx-0.5"><Info size={14} /></div> icons next to each question for guidance on where to find the answer in primary sources (10-Ks, earnings calls, IR materials).
                  </div>
                  <button onClick={dismissHint} className="text-blue-400 hover:text-blue-200 shrink-0 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              )}

              <div className="flex-1">
                {currentStep === 0 && (
                  <>
                    <div className="md:w-1/3">
                      {renderField('ticker', 'Ticker Symbol', undefined, 1, true, 'e.g. AAPL')}
                    </div>
                    {renderField(
                      'companyDo', 
                      'What does this company do?', 
                      "Sources: 10-K Item 1 (Business), IR homepage, latest investor presentation. Goal: a one-sentence elevator pitch."
                    )}
                    {renderField(
                      'radar',
                      'Why is it on your radar right now?',
                      "Sources: 8-K filings for material events, recent earnings prints, activist letters, sell-side initiation notes. Be specific — 'down 40% on activist news' beats 'looks cheap.'"
                    )}
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    {renderField(
                      'revModel',
                      'Revenue model — how does it make money?',
                      "Sources: 10-K MD&A section, segment reporting in financial statements, investor day decks. Identify: who pays, for what, how often, at what margin."
                    )}
                    {renderField(
                      'moat',
                      'What\'s the moat?',
                      "Sources: 10-K 'competition' section (read between lines), industry reports, peer 10-Ks. Look for: pricing power, switching costs, scale, network effects, IP. 'Brand' alone is not a moat."
                    )}
                    {renderField(
                      'industry',
                      'Industry structure',
                      "Sources: trade association reports, top-3 competitor 10-Ks, antitrust filings. Quantify: top-N market share, growth rate, capacity utilization."
                    )}
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    {renderField(
                      'marketBelieve',
                      'What does the market currently believe?',
                      "Sources: sell-side consensus (avg PT, ratings distribution), recent analyst day takeaways, what's implied in the current multiple vs history. 'Consensus' = what the cheapest research note says."
                    )}
                    {renderField(
                      'believeDiff',
                      'What do you believe differently?',
                      "Edges usually come from: (a) primary research the Street ignores, (b) channel checks / expert calls, (c) different time horizon, (d) better numbers in the model, (e) recognizing structural change early. Pick one — don't say 'all of the above.'"
                    )}
                    {renderField(
                      'whyWrong',
                      'Why is the market wrong?',
                      "Strong answers explain WHY the inefficiency exists (orphaned spinoff, liquidity bucket, ESG forced sellers, post-event drift, complexity discount). 'The market is irrational' is not an answer."
                    )}
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    {renderField(
                      'worth',
                      'What\'s the stock worth?',
                      "Frameworks: P/E vs historical & peers, EV/EBITDA, DCF (sensitivity > point estimate), sum-of-parts. Sources: 10-year financials (Stock Analysis, Macrotrends), peer comp tables on Bloomberg/CapIQ."
                    )}
                    {renderField(
                      'bullBase',
                      'Bull vs base case math',
                      "Sources: management's LT targets from investor day, sell-side bull/bear cases for sanity check. Identify the 2-3 variables that drive 80% of the outcome."
                    )}
                    {renderField(
                      'bearDownside',
                      'Bear case downside',
                      "Sources: trough margins from prior cycles (10-yr history), book value × tangibility, distress comps. State a specific % loss — 'down 20%' beats 'could be ugly.'"
                    )}
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    {renderField(
                      'nearTerm',
                      'Near-term catalyst (90 days)',
                      "Sources: company IR calendar (earnings dates, analyst days), FDA calendar (biotech), capex spend curves, lockup expirations, proxy season filings."
                    )}
                    {renderField(
                      'medTerm',
                      'Medium-term catalyst (6-18 months)',
                      "Sources: management LT guidance, capital allocation announcements (buybacks, M&A, divestitures), industry capacity decisions, secular trend inflections, product launch timelines."
                    )}
                    {renderField(
                      'notPricedIn',
                      'Why hasn\'t the market priced this in?',
                      "Common reasons: (a) earnings noise hides structural shift, (b) reporting lag, (c) cycle mistiming, (d) ETF flows mask single-stock moves, (e) 'show me' stock needs multiple proof points before re-rating."
                    )}
                  </>
                )}

                {currentStep === 5 && (
                  <>
                    {renderField(
                      'breakThesis',
                      '#1 thing that breaks the thesis',
                      "10-K Risk Factors section is bloated — pick the 3 that actually matter. Cross-check: short-seller reports, bearish analyst notes, customer concentration data, debt covenant tests."
                    )}
                    {renderField(
                      'otherRisks',
                      'Other meaningful risks',
                      "Quantify each: 'X risk → Y bps margin impact → Z% stock impact.' Sources: sensitivity tables in DEF 14A, credit rating agency reports, regulatory filings."
                    )}
                    {renderField(
                      'killCriteria',
                      'What would make you sell?',
                      "Strong analysts have explicit kill criteria: '(a) thesis fact X breaks, (b) management changes, (c) stock hits target, (d) 6 quarters of bad data.' Vague answers = no discipline."
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        {!isSynthesizing && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                currentStep === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                isNextDisabled()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {currentStep === STEPS.length - 1 ? 'Synthesize Pitch' : 'Next Step'} 
              {currentStep !== STEPS.length - 1 && <ArrowRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
