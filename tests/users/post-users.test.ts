import { test, expect } from "@apix/cli"

test("POST /users", async ({ request }) => {
  const response = await request.post("/users")
  expect(response.status).toBe(200)
})
