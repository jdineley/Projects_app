import { test, expect } from "./base.ts";
// import { LoginPage, ProjectDetailPage } from "./pom.ts";
import { testUsers } from "./test-users.ts";
const randomstring = require("randomstring");
import {
  addBusinessDays,
  format,
  subWeeks,
  addMonths,
  addWeeks,
} from "date-fns";
import {
  User,
  Vacation,
  formatDateString,
  Project,
  createVacation,
  generateVacDateStringPair,
  exposeUser,
  getObjectFromString,
  addNewProject,
} from "./utility.ts";
import { isWithinInterval } from "date-fns";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ dashboardPage, page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await dashboardPage.goto();
  await dashboardPage.isReady();
});
// test.beforeEach(async ({ loginPage, dashboardPage, page }) => {
//   page.on("dialog", (dialog) => dialog.accept());
//   // await dashboardPage.goto();
//   // await dashboardPage.isReady();
//   await loginPage.goto();
//   await loginPage.isReady();
//   await loginPage.login(testUsers[0].email, testUsers[0].pw!);
//   await dashboardPage.isReady();
// });

test("test ms project edit percentage complete & finish date", async ({
  projectsPage,
  projectDetailPage,
  rootLayout,
  loginPage,
  page,
}) => {
  test.setTimeout(80000);
  await projectsPage.goto();
  await projectsPage.clickProject("Customer Service Ramp Up");
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
    const inWorkUserCredentials = testUsers.find(
      (el) => el.name === inWorkUser
    );
    console.log(inWorkUserCredentials);
    await loginPage.isReady();
    await loginPage.login(
      inWorkUserCredentials?.email!,
      inWorkUserCredentials?.pw!
    );
    await page.getByRole("link", { name: "Customer Service Ramp Up" }).click();
    await projectDetailPage.isReady();
    const numberOfTasks = await projectDetailPage.countNumberOfTasksForUser(
      inWorkUserCredentials?.name!
    );

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
    await page.waitForTimeout(2000);
    await expect(page.getByTestId("task-edit-dialog")).not.toBeVisible({
      timeout: 10000,
    });
    await rootLayout.isNotLoading();
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
  await projectsPage.clickProject("Customer Service Ramp Up");
  await projectDetailPage.isReady();
  const ownerName = await projectDetailPage.clickFirstTaskNonUser(
    testUsers[0].name
  );
  const newComment = `Comment: ${randomstring.generate()}`;
  await taskDetailPage.addNewComment(newComment);
  await rootLayout.logout();
  await loginPage.isReady();
  const ownerCedentials = testUsers.find((cred) => cred.name === ownerName);
  await loginPage.login(ownerCedentials?.email!, ownerCedentials?.pw!);
  await dashboardPage.isReady();
  await rootLayout.$avatarLocator.click();
  const lastNotification = rootLayout.$avatarDropLocator.last();
  await lastNotification.click();
  await taskDetailPage.isReady();
  const newReply = `Reply: ${randomstring.generate()}`;
  await taskDetailPage.addReplyToComment(newReply, newComment);
  //check nofifications are correct for new-task-comment & new-task-reply
  await rootLayout.logout();
  await loginPage.isReady();
  await loginPage.login(testUsers[0].email, testUsers[0].pw!);
  await dashboardPage.isReady();
  await rootLayout.$avatarLocator.click();
  expect(
    await rootLayout.countNotificationsOfType(
      `new-task-reply * ${ownerCedentials?.email}`
    )
  ).toBe(1);
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await loginPage.isReady();
  await loginPage.login(ownerCedentials?.email!, ownerCedentials?.pw!);
  await dashboardPage.isReady();
  await rootLayout.$avatarLocator.click();
  expect(
    await rootLayout.countNotificationsOfType(
      `new-task-comment * ${testUsers[0].email}`
    )
  ).toBe(1);
});

test("Create and populate Review", async ({
  page,
  dashboardPage,
  projectsPage,
  projectDetailPage,
  rootLayout,
  loginPage,
  projectReviewPage,
}) => {
  test.setTimeout(120000);
  let reviewDataTracker: any = [];
  let testUsersMinusHenry = testUsers.filter(
    (cred) => cred.name !== "henryTest"
  );
  console.log("testUsersMinusHenry", testUsersMinusHenry);
  await dashboardPage.isReady();
  await page
    .locator("#proj-sum-cards-collector")
    .getByRole("link", { name: "Customer Service Ramp Up" })
    .click();
  await projectDetailPage.isReady();
  await page.getByTestId("edit-project").click();
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
  await rootLayout.isNotLoading();
  await page.getByText("R", { exact: true }).click();
  await page.getByRole("link", { name: "Project review - Review:" }).click();
  await projectReviewPage.isReady();
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

    const currentObjectiveDiv = page
      .locator("div.CollapsibleRoot")
      .filter({ hasText: newObjective })
      .nth(1);
    await expect(currentObjectiveDiv.getByRole("button")).toBeVisible();
    await currentObjectiveDiv.getByRole("button").click();
    for (let j = 0; j < 3; j++) {
      const newAction = `Action: ${randomstring.generate(7)}`;
      await currentObjectiveDiv
        .getByPlaceholder("New action..")
        .fill(newAction);
      await currentObjectiveDiv.getByRole("button", { name: "Add" }).click();

      if (j === 0) {
        for (let k = 0; k < Math.floor(Math.random() * 2) + 1; k++) {
          const assignee =
            testUsersMinusHenry[
              Math.floor(Math.random() * (testUsersMinusHenry.length - 1))
            ];

          if (!assignee.count) assignee.count = 1;
          else assignee.count++;

          const assigneeName = assignee.name;
          console.log("assigneeName", assigneeName);
          if (k === 0) {
            reviewDataTracker[i][`${newObjective}`].push({
              [`act${j + 1}`]: {
                name: newAction,
                actionees: [assigneeName],
              },
            });
          } else {
            const actionees =
              reviewDataTracker[i][`${newObjective}`][j][`act${j + 1}`]
                .actionees;
            if (!actionees.includes(assigneeName)) actionees.push(assigneeName);
          }
          await currentObjectiveDiv
            .getByPlaceholder("find actionee..")
            .fill(assigneeName);
          await currentObjectiveDiv
            .getByRole("button", { name: "Search..." })
            .click();
          await rootLayout.isNotLoading();
          await currentObjectiveDiv
            .locator("a")
            .getByText(`${assigneeName}@mail.com`)
            .click();
        }
      } else {
        for (let l = 0; l < Math.floor(Math.random() * 2) + 1; l++) {
          const assignee =
            testUsersMinusHenry[
              Math.floor(Math.random() * (testUsersMinusHenry.length - 1))
            ];
          if (!assignee.count) assignee.count = 1;
          else assignee.count++;
          const assigneeName = assignee.name;
          console.log("assigneeName", assigneeName);
          if (l === 0) {
            reviewDataTracker[i][`${newObjective}`].push({
              [`act${j + 1}`]: {
                name: newAction,
                actionees: [assigneeName],
              },
            });
          } else {
            const actionees =
              reviewDataTracker[i][`${newObjective}`][j][`act${j + 1}`]
                .actionees;
            if (!actionees.includes(assigneeName)) actionees.push(assigneeName);
          }
          await currentObjectiveDiv
            .getByPlaceholder("find actionee..")
            .nth(j)
            .fill(assigneeName);
          await currentObjectiveDiv
            .getByRole("button", { name: "Search..." })
            .nth(j)
            .click();
          await rootLayout.isNotLoading();
          await currentObjectiveDiv
            .locator("a")
            .getByText(`${assigneeName}@mail.com`)
            .click();
        }
      }
    }
    console.dir(reviewDataTracker, { depth: null });
  }

  await page.getByRole("button", { name: "Save" }).click();
  await rootLayout.isNotLoading();

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
  // now scan users to see if they received notifications about their new Review Actions
  let m = 0;
  for (const assignee of testUsersMinusHenry) {
    console.log("assignee", assignee);
    if (m === 0) await rootLayout.logout();
    await loginPage.isReady();
    await loginPage.login(assignee.email, assignee.pw);
    await dashboardPage.isReady();
    await rootLayout.$avatarLocator.click();
    expect(await rootLayout.countNotificationsOfType("new-reviewAction")).toBe(
      assignee.count || 0
    );
    await page.getByRole("menuitem", { name: "Logout" }).click();
    m++;
  }
  // comment/reply tests
  await loginPage.isReady();
  await loginPage.login(testUsers[0].email, testUsers[0].pw);
  await dashboardPage.isReady();
  await page
    .locator("#proj-sum-cards-collector")
    .getByRole("link", { name: "Customer Service Ramp Up" })
    .click();
  await projectDetailPage.isReady();
  await page.getByText("R", { exact: true }).click();
  await page.getByRole("link", { name: "Project review - Review:" }).click();
  await projectReviewPage.isReady();
  await page
    .locator("div.objective-container")
    .filter({ hasText: Object.keys(reviewDataTracker[0])[0] })
    .getByRole("button")
    .click();
  await page
    .locator("div.action")
    .filter({
      hasText:
        reviewDataTracker[0][Object.keys(reviewDataTracker[0])[0]][0].act1.name,
    })
    .getByRole("button")
    .click();
  const newComment = `Comment: ${randomstring.generate()}`;
  await projectReviewPage.addNewComment(newComment);
  const actioneeName =
    reviewDataTracker[0][Object.keys(reviewDataTracker[0])[0]][0].act1
      .actionees[0];
  const actioneeEmail = testUsers.find((u) => u.name === actioneeName)?.email;
  const actioneePw = testUsers.find((u) => u.name === actioneeName)?.pw;
  await rootLayout.logout();
  await loginPage.isReady();
  await loginPage.login(actioneeEmail!, actioneePw!);
  await dashboardPage.isReady();
  await rootLayout.$projectsLocator.click();
  await projectsPage.isReady();
  await page.getByRole("link", { name: "Customer Service Ramp Up" }).click();
  await projectDetailPage.isReady();
  await page.getByText("R", { exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Project review - Review:" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Project review - Review:" }).click();
  await projectReviewPage.isReady();
  await page
    .locator("div.objective-container")
    .filter({ hasText: Object.keys(reviewDataTracker[0])[0] })
    .getByRole("button")
    .click();
  await page
    .locator("div.action")
    .filter({
      hasText:
        reviewDataTracker[0][Object.keys(reviewDataTracker[0])[0]][0].act1.name,
    })
    .getByRole("button")
    .click();
  await projectReviewPage.addReplyToComment(
    `Reply: ${randomstring.generate()}`,
    newComment
  );
  // assert comment/reply notifications:
  // a. assignees:
  await rootLayout.logout();
  let n = 0;
  const actionees =
    reviewDataTracker[0][Object.keys(reviewDataTracker[0])[0]][0].act1
      .actionees;
  const firstActionee = testUsersMinusHenry.find(
    (a) => a.name === actionees[0]
  );
  for (const assigneeName of actionees) {
    const assignee = testUsersMinusHenry.find((a) => a.name === assigneeName);
    await loginPage.isReady();
    await loginPage.login(assignee?.email!, assignee?.pw!);
    await dashboardPage.isReady();
    await rootLayout.$avatarLocator.click();
    if (n === 0) {
      expect(
        await rootLayout.countNotificationsOfType(
          `new-review-comment * henryTest@mail.com`
        )
      ).toBe(1);
    } else {
      expect(
        await rootLayout.countNotificationsOfType(
          `new-review-reply * ${firstActionee?.email}`
        )
      ).toBe(1);
    }
    await page.getByRole("menuitem", { name: "Logout" }).click();
    n++;
  }
});

test("User profile...", async ({
  page,
  userProfilePage,
  dashboardPage,
  rootLayout,
  projectsPage,
  loginPage,
  projectDetailPage,
}) => {
  test.setTimeout(100000);
  let userStore: User[] = [];
  let vacationStore: Vacation[] = [];
  let projectStore: Project[] = [];
  interface StorageUser {
    _id: string;
    email: string;
    token: string;
  }
  const storage = await page.context().storageState();
  const user: StorageUser = JSON.parse(
    storage.origins[0].localStorage[0].value
  );
  let loggedInUser: User = exposeUser(userStore, user.email);
  await dashboardPage.isReady();
  // harvest user's pm'd and user-in projects:
  await rootLayout.$projectsLocator.click();
  await projectsPage.isReady();
  const myProjectsNames: string[] = await projectsPage.getMyProjectsNames();
  for (const projName of myProjectsNames) {
    const projectRowLocator = page
      .locator(".rt-TableRow")
      .filter({ hasText: projName });
    const projectStartDate = await projectRowLocator
      .getByTestId("project-start-date")
      .innerText();
    const projectFinishDate = await projectRowLocator
      .getByTestId("project-finish-date")
      .innerText();
    const project = new Project(
      projName,
      loggedInUser.email,
      projectStartDate,
      projectFinishDate
    );
    projectStore.push(project);
    loggedInUser.addPMProject(project.name);
  }
  const otherUsersProjectNames: string[] =
    await projectsPage.getOtherUserProjectNames();
  for (const projName of otherUsersProjectNames) {
    const projectRowLocator = page
      .locator(".rt-TableRow")
      .filter({ hasText: projName });
    const projectStartDate = await projectRowLocator
      .getByTestId("project-start-date")
      .innerText();
    const projectFinishDate = await projectRowLocator
      .getByTestId("project-finish-date")
      .innerText();
    const projectPMName = await projectRowLocator
      .getByTestId("other-project-pm")
      .innerText();

    const project = new Project(
      projName,
      `${projectPMName}@mail.com`,
      projectStartDate,
      projectFinishDate
    );

    projectStore.push(project);

    loggedInUser.addUserInProject(project, vacationStore);
  }

  // create 2 vac requests and deal with PMs reponses:
  // const email = loggedInUser.email;
  for (let i = 0; i < 2; i++) {
    // create vactaion
    await rootLayout.gotoUserProfile();
    await userProfilePage.isReady();

    await page.keyboard.press("Escape");
    let { firstVacationDate, lastVacationDate } = generateVacDateStringPair(
      loggedInUser,
      projectStore
    );
    await page.getByPlaceholder("Last date at work").fill(firstVacationDate);
    await page.getByPlaceholder("Return to work date").fill(lastVacationDate);
    let vacationClashError = await page
      .getByText("vacation request clash")
      .first()
      .isVisible();
    while (vacationClashError) {
      const tryAnotherDatePair = generateVacDateStringPair(
        loggedInUser,
        projectStore
      );
      firstVacationDate = tryAnotherDatePair.firstVacationDate;
      lastVacationDate = tryAnotherDatePair.lastVacationDate;
      await page.getByPlaceholder("Last date at work").fill(firstVacationDate);
      await page.getByPlaceholder("Return to work date").fill(lastVacationDate);
      vacationClashError = await page
        .getByText("vacation request clash")
        .isVisible();
    }

    await page.getByRole("button", { name: "Send vacation request" }).click();
    await expect(
      page.getByText(
        `${formatDateString(firstVacationDate, "-/")}-${formatDateString(
          lastVacationDate,
          "-/"
        )}`
      )
    ).toBeVisible();

    const vacation: Vacation = createVacation(
      loggedInUser,
      firstVacationDate,
      lastVacationDate
    );
    const vacationOwner = exposeUser(userStore, vacation.userEmail)!;

    vacationStore.push(vacation);

    await userProfilePage.checkRemainingVacDays(loggedInUser);

    // check for hover over vacation request
    await page
      .getByText(
        `${formatDateString(firstVacationDate, "-/")}-${formatDateString(
          lastVacationDate,
          "-/"
        )}`
      )
      .click();
    await expect(page.getByTestId("pending-vac-req-hover")).toBeVisible();
    const vacId = await page.getByTestId("vac-id").innerText();
    vacation.id = vacId;
    loggedInUser.addVacationRequest(vacId);
    const userInProjectsPopulated: Project[] = loggedInUser.populate(
      "userInProjects",
      projectStore
    ) as Project[];
    for (const userInProject of userInProjectsPopulated) {
      if (
        isWithinInterval(new Date(firstVacationDate), {
          start: new Date(
            formatDateString(userInProject.projectStartDate, "/-")
          ),
          end: new Date(
            formatDateString(userInProject.projectFinishDate, "/-")
          ),
        }) ||
        isWithinInterval(new Date(lastVacationDate), {
          start: new Date(
            formatDateString(userInProject.projectStartDate, "/-")
          ),
          end: new Date(
            formatDateString(userInProject.projectFinishDate, "/-")
          ),
        })
      ) {
        await expect(page.getByTestId("pending-vac-req-hover")).toContainText(
          userInProject.name
        );

        // implement create user architecture
        // find in store or create new and and to store
        const userPM = exposeUser(userStore, userInProject.PM);
        vacation?.addTargetPM(userPM.email);
        vacation.addTargetProject(userInProject.name);
        userInProject.addVacation(vacation.id);
      }
    }
    console.log("vacation", vacation);
    await rootLayout.logout();
    await loginPage.isReady();

    // Allow PMs to deal with vac request:
    let brake: string = "";
    const vacationTargetPMPopulated = vacation.populate(
      "targetPMs",
      userStore
    ) as User[];
    // console.log("vacationTargetPMPopulated", vacationTargetPMPopulated);
    let j = vacationTargetPMPopulated.length;
    for (const targetPM of vacationTargetPMPopulated) {
      if (brake === "Reject") {
        console.log("in brake");
        brake = "";
        break;
      }
      j--;
      await loginPage.login(targetPM.email, targetPM.pw);
      await dashboardPage.isReady();
      loggedInUser = targetPM;

      await rootLayout.gotoUserProfile();
      await userProfilePage.isReady();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);

      // targetPM might have more than 1 target project, so need to loop over vacation.targetProjects.filter(p => p.name === targetPM.name)
      const vacationTargetProjectsPopulated = vacation.populate(
        "targetProjects",
        projectStore
      ) as Project[];

      const relevantProjectNames = vacationTargetProjectsPopulated
        .filter((p) => p.PM === targetPM.email)
        .map((p) => p.name);
      let i = relevantProjectNames.length;

      for (const projName of relevantProjectNames) {
        i--;
        console.log("i", i);
        await page
          .getByTestId("project-vac-manage")
          .filter({ hasText: projName })
          .locator(`id=${vacation.id}but`)
          .click();
        await expect(
          page.getByRole("heading", {
            name: `Vacation request from: ${userStore[0].email}`,
          })
        ).toBeVisible();
        const randomSelection = ["Accept", "Reject"][
          Math.floor(Math.random() * 2)
        ];
        await page.getByLabel(randomSelection).click();
        if (randomSelection === "Reject") {
          const randomReasonReject = randomstring.generate(10);
          await page
            .getByLabel("Reason for rejection")
            .fill(randomReasonReject);
          await expect(
            page.getByRole("button", { name: "Save" })
          ).toBeVisible();
          await page.getByRole("button", { name: "Save" }).click();
          await rootLayout.isNotLoading();
          vacation.updateAndCheckStatus(projName, "Reject");
          vacationOwner.updateRemainingVacDays(vacation.numberOfVacationDays);
          console.log("vacationOwner", vacationOwner);
          // check current logged in user status..
          await expect(
            page
              .getByTestId("project-vac-manage")
              .filter({ hasText: projName })
              .getByTestId("show-rejected-vacations")
          ).toBeVisible();
          await page
            .getByTestId("project-vac-manage")
            .filter({ hasText: projName })
            .getByTestId("show-rejected-vacations")
            .click();
          await expect(
            page
              .getByTestId("project-vac-manage")
              .filter({ hasText: projName })
              .getByText(
                `${vacation.userEmail}: ${`${formatDateString(
                  vacation.firstVacationDate,
                  "-/"
                )}-${formatDateString(vacation.lastVacationDate, "-/")}`}`
              )
          ).toBeVisible();

          if (i !== 0 || j !== 0) {
            brake = "Reject";
            break;
          }
        } else {
          await expect(
            page.getByRole("button", { name: "Save" })
          ).toBeVisible();
          await page.getByRole("button", { name: "Save" }).click();
          await rootLayout.isNotLoading();
          vacation.updateAndCheckStatus(projName, "Accept");
          // check current logged in user status..
          if (vacation.status === "pending") {
            await expect(
              page
                .getByTestId("project-vac-manage")
                .filter({ hasText: projName })
                .locator(`id=${vacation.id}but`)
            ).toBeVisible();
          } else {
            await expect(
              page
                .getByTestId("project-vac-manage")
                .filter({ hasText: projName })
                .locator(`id=${vacation.id}but`)
            ).not.toBeVisible();
            await page
              .getByTestId("project-vac-manage")
              .filter({ hasText: projName })
              .getByTestId("show-approved-vac-button")
              .click();
            await expect(
              page
                .getByTestId("project-vac-manage")
                .filter({ hasText: projName })
                .locator(`id=${vacation.id}but`)
            ).toBeVisible();
          }
        }
      }
      await rootLayout.logout();
      await loginPage.isReady();
    }
    const vacationOwnerObj = exposeUser(userStore, vacationOwner.email)!;
    await loginPage.login(vacationOwnerObj!.email, vacationOwnerObj!.pw);
    await dashboardPage.isReady();
    loggedInUser = vacationOwnerObj;
  }

  // Check the integrity of the vac requests at userProfile for vac owner:
  await rootLayout.gotoUserProfile();
  await userProfilePage.isReady();
  let loggedInUserVacReqPopulated = loggedInUser.populate(
    "vacationRequests",
    vacationStore
  ) as Vacation[];
  async function checkVacationsIntegrity() {
    for (const vacationRequest of loggedInUserVacReqPopulated) {
      await page.keyboard.press("Escape");
      await page
        .getByText(
          `${formatDateString(
            vacationRequest.firstVacationDate,
            "-/"
          )}-${formatDateString(vacationRequest.lastVacationDate, "-/")}`
        )
        .click();
      await expect(
        page.getByTestId(`${vacationRequest.status}-vac-req-hover`)
      ).toBeVisible();
      const descisionTrackObj = Object.fromEntries(
        vacationRequest.decisionTracker
      );
      for (const decision in descisionTrackObj) {
        await expect(page.getByText(decision)).toBeVisible();
        await expect(
          page
            .getByTestId("pm-vac-decision")
            .filter({ hasText: decision })
            .locator("span")
            .getByText(descisionTrackObj[decision!])
        ).toBeVisible();
      }
    }
  }
  await checkVacationsIntegrity();

  // Test delete vacation
  const vacToDelete = loggedInUserVacReqPopulated[0];
  await page.keyboard.press("Escape");
  await page
    .getByTestId(`${vacToDelete.status}-vac`)
    .filter({
      hasText: `${formatDateString(
        vacToDelete.firstVacationDate,
        "-/"
      )}-${formatDateString(vacToDelete.lastVacationDate, "-/")}`,
    })
    .getByRole("button", { name: "Del." })
    .click();
  await rootLayout.isNotLoading();
  await expect(
    page.getByText(
      `${formatDateString(
        vacToDelete.firstVacationDate,
        "-/"
      )}-${formatDateString(vacToDelete.lastVacationDate, "-/")}`
    )
  ).not.toBeVisible();
  vacToDelete.removeVacFromProjectsAndUsers(
    userStore,
    projectStore,
    vacationStore
  );
  if (vacToDelete.status !== "rejected") {
    loggedInUser.updateRemainingVacDays(vacToDelete.numberOfVacationDays);
  }
  console.log("loggedInUser", loggedInUser);
  vacationStore = vacationStore.filter((v) => v.id !== vacToDelete.id);
  // check number of vac days left is accurate:
  await userProfilePage.checkRemainingVacDays(loggedInUser);

  await rootLayout.logout();
  await loginPage.isReady();

  // go to vacToDelete.targetPMs... .projects(relevant vacation) to check vacation continuity
  const vacationTargetPMPopulated = vacToDelete.populate(
    "targetPMs",
    userStore
  ) as User[];
  for (const targetPM of vacationTargetPMPopulated) {
    await loginPage.login(targetPM.email, targetPM.pw);
    await dashboardPage.isReady();
    loggedInUser = targetPM;
    // loggedInUser = exposeUser(userStore, targetPM.email);

    // userStore.push(loggedInUser);
    await rootLayout.gotoUserProfile();
    await userProfilePage.isReady();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);

    // targetPM might have more than 1 target project, so need to loop over vacation.targetProjects.filter(p => p.name === targetPM.name)
    const vacationTargetProjectsPopulated = vacToDelete.populate(
      "targetProjects",
      projectStore
    ) as Project[];

    for (const projName of vacationTargetProjectsPopulated
      .filter((p) => p.PM === targetPM.email)
      .map((p) => p.name)) {
      console.log("projName", projName);

      if (vacToDelete.status === "approved") {
        await page
          .getByTestId("project-vac-manage")
          .filter({ hasText: projName })
          .getByTestId("show-approved-vac-button")
          .click();

        await expect(
          page
            .getByTestId("project-vac-manage")
            .filter({ hasText: projName })
            .locator(`id=${vacToDelete.id}but`)
        ).not.toBeVisible();
      } else {
        const isRejectedVacsVisible = await page
          .getByTestId("project-vac-manage")
          .filter({ hasText: projName })
          .getByTestId("show-rejected-vacations")
          .isVisible();
        if (isRejectedVacsVisible) {
          await page
            .getByTestId("project-vac-manage")
            .filter({ hasText: projName })
            .getByTestId("show-rejected-vacations")
            .click();

          await expect(
            page
              .getByTestId("project-vac-manage")
              .filter({ hasText: projName })
              .getByText(
                `${vacToDelete.userEmail}: ${`${formatDateString(
                  vacToDelete.firstVacationDate,
                  "-/"
                )}-${formatDateString(vacToDelete.lastVacationDate, "-/")}`}`
              )
          ).not.toBeVisible();
        }
      }
    }
    await rootLayout.logout();
    await loginPage.isReady();
  }
  // add new native project PM=penelope and add henry as user to check that the vacation request changes accordingly
  await loginPage.login(userStore[1].email, userStore[1].pw);
  await dashboardPage.isReady();
  loggedInUser = userStore[1];
  await rootLayout.$projectsLocator.click();
  await projectsPage.isReady();
  await page.getByTestId("add-project").click();
  await expect(page.getByTestId("add-project-dialog")).toBeVisible();
  const newProjectTitle = randomstring.generate(10);
  await page.getByLabel("Project title").fill(newProjectTitle);
  // project dates needs to capture existing vacation
  const newProjectStartDate = subWeeks(
    new Date(vacationStore[0].firstVacationDate),
    4
  );
  await page
    .getByLabel("Project start date")
    .fill(format(newProjectStartDate, "yyyy-MM-dd"));
  const newProjectFinishDate = addMonths(new Date(newProjectStartDate), 8);
  await page
    .getByLabel("Project end date")
    .fill(format(newProjectFinishDate, "yyyy-MM-dd"));
  await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await rootLayout.isNotLoading();
  const newProject = addNewProject(
    loggedInUser,
    newProjectTitle,
    format(new Date(newProjectStartDate), "dd/MM/yyy"),
    format(new Date(newProjectFinishDate), "dd/MM/yyy")
  );
  projectStore.push(newProject);

  // now add task for henry..
  await page.getByRole("link", { name: newProjectTitle }).click();
  await projectDetailPage.isReady();
  await page.getByTestId("add-task").click();
  await expect(page.getByTestId("add-task-dialog")).toBeVisible();
  const newTaskTitle = randomstring.generate(10);
  await page.getByLabel("Title").fill(newTaskTitle);
  const newTaskDescription = randomstring.generate(10);
  await page.getByLabel("Description").fill(newTaskDescription);
  const taskStartDate = addWeeks(new Date(newProjectStartDate), 2);
  await page
    .getByLabel("Start date")
    .fill(format(new Date(taskStartDate), "yyyy-MM-dd"));
  const taskFinishtDate = addWeeks(new Date(taskStartDate), 4);
  await page
    .getByLabel("Finish date")
    .fill(format(new Date(taskFinishtDate), "yyyy-MM-dd"));
  await page.getByLabel("Number of days to complete task").fill("12");
  await page.getByPlaceholder("User email search..").fill("henry");
  await page.getByLabel("Assign User (default").click();
  await expect(page.getByText("henryTest@mail.com")).toBeVisible();
  await page.getByText("henryTest@mail.com").click();
  await expect(
    page.locator("#selectedUser").filter({ hasText: "henryTest@mail.com" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await rootLayout.isNotLoading();
  exposeUser(userStore, "henryTest@mail.com").addUserInProject(
    newProject,
    vacationStore
  );
  // go to penelope userProfile to check Project Vacation management new project and vacation status
  await rootLayout.gotoUserProfile();
  await userProfilePage.isReady();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);
  await expect(page.getByText(newProject.name)).toBeVisible();

  console.log("vacationStore", vacationStore);

  const nativeProjectVacationPopulated =
    newProject.populateVacations(vacationStore);

  console.log("nativeProjectVacationPopulated", nativeProjectVacationPopulated);

  if (nativeProjectVacationPopulated.length > 0) {
    for (const vacation of nativeProjectVacationPopulated as Vacation[]) {
      if (vacation.status === "approved") {
        await expect(
          page
            .getByTestId("project-vac-manage")
            .filter({ hasText: newProject.name })
            .locator(`id=${vacation.id}but`)
        ).not.toBeVisible();
        await page
          .getByTestId("project-vac-manage")
          .filter({ hasText: newProject.name })
          .getByTestId("show-approved-vac-button")
          .click();
        await expect(
          page
            .getByTestId("project-vac-manage")
            .filter({ hasText: newProject.name })
            .locator(`id=${vacation.id}but`)
        ).toBeVisible();
      } else if (vacation.status === "rejected") {
        await expect(
          page
            .getByTestId("project-vac-manage")
            .filter({ hasText: newProject.name })
            .getByTestId("show-rejected-vacations")
        ).toBeVisible();
        await page
          .getByTestId("project-vac-manage")
          .filter({ hasText: newProject.name })
          .getByTestId("show-rejected-vacations")
          .click();
        await page.waitForTimeout(500);
        await expect(
          page
            .getByTestId("project-vac-manage")
            .filter({ hasText: newProject.name })
            .getByText(
              `${vacation.userEmail}: ${`${formatDateString(
                vacation.firstVacationDate,
                "-/"
              )}-${formatDateString(vacation.lastVacationDate, "-/")}`}`
            )
        ).toBeVisible();
      } else {
        await expect(
          page
            .getByTestId("project-vac-manage")
            .filter({ hasText: newProject.name })
            .locator(`id=${vacation.id}but`)
        ).toBeVisible();
      }
    }
  }

  // go to henry's account and check that the vacation has updated..
  await rootLayout.logout();
  await loginPage.isReady();
  await loginPage.login(
    exposeUser(userStore, "henryTest@mail.com").email,
    exposeUser(userStore, "henryTest@mail.com").pw
  );
  await dashboardPage.isReady();
  loggedInUser = exposeUser(userStore, "henryTest@mail.com");
  await rootLayout.gotoUserProfile();
  await userProfilePage.isReady();
  loggedInUserVacReqPopulated = loggedInUser.populate(
    "vacationRequests",
    vacationStore
  ) as Vacation[];
  for (const vacationRequest of loggedInUserVacReqPopulated) {
    await page.keyboard.press("Escape");
    await page
      .getByText(
        `${formatDateString(
          vacationRequest.firstVacationDate,
          "-/"
        )}-${formatDateString(vacationRequest.lastVacationDate, "-/")}`
      )
      .click();
    await expect(
      page.getByTestId(`${vacationRequest.status}-vac-req-hover`)
    ).toBeVisible();
    const descisionTrackObj = Object.fromEntries(
      vacationRequest.decisionTracker
    );
    console.log("descisionTrackObj", descisionTrackObj);
    for (const decision in descisionTrackObj) {
      await expect(page.getByText(decision)).toBeVisible();
      await expect(
        page
          .getByTestId("pm-vac-decision")
          .filter({ hasText: decision })
          .locator("span")
          .getByText(descisionTrackObj[decision!])
      ).toBeVisible();
    }
  }
  // delete penelope native test task
  await rootLayout.logout();
  await loginPage.isReady();
  await loginPage.login("penelopeTest@mail.com", "Password123!");
  await dashboardPage.isReady();
  loggedInUser = exposeUser(userStore, "penelopeTest@mail.com");
  await rootLayout.$projectsLocator.click();
  await projectsPage.isReady();
  await page
    .locator(".rt-TableRow")
    .filter({ hasText: newProject.name })
    .getByTestId("edit-project")
    .click();
  await expect(page.getByTestId("edit-project-dialog")).toBeVisible();
  await page.getByRole("button", { name: "Archive Project" }).click();
  await rootLayout.isNotLoading();
  await page.getByText(newProject.name).click();
  await projectDetailPage.isReady();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await projectsPage.isReady();
  await expect(
    page.getByRole("cell", { name: newProject.name })
  ).not.toBeVisible();
  projectStore = projectStore.filter((p) => p.name !== newProject.name);
  const deletedProjectPM = exposeUser(userStore, newProject.PM);
  deletedProjectPM.removeProjFromPMProjects(newProject.name);
  for (const userName of newProject.users) {
    const user = getObjectFromString(userName, userStore) as User;
    user.removeProjFromUserInProjects(newProject.name);
  }
  for (const vacId of newProject.vacations) {
    const vacation = getObjectFromString(vacId, vacationStore) as Vacation;
    vacation.deleteTargetProject(newProject.name, projectStore);
  }

  //go to henry and check the integrity of the vacations
  await rootLayout.logout();
  await loginPage.isReady();

  await loginPage.login("henryTest@mail.com", "Password123!");
  await dashboardPage.isReady();
  loggedInUser = exposeUser(userStore, "henryTest@mail.com");
  await rootLayout.gotoUserProfile();
  await userProfilePage.isReady();
  loggedInUserVacReqPopulated = loggedInUser.populate(
    "vacationRequests",
    vacationStore
  ) as Vacation[];
  await checkVacationsIntegrity();
  await userProfilePage.checkRemainingVacDays(loggedInUser);

  console.log("userStore", userStore);
  console.log("ProjecStore", projectStore);
  console.log("vacationStore", vacationStore);
});
