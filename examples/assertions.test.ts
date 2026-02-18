import { test, expect } from '../src/dsl/index.js';

test('Assertions: toBe should pass for strict equality', async () => {
    expect(5).toBe(5);
    expect('hello').toBe('hello');
    expect(true).toBe(true);
});

test('Assertions: toEqual should pass for deep equality', async () => {
    expect({ name: 'John', age: 30 }).toEqual({ name: 'John', age: 30 });
    expect([1, 2, 3]).toEqual([1, 2, 3]);
});

test('Assertions: toContain should check substring', async () => {
    expect('Hello World').toContain('World');
    expect('apix framework').toContain('apix');
});

test('Assertions: toBeTruthy should validate truthy values', async () => {
    expect(true).toBeTruthy();
    expect(1).toBeTruthy();
    expect('hello').toBeTruthy();
    expect({ key: 'value' }).toBeTruthy();
    expect([1, 2, 3]).toBeTruthy();
});

test('Assertions: toHaveProperty should check object properties', async () => {
    const user = { name: 'Alice', age: 25, email: 'alice@example.com' };
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('age');
    expect(user).toHaveProperty('email');
});

test('Assertions: toHaveStatus for API responses', async (ctx) => {
    const res = await ctx.request({
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET'
    });

    expect(res).toHaveStatus(200);
});
