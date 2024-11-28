import { testUsers } from "./test-users.ts";
import {
  differenceInBusinessDays,
  isBefore,
  format,
  isWeekend,
  addWeeks,
  addBusinessDays,
  isWithinInterval,
} from "date-fns";

export class User {
  readonly name: string;
  readonly email: string;
  readonly pw: string;
  public remainingVacDays: number = 32;
  // public isLoggedin: boolean = false;
  public PMProjects: string[] = [];
  public userInProjects: string[] = [];
  public vacationRequests: string[] = [];

  constructor(name: string, email: string, pw: string) {
    this.name = name;
    this.email = email;
    this.pw = pw;
  }

  public populate(type: string, store: Project[] | Vacation[]) {
    if (type === "PMProjects") {
      return this.PMProjects.map((p: string) => {
        return getObjectFromString(p, store);
      });
    } else if (type === "userInProjects") {
      return this.userInProjects.map((p: string) => {
        return getObjectFromString(p, store);
      });
    } else {
      return this.vacationRequests.map((v: string) => {
        return getObjectFromString(v, store);
      });
    }
  }

  public addPMProject(projectName: string) {
    this.PMProjects.push(projectName);
  }
  public addUserInProject(project: Project, vacationStore: Vacation[]) {
    this.userInProjects.push(project.name);
    project.addUser(this.email);
    //check if vac status is now different..
    const userPopulateVacReq = this.populate(
      "vacationRequests",
      vacationStore
    ) as Vacation[];
    console.log("userPopulateVacReq", userPopulateVacReq);
    if (vacationStore.length > 0) {
      for (const vacation of userPopulateVacReq) {
        if (
          isWithinInterval(new Date(vacation.firstVacationDate), {
            start: new Date(formatDateString(project.projectStartDate, "/-")),
            end: new Date(formatDateString(project.projectFinishDate, "/-")),
          }) ||
          isWithinInterval(new Date(vacation.lastVacationDate), {
            start: new Date(formatDateString(project.projectStartDate, "/-")),
            end: new Date(formatDateString(project.projectFinishDate, "/-")),
          })
        ) {
          console.log("updating vacs sync");
          if (vacation.status === "approved") {
            vacation.status = "pending";
          }
          vacation.addTargetPM(project.PM);
          // vacation.targetPMs.push(project.PM);
          vacation.addTargetProject(project.name);
          // vacation.targetProjects.push(project.name);
          project.addVacation(vacation.id!);
        }
      }
    }
  }

  public updateRemainingVacDays(numOfDays: number) {
    console.log("in updateRemainingVacDays", numOfDays);
    this.remainingVacDays += numOfDays;
  }

  public addVacationRequest(vacationId: string) {
    this.vacationRequests.push(vacationId);
  }

  public deleteVacationRequest(vacId: string) {
    this.vacationRequests = this.vacationRequests.filter((v) => v !== vacId);
  }

  public removeProjFromUserInProjects(projectName: string) {
    this.userInProjects = this.userInProjects.filter((p) => p !== projectName);
  }

  public removeProjFromPMProjects(projectName: string) {
    this.PMProjects = this.PMProjects.filter((p) => p !== projectName);
  }
}

export class Project {
  readonly name: string;
  readonly PM: string;
  readonly projectStartDate: string;
  readonly projectFinishDate: string;
  public vacations: string[] = [];
  public users: string[] = [];

  constructor(
    name: string,
    PM: string,
    projectStartDate: string,
    projectFinishDate: string
  ) {
    this.name = name;
    this.PM = PM;
    this.projectStartDate = projectStartDate;
    this.projectFinishDate = projectFinishDate;
  }

  public addUser(userEmail: string) {
    if (!this.users.includes(userEmail)) {
      this.users.push(userEmail);
    }
  }

  public populateVacations(store: Vacation[]) {
    return this.vacations.map((v: string) => {
      return getObjectFromString(v, store);
    });
  }

  public addVacation(vacationId: string) {
    this.vacations.push(vacationId);
  }

  public deleteVacation(vacId: string) {
    this.vacations = this.vacations.filter((v) => v !== vacId);
  }
}

export class Vacation {
  readonly userEmail: string;
  readonly firstVacationDate: string;
  readonly lastVacationDate: string;
  readonly numberOfVacationDays: number;
  public id?: string;
  public status: "pending" | "approved" | "rejected" = "pending";
  public targetPMs: string[] = [];
  public targetProjects: string[] = [];
  public decisionTracker: Map<string, string> = new Map();

  constructor(
    userEmail: string,
    firstVacationDate: string,
    lastVacationDate: string
  ) {
    this.userEmail = userEmail;
    this.firstVacationDate = firstVacationDate;
    this.lastVacationDate = lastVacationDate;
    this.numberOfVacationDays =
      differenceInBusinessDays(
        new Date(lastVacationDate),
        new Date(firstVacationDate)
      ) + 1;
  }

  public deleteTargetProject(projectName: string, projectStore: Project[]) {
    this.targetProjects = this.targetProjects.filter((p) => p !== projectName);
    // update decisionTracker
    this.updateAndCheckStatus(projectName, null);

    const targetPMs = this.targetProjects.map((pName) => {
      const project = getObjectFromString(pName, projectStore) as Project;
      return project.PM;
    });
    this.targetPMs = targetPMs;
  }

  public populate(type: string, store: Project[] | User[]) {
    if (type === "targetPMs") {
      return this.targetPMs.map((pm: string) => {
        return getObjectFromString(pm, store as User[]);
      });
    } else {
      return this.targetProjects.map((p: string) => {
        return getObjectFromString(p, store as Project[]);
      });
    }
  }

  public updateVacStatus(status: "pending" | "approved" | "rejected") {
    this.status = status;
  }

  public addTargetPM(userPMEmail: string) {
    if (!this.targetPMs.includes(userPMEmail)) {
      this.targetPMs.push(userPMEmail);
    }
  }

  public addTargetProject(projectName: string) {
    if (!this.targetProjects.includes(projectName)) {
      this.targetProjects.push(projectName);
    }
  }

  public updateAndCheckStatus(
    projName: string,
    status: "Accept" | "Reject" | null
  ) {
    if (status) {
      this.decisionTracker.set(projName, status);
    } else {
      this.decisionTracker.delete(projName);
    }
    if (
      Array.from(this.decisionTracker)
        .map((el) => el[1])
        .includes("Reject")
    ) {
      this.status = "rejected";
      return;
    }
    if (this.decisionTracker.size === this.targetProjects.length) {
      this.status = "approved";
    }
  }

  public removeVacFromProjectsAndUsers(
    userStore: User[],
    projectStore: Project[],
    vacationStore: Vacation[]
  ) {
    console.log("vacToDelete", this);
    // this is unecessary since PMs only store theit own vacations like any other user
    // this.targetPMs.forEach((pm) => {
    //   const pmObj = getObjectFromString(pm, userStore) as User;
    //   const pmVacationRequestsPopulated = pmObj.populate(
    //     "vacationRequests",
    //     vacationStore
    //   ) as Vacation[];
    //   pmObj.vacationRequests = pmVacationRequestsPopulated
    //     .filter((v) => v.id !== this.id)
    //     .map((v) => v.id!);
    // });
    const vacOwnerObj = getObjectFromString(this.userEmail, userStore) as User;
    const vacOwnerPopulated = vacOwnerObj.populate(
      "vacAtionRequests",
      vacationStore
    ) as Vacation[];
    vacOwnerObj.vacationRequests = vacOwnerPopulated
      .filter((v) => v.id !== this.id)
      .map((v) => v.id!);

    this.targetProjects.forEach((p) => {
      const pObj = getObjectFromString(p, projectStore) as Project;
      const pVacationsPopulated = pObj.populateVacations(
        vacationStore
      ) as Vacation[];
      pObj.vacations = pVacationsPopulated
        .filter((v) => v.id !== this.id)
        .map((v) => v.id!);
    });
  }
}

export function createLoggedInUser(userEmail: string) {
  const targetUser = testUsers.find((u) => u.email === userEmail);
  // console.log("targetUser", targetUser);
  return new User(targetUser?.name!, targetUser?.email!, targetUser?.pw!);
}

// format date from dd/MM/yyyy to yyyy-MM-dd and vice versa
export function formatDateString(invalidString: string, direction: string) {
  let validString: string;
  if (direction === "/-") {
    const splitString = invalidString.split("/");
    validString = `${splitString[2]}-${splitString[1]}-${splitString[0]}`;
  } else {
    const splitString = invalidString.split("-");
    validString = `${splitString[2]}/${splitString[1]}/${splitString[0]}`;
  }
  console.log("validString", validString);
  return validString;
}

export function createVacation(
  loggedInUser: User,
  firstVacationDate: string,
  lastVacationDate: string
) {
  const vacation = new Vacation(
    loggedInUser.email,
    firstVacationDate,
    lastVacationDate
  );
  // const totalBusinessDays = differenceInBusinessDays(
  //   new Date(lastVacationDate),
  //   new Date(firstVacationDate)
  // );
  loggedInUser.updateRemainingVacDays(-vacation.numberOfVacationDays);
  // loggedInUser.addVacationRequest(vacation);
  // loggedInUser.vacationRequests.push(vacation);
  return vacation;
}

export function generateVacDateStringPair(user: User, projectStore: Project[]) {
  //  populate user
  const userInProjectsPopulated: Project[] = user.populate(
    "userInProjects",
    projectStore
  ) as Project[];
  console.log("userInProjectsPopulated", userInProjectsPopulated);
  const earliestDate = Date.now();
  const latestDate = userInProjectsPopulated
    .map((p) => formatDateString(p.projectFinishDate, "/-"))
    .map((d) => new Date(d).getTime())
    .sort((a, b) => b - a)[0];

  console.log("earliestDate-latestDate", earliestDate, latestDate);

  let firstVacationDateNum =
    Math.floor(Math.random() * (latestDate - earliestDate)) + earliestDate;
  let lastVacationDateNum = addBusinessDays(
    new Date(firstVacationDateNum),
    9
  ).getTime();
  while (isWeekend(firstVacationDateNum)) {
    firstVacationDateNum =
      Math.floor(Math.random() * (latestDate - earliestDate)) + earliestDate;
    lastVacationDateNum = addBusinessDays(
      new Date(firstVacationDateNum),
      9
    ).getTime();
  }

  const firstVacationDate = format(
    new Date(firstVacationDateNum),
    "yyyy-MM-dd"
  );
  const lastVacationDate = format(new Date(lastVacationDateNum), "yyyy-MM-dd");
  console.log(
    "firstVacationDate-lastVacationDate",
    firstVacationDate,
    lastVacationDate
  );
  return { firstVacationDate, lastVacationDate };
}

// export function deleteVacationRequest(
//   vacId: string,
//   loggedInUserStore: User[]
// ) {
//   loggedInUserStore.forEach((u) => {
//     u.deleteVacationRequest(vacId);
//     u.PMProjects.forEach((pmProj) => {
//       pmProj.deleteVacation(vacId);
//     });
//     u.userInProjects.forEach((uiProj) => {
//       uiProj.deleteVacation(vacId);
//     });
//   });
// }

export function exposeUser(userStore: User[], email: string) {
  const existingUser = userStore.find((u) => u.email === email);
  if (existingUser) return existingUser;
  else {
    const targetUser = testUsers.find((u) => u.email === email);
    // console.log("targetUser", targetUser);

    const newUser = new User(
      targetUser?.name!,
      targetUser?.email!,
      targetUser?.pw!
    );
    userStore.push(newUser);
    return newUser;
  }
}

export function getObjectFromString(
  identifier: string,
  store: User[] | Project[] | Vacation[]
) {
  if (store.filter((inst) => inst instanceof User).length === store.length) {
    return (store as User[]).find((el) => el.email! === identifier)!;
  } else if (
    store.filter((inst) => inst instanceof Project).length === store.length
  ) {
    return (store as Project[]).find((el) => el.name! === identifier)!;
  } else {
    return (store as Vacation[]).find((el) => el.id! === identifier)!;
  }
}

export function addNewProject(
  PM: User,
  name: string,
  projectStartDate: string,
  projectFinishDate: string
) {
  const newProject = new Project(
    name,
    PM.email,
    projectStartDate,
    projectFinishDate
  );
  PM.addPMProject(name);
  return newProject;
}
