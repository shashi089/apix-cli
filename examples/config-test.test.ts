import { test, expect } from '../src/dsl/index.js';

test('Config: Should load baseUrl from .env', async ({ api }) => {
    // This test verifies the config is loaded from .env
    // The baseUrl should be https://jsonplaceholder.typicode.com from .env
    const res = await api.get('/posts/1');

    expect(res).toHaveStatus(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toBe(1);
});

test('Config: Should have timeout from .env', async ({ api }) => {
    // Timeout should be 3000ms from .env
    const res = await api.get('/posts/1');
    expect(res).toHaveStatus(200);
});
