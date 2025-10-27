# Test Refine Flow

## Test Steps

### 1. Test the refine endpoint directly

```bash
curl -X POST http://localhost:3003/api/trade-chat/test-refine \
  -H "Content-Type: application/json" \
  -d '{
    "mockPlan": {
      "meta": {
        "instrument": "BTCUSDT",
        "timeframe": "15m"
      },
      "clarifyingQuestions": [
        {
          "id": "risk",
          "text": "What is your risk percentage?"
        }
      ],
      "suggested": [],
      "warnings": []
    },
    "mockAnswers": {
      "risk": "2%"
    }
  }'
```

### 2. Test the complete flow via UI

1. Visit `http://localhost:3003/chat/dev-demo`
2. Upload a trading chart
3. Enter "1%" for Risk %, "BTCUSDT" for instrument, "15m" for timeframe
4. Click "Analyze Chart"
5. Should see clarifying questions
6. Answer the questions and submit
7. Should see "TradingBro is thinking..." state
8. Should transition to either:
   - A complete trade plan, OR
   - Additional clarifying questions, OR
   - An error with traceId

### 3. Verify Server Logs

With `DEBUG_AI=1`, you should see:

```
[INIT] ui_init_... start
[INIT] ... end 200
[REFINE START] ui_refine_...
[PLANNER START] ui_refine_...
[PLANNER RESPONSE] ui_refine_... (1234ms)
[REFINE END] ui_refine_... (1456ms) - plan returned
```

### 4. Verify Network Tab

In browser dev tools, you should see:
- POST to `/api/trade-chat/init` (200)
- POST to `/api/trade-chat/refine` (200)
- Both requests should have `x-trace-id` headers
- Response bodies should include `traceId` field

### 5. Verify DeepSeek Usage

Check DeepSeek dashboard to confirm token usage increments during refine calls.

## Expected Behavior

✅ **Hook preserves plan context** when init returns questions
✅ **Refine API receives** `{ previous, answers, traceId }` payload
✅ **DeepSeek is called** with proper system prompt and user answers
✅ **UI shows "TradingBro is thinking..."** during processing
✅ **Response includes traceId** for debugging
✅ **Errors surface with message + traceId** instead of silent failures
✅ **Network tab shows consistent** POST requests with proper headers

## Debugging Commands

```bash
# Check server logs
DEBUG_AI=1 npm run dev

# Test health endpoint
curl http://localhost:3003/api/trade-chat/health

# Test refine endpoint in isolation
curl -X POST http://localhost:3003/api/trade-chat/test-refine -H "Content-Type: application/json" -d '{"mockPlan": {}, "mockAnswers": {}}'