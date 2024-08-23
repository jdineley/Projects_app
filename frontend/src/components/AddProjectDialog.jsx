import { useState, useEffect } from "react";
import { useRevalidator } from "react-router-dom";

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
import { TiVendorMicrosoft } from "react-icons/ti";

import { isBefore, isEqual, isWithinInterval } from "date-fns";

import { toast } from "react-toastify";

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
  user,
}) => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const [open, setOpen] = useState(false);
  const [numberOfReviews, setNumberOfReviews] = useState([]);
  const [dateSelectionErrors, setDateSelectionErrors] = useState([]);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);

  let revalidator = useRevalidator();

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
    if (projectReviews.length > 0) {
      projectReviews.forEach((rev) => {
        if (
          rev.date &&
          !isWithinInterval(new Date(rev.date), {
            start: new Date(projectStart),
            end: new Date(projectEnd),
          })
        ) {
          localDateSelectionErrors.push(
            "review dates must between project start and end"
          );
        }
      });
    }
    setDateSelectionErrors(localDateSelectionErrors);

    const errorTracker = [projectTitle, projectStart, projectEnd].filter(
      (entry) => {
        if (entry) return entry;
      }
    );
    if (errorTracker.length === 3) setFormFieldsCompleted(true);
    else setFormFieldsCompleted(false);
  }, [projectEnd, projectStart, projectTitle, projectReviews]);

  function submitMsProject(e) {
    e.preventDefault();
    if (
      window.confirm("Are you sure you want to submit a MS Project .xml file?")
    ) {
      let file = e.target.uploadFile.files[0];
      let formData = new FormData();
      formData.append("file", file);
      fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.errors) {
            alert(data.errors);
          } else {
            console.log(data);
            setOpen(false);
            toast(`${data.Project.Title[0]} imported from MS Project`);
            revalidator.revalidate();
          }
        });
    }
  }

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
        <Flex gap="3" mt="4" mb="4" justify="end">
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
        <hr className="mb-5" />
        <Flex align="center" gap="2" mb="4">
          <TiVendorMicrosoft />
          <Dialog.Title mb="0">Add new MS Project</Dialog.Title>
        </Flex>
        <form onSubmit={submitMsProject} method="post" encType="multipart/form">
          <Text as="div" size="2" mb="1" weight="bold">
            Import .xml file from MS Project Desktop
          </Text>
          <input
            type="file"
            name="uploadFile"
            accept=".xml"
            id="xml-file"
            required
          />
          <Button mt="2">Upload</Button>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AddProjectDialog;
