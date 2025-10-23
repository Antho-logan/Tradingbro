# Project Documentation Rules (Non-Obvious Only)

- The app uses a dual AI model approach: vision model for chart feature extraction, reasoning model for trade plan generation
- API endpoints are structured around a chat-based interaction pattern (/api/trade-chat/init, /api/trade-chat/refine)
- State management uses custom hooks pattern (useTradeAnalysis) rather than state management libraries
- The project has separate type definitions for internal TradePlan format and API I/O format
- Development server runs on port 3003 (not the default 3000)
- The project includes a dev-demo page at src/app/chat/dev-demo/ for testing AI functionality