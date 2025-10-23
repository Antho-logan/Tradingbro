# Project Debug Rules (Non-Obvious Only)

- Set `DEBUG_AI=1` environment variable to see AI request/response logs
- Debug information is included in API responses when available
- Network tab should show POST requests to `/api/trade-chat/refine` during plan refinement
- Health endpoint should show vision.ok: true and planner.ok: true
- Check server console for PLANNER RAW and PLANNER PARSED logs when debugging AI responses
- Use the raw JSON toggle in dev-demo to inspect plan structures
- Use the debug info toggle in dev-demo to see detailed error information