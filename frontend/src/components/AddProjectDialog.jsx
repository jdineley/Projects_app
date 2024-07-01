import { useState, useEffect } from "react";

import {
  Dialog,
  Button,
  Flex,
  TextField,
  Text,
  Select,
} from "@radix-ui/themes";

// icons
import { MdOutlinePostAdd } from "react-icons/md";

import { isBefore, isEqual } from "date-fns";

const AddProjectDialog = ({
  projectTitle,
  projectStart,
  projectEnd,
  setProjectTitle,
  setProjectStart,
  setProjectEnd,
  setProjectReviews,
  projectReviews,
  button,
  submit,
}) => {
  const [open, setOpen] = useState(false);
  const [numberOfReviews, setNumberOfReviews] = useState([]);
  const [dateSelectionErrors, setDateSelectionErrors] = useState([]);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);

  let saving = false;

  useEffect(() => {
    let localDateSelectionErrors = [];

    if (
      projectStart &&
      projectEnd &&
      isBefore(new Date(projectEnd), new Date(projectStart))
    ) {
      localDateSelectionErrors.push(
        "project end must come after project start"
      );
    }
    if (
      projectEnd &&
      projectStart &&
      isEqual(new Date(projectEnd), new Date(projectStart))
    ) {
      localDateSelectionErrors.push("start and end dates must be different");
    }
    setDateSelectionErrors(localDateSelectionErrors);

    const errorTracker = [projectTitle, projectStart, projectEnd].filter(
      (entry) => {
        if (entry) return entry;
      }
    );
    if (errorTracker.length === 3) setFormFieldsCompleted(true);
    else setFormFieldsCompleted(false);
  }, [projectEnd, projectStart, projectTitle]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={() => {
        if (open) {
          if (saving) {
            if (window.confirm("Are you sure you want to save?")) {
              submit(button);
              setOpen(false);
            }
          } else {
            if (window.confirm("Are you sure you want to cancel?")) {
              setOpen(false);
            }
          }
        } else {
          setProjectTitle("");
          setProjectStart("");
          setProjectEnd("");
          setNumberOfReviews([]);
          setProjectReviews([]);
          setOpen(true);
        }
      }}
    >
      <Dialog.Trigger>
        <MdOutlinePostAdd
          // title="Add new project"
          className="cursor-pointer text-blue-600"
        />
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Add new Project</Dialog.Title>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project title
            </Text>
            <TextField.Input
              name="title"
              value={projectTitle}
              onChange={(e) => {
                setProjectTitle(e.target.value);
              }}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project start date
            </Text>
            <input
              type="date"
              value={projectStart}
              onChange={(e) => {
                setProjectStart(e.target.value);
              }}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project end date
            </Text>
            <input
              type="date"
              value={projectEnd}
              onChange={(e) => {
                setProjectEnd(e.target.value);
              }}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Select number of project reviews
            </Text>
            <Select.Root
              // defaultValue="0"
              value={numberOfReviews.length}
              onValueChange={(v) => {
                setNumberOfReviews(() => {
                  let ar = [];
                  for (let i = 0; i < v; i++) {
                    ar.push(i);
                  }
                  return ar;
                });
              }}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Number of reviews</Select.Label>
                  <Select.Item value="0">0</Select.Item>
                  <Select.Item value="1">1</Select.Item>
                  <Select.Item value="2">2</Select.Item>
                  <Select.Item value="3">3</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </label>
          {numberOfReviews.map((el) => (
            <div key={el} className="review-form">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Review Title
                </Text>
                <TextField.Input
                  name="title"
                  value={projectReviews[el]?.title}
                  onChange={(e) => {
                    // console.log("here", projectReviews.length);
                    if (!projectReviews[el]) {
                      setProjectReviews((prev) => {
                        const newReviews = [...prev];
                        newReviews[el] = { title: e.target.value };
                        return newReviews;
                      });
                    } else {
                      const newProjectReviews = projectReviews.map(
                        (review, i) => {
                          if (el === i) {
                            review.title = e.target.value;
                            return review;
                          } else return review;
                        }
                      );
                      setProjectReviews(newProjectReviews);
                    }
                  }}
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Review date
                </Text>
                <input
                  type="date"
                  value={projectReviews[el]?.date}
                  onChange={(e) => {
                    // console.log("here", projectReviews.length);
                    if (!projectReviews[el]) {
                      setProjectReviews((prev) => {
                        const newReviews = [...prev];
                        newReviews[el] = { date: e.target.value };
                        return newReviews;
                      });
                    } else {
                      const newProjectReviews = projectReviews.map(
                        (review, i) => {
                          if (el === i) {
                            review.date = e.target.value;
                            return review;
                          } else return review;
                        }
                      );
                      setProjectReviews(newProjectReviews);
                    }
                  }}
                />
              </label>
            </div>
          ))}
        </Flex>
        {dateSelectionErrors.map((msg, i) => {
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
            {dateSelectionErrors.length === 0 && formFieldsCompleted && (
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
  );
};

export default AddProjectDialog;
