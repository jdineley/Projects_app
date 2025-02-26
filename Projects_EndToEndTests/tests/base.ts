import { test as base } from "@playwright/test";
import {
  LoginPage,
  DashboardPage,
  SignupPage,
  ProjectsPage,
  RootLayout,
  ProjectDetailPage,
  TaskDetailPage,
  ProjectReviewPage,
  UserProfilePage,
  AccountPage,
} from "./pom";

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  signupPage: SignupPage;
  projectsPage: ProjectsPage;
  rootLayout: RootLayout;
  projectDetailPage: ProjectDetailPage;
  taskDetailPage: TaskDetailPage;
  projectReviewPage: ProjectReviewPage;
  userProfilePage: UserProfilePage;
  accountPage: AccountPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  rootLayout: async ({ page }, use) => {
    await use(new RootLayout(page));
  },
  projectDetailPage: async ({ page }, use) => {
    await use(new ProjectDetailPage(page));
  },
  taskDetailPage: async ({ page }, use) => {
    await use(new TaskDetailPage(page));
  },
  projectReviewPage: async ({ page }, use) => {
    await use(new ProjectReviewPage(page));
  },
  userProfilePage: async ({ page }, use) => {
    await use(new UserProfilePage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
});

export { expect } from "@playwright/test";
