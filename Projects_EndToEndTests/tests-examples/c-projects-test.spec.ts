import { test, expect } from "./base.ts";
import { testUsers } from "./test-users.ts";
const randomstring = require("randomstring");
import { addBusinessDays, format } from "date-fns";

// test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ loginPage, dashboardPage, page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await loginPage.goto();
  await loginPage.isReady();
  await loginPage.login(testUsers[0].email, testUsers[0].pw!);
  await dashboardPage.isReady();
});

test("test ms project edit percentage complete & finish date", async ({
  projectsPage,
  projectDetailPage,
  rootLayout,
  loginPage,
  page,
}) => {
  test.setTimeout(80000);
  await projectsPage.goto();
  await projectsPage.$msProjectLocator.click();
  await projectDetailPage.isReady();
  await expect(page.getByTestId("user-active-task-row")).toHaveCount(91);
  await projectDetailPage.filterBy("henryTest@mail.com");
  await expect(page.getByTestId("user-active-task-row")).toHaveCount(23);
  await projectDetailPage.updatePercentagecomplete(
    "Review resource performance, determine which ones are the most effective",
    0.3
  );
  await projectDetailPage.updatePercentagecomplete(
    "Identify typical customer types",
    0.4
  );
  await projectDetailPage.updatePercentagecomplete(
    "Determine required skill sets for various support options",
    0.95
  );
  await projectDetailPage.$savePercentCompleteButton.click();
  await projectDetailPage.assertPercentageComplete(
    "30",
    "Review resource performance, determine which ones are the most effective"
  );
  await projectDetailPage.assertPercentageComplete(
    "40",
    "Identify typical customer types"
  );
  await projectDetailPage.assertPercentageComplete(
    "95",
    "Determine required skill sets for various support options"
  );
  await projectDetailPage.filterBy("All members");
  await projectDetailPage.toggleInWorkTasks("checked");
  const inWorkUser = await projectDetailPage.getFirstInWorkUserNotPM(
    testUsers[0].name
  );
  console.log(inWorkUser);
  if (inWorkUser) {
    await rootLayout.logout();
    // await loginPage.goto();
    const inWorkUserCredentials = testUsers.find(
      (el) => el.name === inWorkUser
    );
    console.log(inWorkUserCredentials);
    await loginPage.login(
      inWorkUserCredentials?.email!,
      inWorkUserCredentials?.pw!
    );
    // await page.waitForTimeout(3000);
    await page.getByRole("link", { name: "Customer Service Ramp Up" }).click();
    await projectDetailPage.isReady();
    const numberOfTasks = await projectDetailPage.countNumberOfTasksForUser(
      inWorkUserCredentials?.name!
    );
    await rootLayout.assertNumberOfNotifications(numberOfTasks);
    await projectDetailPage.toggleInWorkTasks("checked");
    await projectDetailPage.filterBy(inWorkUserCredentials?.name!);
    await page.getByTestId("task-edit").first().getByRole("img").click();
    // date needs to be dynamic probably based of the existing finish date
    const finishDateLocator = page.getByLabel("Finish date");
    const currentFinishDate = await finishDateLocator.inputValue();
    console.log("currentFinishDate", currentFinishDate);
    const newFinishDate = format(
      new Date(addBusinessDays(new Date(currentFinishDate), 4)),
      "yyyy-MM-dd"
    );
    console.log("newFinishDate", newFinishDate);
    await page.getByLabel("Finish date").fill(newFinishDate);
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(4000);
    await projectDetailPage.assertFirstTaskFinishDate(
      format(new Date(newFinishDate), "dd/MM/yyy")
    );
  }
});

test("task comment and reply", async ({
  page,
  projectsPage,
  projectDetailPage,
  taskDetailPage,
  rootLayout,
  loginPage,
  dashboardPage,
}) => {
  test.setTimeout(80000);
  await projectsPage.goto();
  await projectsPage.$msProjectLocator.click();
  await projectDetailPage.isReady();
  // await page.waitForTimeout(15000);
  // const firstTaskOwner = await projectDetailPage.getFirstTaskOwner();
  // console.log(firstTaskOwner);
  const ownerName = await projectDetailPage.clickFirstTaskNonUser(
    testUsers[0].name
  );
  const newComment = `Comment: ${randomstring.generate()}`;
  await taskDetailPage.addNewComment(newComment);
  await rootLayout.logout();
  await page.waitForTimeout(5000);
  await loginPage.goto();
  await loginPage.isReady();
  const ownerCedentials = testUsers.find((cred) => cred.name === ownerName);
  await loginPage.login(ownerCedentials?.email!, ownerCedentials?.pw!);
  await dashboardPage.isReady();
  await rootLayout.$avatarLocator.click();
  const lastNotification = rootLayout.$avatarDropLocator.last();
  await lastNotification.click();
  await page.waitForTimeout(5000);
  const newReply = `Reply: ${randomstring.generate()}`;
  await taskDetailPage.addReplyToComment(newReply, newComment);
});

test("Create and populate Review", async ({
  page,
  dashboardPage,
  projectsPage,
  projectDetailPage,
  rootLayout,
}) => {
  test.setTimeout(80000);
  let reviewDataTracker: any = [];
  let testUsersMinusHenry = testUsers.filter(
    (cred) => cred.name !== "henryTest"
  );
  console.log("testUsersMinusHenry", testUsersMinusHenry);
  await rootLayout.$projectsLocator.click();
  await projectsPage.isReady();
  await expect(page.getByText("Customer Service Ramp Up")).toBeVisible();
  await page
    .locator(".rt-TableRow")
    .filter({ hasText: "Customer Service Ramp Up" })
    .getByTestId("edit-project")
    .click();
  await page.getByRole("button", { name: "Add Review" }).click();
  const reviewName = randomstring.generate(7);
  await page
    .getByLabel("Review Title new review")
    .fill(`Review: ${reviewName}`);
  await page
    .getByLabel("Review date")
    .fill(
      format(
        new Date(
          addBusinessDays(new Date(), Math.floor(Math.random() * 40 + 1))
        ),
        "yyyy-MM-dd"
      )
    );
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(2000);
  await page.getByRole("link", { name: "Customer Service Ramp Up" }).click();
  await projectDetailPage.isReady();
  await page.getByText("R", { exact: true }).click();
  await page.getByRole("link", { name: "Project review - Review:" }).click();
  // create review pom and fixture and add this to it:
  await page.getByTestId("edit-review").click();
  for (let i = 0; i < 3; i++) {
    const newObjective = `Objective: ${randomstring.generate(7)}`;
    reviewDataTracker.push({ [`${newObjective}`]: [] });
    await page.getByPlaceholder("New objective description").fill(newObjective);
    if (i === 0) {
      await page.getByRole("button", { name: "Add" }).click();
    } else {
      await page.getByRole("button", { name: "Add" }).nth(i).click();
    }
    await page.waitForTimeout(2000);

    const currentObjectiveDiv = page
      .locator("div.CollapsibleRoot")
      .filter({ hasText: newObjective })
      .nth(1);
    await currentObjectiveDiv.getByRole("button").click();
    for (let j = 0; j < 3; j++) {
      const newAction = `Action: ${randomstring.generate(7)}`;
      await currentObjectiveDiv
        .getByPlaceholder("New action..")
        .fill(newAction);
      await currentObjectiveDiv.getByRole("button", { name: "Add" }).click();
      await page.waitForTimeout(2000);

      if (j === 0) {
        for (let k = 0; k < Math.floor(Math.random() * 2) + 1; k++) {
          const assigneeName =
            testUsersMinusHenry[
              Math.floor(Math.random() * (testUsersMinusHenry.length - 1))
            ].name;
          console.log("assigneeName", assigneeName);
          // await page.waitForTimeout(1000);
          if (k === 0) {
            reviewDataTracker[i][`${newObjective}`].push({
              [`act${j + 1}`]: { name: newAction, actionees: [assigneeName] },
            });
          } else {
            reviewDataTracker[i][`${newObjective}`][j][
              `act${j + 1}`
            ].actionees.push(assigneeName);
          }
          await currentObjectiveDiv
            .getByPlaceholder("find actionee..")
            .fill(assigneeName);
          await currentObjectiveDiv
            .getByRole("button", { name: "Search..." })
            .click();
          await page.waitForTimeout(2000);
          await currentObjectiveDiv
            .locator("a")
            .getByText(`${assigneeName}@mail.com`)
            .click();
          await page.waitForTimeout(2000);
        }
      } else {
        for (let l = 0; l < Math.floor(Math.random() * 2) + 1; l++) {
          const assigneeName =
            testUsersMinusHenry[
              Math.floor(Math.random() * (testUsersMinusHenry.length - 1))
            ].name;
          console.log("assigneeName", assigneeName);
          if (l === 0) {
            reviewDataTracker[i][`${newObjective}`].push({
              [`act${j + 1}`]: { name: newAction, actionees: [assigneeName] },
            });
          } else {
            reviewDataTracker[i][`${newObjective}`][j][
              `act${j + 1}`
            ].actionees.push(assigneeName);
          }
          await currentObjectiveDiv
            .getByPlaceholder("find actionee..")
            .nth(j)
            .fill(assigneeName);
          await currentObjectiveDiv
            .getByRole("button", { name: "Search..." })
            .nth(j)
            .click();
          await page.waitForTimeout(2000);
          await currentObjectiveDiv
            .locator("a")
            .getByText(`${assigneeName}@mail.com`)
            .click();
          await page.waitForTimeout(2000);
        }
      }
    }
    console.dir(reviewDataTracker, { depth: null });
  }

  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(2000);
  // now assert UI matches the reviewDataTracker array
  for (const obj of reviewDataTracker) {
    let i = 1;
    const objectiveName = Object.keys(obj)[0];
    const ObjNameRegex = new RegExp(`${objectiveName}`);
    console.log(objectiveName);
    console.log(ObjNameRegex);
    await expect(page.getByText(objectiveName, { exact: true })).toBeVisible();
    await page
      .locator("div.objective-container")
      .filter({ hasText: objectiveName })
      .getByRole("button")
      .click();
    await page.waitForTimeout(1000);
    // assert actions and actionees are visible
    for (const act of obj[objectiveName]) {
      const actionLocator = page.getByText(act[`act${i}`].name);
      await expect(actionLocator).toBeVisible();
      for (const actionee of act[`act${i}`].actionees) {
        const actionDivLocator = page
          .locator("div.action")
          .filter({ hasText: act[`act${i}`].name });
        await expect(actionDivLocator.getByText(actionee)).toBeVisible();
      }
      i++;
    }
  }
});

// test("assert Review is sufficiently populated", async ({ page }) => {
//   await page.goto(
//     "http://localhost:5173/projects/672cf8d04ad2b25318bdd601/reviews/672cf92d4ad2b25318bddb40"
//   );
// });

// [
//   {
//     'Objective: tREa8x3': [
//       {
//         act1: { name: 'Action: BYB2Ofn', actionee: [ 'catherineTest' ] }
//       },
//       {
//         act2: { name: 'Action: kfsw94k', actionee: [ 'catherineTest' ] }
//       },
//       {
//         act3: {
//           name: 'Action: PeO8SpX',
//           actionee: [ 'jamesTest', 'catherineTest' ]
//         }
//       }
//     ]
//   },
//   {
//     'Objective: e1MSCBw': [
//       {
//         act1: { name: 'Action: Xw7kWKd', actionee: [ 'catherineTest' ] }
//       },
//       {
//         act2: {
//           name: 'Action: sCTYugc',
//           actionee: [ 'catherineTest', 'georgeTest' ]
//         }
//       },
//       { act3: { name: 'Action: h8k1V85', actionee: [ 'jamesTest' ] } }
//     ]
//   },
//   {
//     'Objective: SE32DL3': [
//       {
//         act1: { name: 'Action: xbQjSHp', actionee: [ 'catherineTest' ] }
//       },
//       {
//         act2: {
//           name: 'Action: svCBR1V',
//           actionee: [ 'jamesTest', 'georgeTest' ]
//         }
//       },
//       {
//         act3: { name: 'Action: KxIZLsO', actionee: [ 'catherineTest' ] }
//       }
//     ]
//   }
// ]
