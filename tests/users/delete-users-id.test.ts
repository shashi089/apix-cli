import { test, expect } from "@apix/cli"

test("DELETE /users/{id}", async ({ request }) => {
  const response = await request.delete("/users/{id}")
  expect(response.status).toBe(200)
})
