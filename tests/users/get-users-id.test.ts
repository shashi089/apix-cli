import { test, expect } from "@apix/cli"

test("GET /users/{id}", async ({ request }) => {
  const response = await request.get("/users/{id}")
  expect(response.status).toBe(200)
})
