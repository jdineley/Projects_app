import { useState, useRef } from "react";

// components
// import AddTaskDialog from "../components/AddTaskDialog";
import UserActiveTaskRow from "../UserActiveTaskRow";
import ProjectTimeline from "../ProjectTimeline";
import ProjectEditDialog_defeatured from "./ProjectEditDialog_defeatured";
import { AddTaskDialog_defeatured } from "./AddTaskDialog_defeatured";

// icons
import { TiVendorMicrosoft } from "react-icons/ti";

// radix
import {
  Table,
  Button,
  Flex,
  Switch,
  Text,
  Select,
  Strong,
} from "@radix-ui/themes";

//hooks
import useMatchMedia from "../../hooks/useMatchMedia";
// constants
import { mobileScreenWidth, tabletScreenWidth } from "../../utility";

import { isAfter, isBefore } from "date-fns";

export default function ProjectsDetail_Defeatured({
  user,
  project,
  projectTasks,
}) {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);

  const [percentCompleteChanged, setPercentCompleteChanged] = useState(false);

  const [inWorkTasksOnly, setInWorkTasksOnly] = useState(false);
  const [filteredUsers, setFilterUsers] = useState("all-members");

  const percentChangeButtonsRef = useRef([]);

  function handleSubmitAllPercentFetchers() {
    percentChangeButtonsRef.current.forEach((button) => {
      // submit(button);
      percentChangeButtonsRef.current = [];
      setPercentCompleteChanged(false);
    });
  }

  return (
    <div
      className={`projects-detail ${
        !project?.inWork &&
        project?.owner._id !== user._id &&
        "pointer-events-none"
      }`}
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
        {project?.archived && (
          <Flex gap="3">
            <Button
              id="unarchive-project-button"
              type="submit"
              name="intent"
              value="unarchive-project"
              color="yellow"
            >
              Restore Project
            </Button>
            <Button
              id="delete-project-button"
              type="submit"
              name="intent"
              value="delete-project"
              color="tomato"
            >
              Delete Project
            </Button>
          </Flex>
        )}{" "}
        {!project?.archived && (
          <ProjectEditDialog_defeatured project={project} user={user} />
        )}
      </div>
      <div>
        <div>
          <ProjectTimeline
            project={project}
            projectTasks={projectTasks}
            defeatured={true}
          />
          <div className="flex justify-between mt-3">
            <div className="flex gap-3 items-center">
              <h3>Tasks</h3>
              {!project?.msProjectGUID &&
                !project?.archived &&
                (project?.users.includes(user._id) ||
                  project?.owner._id === user._id) && (
                  <AddTaskDialog_defeatured project={project} user={user} />
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
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
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
                              <Select.Item value="all-members">
                                <Strong>All members</Strong>
                              </Select.Item>
                              {project.users.map((u) => (
                                <Select.Item key={u._id} value={u._id}>
                                  <Strong>{u.email}</Strong>
                                </Select.Item>
                              ))}
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
                {!inWorkTasksOnly
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
                          setPercentCompleteChanged={setPercentCompleteChanged}
                          percentChangeButtonsRef={percentChangeButtonsRef}
                          taskDetail={false}
                          isTabletResolution={isTabletResolution}
                          isMobileResolution={isMobileResolution}
                          project={project}
                          user={user}
                          learning={true}
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
                          setPercentCompleteChanged={setPercentCompleteChanged}
                          percentChangeButtonsRef={percentChangeButtonsRef}
                          taskDetail={false}
                          isTabletResolution={isTabletResolution}
                          isMobileResolution={isMobileResolution}
                          project={project}
                          user={user}
                        />
                      ))}
              </Table.Body>
            </Table.Root>
          )}
        </div>
      </div>
    </div>
  );
}
