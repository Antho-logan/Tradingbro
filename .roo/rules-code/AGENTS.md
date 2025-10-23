# Project Coding Rules (Non-Obvious Only)

- Always use `coerceJSON` utility from src/lib/openrouter.ts when parsing AI responses instead of JSON.parse
- Image processing must use Sharp library (excluded from client bundle via next.config.ts)
- All AI responses must be validated with Zod schemas before use (tradePlanSchema in src/types/trade-io.ts)
- State management should use custom hooks pattern (see useTradeAnalysis in src/app/chat/hooks/)
- When working with AI APIs, always implement fallback responses when parsing fails
- Image uploads must be processed with shrinkImage() (1200px width, 80% quality) to reduce token usage
- Form components should use Radix UI primitives from src/components/ui/
- API routes must follow the error response pattern defined in TradeChatResponse type
- Environment variables should be accessed through the ENV object from src/lib/env.ts
- Use the dual AI model pattern: vision model for feature extraction, reasoning model for plan generation