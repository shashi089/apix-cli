# Installing apix Directly from GitHub

> **No npm account needed.** Use this guide to install apix directly into your project from the GitHub repository — ideal for evaluating the framework before it is published to npm.

---

## Prerequisites

- Node.js 18 or higher
- npm 7 or higher (for `file:` and `github:` dependency support)

---

## Option 1 — Install from GitHub URL (recommended)

Add apix directly to your project's `package.json` using npm's built-in GitHub install:

```bash
npm install github:shashi089/apix-cli
```

Or pin to a specific commit or branch for stability:

```bash
# Specific branch
npm install github:shashi089/apix-cli#main

# Specific commit SHA
npm install github:shashi089/apix-cli#a1b2c3d
```

npm will clone the repo, run `npm run build` (the `prepare` script), and install it as a local dependency — exactly like a published package.

> Replace `shashi089/apix-cli` with the actual GitHub username and repo name once the repo is public.

---

## Option 2 — Install from a local clone

If you want to modify apix alongside your project, clone it locally first:

```bash
# 1. Clone the repo somewhere on your machine
git clone https://github.com/shashi089/apix-cli.git
cd apix-cli
npm install
npm run build
```

Then in your project:

```bash
npm install file:../apix-cli
```

Or add it manually to `package.json`:

```json
{
  "dependencies": {
    "@apix/cli": "file:../apix-cli"
  }
}
```

Run `npm install` to link it. Any time you change apix, rebuild it (`npm run build` inside the apix-cli folder) and reinstall in your project.

---

## Step-by-step: Setting up your first test

### 1. Install apix

```bash
npm install github:shashi089/apix-cli
```

### 2. Create a config file

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

### 3. Write your first test

```ts
// tests/users.test.ts
import { test } from '@apix/cli/dsl';

test('GET /users — returns 200', async (ctx) => {
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

### 4. Add a script to `package.json`

```json
{
  "scripts": {
    "test:api": "apix run \"tests/**/*.test.ts\""
  }
}
```

### 5. Run your tests

```bash
npm run test:api
```

Or directly:

```bash
npx apix run "tests/**/*.test.ts"
```

---

## Environment variables

Create a `.env` file in your project root — apix loads it automatically:

```env
API_TOKEN=your-secret-token
BASE_URL=https://staging.your-api.com
```

Reference them in `apix.config.ts` via `process.env.API_TOKEN`.

---

## Updating apix

### If installed via GitHub URL

```bash
npm install github:shashi089/apix-cli
```

Re-running the install command always fetches the latest commit on the default branch.

### If installed via local clone

```bash
# Inside the apix-cli folder
git pull
npm run build

# Back in your project
npm install
```

---

## Troubleshooting

**`apix: command not found`**

The `bin` entry requires the package to be built. If you installed from a local clone, make sure you ran `npm run build` inside the apix directory first.

**TypeScript errors on import**

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022"
  }
}
```

**Tests not found**

Pass the glob pattern explicitly:

```bash
npx apix run "tests/**/*.test.ts"
```

Glob patterns must be quoted to prevent shell expansion.

---

## When you're ready to publish

Once you've validated apix works for your team, publishing to npm is one command:

```bash
npm login
npm publish --access public
```

The `package.json` is already configured with `name`, `bin`, `main`, and `engines`. No changes needed.
