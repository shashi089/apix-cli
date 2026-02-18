import { test, expect } from '../src/dsl/index.js';

test('Global DSL: should fetch ditto', async (ctx) => {
    const res = await ctx.request({
        url: 'https://pokeapi.co/api/v2/pokemon/ditto',
        method: 'GET',
    });

    expect(res).toHaveStatus(200);
});

test('Global DSL: should fail gracefully', async (ctx) => {
    const res = await ctx.request({
        url: 'https://pokeapi.co/api/v2/pokemon/missing',
        method: 'GET',
    });

    expect(res).toHaveStatus(404);
});
