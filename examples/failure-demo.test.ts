/**
 * Deliberate failure test to verify the CLI error output format.
 * Run: npx tsx src/cli/index.ts run "examples/failure-demo.test.ts"
 */
import { test } from '../src/dsl/index.js';

test('✓ GET /pokemon/ditto — should pass', async (ctx) => {
    const res = await ctx.request({
        url: 'https://pokeapi.co/api/v2/pokemon/ditto',
        method: 'GET',
    });
    ctx.expect(res).toHaveStatus(200);
    ctx.expect(res.body.name).toBe('ditto');
});

test('✖ GET /pokemon/ditto — wrong status assertion (deliberate fail)', async (ctx) => {
    const res = await ctx.request({
        url: 'https://pokeapi.co/api/v2/pokemon/ditto',
        method: 'GET',
    });
    // Deliberately wrong: expect 201 but will get 200
    ctx.expect(res).toHaveStatus(201);
});

test('✖ GET /pokemon/ditto — wrong name assertion (deliberate fail)', async (ctx) => {
    const res = await ctx.request({
        url: 'https://pokeapi.co/api/v2/pokemon/ditto',
        method: 'GET',
    });
    // Deliberately wrong: expect 'pikachu' but will get 'ditto'
    ctx.expect(res.body.name).toBe('pikachu');
});
