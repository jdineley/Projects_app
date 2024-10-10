import { Link, useNavigate, useFetcher, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// components
import TaskEditDialog from "../components/TaskEditDialog";

// radix
import { Table, Badge, Flex, Text } from "@radix-ui/themes";

// date-fns
import { format, differenceInBusinessDays } from "date-fns";

// utility
import { isTaskAtRisk } from "../utility";

// icon
// import { FaEdit } from "react-icons/fa";

const UserActiveTaskRow = ({
  task,
  newTaskId,
  notification,
  setPercentCompleteChanged,
  searchedTasks,
  taskDep,
  percentChangeButtonsRef,
  taskDetail,
  isTabletResolution,
  isMobileResolution,
  project,
  user,
  learning,
}) => {
  console.log(task);
  const [percentCompleteInState, setPercentCompleteInState] = useState(
    task.percentageComplete
  );
  const [isSettingPercentComplete, setIsSettingPercentComplete] =
    useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetcher = useFetcher();

  const percentRef = useRef(null);

  const currentPathNoQuery = location.pathname.split("?")[0];

  useEffect(() => {
    // if (task._id === newTaskId && notification) {
    //   setTimeout(() => {
    //     navigate(currentPathNoQuery);
    //   }, 1000);
    // }

    setIsSettingPercentComplete(true);

    setPercentCompleteInState(task.percentageComplete);
  }, [task]);
  // [task, task._id, newTaskId, notification, navigate, currentPathNoQuery]);

  return (
    <Table.Row
      key={task._id}
      id={task._id === newTaskId && notification ? newTaskId : ""}
      className={
        task._id === newTaskId && notification ? "new-task-notification" : ""
      }
    >
      {!taskDetail && (
        <>
          <Table.Cell>
            <Link
              to={`tasks/${task._id}`}
              className={`${learning && "pointer-events-none"}`}
            >
              {task.title}
            </Link>
          </Table.Cell>
          {!isTabletResolution && (
            <Table.Cell>{task.description.slice(0, 40)}...</Table.Cell>
          )}
        </>
      )}
      {!task.archived && (
        <>
          <Table.Cell id="task-complete-column">
            {isTabletResolution && !taskDetail ? (
              `${task.percentageComplete}%`
            ) : (
              <>
                <h5>Percent complete:</h5>
                <fetcher.Form method="POST" id="percent-slider">
                  <input
                    type="range"
                    name="percentageComplete"
                    min="0"
                    max={
                      task.dependencies.length === 0 ||
                      !task.dependencies.some(
                        (dep) => dep.percentageComplete !== 100
                      )
                        ? "100"
                        : "95"
                    }
                    // max="100"
                    step="5"
                    value={percentCompleteInState}
                    onChange={(e) => {
                      if (!taskDetail) {
                        percentChangeButtonsRef.current.push(
                          percentRef.current
                        );
                      }
                      setIsSettingPercentComplete(false);
                      setPercentCompleteInState(e.target.value);
                      setPercentCompleteChanged(true);
                    }}
                    disabled={user?._id !== task.user._id}
                  />
                  <input type="hidden" name="editPercent" value="true" />
                  <input type="hidden" name="taskId" value={task._id} />
                  <input
                    type="hidden"
                    name="completed"
                    value={
                      percentCompleteInState === "100" &&
                      (task.dependencies.length === 0 ||
                        !task.dependencies.some(
                          (dep) => dep.percentageComplete !== 100
                        ))
                        ? true
                        : false
                    }
                  />
                  <button
                    className={`${learning && "pointer-events-none"}`}
                    disabled={!isSettingPercentComplete ? false : true}
                    name="intent"
                    id={task._id}
                    ref={percentRef}
                    value="edit-task"
                    style={{
                      display: taskDetail ? "block" : "none",
                      padding: "2px",
                      marginBottom: "5px",
                    }}
                  >
                    save
                  </button>
                  <div
                    className={`percent-complete-commit ${
                      isSettingPercentComplete ? "" : "save-new-percent"
                    }  `}
                  ></div>
                </fetcher.Form>

                <div className="numerical-percent-complete">
                  {/* {isSettingPercentComplete
            ? task.percentageComplete
            : percentCompleteInState} */}
                  {percentCompleteInState}
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
                  <h5>Task predecessors:</h5>
                  {task.dependencies?.length > 0 ? (
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
                        <Link to={`/projects/${dep.project}/tasks/${dep._id}`}>
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
          {taskDetail && !isMobileResolution && (
            <Table.Cell>{task.daysToComplete}</Table.Cell>
            // <Table.Cell>
            //   {differenceInBusinessDays(
            //     new Date(task.deadline),
            //     new Date(task.startDate)
            //   )}
            // </Table.Cell>
          )}
          {!taskDetail && !isTabletResolution && (
            <Table.Cell>{task.daysToComplete}</Table.Cell>
            // <Table.Cell>
            //   {differenceInBusinessDays(
            //     new Date(task.deadline),
            //     new Date(task.startDate)
            //   )}
            // </Table.Cell>
          )}
        </>
      )}
      {!isMobileResolution && (
        <>
          <Table.Cell>
            {task.startDate
              ? format(new Date(task.startDate), "dd/MM/yyyy")
              : null}
          </Table.Cell>

          {/* {task.msProjectGUID && (
            <Table.Cell>
              {format(new Date(task.startDate), "dd/MM/yyyy")}
            </Table.Cell>
          )} */}
          <Table.Cell>
            {format(new Date(task.deadline), "dd/MM/yyyy")}
          </Table.Cell>
          <Table.Cell>
            <Flex direction="column">
              <b>{task.user.email.split("@")[0]}</b>
              {task.secondaryUsers.map((u) => (
                <Text key={u._id}>{u.email.split("@")[0]}</Text>
              ))}
            </Flex>
          </Table.Cell>
        </>
      )}
      {!taskDetail && !task.archived && (
        <Table.Cell>
          {user?._id === task.user._id && (
            <TaskEditDialog
              task={task}
              searchedTasks={searchedTasks}
              taskDep={taskDep}
              taskDetail={taskDetail}
              learning={learning}
            />
          )}
        </Table.Cell>
      )}
    </Table.Row>
  );
};

export default UserActiveTaskRow;
