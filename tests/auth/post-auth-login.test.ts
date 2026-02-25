import { test, expect } from "@apix/cli"

test("POST /auth/login", async ({ request }) => {
  const response = await request.post("/auth/login")
  expect(response.status).toBe(200)
})
