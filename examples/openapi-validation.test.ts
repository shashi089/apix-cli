/**
 * OpenAPI Validation Example
 *
 * Demonstrates automatic response validation against a local OpenAPI spec.
 * The spec is loaded from examples/openapi/pokemon.json.
 *
 * To run:
 *   node dist/cli/index.js test examples/openapi-validation.test.ts
 *
 * Note: The openapi config must be set in apix.config.ts (or passed via CLI).
 * For this example we import the suite directly — the runner picks up config
 * from apix.config.ts which should include:
 *
 *   openapi: {
 *     specPath: './examples/openapi/pokemon.json',
 *     strict: false,
 *   }
 */
import { TestSuite } from '../src/types/index.js';

const suite: TestSuite = {
    name: 'OpenAPI Response Validation',
    tests: [
        {
            name: 'GET /pokemon/ditto — validates 200 response against schema',
            run: async (ctx) => {
                const res = await ctx.request({
                    url: 'https://pokeapi.co/api/v2/pokemon/ditto',
                    method: 'GET',
                });

                ctx.expect(res).toHaveStatus(200);
                // If openapi config is set, the response body was already
                // validated against the Pokemon schema automatically.
                ctx.expect(res.body.name).toBe('ditto');
            },
        },
        {
            name: 'GET /pokemon/pikachu — validates 200 response against schema',
            run: async (ctx) => {
                const res = await ctx.request({
                    url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
                    method: 'GET',
                });

                ctx.expect(res).toHaveStatus(200);
                ctx.expect(res.body.name).toBe('pikachu');
            },
        },
        {
            name: 'GET /pokemon/non-existent — 404 skips validation (strict: false)',
            run: async (ctx) => {
                const res = await ctx.request({
                    url: 'https://pokeapi.co/api/v2/pokemon/non-existent-xyz-99999',
                    method: 'GET',
                });

                // PokeAPI returns a plain text "Not found." for 404
                ctx.expect(res).toHaveStatus(404);
            },
        },
    ],
};

export default suite;
