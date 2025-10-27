# AI Trade Chat Refine Flow - Canonical JSON Implementation

## 🎯 Overview

The AI Trade Chat refine flow has been completely refactored to use a canonical JSON structure with comprehensive trace logging. This implementation ensures consistent API responses, proper error handling, and end-to-end traceability.

## 📊 Canonical JSON Structure

### Success Response
```json
{
  "traceId": "ui_refine_1234567890_abc123",
  "meta": {
    "instrument": "BTCUSDT",
    "timeframe": "15m",
    "risk_pct": "2",
    "mode": "refine"
  },
  "questions": [],  // May be empty array
  "suggestions": []  // May be empty array
}
```

### Error Response
```json
{
  "traceId": "ui_refine_1234567890_abc123",
  "error": {
    "message": "Planner timeout after 90000ms",
    "code": "timeout"
  }
}
```

## 🔧 Implementation Details

### 1. API Types (`src/types/api.ts`)

#### New Types Added:
- `PlannerSuccess` - Canonical success response structure
- `PlannerError` - Canonical error response structure
- `RefineResponse` - Union type for success/error responses

#### Enhanced Types:
- `TradeChatResponse` - Extended with optional `traceId` field

### 2. Init Route (`src/app/api/trade-chat/init/route.ts`)

#### Cache Headers Added:
```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
```

#### Logging Pattern:
```typescript
console.log(`[INIT START] trace=${traceId} meta=${JSON.stringify(meta)}`);
console.log(`[INIT END] trace=${traceId} status=${status} duration=${duration}ms`);
```

#### Response Headers:
- `X-Trace-Id` - Included in all responses for debugging

### 3. Refine Route (`src/app/api/trade-chat/refine/route.ts`)

#### Cache Headers Added:
```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
```

#### Logging Pattern:
```typescript
console.log(`[REFINE START] trace=${traceId} keys=[${keys.join(',')}]`);
console.log(`[PLANNER START] trace=${traceId} model=${model} timeout=${timeout}`);
console.log(`[PLANNER RESPONSE] trace=${traceId} status=${status} ms=${ms}`);
console.log(`[REFINE END] trace=${traceId} outcome=${outcome} duration=${duration}ms`);
```

#### Error Handling:
- Empty planner responses treated as errors (`planner_empty`)
- All errors include traceId for debugging
- Structured error format with message and code

### 4. DeepSeek Client (`src/lib/deepseek.ts`)

#### Enhanced Logging:
```typescript
console.log(`[PLANNER] ${traceId} start`, { model, timeout, messageCount });
console.log(`[PLANNER] ${traceId} end`, { elapsed, ok: true, snippet });
console.log(`[PLANNER] ${traceId} timeout`, { timeoutMs });
console.log(`[PLANNER] ${traceId} error`, error);
```

#### JSON Directive Handling:
- `ensureJsonDirective()` guarantees "json" word in prompts
- Auto-retry for missing JSON directive errors
- Model fallback for invalid model errors

#### Error Handling:
- Timeout handling with `AbortError`
- Structured error objects with context
- 200-char content snippets for debugging

### 5. Hook (`src/app/chat/hooks/useTradeAnalysis.ts`)

#### Canonical Response Handling:
The hook now uses `PlannerResponse` instead of legacy `TradeChatResponse`:

```typescript
// Success with suggestions
if (json.suggestions.length > 0) {
  setPlan({
    meta: json.meta,
    clarifyingQuestions: [],
    suggested: json.suggestions,
    warnings: [],
  });
  setStatus("done");
}

// Success with questions
if (json.questions.length > 0) {
  setQuestions(json.questions);
  setPlan({
    meta: json.meta,
    clarifyingQuestions: json.questions,
    suggested: [],
    warnings: [],
  });
  setStatus("needsAnswers");
}

// Error handling
if ("error" in json) {
  setError(`${json.error.message} (trace ${json.traceId})`);
  setStatus("error");
}
```

#### TraceId Generation:
```typescript
const traceId = `ui_refine_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
```

#### Status Management:
- `idle` → `analyzing` → `reasoning` → `needsAnswers` → `refining` → `done` | `error`
- Proper traceId propagation in error messages
- Maintains meta context when init returns questions

### 6. Test Endpoint (`src/app/api/trade-chat/test-refine/route.ts`)

#### Purpose:
- Isolated testing of refine functionality
- Burns DeepSeek tokens with actual API calls
- Returns canonical response structure

#### Usage:
```bash
POST /api/trade-chat/test-refine
{
  "mockPlan": { /* partial TradePlan */ },
  "mockAnswers": { "question_id": "answer" }
}
```

## 🎯 Acceptance Criteria Met

✅ **POST /api/trade-chat/refine returns 200 with canonical structure**
- Success responses include traceId, meta, questions, suggestions
- Error responses include traceId, error.message, error.code

✅ **Server logs display exact trace-prefixed entries**
- `[INIT START/END]` for init route
- `[REFINE START/END]` for refine route  
- `[PLANNER START/RESPONSE]` for DeepSeek calls

✅ **Test endpoint burns DeepSeek tokens and returns canonical structure**
- `/api/trade-chat/test-refine` uses actual DeepSeek API
- Returns same canonical structure as production endpoint

✅ **UI displays plans/questions with traceId on errors**
- Hook properly handles canonical response structure
- Error messages include traceId for debugging

✅ **Network tab shows consistent requests with proper headers**
- All responses include `X-Trace-Id` header
- Consistent JSON structure across all endpoints

✅ **All responses include traceId for debugging**
- Generated in UI hook: `ui_refine_${timestamp}_${random}`
- Propagated through all API calls and responses

## 🚀 Production Features

### Traceability
- End-to-end traceId from UI to API to DeepSeek
- Comprehensive logging with timing information
- Error tracking with traceId correlation

### Reliability
- Robust error handling with fallback responses
- Timeout protection with AbortController
- Model aliasing and fallback logic

### Performance
- Proper cache headers for dynamic content
- Rate limiting on test endpoint
- Efficient JSON parsing with safe-json utilities

### Debugging
- DEBUG_AI=1 environment variable for verbose logging
- Content snippets in logs for quick inspection
- Structured error codes for common issues

## 📋 Testing

### Manual Testing
1. Upload chart and verify init flow with logs
2. Answer questions and verify refine flow with logs
3. Check Network tab for proper headers and structure
4. Test error scenarios with traceId verification

### Automated Testing
```bash
# Test refine endpoint directly
curl -X POST http://localhost:3003/api/trade-chat/test-refine \
  -H "Content-Type: application/json" \
  -d '{
    "mockPlan": {"meta": {"instrument": "BTCUSDT"}},
    "mockAnswers": {"risk": "2"}
  }'
```

### Health Check
```bash
# Verify DeepSeek connectivity
curl http://localhost:3003/api/trade-chat/health
```

## 🔍 Debugging

### Enable Debug Logs
```bash
DEBUG_AI=1 npm run dev
```

### Key Log Patterns to Watch
- `[INIT START] trace=...` - Init request started
- `[REFINE START] trace=...` - Refine request started
- `[PLANNER START] trace=...` - DeepSeek API call started
- `[PLANNER RESPONSE] trace=...` - DeepSeek response received

### Common Error Codes
- `timeout` - Planner API call timed out
- `rate_limit_exceeded` - Too many requests
- `missing_input` - Required parameters missing
- `planner_empty` - Empty response from planner
- `model_not_found` - Invalid model specified

## 📚 API Reference

### Init Endpoint
```
POST /api/trade-chat/init
Content-Type: multipart/form-data

Body: FormData with "image" file

Response: PlannerResponse (canonical structure)
```

### Refine Endpoint
```
POST /api/trade-chat/refine
Content-Type: application/json

Body: {
  "previous": TradePlan,
  "answers": Record<string, string>
}

Response: PlannerResponse (canonical structure)
```

### Test Refine Endpoint
```
POST /api/trade-chat/test-refine
Content-Type: application/json

Body: {
  "mockPlan": Partial<TradePlan>,
  "mockAnswers": Record<string, string>
}

Response: PlannerResponse (canonical structure)
```

---

**The AI Trade Chat refine flow is now production-ready with comprehensive logging, canonical JSON structure, and full traceability.**