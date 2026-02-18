/**
 * Manual verification script for OpenAPI validation.
 * Tests: schema match, schema mismatch, strict mode missing schema.
 *
 * Run: npx tsx scripts/verify-openapi.ts
 */
import { OpenApiValidator } from '../src/openapi/index.js';

const SPEC = './examples/openapi/pokemon.json';

async function run() {
    let passed = 0;
    let failed = 0;

    // ── Test 1: Valid response passes schema validation ──────────────────────
    try {
        const validator = new OpenApiValidator({ specPath: SPEC, strict: true });
        const res = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
        const body = await res.json();
        await validator.validate('GET', '/api/v2/pokemon/ditto', 200, body);
        console.log('✅ Test 1 PASS: Valid ditto response passes schema validation');
        passed++;
    } catch (e: any) {
        console.error('❌ Test 1 FAIL:', e.message);
        failed++;
    }

    // ── Test 2: Schema mismatch fails with clear error ───────────────────────
    try {
        const validator = new OpenApiValidator({ specPath: SPEC, strict: true });
        // Inject a body missing required fields (id, base_experience, etc.)
        const badBody = { name: 'fake', wrongField: true };
        await validator.validate('GET', '/api/v2/pokemon/ditto', 200, badBody);
        console.error('❌ Test 2 FAIL: Should have thrown for invalid body');
        failed++;
    } catch (e: any) {
        if (e.message.includes('failed schema validation')) {
            console.log('✅ Test 2 PASS: Invalid body correctly rejected with:', e.message.split('\n')[0]);
            passed++;
        } else {
            console.error('❌ Test 2 FAIL (unexpected error):', e.message);
            failed++;
        }
    }

    // ── Test 3: strict=false skips when schema missing ───────────────────────
    try {
        const validator = new OpenApiValidator({ specPath: SPEC, strict: false });
        // /api/v2/berry is not in the spec
        await validator.validate('GET', '/api/v2/berry/1', 200, { some: 'data' });
        console.log('✅ Test 3 PASS: Missing schema silently skipped (strict: false)');
        passed++;
    } catch (e: any) {
        console.error('❌ Test 3 FAIL:', e.message);
        failed++;
    }

    // ── Test 4: strict=true fails when schema missing ────────────────────────
    try {
        const validator = new OpenApiValidator({ specPath: SPEC, strict: true });
        await validator.validate('GET', '/api/v2/berry/1', 200, { some: 'data' });
        console.error('❌ Test 4 FAIL: Should have thrown for missing schema in strict mode');
        failed++;
    } catch (e: any) {
        if (e.message.includes('No schema found')) {
            console.log('✅ Test 4 PASS: Missing schema throws in strict mode:', e.message);
            passed++;
        } else {
            console.error('❌ Test 4 FAIL (unexpected error):', e.message);
            failed++;
        }
    }

    // ── Test 5: $ref resolution works (Pokemon schema uses $ref) ─────────────
    try {
        const validator = new OpenApiValidator({ specPath: SPEC, strict: true });
        const res = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');
        const body = await res.json();
        await validator.validate('GET', '/api/v2/pokemon/pikachu', 200, body);
        console.log('✅ Test 5 PASS: $ref resolved correctly for pikachu');
        passed++;
    } catch (e: any) {
        console.error('❌ Test 5 FAIL:', e.message);
        failed++;
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}

run();
