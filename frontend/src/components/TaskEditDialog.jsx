import { useRef, useState, useEffect } from "react";
import { useFetcher, Form, useSubmit } from "react-router-dom";
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";

import { isPast, isToday } from "date-fns";

// icons
import { MdOutlinePostAdd } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const TaskEditDialog = ({ task, searchedTasks, taskDep, taskDetail }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskSearchActive, setTaskSearchActive] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState([]);
  const [daysToCompleteTask, setDaysToCompleteTask] = useState(null);
  const [open, setOpen] = useState(false);

  const [selectionErrors, setSelectionErrors] = useState([]);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);

  const fetcher = useFetcher();
  const editTaskRef = useRef(null);
  const searchTaskButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const submit = useSubmit();

  let saving = false;
  let deleting = false;

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

    setSelectionErrors(userInputErrorMessages);

    const errorTracker = [
      newTaskTitle,
      newTaskDescription,
      newTaskDeadline,
      daysToCompleteTask,
    ].filter((entry) => {
      if (entry) return entry;
    });
    if (errorTracker.length === 4) setFormFieldsCompleted(true);
    else setFormFieldsCompleted(false);
  }, [newTaskDeadline, daysToCompleteTask, newTaskDescription, newTaskTitle]);

  return (
    <>
      <fetcher.Form method="POST" style={{ display: "none" }}>
        <input type="hidden" name="title" value={newTaskTitle} />
        <input type="hidden" name="description" value={newTaskDescription} />
        <input type="hidden" name="deadline" value={newTaskDeadline} />
        <input type="hidden" name="daysToComplete" value={daysToCompleteTask} />
        <input type="hidden" name="taskId" value={task._id} />
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
        <button
          id={task._id}
          ref={editTaskRef}
          type="submit"
          name="intent"
          value="edit-task"
        ></button>
      </fetcher.Form>
      <Form style={{ display: "none" }}>
        <input type="hidden" name="taskDep" value={taskSearch} />

        <button ref={searchTaskButtonRef}></button>
      </Form>
      <fetcher.Form method="POST" style={{ display: "none" }}>
        <input type="hidden" name="taskId" value={task._id} />
        <input type="hidden" name="taskDetail" value={taskDetail} />
        <button
          id="delete-project-button"
          type="submit"
          name="intent"
          value="delete-task"
          ref={deleteButtonRef}
        ></button>
      </fetcher.Form>
      <Dialog.Root
        open={open}
        onOpenChange={() => {
          if (open) {
            if (saving) {
              if (window.confirm("Are you sure you want to save?")) {
                submit(editTaskRef.current);
                setNewTaskTitle("");
                setNewTaskDescription("");
                setNewTaskDeadline("");
                setDaysToCompleteTask(null);
                setTaskSearch("");
                setSelectedDependencies([]);
                setTaskSearchActive(false);
                setOpen(false);
              }
            } else if (deleting) {
              if (window.confirm("Are you sure you want to delete?")) {
                submit(deleteButtonRef.current);
                setOpen(false);
              }
            } else {
              if (window.confirm("Are you sure you want to cancel?")) {
                setNewTaskTitle("");
                setNewTaskDescription("");
                setNewTaskDeadline("");
                setDaysToCompleteTask(null);
                setTaskSearch("");
                setSelectedDependencies([]);
                setTaskSearchActive(false);
                setOpen(false);
              }
            }
          } else {
            setNewTaskTitle(task.title);
            setNewTaskDescription(task.description);
            setNewTaskDeadline(
              new Date(task.deadline).toISOString().split("T")[0]
            );
            setDaysToCompleteTask(task.daysToComplete);
            setTaskSearch(taskDep);
            setSelectedDependencies(task.dependencies);
            setOpen(true);
          }
        }}
      >
        <Dialog.Trigger
          onClick={() => {
            console.log("in edit task dialog..");
          }}
        >
          {/* {taskDetail ? (
            <FaEdit className="cursor-pointer text-blue-600" />
          ) : (
            <p className="cursor-pointer text-blue-600">Edit task</p>
          )} */}
          <FaEdit className="cursor-pointer text-blue-600" />
        </Dialog.Trigger>

        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit task</Dialog.Title>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Title
              </Text>
              <TextField.Input
                defaultValue={task.title}
                placeholder="Enter new title"
                onChange={(e) => {
                  setNewTaskTitle(e.target.value);
                }}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Description
              </Text>
              <TextField.Input
                defaultValue={task.description}
                placeholder="Enter new description"
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
                onChange={(e) => {
                  setDaysToCompleteTask(e.target.value);
                }}
              />
            </label>
            {!task.msProjectGUID && (
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
                                arr.findIndex(
                                  (item) => item._id === dep._id
                                ) === i
                            )
                          );
                        }}
                      >
                        {task.title}
                      </p>
                    ))}
                </div>
              </label>
            )}
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
            {!task.msProjectGUID && (
              <Dialog.Close>
                <Button
                  color="tomato"
                  onClick={() => {
                    deleting = true;
                  }}
                >
                  Delete Task
                </Button>
              </Dialog.Close>
            )}
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

export default TaskEditDialog;
