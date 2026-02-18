/**
 * End-to-end integration test: runs real PokeAPI tests and generates reports.
 * Run: npx tsx scripts/verify-reporters-e2e.ts
 */
import { ResultCollector } from '../src/reporters/collector.js';
import { runReporters } from '../src/reporters/index.js';
import { TestRunner } from '../src/runner/index.js';
import { TestSuite } from '../src/types/index.js';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = './apix-reports';

const config = {
    reporters: { outDir: OUT_DIR, json: true, html: true },
};

const runner = new TestRunner(config);
const collector = new ResultCollector();

// Load and run the pokeapi test suite
const mod = await import(pathToFileURL('./examples/pokeapi.test.ts').href + '?t=' + Date.now());
const suite = mod.default as TestSuite;

const t0 = performance.now();
const results = await runner.runTests(suite.tests, suite.name);
const dur = Math.round(performance.now() - t0);

collector.addSuite(suite.name, results, dur);
await runReporters(collector.getSummary(), config.reporters);

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`\nTest run: ${passed} passed, ${failed} failed`);
console.log(`JSON: ${fs.existsSync(path.join(OUT_DIR, 'report.json')) ? '✅ written' : '❌ missing'}`);
console.log(`HTML: ${fs.existsSync(path.join(OUT_DIR, 'report.html')) ? '✅ written' : '❌ missing'}`);

process.exit(failed > 0 ? 1 : 0);
