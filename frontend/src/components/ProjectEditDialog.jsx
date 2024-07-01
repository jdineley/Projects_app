import { useState, useEffect } from "react";

import { Dialog, Button, Flex, TextField, Text } from "@radix-ui/themes";

// icons
import { CiTrash } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";

import { isBefore, isEqual } from "date-fns";

const ProjectTitleEditDialog = ({
  projectTitle,
  setProjectTitle,
  projectStart,
  setProjectStart,
  projectEnd,
  setProjectEnd,
  project,
  projectReviews,
  setProjectReviews,
  editProjectButton,
  // deleteProjectButton,
  archiveProjectButton,
  submit,
}) => {
  const [open, setOpen] = useState(false);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);
  const [dateSelectionErrors, setDateSelectionErrors] = useState([]);

  let saving = false;
  // let deleting = false;
  let archiving = false;

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
              submit(editProjectButton);
              setOpen(false);
            }
          }
          // else if (deleting) {
          //   if (window.confirm("Are you sure you want to delete?")) {
          //     submit(deleteProjectButton);
          //     setOpen(false);
          //   }
          // }
          else if (archiving) {
            if (window.confirm("Are you sure you want to archive?")) {
              submit(archiveProjectButton);
              setOpen(false);
            }
          } else {
            if (window.confirm("Are you sure you want to cancel?")) {
              setOpen(false);
            }
          }
        } else {
          setProjectTitle(project.title);
          setProjectReviews(project.reviews);
          setProjectStart(new Date(project.start).toISOString().split("T")[0]);
          setProjectEnd(new Date(project.end).toISOString().split("T")[0]);
          setOpen(true);
        }
      }}
    >
      <Dialog.Trigger>
        {/* <a href="#">Edit</a> */}
        <FaEdit className="cursor-pointer text-blue-600" />
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Edit Project</Dialog.Title>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project title
            </Text>
            <TextField.Input
              name="title"
              // defaultValue={projectTitle}
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
              // defaultValue={projectStart}
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
              // defaultValue={projectEnd}
              value={projectEnd}
              onChange={(e) => {
                setProjectEnd(e.target.value);
              }}
            />
          </label>
          {projectReviews.map((review, i, arr) => (
            <div key={review._id} className="review-form">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Review Title
                </Text>
                <TextField.Input
                  name="title"
                  defaultValue={review.title}
                  onChange={(e) => {
                    setProjectReviews((prev) => {
                      return prev.map((rev, index) => {
                        if (i === index) {
                          return { ...rev, title: e.target.value };
                        } else {
                          return rev;
                        }
                      });
                    });
                  }}
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Review date
                </Text>
                <input
                  type="date"
                  defaultValue={
                    review.date &&
                    new Date(review.date).toISOString().split("T")[0]
                    // format(new Date(review.date), "MM/dd/yyyy")
                  }
                  onChange={(e) => {
                    setProjectReviews((prev) => {
                      return prev.map((rev, index) => {
                        if (i === index) {
                          return { ...rev, date: e.target.value };
                        } else {
                          return rev;
                        }
                      });
                    });
                  }}
                />
              </label>
              <button
                className="review-trash"
                onClick={() => {
                  const filteredReviews = arr.filter((rev) => {
                    return rev._id !== review._id;
                  });
                  setProjectReviews(filteredReviews);
                  // ** Delete review and children from the db?
                }}
              >
                <CiTrash size="20px" />
              </button>
            </div>
          ))}
        </Flex>
        <Button
          onClick={() => {
            setProjectReviews([
              ...projectReviews,
              {
                title: "",
                date: "",
              },
            ]);
          }}
        >
          Add Review
        </Button>
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
            {formFieldsCompleted && dateSelectionErrors.length === 0 && (
              <Button
                onClick={() => {
                  saving = true;
                  // submit(editProjectButton);
                }}
              >
                Save
              </Button>
            )}
          </Dialog.Close>
          <Dialog.Close>
            <Button
              color="tomato"
              onClick={() => {
                // deleting = true;
                archiving = true;
                // console.log("clicked");
                // submit(deleteProjectButton);
              }}
            >
              {/* Delete Project */}
              Archive Project
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ProjectTitleEditDialog;
