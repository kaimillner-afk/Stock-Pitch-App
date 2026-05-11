import path from 'path';

// We also need to supply a dummy GEMINI_API_KEY if it's not set. In the AI Studio env, process.env.GEMINI_API_KEY is available.

import { evaluateStockPitch } from './services/geminiService.js';
import { synthesizePitch } from './services/mentorService.js';
import { FirmStyle, StockPitch, GuidedAnswers } from './types.js';

const FIRM_STYLES: FirmStyle[] = [
  {
    id: "long-only",
    name: "Long-only quality (Pershing Square, Sequoia)",
    description: "Evaluates durable moats, capital allocation, and long-term compounding.",
    promptEmphasis: "Focus on durable competitive advantages (moats), high returns on invested capital (ROIC), management capital allocation skills, and long-term compounding. Ignore short-term noise, focus on terminal value and business quality."
  }
];

const test1Pitch: StockPitch = {
  ticker: 'LW',
  thesis: 'The business does have a lot of cashflows, its just masked by shareholder friendly policies, so it screens weak. But if the activists can successfully influence even more cuts and streamlining the business by selling international, the business will rerate. Even if it doesnt, I would pay a MSD multiple for this kind of asset given the moat.',
  catalysts: '1. Recognition that demand is stable, and 2. receivables moderating.',
  risks: 'If their very rational competitors start acting irrationally. Unfortunately, this is a company that is being researched for fixing prices with competitors. That is a bad thing, but you dont just switch from that to attacking eachothers margins overnight.'
};

const test2Pitch: StockPitch = {
  ticker: 'LW',
  thesis: "At $43, LW trades at 6.4x LTM EV/EBITDA vs. a 10-year median of ~12x and packaged-food peers (CAG ~12x, GIS ~14x, KHC ~10x). Market is conflating a self-inflicted reset (ERP miss, peak capex, win-back concessions) with structural impairment in a 97%-concentrated NA oligopoly where LW holds 39% share with a Pacific Northwest cost moat (yields ~600 vs. industry ~440 cwt/acre, ~500-700 bps margin advantage). Non-consensus edge #1: GAAP earnings understate run-rate FCF by ~$300-400M because FY26 capex of ~$750M masks the cash engine; as capex normalizes to ~$550M by FY28, FCF/share walks from depressed ~$2 to ~$5+. Non-consensus edge #2: the win-back is transient, not structural — contracts reset on 2-3yr cycles, LW ran this exact playbook post-COVID FY21 (price/mix went negative, then recovered to +20%+ as contracts repriced FY22-23), and -8% price/mix is unsustainable industry-wide because it puts McCain/Simplot below their ~12% cost of capital on freshly built capacity. F3Q26 NA volume +12% with sequential price/mix improvement is the early inflection signal. Critically, the math holds WITHOUT needing the 12x re-rate: at a structurally de-rated 10x P/FCF and a 22% FY29 margin (3 pts below Starboard's 25% target), stock = $53 (+23%). At 25% margin + 10x = $65 (+51%). At 25% + 12x = $78 (+81%). Bear case (20% margin, 8x P/FCF) = $34, only 21% downside. Asymmetry is the entire setup. With CFO Jim Gray personally buying $200K on 4/27/26, Starboard demanding $500M cost-out and APAC divestiture, and Mike Smith executing, this is a forced re-rate over 18-24 months.",
  catalysts: "1. F4Q26 earnings + FY27 guide, ~late July 2026 (~75 days out) — the near-term tell. F4 is seasonally stronger; if NA price/mix narrows to -3 to -5% (from F2Q26 -8%) AND volume holds, oligopoly is choosing utilization over price-war and the win-back is over.\n2. Starboard proxy nomination window opens ~July (90-120 days pre-September annual meeting) — escalation optionality.\n3. APAC strategic review announcement — Starboard's 4/30 letter explicit demand; formal announcement live any time.\n4. Insider buy signal already firing — CFO Jim Gray bought 4,556 shares ($200K) on 4/27/26.\n5. Capex inflection — FY26 ~$750M → FY28 ~$550M; ~$300-400M of incremental FCF visible by F2H FY27.\n6. Industry capacity rationalization — Connell, WA (LW) + Munro, Argentina (LW) closures already announced. Industry utilization recovering from mid-80s toward low-90s.\n7. Investor Day in 1H FY27 — narrative reset, explicit margin targets, SG&A to 4.5% of sales.",
  risks: "1. Simplot/Clarebout combined entity now holds ~30-32% global share, slightly exceeding LW. Critical distinction: NA market structure unchanged (39/30/29/5); merger is Europe-centric. Real risk = Simplot uses European cash flow to subsidize NA price aggression. Mitigants: family-owned ROIC focus, integration absorbs 12-18 months. Tell to watch: any Simplot or McCain NA capacity announcement in next 6 months.\n2. Antitrust class action (Redner's Markets et al.) alleging coordination via Circana's PotatoTrack 2021-2023. Raw treble-damages exposure $1-2B (industry overcharge ~5-10% of $20B '21-'23 revenue × 3 × 40% LW share = 15-40% of mcap). Realistic settlement ~$100-300M. Binary risk on class certification ruling late 2026/early 2027. Mitigant: pricing tracked input cost inflation, supporting parallel-conduct defense.\n3. Win-back becomes \"new normal\" — if F4Q26 NA price/mix prints worse than -7%, market re-prices as structural pricing-power loss. Sell signal.\n4. International drag persists — F2Q26 International EBITDA margin 5.0% vs 17% historical. Argentina ramp losses, Asia facing low-cost India/China local processors.\n5. Customer concentration — McDonald's = 15% of FY25 sales; multi-year contracts and proprietary fry profiles mitigate, but RFP cycles are a discrete risk. Loss or repricing of MCD contract would be a thesis-breaking event.\n6. GLP-1 demand drag — partly priced in; 20-30% insurance coverage caps adoption near-term, surveys show calorie cuts skew to sugary snacks over fries. But if penetration accelerates and per-capita fry consumption inflects negative in NA, terminal growth assumption (LSD volume) breaks and the multiple compresses further."
};

async function runTests() {
  console.log('--- TEST 1 ---');
  try {
    const feedback1 = await evaluateStockPitch(test1Pitch, FIRM_STYLES[0]);
    console.log('Test 1 Score:', feedback1.score);
  } catch (e) {
    console.error('Test 1 failed', e);
  }

  console.log('\\n--- TEST 2 ---');
  try {
    const feedback2 = await evaluateStockPitch(test2Pitch, FIRM_STYLES[0]);
    console.log('Test 2 Score:', feedback2.score);
  } catch (e) {
    console.error('Test 2 failed', e);
  }

  console.log('\\n--- TEST 3: Synthesis ---');
  try {
    const answers: GuidedAnswers = {
      ticker: 'AAPL',
      businessQuality: 'Good tech company, selling lots of iPhones',
      variantPerception: 'People think its a hardware company, but services is growing fast',
      catalysts: 'New AI features',
      risks: 'Chinese regulation'
    };
    const synth = await synthesizePitch(answers);
    console.log('Synthesized Pitch:', synth.ticker, 'has thesis length', synth.thesis?.length);
  } catch(e) {
    console.error('Test 3 failed', e);
  }
}

runTests();
