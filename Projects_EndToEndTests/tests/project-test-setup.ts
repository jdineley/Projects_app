import { test as setup, expect } from "./base.ts";
import { testUsers } from "./test-users.ts";
import { createLoggedInUser } from "./utility.ts";

import { STORAGE_STATE } from "../playwright.config";

setup.describe.configure({ mode: "serial" });

setup("do initialisations", async ({ request, signupPage, rootLayout }) => {
  const response = await request.delete(
    process.env.BASE_API_URL + "/api/v1/test"
  );
  const body = await response.json();
  console.log(body);
  for (const { email, pw } of testUsers) {
    await signupPage.goto();
    await signupPage.isReady();
    await signupPage.signup(email, pw, pw);
    await expect(rootLayout.$avatarLocator).toHaveText(
      `${email[0].toUpperCase()}`
    );
    console.log(`${email} has signed up`);
  }
});

setup(
  "login & MS Project upload",
  async ({ loginPage, dashboardPage, projectsPage, page, rootLayout }) => {
    setup.setTimeout(250000);
    page.on("dialog", (dialog) => dialog.accept());
    await loginPage.goto();
    await page.waitForTimeout(2000);
    await loginPage.isReady();
    const usersArray = [
      [
        "penelopeTest@mail.com",
        "Evaluate Strategic Merger or Acquisition (M&A)",
      ],
      ["georgeTest@mail.com", "Plan for Project Server 2013 deployment"],
      ["henryTest@mail.com", "Customer Service Ramp Up"],
    ];
    for (const user of usersArray) {
      let currentUser = createLoggedInUser(user[0]);
      console.log("currentUser", currentUser);
      await loginPage.login(currentUser.email, currentUser.pw!);
      await dashboardPage.isReady();
      await projectsPage.goto();
      await projectsPage.isReady();
      await projectsPage.addMsProject(user[1]);
      console.log(`${user[1]} uploaded`);
      if (user[0] !== "henryTest@mail.com") {
        await rootLayout.logout();
        await loginPage.isReady();
      }
    }
    await page.context().storageState({ path: STORAGE_STATE });
  }
);
