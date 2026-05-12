import { Type } from '@google/genai';
import { StockPitch, PitchFeedback, FirmStyle } from '../types';
import { ai } from './apiClient';

export async function evaluateStockPitch(
  pitch: StockPitch,
  firmStyle: FirmStyle,
  specificFirm?: string
): Promise<PitchFeedback> {
  const prompt = `You are an expert Portfolio Manager evaluating a junior analyst.
The user has selected a target firm style: ${firmStyle.name} ${specificFirm ? `(specific firm: ${specificFirm})` : ''}.
Calibrate your evaluation rubric to that firm's investment philosophy:
- Long-only quality (Capital Group, Lone Pine): heaviest weight on durability of moat, management track record, long-term compounding. Penalize trader-style catalyst dependencies and short-horizon thinking.
- Classic value (Baupost, Greenlight): heaviest weight on downside scenario, margin of safety, asset coverage. Penalize growth narrative without value backstop.
- L/S pod (Citadel, Millennium, Point72): heaviest weight on variant view specificity, catalyst path within 6-12 months, exit triggers, and position sizing/risk-reward math. Penalize unfocused "long-term story" pitches.
- Tiger cub / Growth-at-scale (Coatue, Tiger Global, D1): heaviest weight on TAM defensibility, unit economics at scale, durability of growth. Penalize anything that ignores unit economics or assumes TAM without articulating how share is captured.
- Event-driven / Special situations (Third Point, Elliott): heaviest weight on catalyst clarity, probabilistic outcomes, deal mechanics. Penalize fuzzy "general improvement" theses.
- Distressed / Restructuring (Oaktree, Centerbridge): heaviest weight on capital structure, recovery analysis, leverage point in the cap stack. Penalize anything that ignores debt seniority or assumes equity recovery without waterfall analysis.
- Activist (Pershing Square activist, Starboard): heaviest weight on what specifically the candidate would change at the company and the operational/strategic playbook. Penalize "good business buy and hold" without a clear change agenda.

Score, strengths, weaknesses, and actionable advice should all reflect this calibration. A pitch that's an 80 for a Tiger cub seat should be a 50 for a value seat if the variant view is growth-shaped.

They are pitching the following stock:
Ticker: ${pitch.ticker}
Thesis: ${pitch.thesis}
Catalysts: ${pitch.catalysts}
Risks: ${pitch.risks}

Provide honest, direct, Wall-Street-style feedback. Be constructive but demanding.
Evaluate their pitch.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "A number 0-100 indicating quality/conviction of the pitch structure and thought process"
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 strings detailing strong points of their pitch"
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 strings detailing weak points, logical gaps, or missing critical elements"
            },
            actionableAdvice: {
              type: Type.STRING,
              description: "1-2 sentences on how they can improve this specific pitch"
            }
          },
          required: ["score", "strengths", "weaknesses", "actionableAdvice"]
        }
      }
    });

    let text = response.text;
    if(!text) throw new Error("Empty response from Gemini");
    
    text = text.replace(/```json\n?|```\n?/g, '').trim();
    
    const json = JSON.parse(text) as PitchFeedback;
    return json;
  } catch (error: any) {
    console.error("Evaluation failed", error);
    throw new Error(error?.message || "Failed to evaluate pitch");
  }
}
