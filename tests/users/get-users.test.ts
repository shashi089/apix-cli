import { test, expect } from "@apix/cli"

test("GET /users", async ({ request }) => {
  const response = await request.get("/users")
  expect(response.status).toBe(200)
})
