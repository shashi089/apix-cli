<div align="center">

# apix

**TypeScript-first API testing for teams that ship.**

[![npm](https://img.shields.io/npm/v/@apix/cli?color=0ea5e9&label=npm)](https://www.npmjs.com/package/@apix/cli)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org)

Write API tests in TypeScript. Run them from the CLI. Validate against your OpenAPI spec. Ship with confidence.

</div>

---

## Why not Postman?

Postman is a GUI tool built for exploration. **apix is a code-first tool built for automation.**

| | Postman | apix |
|---|---|---|
| **Lives in Git** | ❌ JSON exports, not code | ✅ `.ts` files, full diff history |
| **TypeScript** | ❌ Proprietary scripting | ✅ Native, typed, IDE-complete |
| **CI/CD** | ⚠️ Requires Newman + config | ✅ `npx apix run` — done |
| **OpenAPI validation** | ❌ Manual schema checks | ✅ Automatic per-request |
| **Code review** | ❌ GUI state, no diffs | ✅ PRs, blame, history |
| **Monorepo** | ❌ Workspace-level only | ✅ Per-package config |
| **Reports** | ⚠️ Cloud-only | ✅ HTML + JSON, local |
| **Cost** | 💸 Team plan required | ✅ Free, open-source |

If your tests live in a GUI, they don't belong to your team — they belong to a vendor. **apix puts your tests back in your codebase.**

---

## Quick Start

> **apix is not yet published to npm.** Install it directly from GitHub — see the full guide in **[INSTALL_FROM_GITHUB.md](./INSTALL_FROM_GITHUB.md)**.

### Install into your project

```bash
npm install github:shashi089/apix-cli
```

### Create a config file

```ts
// apix.config.ts
import type { Config } from '@apix/cli';

const config: Config = {
  baseUrl: 'https://your-api.com',
  timeout: 10_000,
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
};

export default config;
```

### Write a test

```ts
// tests/users.test.ts
import { test } from '@apix/cli/dsl';

test('GET /users — returns 200', async (ctx) => {
  const res = await ctx.request({ url: '/users', method: 'GET' });
  ctx.expect(res).toHaveStatus(200);
});
```

### Run it

```bash
npx apix run "tests/**/*.test.ts"
```

Output:

```
❯ users.test.ts

  ✓ GET /users — returns 200   312ms

────────────────────────────────────────
   PASSED   312ms
────────────────────────────────────────
  ✓ Passed  1
  ✖ Failed  0
    Total   1
────────────────────────────────────────
```

Exit code `1` on failure — CI-ready out of the box.

> For local clone setup, environment variables, updating, and troubleshooting — see **[INSTALL_FROM_GITHUB.md](./INSTALL_FROM_GITHUB.md)**.

---

## Configuration

```ts
// apix.config.ts
import type { Config } from '@apix/cli';

const config: Config = {
  baseUrl: 'https://api.yourservice.com',
  timeout: 10_000,
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
  openapi: {
    specPath: './openapi.json',
    strict: false,           // true = fail on missing schemas
  },
  reporters: {
    outDir: './apix-reports',
    json: true,
    html: true,
  },
};

export default config;
```

---

## Writing Tests

### DSL style (recommended)

```ts
// users.test.ts
import { test, expect } from '@apix/cli/dsl';

test('GET /users — returns a list', async (ctx) => {
  const res = await ctx.request({
    url: '/users',
    method: 'GET',
  });

  ctx.expect(res).toHaveStatus(200);
  ctx.expect(res.body).toHaveProperty('data');
});

test('POST /users — creates a user', async (ctx) => {
  const res = await ctx.request({
    url: '/users',
    method: 'POST',
    body: { name: 'Alice', email: 'alice@example.com' },
  });

  ctx.expect(res).toHaveStatus(201);
  ctx.expect(res.body.name).toBe('Alice');
});
```

### Suite style (for shared setup)

```ts
// auth.test.ts
import type { TestSuite } from '@apix/cli';

const suite: TestSuite = {
  name: 'Auth API',
  tests: [
    {
      name: 'POST /auth/login — returns token',
      run: async (ctx) => {
        const res = await ctx.request({
          url: '/auth/login',
          method: 'POST',
          body: { email: 'admin@example.com', password: 'secret' },
        });

        ctx.expect(res).toHaveStatus(200);
        ctx.expect(res.body.token).toBeTruthy();
      },
    },
  ],
};

export default suite;
```

### Available assertions

```ts
ctx.expect(res).toHaveStatus(200);
ctx.expect(res.body.name).toBe('Alice');
ctx.expect(res.body.items).toEqual([1, 2, 3]);
ctx.expect(res.body.message).toContain('success');
ctx.expect(res.body.token).toBeTruthy();
ctx.expect(res.body).toHaveProperty('id');
```

---

## OpenAPI Validation

> **This feature is entirely optional.** apix works perfectly without a spec — OpenAPI validation is an additive layer you enable when you're ready.

Point apix at your OpenAPI 3.x spec and every response is automatically validated — no extra code in your tests.

```ts
// apix.config.ts
const config: Config = {
  baseUrl: 'https://api.yourservice.com',
  openapi: {
    specPath: './openapi.json',  // path to your spec file
    strict: false,               // true = fail if no schema found for a route
  },
};
```

```ts
// products.test.ts
test('GET /products/:id — response matches schema', async (ctx) => {
  const res = await ctx.request({ url: '/products/42', method: 'GET' });

  // apix automatically validates res.body against
  // the GET /products/{id} → 200 schema in your spec.
  // No extra assertion needed.
  ctx.expect(res).toHaveStatus(200);
});
```

If the response body doesn't match the schema, apix throws a detailed error:

```
  ✖ GET /products/42 — response matches schema  (67ms)
    ├ [apix/openapi] Response body failed schema validation:
    ├   • body.price: must be number
    └   • body.stock: must have required property 'stock'
```

**Supported:**
- OpenAPI 3.x JSON specs
- Local `$ref` resolution
- Path template matching (`/users/{id}`)
- `default` response fallback
- `strict: false` silently skips missing schemas (good for partial specs)

### Where does `openapi.json` come from?

You have three options — pick whichever fits your stack:

**Option A — Your backend generates it automatically (recommended)**

Most frameworks can emit a spec at build time or startup:

| Framework | Tool |
|---|---|
| NestJS | `@nestjs/swagger` |
| Express | `swagger-jsdoc` |
| Fastify | `@fastify/swagger` |
| Hono | `hono/zod-openapi` |
| FastAPI (Python) | Built-in at `/openapi.json` |
| Spring Boot | `springdoc-openapi` |

Example with NestJS — write the spec to disk during your build step:

```ts
// main.ts (NestJS)
import * as fs from 'fs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const document = SwaggerModule.createDocument(app, new DocumentBuilder()
  .setTitle('My API').setVersion('1.0').build()
);
fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
```

Commit `openapi.json` to your repo. apix reads it on every test run.

> **Note on naming:** "Swagger" and "OpenAPI" are open standards. `@nestjs/swagger`, `swagger-jsdoc`, and the Swagger Editor are open-source tools (Apache 2.0 / MIT). Referencing them by name carries no copyright or trademark concerns.

**Option B — Write it by hand (small or internal APIs)**

For a small API, a minimal spec is straightforward:

```json
{
  "openapi": "3.0.0",
  "info": { "title": "My API", "version": "1.0.0" },
  "paths": {
    "/users/{id}": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["id", "name"],
                  "properties": {
                    "id":   { "type": "integer" },
                    "name": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

Use the free [Swagger Editor](https://editor.swagger.io) for a visual editor with live validation — no account required.

**Option C — Generate from an existing running API**

If you have a live API but no spec yet, tools can reverse-engineer one:

- **[Optic](https://www.useoptic.com/)** — captures real traffic and generates a spec from it
- **[swagger-autogen](https://github.com/swagger-autogen/swagger-autogen)** — scans Express route files
- **Postman** — export any collection as OpenAPI 3.0 from the GUI

### Recommended workflow

```
Backend generates openapi.json at build time
           ↓
Commit openapi.json to the repo alongside your tests
           ↓
apix validates every response on every CI run
           ↓
Spec drift from reality → test fails → caught before prod
```

This turns your spec into a **living contract** — not a document that goes stale.

---

## Generating Reports

> **This feature is entirely optional.** If no `reporters` config is set, apix simply prints results to the terminal and exits — no files are written.

Enable reporters in your config and apix writes reports after every run:

```ts
reporters: {
  outDir: './apix-reports',
  json: true,   // apix-reports/report.json
  html: true,   // apix-reports/report.html
}
```

The **HTML report** is a fully self-contained, dependency-free file — open it in any browser, attach it to a PR, or upload it as a CI artifact. It includes:

- Pass/fail summary with total duration
- Per-suite test tables with badges
- Expandable error rows showing expected vs received + response body

The **JSON report** is machine-readable and suitable for downstream tooling, dashboards, or Slack bots.

---

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run API tests
        run: npx apix run "tests/**/*.test.ts"
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
          BASE_URL: ${{ vars.STAGING_URL }}

      - name: Upload HTML report
        if: always()   # upload even on failure
        uses: actions/upload-artifact@v4
        with:
          name: apix-report
          path: apix-reports/
```

### GitLab CI

```yaml
api-tests:
  image: node:20-alpine
  script:
    - npm ci
    - npx apix run "tests/**/*.test.ts"
  artifacts:
    when: always
    paths:
      - apix-reports/
    expire_in: 7 days
  variables:
    API_TOKEN: $API_TOKEN
```

apix exits with code `1` when any test fails, which causes the CI job to fail automatically. No extra configuration needed.

---

## Monorepo Usage

apix reads config from the nearest `apix.config.ts` relative to where you run it. In a monorepo, each package can have its own config:

```
apps/
  users-service/
    apix.config.ts      # baseUrl: http://users-service
    tests/
      users.test.ts
  orders-service/
    apix.config.ts      # baseUrl: http://orders-service
    tests/
      orders.test.ts
```

Run tests for a specific service:

```bash
# From the monorepo root
npx apix run "apps/users-service/tests/**/*.test.ts"

# Or from within the package
cd apps/users-service
npx apix run "tests/**/*.test.ts"
```

Use a shared base config with per-service overrides:

```ts
// apps/users-service/apix.config.ts
import baseConfig from '../../apix.base.config.ts';

export default {
  ...baseConfig,
  baseUrl: process.env.USERS_SERVICE_URL ?? 'http://localhost:3001',
};
```

---

## Project Structure

```
src/
├── types/        shared TypeScript contracts
├── config/       config file loader
├── request/      HTTP client (fetch-based, Node 18+)
├── assertions/   assertion library (toBe, toHaveStatus, …)
├── dsl/          global test() + expect() DSL
├── runner/       test orchestrator
├── openapi/      OpenAPI spec loading, $ref resolution, Ajv validation
├── reporters/    JSON + HTML report generation
├── cli/          CLI commands (run, init)
└── utils/        logger
```

**Dependency rules:** each module only imports from modules below it in the list. No circular dependencies. No DI framework.

---

## Roadmap

| Status | Feature |
|---|---|
| ✅ | TypeScript-first test runner |
| ✅ | DSL (`test()`) + suite (`TestSuite`) patterns |
| ✅ | Full assertion library |
| ✅ | OpenAPI 3.x response validation |
| ✅ | HTML + JSON reports |
| ✅ | CI exit codes |
| ✅ | `.env` support |
| 🔜 | `apix init` scaffold command |
| 🔜 | Watch mode (`apix run --watch`) |
| 🔜 | Parallel test execution |
| 🔜 | `beforeAll` / `afterAll` hooks |
| 🔜 | Response time assertions (`toRespondWithin`) |
| 🔜 | JUnit XML report (for Jenkins / Azure DevOps) |
| 🔜 | gRPC support |
| 🔜 | VS Code extension |

---

## Contributing

Contributions are welcome. apix is intentionally small — please keep PRs focused.

### Setup

```bash
git clone https://github.com/shashi089/apix-cli.git
cd apix-cli
npm install
npm run build
```

### Running the examples

```bash
npx tsx src/cli/index.ts run "examples/pokeapi.dsl.test.ts"
npx tsx src/cli/index.ts run "examples/openapi-validation.test.ts"
```

### Project conventions

- **No new runtime dependencies** without discussion — the current footprint is intentionally minimal (`ajv`, `commander`, `dotenv`, `fast-glob`, `picocolors`, `tsx`)
- **Single responsibility** — each module in `src/` has one job. See the structure above
- **No circular imports** — the dependency graph is strictly one-way
- **TypeScript strict mode** — `tsc` must exit 0 before any PR is merged

### Submitting a PR

1. Fork the repo and create a feature branch
2. Write your change + update or add tests in `examples/`
3. Run `npm run build` — must exit 0
4. Open a PR with a clear description of what and why

### Reporting bugs

Open an issue with:
- apix version (`npx apix --version`)
- Node version (`node --version`)
- Minimal reproduction (a test file + config)
- Actual vs expected output

---

## License

MIT © Shashidhar Naik
