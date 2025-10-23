# Project Architecture Rules (Non-Obvious Only)

- The application follows a dual AI model architecture: vision model for feature extraction, reasoning model for plan generation
- API routes follow a chat-based pattern with init/refine endpoints rather than traditional CRUD
- State management uses custom hooks pattern rather than external state libraries
- Image processing is server-side only (Sharp excluded from client bundle)
- Type safety is enforced with separate schemas for internal TradePlan format and API I/O format
- The project uses provider switching via environment variables for multiple AI services
- Error handling includes fallback responses when AI parsing fails
- Development server runs on port 3003 to avoid conflicts with other services