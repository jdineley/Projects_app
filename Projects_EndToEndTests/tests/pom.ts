import { expect, type Page, type Locator } from "@playwright/test";
import path from "path";
import { User } from "./utility";

class CommentReply {
  readonly page: Page;
  readonly $addCommentLocator: Locator;
  readonly $submitButtonLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$addCommentLocator = page.getByRole("button", {
      name: "Add comment...",
    });
    this.$submitButtonLocator = page.getByRole("button", { name: "Submit" });
  }

  public async addNewComment(comment: string) {
    await this.$addCommentLocator.click();
    const commentBox = this.page.getByPlaceholder("add new");
    await expect(commentBox).toBeVisible();
    await commentBox.click();
    await commentBox.fill(comment);
    await this.$submitButtonLocator.click();
    await expect(this.page.getByText(comment)).toBeVisible();
  }

  public async addReplyToComment(reply: string, comment: string) {
    const userCommentCollector = this.page
      .locator(".user-comment-collector")
      .filter({
        has: this.page.locator(".user-comment").filter({
          has: this.page.getByText(comment, { exact: true }),
        }),
      });
    await userCommentCollector.getByRole("button", { name: "Reply.." }).click();
    const replyBox = this.page.getByPlaceholder("reply to henryTest@mail.com");
    await expect(replyBox).toBeVisible();
    await replyBox.click();
    await replyBox.fill(reply);
    await this.$submitButtonLocator.click();
    await userCommentCollector
      .getByRole("button", { name: "Show discussion" })
      .click();
    await expect(this.page.getByText(reply)).toBeVisible();
  }
}

export class LoginPage {
  public url: string = process.env.BASE_FRONTEND_URL! + "login";
  readonly page: Page;
  readonly $loginLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$loginLocator = this.page.locator(".login");
  }

  public async goto() {
    await this.page.goto(this.url);
  }

  public async isReady() {
    return expect(this.$loginLocator).toBeVisible({ timeout: 3000 });
  }

  public async login(email: string, pw: string) {
    await this.$loginLocator.getByLabel("Email").fill(email);
    await this.$loginLocator.getByLabel("Password").fill(pw);
    await this.$loginLocator.getByRole("button", { name: "Submit" }).click();
  }
}

export class DashboardPage {
  public url: string = process.env.BASE_FRONTEND_URL! + "dashboard";
  readonly page: Page;
  readonly $dashboardLocator: Locator;
  readonly $msProjectLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$dashboardLocator = this.page.locator("#dashboard");
    this.$msProjectLocator = this.page.getByRole("link", {
      name: "Customer Service Ramp Up",
    });
  }

  public async goto() {
    await this.page.goto(this.url);
  }

  public async isReady() {
    return expect(this.$dashboardLocator).toBeAttached({ timeout: 15000 });
  }
}

export class SignupPage {
  public url: string = process.env.BASE_FRONTEND_URL! + "signup";
  readonly page: Page;
  readonly $signupLocator: Locator;
  readonly $errorLocator: Locator;
  readonly $submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$signupLocator = this.page.locator(".signup");
    this.$errorLocator = this.page.locator(".error");
    this.$submitButton = this.page.getByRole("button", { name: "Submit" });
  }

  public async goto() {
    await this.page.goto(this.url);
  }

  public async isReady() {
    return expect(this.$signupLocator).toBeAttached();
  }

  public async emailNotInUse() {
    return expect(this.$errorLocator).not.toBeAttached();
  }

  public async signup(
    email: string,
    password: string,
    confirmPassword: string
  ) {
    await this.$signupLocator.getByLabel("Email").fill(email);
    await this.$signupLocator
      .getByLabel("Password", { exact: true })
      .fill(password);
    await this.$signupLocator
      .getByLabel("Confirm Password", { exact: true })
      .fill(confirmPassword);
    await this.$submitButton.click();
    // await this.emailNotInUse();
  }
}

export class ProjectsPage {
  public url: string = process.env.BASE_FRONTEND_URL! + "projects";
  readonly page: Page;
  readonly $projectsLocator: Locator;
  readonly $myActiveProjectsLocator: Locator;
  readonly $otherUsersActiveProjectsLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$projectsLocator = this.page.locator("#projects");
    this.$myActiveProjectsLocator = this.page.getByTestId("my-active-projects");
    this.$otherUsersActiveProjectsLocator = this.page.getByTestId(
      "other-users-active-projects"
    );
  }

  public async getMyProjectsNames() {
    return this.$myActiveProjectsLocator.getByRole("link").allInnerTexts();
  }

  public async getOtherUserProjectNames() {
    return this.$otherUsersActiveProjectsLocator
      .getByRole("link")
      .allInnerTexts();
  }

  public async goto() {
    await this.page.goto(this.url);
  }

  public async clickProject(projectName: string) {
    await this.$projectsLocator
      .getByRole("link", { name: projectName })
      .click();
  }

  public async isReady() {
    return expect(this.$projectsLocator).toBeAttached();
  }

  public async addMsProject(xmlName: string) {
    await this.$projectsLocator.getByTestId("add-project").click();
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.page.getByTestId("upload-.xml").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(
      path.join(__dirname, `../test-data/${xmlName}.xml`)
    );
    await this.page.getByRole("button", { name: "Upload" }).click();
    await expect(
      this.page.getByRole("link", {
        name: xmlName,
      })
    ).toBeVisible({ timeout: 200000 });
  }
}

export class ProjectDetailPage {
  public baseUrl: string = process.env.BASE_FRONTEND_URL + "projects/";
  readonly page: Page;
  readonly $projectDetailLocator: Locator;
  readonly $filterComboBox: Locator;
  readonly $savePercentCompleteButton: Locator;
  readonly $inWorkTasksSwitch: Locator;
  readonly $editProjectLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$projectDetailLocator = page.getByTestId("project-detail");
    this.$filterComboBox = page.getByRole("combobox");
    this.$savePercentCompleteButton = page.locator("#percent-complete-save");
    this.$inWorkTasksSwitch = page
      .locator("div")
      .filter({ hasText: /^Show in-work tasks only$/ })
      .getByRole("switch");
    this.$editProjectLocator = page.getByTestId("edit-project");
  }

  public async goto(url: string) {
    await this.page.goto(url);
  }

  public async isReady() {
    return expect(this.$projectDetailLocator).toBeVisible({ timeout: 60000 });
  }

  public async filterBy(name: string) {
    await this.$filterComboBox.click();
    await this.page.getByLabel(name).click();
  }

  public async toggleInWorkTasks(type: string) {
    await this.$inWorkTasksSwitch.click();
    await expect(this.$inWorkTasksSwitch).toHaveAttribute(
      "data-state",
      `${type}`
    );
  }

  public async updatePercentagecomplete(taskName: string, fraction: number) {
    const slider = this.page
      .getByRole("row", { name: taskName })
      .getByRole("slider");
    await slider.scrollIntoViewIfNeeded();
    await expect(slider).toBeVisible();
    const box = await slider.boundingBox();
    console.log(box);
    // if task has dependencies with less than 100% complete the top percentage id 95%...
    const clickFraction = fraction * 0.95 + 0.05;
    console.log(clickFraction);
    await this.page.mouse.click(
      box!.x + box!.width * clickFraction,
      box!.y + box!.height * 0.5
    );
    const id = await this.getTaskLinkHrefId(taskName);
    await expect(await this.getTaskPercentageDisplay(id)).toHaveText(
      new RegExp(`${fraction * 100}`)
    );
  }

  public async getTaskLinkHrefId(taskName: string) {
    const link = this.page.getByRole("link", { name: taskName });
    const href = await link.getAttribute("href");
    const hrefArr = href!.split("/");
    const id = hrefArr[hrefArr.length - 1];
    return id;
  }

  public async getTaskPercentageDisplay(taskId: string) {
    return this.page.getByTestId(`percentage-complete-${taskId}`);
  }

  public async getTaskFinishDateDisplay(taskId: string) {
    return this.page.getByTestId(`finish-date-${taskId}`);
  }

  public async assertPercentageComplete(
    expectedPercentage: string,
    taskName: string
  ) {
    const taskId = await this.getTaskLinkHrefId(taskName);
    await expect(await this.getTaskPercentageDisplay(taskId)).toHaveText(
      new RegExp(`${expectedPercentage}`)
    );
  }

  public async getFirstInWorkUserNotPM(pmName: string) {
    const inWorkUser = this.page.getByTestId("task-owner");
    let inWorkUserName: string | null;

    const numberOfInworkTasks = await this.page
      .getByTestId("task-owner")
      .count();
    if (numberOfInworkTasks > 1) {
      for (let i = 0; i < numberOfInworkTasks; i++) {
        inWorkUserName = await inWorkUser.nth(i).innerText();

        if (inWorkUserName?.split("\n")[0] !== pmName)
          return inWorkUserName?.split("\n")[0];
      }
    } else {
      inWorkUserName = await inWorkUser.innerText();
      if (inWorkUserName?.split("\n")[0] !== pmName)
        return inWorkUserName?.split("\n")[0];
    }
    return null;
  }

  public async getFirstTaskName() {
    return await this.page
      .locator(".rt-TableRoot")
      .getByRole("link")
      .first()
      .innerText({ timeout: 20000 });
  }

  public async getFirstTaskOwner() {
    return (
      await this.page
        .getByRole("row", { name: await this.getFirstTaskName() })
        .getByTestId("task-owner")
        .innerText()
    ).split("\n")[0];
  }

  public async clickFirstTaskNonUser(userName: string) {
    const tasksOrderByOwnerName = await this.page
      .getByTestId("task-owner")
      .allInnerTexts();
    console.log(tasksOrderByOwnerName);
    const taskRows = await this.page.getByTestId("user-active-task-row").all();
    console.log("task rows", taskRows);
    let i = 0;
    for (const ownerName of tasksOrderByOwnerName) {
      if (userName !== ownerName) {
        await taskRows[i].getByRole("link").first().click();
        return ownerName;
      }
      i++;
    }
  }

  public async assertFirstTaskFinishDate(expectedDate: string) {
    const firstTaskName = await this.getFirstTaskName();
    const firstTaskId = await this.getTaskLinkHrefId(firstTaskName);
    await expect(await this.getTaskFinishDateDisplay(firstTaskId)).toHaveText(
      expectedDate,
      { timeout: 20000 }
    );
  }

  public async countNumberOfTasksForUser(name: string) {
    return this.page.getByText(name).count();
  }
}

export class RootLayout {
  readonly page: Page;
  readonly $avatarLocator: Locator;
  readonly $avatarDropLocator: Locator;
  readonly $projectsLocator: Locator;
  readonly $mainLoadingLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.$avatarLocator = page.getByTestId("avatar").locator("span").nth(1);
    this.$avatarDropLocator = page.getByTestId("avatar-drop");
    this.$projectsLocator = page.getByRole("button", { name: "Projects" });
    this.$mainLoadingLocator = page.locator("main.loading");
  }

  public async logout() {
    await this.$avatarLocator.click();
    await expect(this.page.getByText("Logout")).toBeVisible({ timeout: 3000 });
    await this.page.getByRole("menuitem", { name: "Logout" }).click();
  }

  public async assertNumberOfNotifications(numNotifications: number) {
    await expect(this.$avatarLocator).toHaveText(`${numNotifications}`);
  }

  public async isNotLoading() {
    await this.page.waitForTimeout(100);
    return await expect(this.$mainLoadingLocator).not.toBeVisible({
      timeout: 15000,
    });
  }

  public async countNotificationsOfType(type: string) {
    await expect(this.page.getByText("Logout")).toBeVisible({ timeout: 3000 });
    const numNotificationOfType = await this.$avatarDropLocator
      .getByText(type)
      .count();
    console.log("numNotificationOfType", numNotificationOfType);
    return numNotificationOfType;
  }

  public async gotoUserProfile() {
    await this.$avatarLocator.click();
    await expect(this.page.getByText("User Profile")).toBeVisible();
    await this.page.getByText("User Profile").click();
  }
}

export class TaskDetailPage extends CommentReply {
  readonly $taskDetailLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.$taskDetailLocator = page.getByTestId("task-detail");
  }

  public async isReady() {
    return expect(this.$taskDetailLocator).toBeVisible({ timeout: 60000 });
  }
}

export class ProjectReviewPage extends CommentReply {
  readonly $projectReviewLocator: Locator;
  constructor(page: Page) {
    super(page);
    this.$projectReviewLocator = page.getByTestId("project-review");
  }

  public async isReady() {
    return expect(this.$projectReviewLocator).toBeVisible();
  }
}

export class UserProfilePage {
  readonly page: Page;
  readonly $userProfileLocator: Locator;
  readonly $remainingVacDaysLocator: Locator;

  constructor(page: Page) {
    this.$userProfileLocator = page.getByTestId("user-profile");
    this.$remainingVacDaysLocator = page
      .getByRole("heading", { name: "Remaining vacation days" })
      .locator("small");
  }

  public async isReady() {
    return expect(this.$userProfileLocator).toBeVisible();
  }

  public async checkRemainingVacDays(loggedInUser: User) {
    return expect(this.$remainingVacDaysLocator).toHaveText(
      loggedInUser.remainingVacDays.toString()
    );
  }
}
