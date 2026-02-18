/**
 * Verification script for the reporting module.
 * Simulates two suites (one passing, one with a failure) and generates both reports.
 *
 * Run: npx tsx scripts/verify-reporters.ts
 */
import { ResultCollector } from '../src/reporters/collector.js';
import { runReporters } from '../src/reporters/index.js';
import { TestResult } from '../src/types/index.js';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = './apix-reports';

// ── Simulate test results ────────────────────────────────────────────────────

const collector = new ResultCollector();

// Suite 1: all passing
const passResults: TestResult[] = [
    { name: 'should fetch ditto', passed: true, duration: 312 },
    { name: 'should fetch pikachu', passed: true, duration: 289 },
    { name: 'should return 200 for valid pokemon', passed: true, duration: 198 },
];
collector.addSuite('PokeAPI Health Check', passResults, 799);

// Suite 2: one failure with error + response body
const failResults: TestResult[] = [
    { name: 'should return 200', passed: true, duration: 150 },
    {
        name: 'should validate schema',
        passed: false,
        duration: 45,
        error: new Error('[apix/openapi] Response body failed schema validation:\n  • (root): must have required property "id"\n  • (root): must have required property "base_experience"'),
        response: {
            status: 404,
            statusText: 'Not Found',
            headers: { 'content-type': 'text/plain' },
            body: 'Not found.',
            duration: 45,
        },
    },
];
collector.addSuite('Schema Validation Suite', failResults, 195);

// ── Generate reports ─────────────────────────────────────────────────────────

const summary = collector.getSummary();
await runReporters(summary, { outDir: OUT_DIR, json: true, html: true });

// ── Verify output ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
    if (condition) {
        console.log(`✅ ${label}`);
        passed++;
    } else {
        console.error(`❌ ${label}`);
        failed++;
    }
}

const jsonPath = path.join(OUT_DIR, 'report.json');
const htmlPath = path.join(OUT_DIR, 'report.html');

check('report.json exists', fs.existsSync(jsonPath));
check('report.html exists', fs.existsSync(htmlPath));

if (fs.existsSync(jsonPath)) {
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    check('JSON: totalPassed = 4', json.totalPassed === 4);
    check('JSON: totalFailed = 1', json.totalFailed === 1);
    check('JSON: totalTests = 5', json.totalTests === 5);
    check('JSON: has 2 suites', json.suites.length === 2);
    check('JSON: has timestamp', typeof json.timestamp === 'string');
    check('JSON: error message captured', json.suites[1].results[1].error?.includes('schema validation'));
    check('JSON: responseBody captured', json.suites[1].results[1].responseBody === 'Not found.');
}

if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    check('HTML: contains apix brand', html.includes('apix'));
    check('HTML: contains suite name', html.includes('PokeAPI Health Check'));
    check('HTML: contains FAILED status', html.includes('FAILED'));
    check('HTML: no external script/link tags', !html.includes('src="http') && !html.includes('href="http'));
    check('HTML: has inline toggle script', html.includes('function toggle'));
}

// ── No-op test ───────────────────────────────────────────────────────────────
await runReporters(summary, undefined);
check('No-op: runReporters(undefined) does not throw', true);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
