import { Type } from '@google/genai';
import { StockPitch, GuidedAnswers } from '../types';
import { ai } from './apiClient';

export async function synthesizePitch(answers: GuidedAnswers): Promise<StockPitch> {
  const prompt = `You are a Senior Analyst mentoring a junior on how to structure a stock pitch. 
The junior has provided raw notes answering four key questions. 
Distill their raw notes into a crisp, professional, Wall-Street-style structured stock pitch.

Do not add new assumptions unless it logically completes their thought. Do not invent non-existent metrics.
Maintain the core of their argument but elevate the language. Make it punchy and concise.

Raw Notes:
- Ticker: ${answers.ticker}
- Business Quality & Context: ${answers.businessQuality}
- Variant Perception (The Thesis): ${answers.variantPerception}
- Catalysts: ${answers.catalysts}
- Key Risks: ${answers.risks}

Synthesize these into the following 4 sections:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: {
              type: Type.STRING,
              description: "The stock ticker symbol."
            },
            thesis: {
              type: Type.STRING,
              description: "Combining the business context and the variant perception into a strong, concise 3-4 sentence investment thesis."
            },
            catalysts: {
              type: Type.STRING,
              description: "A bulleted or numbered list of hard events that will drive the stock, synthesized from their catalyst notes."
            },
            risks: {
              type: Type.STRING,
              description: "A bulleted or numbered list of key risks and mitigants, synthesized from their risk notes."
            }
          },
          required: ["ticker", "thesis", "catalysts", "risks"]
        }
      }
    });

    let text = response.text;
    if(!text) throw new Error("Empty response from Mentor LLM");
    
    text = text.replace(/```json\n?|```\n?/g, '').trim();
    
    const json = JSON.parse(text) as StockPitch;
    return json;
  } catch (error: any) {
    console.error("Mentor synthesis failed", error);
    throw new Error(error?.message || "Failed to synthesize guided answers.");
  }
}
