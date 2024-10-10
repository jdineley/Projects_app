import { Link } from "react-router-dom";

import { Table, Badge, Grid, Flex } from "@radix-ui/themes";

// util
import { goBackToStartOfArrayIndex, isTaskAtRisk } from "../../utility";

// components
import UserProjectDashSummary from "../UserProjectDashSummary";

// hooks
import useMatchMedia from "../../hooks/useMatchMedia";

// constants
import { tabletScreenWidth } from "../../utility";

// icons
import { TiVendorMicrosoft } from "react-icons/ti";

export default function HomeDefeatured({ userObj }) {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);

  // const userObj = useLoaderData();
  console.dir(userObj);
  if (!userObj || userObj.error) return null;
  const themeColors = ["brown", "tomato", "purple", "blue", "green", "sky"];

  let activeProjects;
  let currentUserProjectTasks;
  let currentUserProjectRow;
  let riskOrderedTasks;
  let taskRiskRow;
  let hasSomeUnArchivedProjects;
  if (!userObj.error) {
    activeProjects = [...userObj.projects, ...userObj.userInProjects].filter(
      (proj) => !proj.archived
    );

    currentUserProjectTasks = activeProjects.reduce((acc, cur) => {
      const activeTasks = cur.tasks.filter(
        (task) =>
          !task.archived && task.user.toString() === userObj._id.toString()
      );
      const incompleteTasks =
        activeTasks.filter((actTask) => !actTask.completed) || [];
      const completeTasks =
        activeTasks.filter((actTask) => actTask.completed) || [];
      let newObj = {
        projectId: cur._id,
        projectTitle: cur.title,
        msProjectGUID: cur.msProjectGUID || null,
        incompleteTasks: incompleteTasks.length,
        completeTasks: completeTasks.length,
      };
      acc.push(newObj);
      return acc;
    }, []);

    currentUserProjectRow = currentUserProjectTasks.map((proj) => {
      return (
        <Table.Row key={proj.projectId}>
          <Table.Cell>
            <Link
              to={`/projects/${proj.projectId}`}
              className="pointer-events-none"
            >
              <Flex align="center" gap="2">
                {proj?.msProjectGUID && <TiVendorMicrosoft />}
                {proj.projectTitle}
              </Flex>
            </Link>
          </Table.Cell>
          <Table.Cell>{proj.incompleteTasks}</Table.Cell>
          <Table.Cell>{proj.completeTasks}</Table.Cell>
        </Table.Row>
      );
    });

    riskOrderedTasks = userObj.tasks
      .filter((task) => !task.archived && task)
      .sort((a, b) => isTaskAtRisk(b) - isTaskAtRisk(a))
      .slice(0, 5);

    taskRiskRow = riskOrderedTasks.map((task) => {
      return (
        <Table.Row key={task._id}>
          <Table.Cell>
            <Link
              to={`/projects/${task.project?._id}/tasks/${task._id}`}
              className="pointer-events-none"
            >
              {task.title.slice(0, 15)}...
            </Link>
          </Table.Cell>
          <Table.Cell>
            {isTaskAtRisk(task) > 1 ? (
              <>
                <Badge color="tomato" variant="solid">
                  At risk
                </Badge>{" "}
                <small>
                  ({Math.floor(isTaskAtRisk(task) * 100)}
                  {"%"})
                </small>
              </>
            ) : (
              Math.floor(isTaskAtRisk(task) * 100)
            )}
          </Table.Cell>
        </Table.Row>
      );
    });

    hasSomeUnArchivedProjects =
      userObj.projects.filter((project) => !project.archived).length > 0;
  } else return null;

  return (
    <main>
      {/* <h1 className="mb-4">Dashboard</h1> */}
      <Grid columns={isTabletResolution ? "1" : "2"} gap="3" width="auto">
        {hasSomeUnArchivedProjects && (
          <div>
            <h2>Project Management</h2>
            <div id="proj-sum-cards-collector">
              {userObj.projects.map((project, i) => {
                if (!project.archived) {
                  return (
                    <UserProjectDashSummary
                      key={project._id}
                      project={project}
                      accentColor={
                        themeColors[goBackToStartOfArrayIndex(themeColors, i)]
                      }
                      defeatured={true}
                    />
                  );
                }
              })}
            </div>
          </div>
        )}
        <div>
          {currentUserProjectTasks?.length > 0 && (
            <>
              <h2>Task Management</h2>
              <h3>All my tasks</h3>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      Num Active Tasks
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      Num Completed Tasks
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{currentUserProjectRow}</Table.Body>
              </Table.Root>
              {riskOrderedTasks.length > 0 && (
                <>
                  <h3 style={{ marginTop: "10px" }}>My most at risk tasks</h3>
                  <Table.Root variant="surface">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Task</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          Task time to available time %
                        </Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>{taskRiskRow}</Table.Body>
                  </Table.Root>
                </>
              )}
            </>
          )}
        </div>
      </Grid>
    </main>
  );
}
