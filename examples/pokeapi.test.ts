import { TestSuite } from '../src/types/index.js';

const suite: TestSuite = {
    name: 'PokeAPI Health Check',
    tests: [
        {
            name: 'should fetch ditto data',
            run: async (ctx) => {
                const res = await ctx.request({
                    url: 'https://pokeapi.co/api/v2/pokemon/ditto',
                    method: 'GET',
                });

                ctx.expect(res).toHaveStatus(200);
                ctx.expect(res.body.name).toBe('ditto');
            },
        },
        {
            name: 'should fail on non-existent pokemon',
            run: async (ctx) => {
                const res = await ctx.request({
                    url: 'https://pokeapi.co/api/v2/pokemon/non-existent-12345',
                    method: 'GET',
                });

                ctx.expect(res).toHaveStatus(404);
            },
        }
    ],
};

export default suite;
