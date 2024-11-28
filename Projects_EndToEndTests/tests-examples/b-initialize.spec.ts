import { test, expect } from "./base.ts";
import { testUsers } from "./test-users.ts";

// test.beforeEach(async ({ loginPage, dashboardPage, page }) => {
//   page.on("dialog", (dialog) => dialog.accept());
//   await loginPage.goto();
//   await loginPage.isReady();
//   await loginPage.login(testUsers[0].email, testUsers[0].pw!);
//   await dashboardPage.isReady();
// });

test("Upload MS Project", async ({
  projectsPage,
  page,
  loginPage,
  dashboardPage,
}) => {
  test.setTimeout(120000);
  page.on("dialog", (dialog) => dialog.accept());
  await loginPage.goto();
  await loginPage.isReady();
  await loginPage.login(testUsers[0].email, testUsers[0].pw!);
  await dashboardPage.isReady();
  const storage = await page.context().storageState();
  const user = JSON.parse(storage.origins[0].localStorage[0].value);
  await projectsPage.goto();
  await projectsPage.isReady();
  await projectsPage.addMsProject(user);
});
