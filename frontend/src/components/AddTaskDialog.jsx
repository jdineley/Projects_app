import { useState, useRef, useEffect } from "react";
import { useFetcher, useSubmit, Form } from "react-router-dom";

// components
import DynamicSearchParamFormInputs from "./DynamicSearchParamFormInputs";

import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
} from "@radix-ui/themes";

import { MdOutlinePostAdd } from "react-icons/md";

import { isPast, isToday, isWithinInterval } from "date-fns";

export const AddTaskDialog = ({
  userTask,
  searchedTasks,
  searchedUsers,
  taskDep,
  assignUser,
  project,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [assignee, setAssignee] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [userSearchActive, setUserSearchActive] = useState(false);

  const [taskSearch, setTaskSearch] = useState("");
  const [taskSearchActive, setTaskSearchActive] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState([]);
  const [daysToCompleteTask, setDaysToCompleteTask] = useState(null);
  const [open, setOpen] = useState();

  const submit = useSubmit();
  const fetcher = useFetcher();
  const createTaskButtonRef = useRef(null);
  const searchTaskButtonRef = useRef(null);
  const searchUserButtonRef = useRef(null);

  // console.log(taskSearch);

  let saving = false;

  const [selectionErrors, setSelectionErrors] = useState([]);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);

  useEffect(() => {
    let userInputErrorMessages = [];

    if (
      newTaskDeadline &&
      (isPast(new Date(newTaskDeadline)) || isToday(new Date(newTaskDeadline)))
    ) {
      userInputErrorMessages.push("task completion date must be in the future");
    }

    if (daysToCompleteTask === "0") {
      userInputErrorMessages.push(
        "Days to complete task must be greater than 0"
      );
    }

    if (
      newTaskDeadline &&
      !isWithinInterval(new Date(newTaskDeadline), {
        start: new Date(project.start),
        end: new Date(project.end),
      })
    ) {
      userInputErrorMessages.push(
        "Task deadline must fall within the project timescale"
      );
    }

    setSelectionErrors(userInputErrorMessages);

    const criticalInputArray = userTask
      ? [newTaskTitle, newTaskDescription, newTaskDeadline, daysToCompleteTask]
      : [
          newTaskTitle,
          newTaskDescription,
          newTaskDeadline,
          daysToCompleteTask,
          assignee,
        ];
    const errorTracker = criticalInputArray.filter((entry) => {
      if (entry) return entry;
    });
    if (errorTracker.length === 4 && userTask) {
      setFormFieldsCompleted(true);
    } else if (errorTracker.length === 5 && !userTask) {
      setFormFieldsCompleted(true);
    } else setFormFieldsCompleted(false);
  }, [
    newTaskDeadline,
    daysToCompleteTask,
    newTaskDescription,
    newTaskTitle,
    assignee,
    userTask,
  ]);

  return (
    <>
      <fetcher.Form method="POST" style={{ display: "none" }}>
        <input type="hidden" name="title" value={newTaskTitle} />
        <input type="hidden" name="description" value={newTaskDescription} />
        <input type="hidden" name="deadline" value={newTaskDeadline} />
        <input type="hidden" name="daysToComplete" value={daysToCompleteTask} />
        <input type="hidden" name="projectId" value={project?._id} />
        {assignee._id && (
          <input type="hidden" name="assigneeId" value={assignee._id} />
        )}
        {selectedDependencies.map((dep, i) => {
          return (
            <input
              key={dep._id}
              type="hidden"
              name={`selectedDependency${i}`}
              value={dep._id}
            />
          );
        })}
        <button type="submit" name="intent" ref={createTaskButtonRef}></button>
      </fetcher.Form>
      <Form style={{ display: "none" }}>
        <DynamicSearchParamFormInputs searchParamKey="taskDep" />
        <input type="hidden" name="taskDep" value={taskSearch} />

        <button ref={searchTaskButtonRef}></button>
      </Form>
      {!userTask && (
        <Form style={{ display: "none" }}>
          <DynamicSearchParamFormInputs searchParamKey="assignUser" />
          <input type="hidden" name="assignUser" value={userSearch} />

          <button ref={searchUserButtonRef}></button>
        </Form>
      )}
      <Dialog.Root
        id="dialog-root"
        open={open}
        onOpenChange={() => {
          if (open) {
            if (saving) {
              if (window.confirm("Are you sure you want to save?")) {
                createTaskButtonRef.current.setAttribute(
                  "value",
                  "create-task"
                );
                submit(createTaskButtonRef.current);
                setSelectionErrors([]);
                setNewTaskTitle("");
                setNewTaskDescription("");
                setNewTaskDeadline("");
                setDaysToCompleteTask(null);
                setUserSearch("");
                setTaskSearch("");
                setSelectedDependencies([]);
                setOpen(false);
              }
            } else {
              if (window.confirm("Are you sure you want to cancel?")) {
                setSelectionErrors([]);
                setNewTaskTitle("");
                setNewTaskDescription("");
                setNewTaskDeadline("");
                setDaysToCompleteTask(null);
                setUserSearch("");
                setTaskSearch("");
                setSelectedDependencies([]);
                setOpen(false);
              }
            }
          } else {
            setTaskSearch(taskDep);
            setUserSearch(assignUser);
            // setSelectionErrors([]);
            // setNewTaskTitle("");
            // setNewTaskDescription("");
            // setNewTaskDeadline("");
            // setDaysToCompleteTask(null);
            // setUserSearch("");
            // setTaskSearch("");
            setOpen(true);
          }
        }}
      >
        <Dialog.Trigger>
          <a href="#">
            <MdOutlinePostAdd />
          </a>
        </Dialog.Trigger>

        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Create new task</Dialog.Title>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Title
              </Text>
              <TextField.Input
                placeholder="Enter new title"
                value={newTaskTitle}
                onChange={(e) => {
                  setNewTaskTitle(e.target.value);
                }}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Description
              </Text>
              <TextArea
                size="3"
                placeholder="Enter new description"
                value={newTaskDescription}
                onChange={(e) => {
                  setNewTaskDescription(e.target.value);
                }}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Completion date
              </Text>
              <input
                type="date"
                value={newTaskDeadline}
                onChange={(e) => {
                  setNewTaskDeadline(e.target.value);
                }}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Number of days to complete task
              </Text>
              <input
                type="number"
                min="0"
                value={daysToCompleteTask}
                placeholder="Enter approximate number of days"
                onChange={(e) => {
                  setDaysToCompleteTask(e.target.value);
                }}
              />
            </label>
            {!userTask && (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Assign User
                  <small
                    style={{
                      display: "flex",
                      fontSize: "0.7rem",
                      justifyContent: "end",
                    }}
                  >
                    <button
                      onClick={() => {
                        submit(searchUserButtonRef.current);
                        setUserSearchActive(true);
                      }}
                    >
                      Find users
                    </button>
                  </small>
                </Text>
                <TextField.Input
                  placeholder="User email search.."
                  id="search-user"
                  defaultValue={assignUser}
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserSearchActive(false);
                  }}
                />

                {assignee.email && (
                  <div id="selectedUser" onClick={() => setAssignee("")}>
                    {assignee.email}
                  </div>
                )}
                {userSearchActive &&
                  searchedUsers?.map((user) => (
                    <p
                      key={user._id}
                      id={user._id}
                      onClick={() => setAssignee(user)}
                    >
                      {user.email}
                    </p>
                  ))}
              </label>
            )}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Assign tasks that are parent dependencies
                <small
                  style={{
                    display: "flex",
                    fontSize: "0.7rem",
                    justifyContent: "end",
                  }}
                >
                  <button
                    onClick={() => {
                      submit(searchTaskButtonRef.current);
                      setTaskSearchActive(true);
                    }}
                  >
                    Search prerequisite tasks
                  </button>
                </small>
              </Text>
              <TextField.Input
                placeholder="Task title search.."
                id="search-task"
                value={taskSearch}
                onChange={(e) => {
                  setTaskSearch(e.target.value);
                  setTaskSearchActive(false);
                }}
                defaultValue={taskDep}
              />

              {selectedDependencies.length > 0 && (
                <div id="selected-dependencies">
                  {selectedDependencies.map((dep) => (
                    <div
                      key={dep._id}
                      onClick={(e) => {
                        setSelectedDependencies(
                          selectedDependencies.filter((dep) => {
                            return dep.title !== e.target.textContent;
                          })
                        );
                      }}
                    >
                      {dep.title}
                    </div>
                  ))}
                </div>
              )}
              <div>
                {taskSearchActive &&
                  searchedTasks?.map((task) => (
                    <p
                      key={task._id}
                      id={task._id}
                      onClick={() => {
                        setSelectedDependencies(
                          [...selectedDependencies, task].filter(
                            (dep, i, arr) =>
                              arr.findIndex((item) => item._id === dep._id) ===
                              i
                          )
                        );
                      }}
                    >
                      {task.title}
                    </p>
                  ))}
              </div>
            </label>
          </Flex>
          {selectionErrors.map((msg, i) => {
            return (
              <Text key={i} as="p" color="tomato">
                {msg}
              </Text>
            );
          })}
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              {selectionErrors.length === 0 && formFieldsCompleted && (
                <Button
                  onClick={() => {
                    saving = true;
                  }}
                >
                  Save
                </Button>
              )}
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default AddTaskDialog;
