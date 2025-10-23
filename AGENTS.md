# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
This is a Next.js 15 application with TypeScript that provides AI-powered trading analysis. The app allows users to upload trading charts, receive AI-generated trade plans, and refine them through clarifying questions.

## Development Commands
- `npm run dev` - Start development server on port 3003 with Turbopack
- `npm run dev:smart` - Start development with custom script (scripts/dev.mjs)
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server on port 3003
- `npm run lint` - Run ESLint

## Non-Obvious Technical Details

### AI Integration Architecture
- The app uses a dual AI model approach:
  1. Vision model (OpenRouter Qwen-VL) for chart feature extraction
  2. Reasoning model (DeepSeek R1) for trade plan generation
- All AI responses are validated with Zod schemas before use
- Image processing includes automatic resizing (1200px width, 80% quality) to reduce token usage

### API Structure
- `/api/trade-chat/init` - Initial chart analysis endpoint
- `/api/trade-chat/refine` - Plan refinement endpoint
- `/api/trade-chat/health` - Health check endpoint
- `/api/trade-chat/selftest` - Self-diagnostic endpoint

### Environment Configuration
- Multiple API providers supported (OpenRouter, Google Gemini, OpenAI)
- Provider switching via environment variables (VISION_PROVIDER, DEEPSEEK_PROVIDER)
- Custom error handling with fallback responses when AI parsing fails

### Key Libraries & Patterns
- Uses `coerceJSON` utility for robust JSON parsing from AI responses
- Image processing uses Sharp library (excluded from client bundle)
- State management via custom hooks (useTradeAnalysis)
- Form handling with Radix UI components

### Debugging
- Set `DEBUG_AI=1` environment variable to see AI request/response logs
- Debug information is included in API responses when available
- Network tab should show POST requests to `/api/trade-chat/refine` during plan refinement

### Type Safety
- Strict TypeScript configuration with path aliases (`@/*` maps to `./src/*`)
- Zod schemas for API validation (tradePlanSchema in src/types/trade-io.ts)
- Separate types for internal TradePlan format and API I/O format

### Custom Components
- TradePlanCard for displaying generated trade plans
- ClarifyingForm for handling AI questions
- UploadDropzone for chart image uploads

### Testing
- Tests located in `tests/` directory
- Uses standard test runner (configure based on package.json if test scripts are added)