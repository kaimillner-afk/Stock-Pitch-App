export interface FirmStyle {
  id: string;
  name: string;
  description: string;
  promptEmphasis: string;
}

export interface StockPitch {
  ticker: string;
  thesis: string;
  catalysts: string;
  risks: string;
}

export interface GuidedAnswers {
  ticker: string;
  businessQuality: string;
  variantPerception: string;
  catalysts: string;
  risks: string;
}

export interface PitchFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  actionableAdvice: string;
}
