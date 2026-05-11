# Stock Pitch Simulator

**Master the Wall Street pitch.** AI-powered interview prep for buy-side candidates, calibrated to seven different firm investing styles.

## What it does

Stock Pitch Simulator gives candidates rigorous, firm-specific feedback on their stock pitches. The same pitch is evaluated differently for a Citadel-style L/S pod vs a Baupost-style value seat vs a Pershing-style long-only quality fund — closing the access gap for first-generation candidates who don't have buy-side mentors and don't know how different funds actually evaluate ideas.

Built for the MLT20 AI Buildathon, May 2026.

## Features

- **Pitch Builder.** Submit your Investment Thesis, Catalysts, and Key Risks. Get a 0-100 score, specific strengths and weaknesses, and actionable advice — calibrated to your target firm style.
- **Seven firm-style rubrics.** Long-Only Quality, Classic Value, L/S Pod, Tiger Cub, Event-Driven, Distressed/RX, Activist. Each has its own evaluation logic mapped to that style's actual investing priorities.
- **Costco walkthrough.** Annotated worked example showing what a strong pitch looks like, with explanations of what makes each section work.
- **Demo pitches.** Professional Apple, Amateur Tesla, and Costco contrasts to anchor expectations.

## Try it live

Hosted via Google AI Studio: https://ai.studio/apps/252428a3-74ad-4915-a9b1-0a4e4b4a73c6

## How it works

Built in Google AI Studio Build mode using Gemini 3 Pro Preview. The "AI Portfolio Manager" is a calibrated system prompt that maps Sonkin and Johnson's *Pitch the Perfect Investment* framework into firm-specific evaluation rubrics. The system prompts are the moat — the code is a thin React/TypeScript wrapper.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app: `npm run dev`

## Built with

- Google AI Studio (Build mode)
- Gemini 3 Pro Preview
- TypeScript / React / Vite
