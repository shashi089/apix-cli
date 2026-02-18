# apix - Architecture Overview

## Test Discovery & Dynamic Import Pattern

### Glob-Based Test Discovery
The CLI uses `fast-glob` to discover test files dynamically:

```typescript
// In src/cli/commands/run.ts
const testFiles = await glob(pattern, { absolute: true });
// Default pattern: **/*.test.ts
```

**How it works:**
1. User runs: `apix run examples/*.test.ts`
2. Glob pattern expands to match all test files
3. Returns absolute file paths for import

### Dynamic Import Pattern
Tests are loaded at runtime using dynamic imports:

```typescript
// Clear registry before each file
registry.clear();

// Dynamic import triggers test() calls
await import(pathToFileURL(file).toString() + `?t=${Date.now()}`);

// Retrieve registered tests
const tests = registry.getTests();
```

**Cache Busting:** The `?t=${Date.now()}` query parameter ensures fresh imports during development.

### API Context Injection
The runner injects the HTTP client instance into each test:

```typescript
// In TestRunner.runTests()
const ctx: TestContext = {
  request: (req) => this.client.request(req),
  expect: expect,
  api: this.client,  // Direct HttpClient instance
};

await test.run(ctx);
```

## Test File Structure

### Using the API Instance
```typescript
import { test, expect } from '../src/core/dsl.js';

test('GET request', async ({ api }) => {
  const res = await api.get('/users');
  expect(res).toHaveStatus(200);
});

test('POST request', async ({ api }) => {
  const res = await api.post('/posts', { title: 'Test' });
  expect(res).toHaveStatus(201);
});
```

### Backward Compatible
```typescript
test('Using ctx.request', async (ctx) => {
  const res = await ctx.request({ 
    url: '/users', 
    method: 'GET' 
  });
  expect(res).toHaveStatus(200);
});
```

## Key Design Decisions

1. **Registry Pattern**: Tests self-register during import
2. **Singleton HttpClient**: One shared instance per test run
3. **Context Injection**: Each test receives a fresh context with shared client
4. **Sequential Execution**: Tests run one-by-one for deterministic behavior
5. **Flexible API**: Both `api.get()` semantic methods and `ctx.request()` are supported
