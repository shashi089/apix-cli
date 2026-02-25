<div align="center">

# apix: TypeScript-First API Testing Framework

**The best CLI-based REST API testing tool for Git-native automation, OpenAPI contract validation, and clean architecture.**

[![npm](https://img.shields.io/npm/v/@apix/cli?color=0ea5e9&label=npm)](https://www.npmjs.com/package/@apix/cli)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org)

apix brings reliable and modular API automation into the modern era. Write API tests in TypeScript, run them directly from your command line, and automatically validate payloads against your OpenAPI JSON specs.

</div>

---

## What is apix?

Traditional GUI-based tools (like Postman or Insomnia) are built for manual exploration. `apix` is a highly extensible, **TypeScript CLI API testing framework** built for automation. It integrates elegantly into modern **CI/CD REST API pipelines**, giving developers the power to treat their tests as first-class, Git-native infrastructure.

### Features
|   | Feature | Description |
|---|---------|-------------|
| 📝 | **TypeScript Native** | Tests are written in fully typed `.ts` files ensuring IDE integrations. |
| 🔄 | **Watch Mode** | `apix run --watch` automatically tracks and re-executes tests on save with native FS watchers. |
| 🛡️ | **OpenAPI Contract Validation** | Optionally validate your backend payloads against live `openapi.json` schemas globally. |
| ⚙️ | **Scaffold Generation** | Generate test suites directly from your specs using `apix generate --from openapi.json`. |
| 🌱 | **Git-Native History**| PRs actually show line-by-line file diffs, making API code-review processes frictionless. |
| 📊 | **Rich Reporting** | Outputs self-contained summary reports in JSON and HTML without external dependencies. |

---

## Quick Start
> **apix is not yet published to npm.** Install it directly from GitHub — see the full guide in **[INSTALL_FROM_GITHUB.md](./INSTALL_FROM_GITHUB.md)**.

### 1. Installation

```bash
npm install github:shashi089/apix-cli
```

### 2. Scaffold Missing Tests Automatically

Save hours of boilerplate writing. If you have an existing OpenAPI specification, feed it to `apix` to automatically scaffold heavily typed TypeScript test stubs for every active HTTP method:

```bash
npx apix generate --from openapi.json
```

This populates a clean directory structure grouping your tests optimally (e.g. `tests/users/get-users-id.test.ts`).

### 3. Write Your API Tests (DSL)

`apix` exposes a highly familiar, Jest-like Domain Specific Language (DSL) specifically optimized for REST API verification.

```ts
// tests/users.test.ts
import { test } from '@apix/cli/dsl';

test('GET /users — verifies proper payload', async (ctx) => {
  const res = await ctx.request({ url: '/users', method: 'GET' });
  ctx.expect(res).toHaveStatus(200);
  ctx.expect(res.body).toHaveProperty('data');
});
```

### 4. Run Watch Mode During Development
Execute tests instantly while modifying endpoints. 

```bash
npx apix run "tests/**/*.test.ts" --watch
```
*(The `--watch` flag debounces filesystem activity natively on Node 18+ to gracefully manage test flows and exit gracefully on `Ctrl+C`)*

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

## OpenAPI Validation & Contract Testing

Building bullet-proof software requires **Contract Testing with OpenAPI**. apix optionally reads your `openapi.json` specs and mathematically validates the structure of every single payload on its respective route *without requiring any extra assertion code!*

Point apix at your OpenAPI 3.x spec and every response is automatically validated:

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

If the response body doesn't match the schema, apix throws a detailed error.

**Supported:**
- OpenAPI 3.x JSON specs
- Local `$ref` resolution
- Path template matching (`/users/{id}`)
- `default` response fallback
- `strict: false` silently skips missing schemas (good for partial specs)

---

## Generating Reports

> **This feature is entirely optional.** If no `reporters` config is set, apix simply prints results to the terminal and exits — no files are written.

Enable reporters in your config and apix writes reports after every run:

The **HTML report** is a fully self-contained, dependency-free file — open it in any browser, attach it to a PR, or upload it as a CI artifact. It includes:
- Pass/fail summary with total duration
- Per-suite test tables with badges
- Expandable error rows showing expected vs received + response body

The **JSON report** is machine-readable and suitable for downstream tooling, dashboards, or Slack bots.

---

## CI Integration

apix exits with code `1` when any test fails, which causes CI jobs to fail automatically. No extra configuration needed.

### GitHub Actions Example

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
```

---

## Monorepo Usage

apix reads config from the nearest `apix.config.ts` relative to where you run it. In a monorepo, each package can have its own config:

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

## Architectural Implementation

For those curious about how `apix` works under the hood, the architecture dictates strict, functional dependency rules that keep the framework incredibly lightweight and agile:

- **No Over-engineering**: Designed to be the fastest Node CLI for API tracking, operating without deep abstractions.
- **`src/runner/`**: Evaluates individual tests completely decoupled from configurations or assertions.
- **`src/cli/`**: The CLI orchestration layer relying on `commander`.
- **`src/generator/`**: Specialized OpenAPI spec traversing that gracefully avoids AST-manipulation in favor of high-performance localized path sorting.
- **`src/watcher/`**: Provides a robust zero-dependency alternative to libraries like `chokidar`, utilizing raw `node:fs` capabilities to debounce and monitor environments efficiently.
- **`src/reporters/`**: Handles generating JSON + HTML reports cleanly without tying into the core runner loop.
- **`src/dsl/`**: Exposes the global `test()` + `expect()` structure seamlessly to your test files.

There are **No Circular Dependencies** and the application stays modular.

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

### Project conventions

- **No new runtime dependencies** without discussion — the current footprint is intentionally minimal (`ajv`, `commander`, `dotenv`, `fast-glob`, `picocolors`, `tsx`)
- **Single responsibility** — each module in `src/` has one job. See the architecture above.
- **No circular imports** — the dependency graph is strictly one-way.
- **TypeScript strict mode** — `tsc` must exit 0 before any PR is merged.

---

## License

MIT © Shashidhar Naik
