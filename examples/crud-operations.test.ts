import { test, expect } from '../src/dsl/index.js';

/**
 * Example: Testing a RESTful API with full CRUD operations
 */

test('Example: Create a new resource', async ({ api }) => {
    const newPost = {
        title: 'Introduction to apix',
        body: 'apix is a TypeScript-first API testing framework',
        userId: 1
    };

    const res = await api.post('/posts', newPost);

    expect(res).toHaveStatus(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(newPost.title);
    expect(res.body.userId).toBe(newPost.userId);
});

test('Example: Fetch a specific resource', async ({ api }) => {
    const res = await api.get('/posts/1');

    expect(res).toHaveStatus(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('body');
    expect(res.body.id).toBe(1);
});

test('Example: Update a resource', async ({ api }) => {
    const updates = {
        title: 'Updated Title',
        body: 'Updated body content'
    };

    const res = await api.put('/posts/1', updates);

    expect(res).toHaveStatus(200);
    expect(res.body.title).toBe(updates.title);
    expect(res.body.body).toBe(updates.body);
});

test('Example: Delete a resource', async ({ api }) => {
    const res = await api.delete('/posts/1');

    expect(res).toHaveStatus(200);
});

test('Example: Fetch with query parameters', async ({ api }) => {
    const res = await api.get('/posts', {
        params: {
            userId: '1'
        }
    });

    expect(res).toHaveStatus(200);
    expect(Array.isArray(res.body)).toBeTruthy();
});

test('Example: Test with custom headers', async ({ api }) => {
    const res = await api.get('/posts/1', {
        headers: {
            'X-Custom-Header': 'test-value'
        }
    });

    expect(res).toHaveStatus(200);
});

test('Example: Verify response structure', async ({ api }) => {
    const res = await api.get('/users/1');

    expect(res).toHaveStatus(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('address');
    expect(res.body.address).toHaveProperty('city');
    expect(res.body.address).toHaveProperty('zipcode');
});
