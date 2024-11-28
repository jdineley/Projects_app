import { Sign } from "crypto";
import { test } from "./base.ts";

const { EMAIL, PW } = process.env;

test("sign up to Projects", async ({ signupPage }) => {
  await signupPage.goto();
  await signupPage.isReady();
  await signupPage.signup("mathew@mail.com", "Password123!", "Password123!");
});

test("log into Projects", async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.isReady();
  await loginPage.login(EMAIL!, PW!);
  await dashboardPage.isReady();
});
