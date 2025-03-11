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
import {
  Table,
  Badge,
  Button,
  Flex,
  Switch,
  Text,
  Select,
  Strong,
} from "@radix-ui/themes";

//hooks
import useMatchMedia from "../hooks/useMatchMedia";

//utility
import { isTaskAtRisk } from "../utility";

// constants
import { mobileScreenWidth, tabletScreenWidth } from "../utility";

import { toast } from "react-toastify";

import { isAfter, isBefore } from "date-fns";

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

  console.dir(project);
  console.dir(projectTasks);

  const json = useActionData();

  const [percentCompleteChanged, setPercentCompleteChanged] = useState(false);

  const [projectTitle, setProjectTitle] = useState("");
  const [projectStart, setProjectStart] = useState("");
  const [projectEnd, setProjectEnd] = useState("");
  const [projectReviews, setProjectReviews] = useState([]);
  const [inWorkTasksOnly, setInWorkTasksOnly] = useState(false);
  const [filteredUsers, setFilterUsers] = useState("all-members");

  const { user } = useAuthContext();
  console.dir(user);
  const submit = useSubmit();
  const { notification } = useNotificationContext();

  const percentChangeButtonsRef = useRef([]);
  const archiveButtonRef = useRef(null);
  const freezeProjectButtonRef = useRef(null);
  const unFreezeProjectButtonRef = useRef(null);

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

  function handleSubmitAllPercentFetchers() {
    percentChangeButtonsRef.current.forEach((button) => {
      submit(button);
      percentChangeButtonsRef.current = [];
      setPercentCompleteChanged(false);
    });
  }

  return (
    <div
      className={`projects-detail ${
        !project?.inWork &&
        project?.owner._id !== user?._id &&
        "pointer-events-none"
      }`}
      data-testid="project-detail"
    >
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
            {!project?.inWork && " *FROZEN FOR SCHEDULING*"}
            {project?.archived && " *ARCHIVED*"}
          </h2>
        </div>
        {user?._id === project?.owner._id && project?.archived && (
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
            <fetcher.Form method="POST" style={{ display: "none" }}>
              <input type="hidden" name="freeze" value="true" />
              <button
                mt="2"
                id="freezeProjectButton"
                type="submit"
                name="intent"
                value="change-freeze-state"
                // ref={freezeProjectButtonRef}
              ></button>
            </fetcher.Form>
            <fetcher.Form method="POST" style={{ display: "none" }}>
              <input type="hidden" name="freeze" value="false" />
              <button
                mt="2"
                id="unFreezeProjectButton"
                type="submit"
                name="intent"
                value="change-freeze-state"
                // ref={unFreezeProjectButtonRef}
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
              freezeProjectButton={document.getElementById(
                "freezeProjectButton"
              )}
              unFreezeProjectButton={document.getElementById(
                "unFreezeProjectButton"
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
            <ProjectTimeline project={project} projectTasks={projectTasks} />
            <div className="flex justify-between mt-3">
              {/* <h3>My {!project?.archived && "Active"} Tasks</h3> */}
              <div className="flex gap-3 items-center">
                <h3>Tasks</h3>
                {!project?.msProjectGUID &&
                  !project?.archived &&
                  (project?.users.includes(user._id) ||
                    project?.owner._id === user._id) && (
                    <AddTaskDialog
                      userTask={false}
                      searchedTasks={searchedTasks}
                      taskDep={taskDep}
                      assignUser={assignUser}
                      searchedUsers={searchedUsers}
                      project={project}
                      user={user}
                    />
                  )}
              </div>
              <Flex gap="2" align="center">
                <Switch
                  size="1"
                  onClick={(e) => {
                    if (e.target.dataset.state === "unchecked") {
                      setInWorkTasksOnly(true);
                    } else {
                      setInWorkTasksOnly(false);
                    }
                  }}
                />
                <Text>Show in-work tasks only</Text>
              </Flex>
            </div>
            {projectTasks?.length > 0 && (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Task</Table.ColumnHeaderCell>
                    {!isTabletResolution && (
                      <Table.ColumnHeaderCell>
                        Description
                      </Table.ColumnHeaderCell>
                    )}
                    {!project?.archived && (
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
                            <Flex direction="column">
                              Estimated duration (days)
                              <small>(with assigned resource)</small>
                            </Flex>
                          </Table.ColumnHeaderCell>
                        )}
                      </>
                    )}
                    {!isMobileResolution && (
                      <>
                        <Table.ColumnHeaderCell>
                          Start date
                        </Table.ColumnHeaderCell>

                        <Table.ColumnHeaderCell>
                          Finish date
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          <Select.Root
                            defaultValue="all-members"
                            onValueChange={(val) => {
                              setFilterUsers(val);
                            }}
                          >
                            <Select.Trigger variant="ghost" />
                            <Select.Content>
                              <Select.Group>
                                {/* <Select.Label>Fruits</Select.Label> */}
                                <Select.Item value="all-members">
                                  <Strong>All members</Strong>
                                </Select.Item>
                                {project.users.map((u) => (
                                  <Select.Item key={u._id} value={u._id}>
                                    <Strong>{u.email}</Strong>
                                  </Select.Item>
                                ))}
                                {
                                  <Select.Item value={project.owner._id}>
                                    <Strong>{project.owner.email}</Strong>
                                  </Select.Item>
                                }
                              </Select.Group>
                            </Select.Content>
                          </Select.Root>
                        </Table.ColumnHeaderCell>
                      </>
                    )}
                    {!project?.archived && (
                      <Table.ColumnHeaderCell>Edit</Table.ColumnHeaderCell>
                    )}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {
                    // !project.msProjectGUID
                    //   ? userTasks?.map((task) => (
                    //       <UserActiveTaskRow
                    //         key={task._id}
                    //         task={task}
                    //         newTaskId={newTaskId}
                    //         notification={notification}
                    //         setPercentCompleteChanged={setPercentCompleteChanged}
                    //         searchedTasks={searchedTasks}
                    //         taskDep={taskDep}
                    //         percentChangeButtonsRef={percentChangeButtonsRef}
                    //         taskDetail={false}
                    //         isTabletResolution={isTabletResolution}
                    //         isMobileResolution={isMobileResolution}
                    //         user={user}
                    //       />
                    //     ))
                    //   :
                    !inWorkTasksOnly
                      ? projectTasks
                          ?.filter(
                            (t) =>
                              !t.milestone &&
                              (filteredUsers !== "all-members"
                                ? t.user._id.toString() === filteredUsers
                                : true)
                          )
                          .sort((a, b) =>
                            new Date(a.startDate).getTime() >
                            new Date(b.startDate).getTime()
                              ? 1
                              : -1
                          )
                          .map((task) => (
                            <UserActiveTaskRow
                              key={task._id}
                              task={task}
                              newTaskId={newTaskId}
                              notification={notification}
                              setPercentCompleteChanged={
                                setPercentCompleteChanged
                              }
                              searchedTasks={searchedTasks}
                              taskDep={taskDep}
                              percentChangeButtonsRef={percentChangeButtonsRef}
                              taskDetail={false}
                              isTabletResolution={isTabletResolution}
                              isMobileResolution={isMobileResolution}
                              project={project}
                              user={user}
                            />
                          ))
                      : projectTasks
                          ?.filter(
                            (t) =>
                              isAfter(new Date(), new Date(t.startDate)) &&
                              isBefore(new Date(), new Date(t.deadline)) &&
                              !t.milestone &&
                              (filteredUsers !== "all-members"
                                ? t.user._id.toString() === filteredUsers
                                : true)
                          )
                          .sort((a, b) =>
                            new Date(a.startDate).getTime() >
                            new Date(b.startDate).getTime()
                              ? 1
                              : -1
                          )
                          .map((task) => (
                            <UserActiveTaskRow
                              key={task._id}
                              task={task}
                              newTaskId={newTaskId}
                              notification={notification}
                              setPercentCompleteChanged={
                                setPercentCompleteChanged
                              }
                              searchedTasks={searchedTasks}
                              taskDep={taskDep}
                              percentChangeButtonsRef={percentChangeButtonsRef}
                              taskDetail={false}
                              isTabletResolution={isTabletResolution}
                              isMobileResolution={isMobileResolution}
                              project={project}
                              user={user}
                            />
                          ))
                  }
                </Table.Body>
              </Table.Root>
            )}
          </div>
        )}

        {/* {!project?.msProjectGUID && (
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
                            <Flex direction="column">
                              Estimated duration (days)
                              <small>(with assigned resource)</small>
                            </Flex>
                          </Table.ColumnHeaderCell>
                        )}
                      </>
                    )}
                    {!isMobileResolution && (
                      <Table.ColumnHeaderCell>
                        Finish date
                      </Table.ColumnHeaderCell>
                    )}
                    <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{otherUsersTableRows}</Table.Body>
              </Table.Root>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}
