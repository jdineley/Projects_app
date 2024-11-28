import { test, expect } from "./base.ts";
import { testUsers } from "./test-users.ts";

test("clear all e2e test artifacts and signup", async ({ request }) => {
  const response = await request.delete(
    process.env.DEV_API_URL + "/api/v1/test"
  );
  const body = await response.json();
  console.log(body);
});

for (const { email, pw } of testUsers) {
  test(`Signup: ${email}`, async ({ signupPage, rootLayout, page }) => {
    await signupPage.goto();
    await signupPage.isReady();
    await signupPage.signup(email, pw, pw);
    await expect(rootLayout.$avatarLocator).toHaveText(
      `${email[0].toUpperCase()}`
    );
  });
}
