import { useState, useEffect, useRef } from "react";
import {
  Link,
  useLoaderData,
  useSubmit,
  useNavigation,
  useFetcher,
  useActionData,
  Form,
} from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
// date-fns
import { format } from "date-fns";
import { useNotificationContext } from "../hooks/useNotificationContext";

// components

import AddTaskDialog from "../components/AddTaskDialog";
import UserActiveTaskRow from "../components/UserActiveTaskRow";
import ProjectTimeline from "../components/ProjectTimeline";
import ProjectEditDialog from "../components/ProjectEditDialog";

// icons
import { TiVendorMicrosoft } from "react-icons/ti";

// radix
import { Table, Badge, Button, Flex } from "@radix-ui/themes";

//hooks
import useMatchMedia from "../hooks/useMatchMedia";

//utility
import { isTaskAtRisk } from "../utility";

// constants
import { mobileScreenWidth, tabletScreenWidth } from "../utility";

import { toast } from "react-toastify";

export default function ProjectsDetail() {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);

  const {
    project,
    projectTasks,
    newTaskId,
    searchedTasks,
    taskDep,
    searchedUsers,
    assignUser,
  } = useLoaderData();

  // console.log("project", project);

  const json = useActionData();

  const [percentCompleteChanged, setPercentCompleteChanged] = useState(false);

  const [projectTitle, setProjectTitle] = useState("");
  const [projectStart, setProjectStart] = useState("");
  const [projectEnd, setProjectEnd] = useState("");
  const [projectReviews, setProjectReviews] = useState([]);

  const { user } = useAuthContext();
  const submit = useSubmit();
  const { notification } = useNotificationContext();

  const percentChangeButtonsRef = useRef([]);
  const archiveButtonRef = useRef(null);

  const fetcher = useFetcher();

  useEffect(() => {
    console.log("in ProjectsDetail useEffect");
    if (notification) {
      document.getElementById(newTaskId)?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
    if (json) {
      const { result } = json;
      toast(result);
    }
  }, [notification, newTaskId, json]);

  let userTasks;
  let otherUsersTasks;
  if (projectTasks) {
    userTasks = projectTasks.filter((task) => task.user.email === user.email);
    if (project.msProjectGUID) {
      userTasks.sort((a, b) =>
        new Date(a.startDate).getTime() > new Date(b.startDate).getTime()
          ? 1
          : -1
      );
    } else {
      userTasks.sort((a) => {
        if (!a.completed) return -1;
      });
    }

    otherUsersTasks = projectTasks.filter(
      (task) => task.user.email !== user.email
    );
    if (project.msProjectGUID) {
      otherUsersTasks.sort((a, b) =>
        new Date(a.startDate).getTime() > new Date(b.startDate).getTime()
          ? 1
          : -1
      );
    } else {
      otherUsersTasks.sort((a) => {
        if (!a.completed) return -1;
      });
    }
  }

  function handleSubmitAllPercentFetchers() {
    percentChangeButtonsRef.current.forEach((button) => {
      submit(button);
      percentChangeButtonsRef.current = [];
      setPercentCompleteChanged(false);
    });
  }

  const otherUsersTableRows = otherUsersTasks?.map((task) => {
    return (
      <Table.Row
        key={task._id}
        id={task._id === newTaskId && notification ? newTaskId : ""}
        className={
          task._id === newTaskId && notification ? "new-task-notification" : ""
        }
      >
        <Table.Cell>
          <Link to={`tasks/${task._id}`}>{task.title}</Link>
        </Table.Cell>
        {!task.archived && (
          <>
            <Table.Cell>
              {isTabletResolution ? (
                `${task.percentageComplete}%`
              ) : (
                <>
                  <h5>Percent complete:</h5>
                  <div className="numerical-percent-complete">
                    {task.percentageComplete}
                    {"%"}
                    {isTaskAtRisk(task) >= 1 ? (
                      <Badge color="tomato" variant="solid">
                        At risk
                      </Badge>
                    ) : (
                      ""
                    )}
                    {task.completed && (
                      <Badge color="green" variant="solid">
                        Complete
                      </Badge>
                    )}
                    {!task.completed &&
                      new Date(task.deadline).getTime() < Date.now() && (
                        <Badge color="purple" variant="solid">
                          Overdue
                        </Badge>
                      )}
                  </div>
                  <div id="task-deps">
                    <h5>Task dependencies:</h5>
                    {task.dependencies.length > 0 ? (
                      task.dependencies.map((dep) => (
                        <Badge
                          highContrast
                          color={
                            dep.completed
                              ? "green"
                              : dep.percentageComplete <= 25
                              ? "red"
                              : "orange"
                          }
                          key={dep._id}
                        >
                          <Link
                            to={`/projects/${dep.project}/tasks/${dep._id}`}
                          >
                            <div>{dep.title.slice(0, 15)}...</div>
                            <div>{dep.percentageComplete}%</div>
                          </Link>
                        </Badge>
                      ))
                    ) : (
                      <div>None assigned</div>
                    )}
                  </div>
                </>
              )}
            </Table.Cell>
            {!isTabletResolution && (
              <Table.Cell>{task.daysToComplete}</Table.Cell>
            )}
          </>
        )}
        {!isMobileResolution && (
          <Table.Cell>
            {format(new Date(task.deadline), "dd/MM/yyyy")}
          </Table.Cell>
        )}
        <Table.Cell>
          <Flex direction="column">
            <b>{task.user.email.split("@")[0]}</b>
            {task.secondaryUsers.map((u) => u.email.split("@")[0])}
          </Flex>
        </Table.Cell>
      </Table.Row>
    );
  });

  return (
    <div className="projects-detail">
      <div className="project-title-collector">
        <div className="title-icon-collect">
          <h2 className="flex items-center gap-2">
            {project?.msProjectGUID && <TiVendorMicrosoft />}
            {project?.title}
            {project?.owner._id !== user._id && (
              <span className="owner">
                {" - "}
                {project?.owner.email}
              </span>
            )}
            {project?.archived && " *ARCHIVED*"}
          </h2>
        </div>
        {user._id === project?.owner._id && project?.archived && (
          <Flex gap="3">
            <Form method="POST">
              <input type="hidden" name="projectId" value={project?._id} />
              <Button
                id="unarchive-project-button"
                type="submit"
                name="intent"
                value="unarchive-project"
                color="yellow"
              >
                Restore Project
              </Button>
            </Form>
            <fetcher.Form method="POST">
              <input type="hidden" name="projectId" value={project?._id} />
              <Button
                id="delete-project-button"
                type="submit"
                name="intent"
                value="delete-project"
                color="tomato"
              >
                Delete Project
              </Button>
            </fetcher.Form>
          </Flex>
        )}{" "}
        {!project?.archived && user._id === project?.owner._id && (
          <>
            <fetcher.Form method="POST" style={{ display: "none" }}>
              <input type="hidden" name="title" value={projectTitle} />
              <input type="hidden" name="start" value={projectStart} />
              <input type="hidden" name="end" value={projectEnd} />
              <input type="text" name="projectId" value={project?._id} />
              {projectReviews.map((reviewObj, i) => {
                if (reviewObj._id) {
                  return (
                    <div key={i}>
                      <input
                        type="hidden"
                        name={`reviewId${i}`}
                        value={reviewObj._id}
                      />
                      <input
                        type="hidden"
                        name={`title${i}`}
                        value={reviewObj.title}
                      />
                      <input
                        type="hidden"
                        name={`date${i}`}
                        value={reviewObj.date}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={i}>
                      <input type="hidden" name={`newReview${i}`} />
                      <input
                        type="hidden"
                        name={`Title${i}`}
                        value={reviewObj.title}
                      />
                      <input
                        type="hidden"
                        name={`Date${i}`}
                        value={reviewObj.date}
                      />
                    </div>
                  );
                }
              })}
              <button
                id={project?._id}
                type="submit"
                name="intent"
                value="edit-project"
              ></button>
            </fetcher.Form>
            <fetcher.Form method="POST" style={{ display: "none" }}>
              <input type="hidden" name="projectId" value={project?._id} />
              <button
                id={`archive-project-button${project?._id}`}
                type="submit"
                name="intent"
                value="archive-project"
                ref={archiveButtonRef}
              ></button>
            </fetcher.Form>
            <ProjectEditDialog
              projectTitle={projectTitle}
              setProjectTitle={setProjectTitle}
              projectStart={projectStart}
              setProjectStart={setProjectStart}
              projectEnd={projectEnd}
              setProjectEnd={setProjectEnd}
              project={project}
              projectReviews={projectReviews}
              setProjectReviews={setProjectReviews}
              editProjectButton={document.getElementById(project?._id)}
              archiveProjectButton={document.getElementById(
                `archive-project-button${project?._id}`
              )}
              submit={submit}
              user={user}
            />
          </>
        )}
      </div>
      <div>
        {user && (
          <div>
            <ProjectTimeline project={project} />
            <div className="title-icon-collect">
              {/* <h3>My {!project?.archived && "Active"} Tasks</h3> */}
              <h3>My Tasks</h3>
              {!project?.archived &&
                (project?.users.includes(user._id) ||
                  project?.owner._id === user._id) && (
                  <AddTaskDialog
                    searchedTasks={searchedTasks}
                    taskDep={taskDep}
                    project={project}
                    userTask={true}
                  />
                )}
            </div>
            {userTasks?.length > 0 && (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Task</Table.ColumnHeaderCell>
                    {!isTabletResolution && (
                      <Table.ColumnHeaderCell>
                        Description
                      </Table.ColumnHeaderCell>
                    )}
                    {!project.archived && (
                      <>
                        <Table.ColumnHeaderCell>
                          {isTabletResolution ? (
                            <div>Percent complete</div>
                          ) : (
                            <div id="percent-complete-th">
                              Completion status
                              <button
                                type="submit"
                                onClick={handleSubmitAllPercentFetchers}
                                id="percent-complete-save"
                                style={{
                                  backgroundColor: percentCompleteChanged
                                    ? "rgb(22, 101, 192)"
                                    : "transparent",
                                }}
                              ></button>
                            </div>
                          )}
                        </Table.ColumnHeaderCell>
                        {!isTabletResolution && (
                          <Table.ColumnHeaderCell>
                            Days to complete
                          </Table.ColumnHeaderCell>
                        )}
                      </>
                    )}
                    {!isMobileResolution && (
                      <>
                        {project?.msProjectGUID && (
                          <Table.ColumnHeaderCell>
                            Start date
                          </Table.ColumnHeaderCell>
                        )}
                        <Table.ColumnHeaderCell>
                          Completion date
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          Colaborators
                        </Table.ColumnHeaderCell>
                      </>
                    )}
                    {!project.archived && (
                      <Table.ColumnHeaderCell>Edit</Table.ColumnHeaderCell>
                    )}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {userTasks?.map((task) => (
                    <UserActiveTaskRow
                      key={task._id}
                      task={task}
                      newTaskId={newTaskId}
                      notification={notification}
                      setPercentCompleteChanged={setPercentCompleteChanged}
                      searchedTasks={searchedTasks}
                      taskDep={taskDep}
                      percentChangeButtonsRef={percentChangeButtonsRef}
                      taskDetail={false}
                      isTabletResolution={isTabletResolution}
                      isMobileResolution={isMobileResolution}
                    />
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </div>
        )}
        <div className="other-users-container">
          <div className="title-icon-collect">
            <h3>Other users Tasks</h3>
            {user._id === project?.owner._id && !project?.archived && (
              <AddTaskDialog
                userTask={false}
                searchedTasks={searchedTasks}
                taskDep={taskDep}
                assignUser={assignUser}
                searchedUsers={searchedUsers}
                project={project}
              />
            )}
          </div>
          {otherUsersTasks?.length > 0 && (
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Task</Table.ColumnHeaderCell>
                  {!project?.archived && (
                    <>
                      <Table.ColumnHeaderCell>
                        {isTabletResolution
                          ? "Percentage complete"
                          : "Completion status"}
                      </Table.ColumnHeaderCell>
                      {!isTabletResolution && (
                        <Table.ColumnHeaderCell>
                          Days to complete
                        </Table.ColumnHeaderCell>
                      )}
                    </>
                  )}
                  {!isMobileResolution && (
                    <Table.ColumnHeaderCell>
                      Completion date
                    </Table.ColumnHeaderCell>
                  )}
                  <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>{otherUsersTableRows}</Table.Body>
            </Table.Root>
          )}
        </div>
      </div>
    </div>
  );
}
