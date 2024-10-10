import { useState, useEffect } from "react";
import { useRevalidator } from "react-router-dom";
// import xml2js from "xml2js";

import { submitMsProject, msProjectGuidance } from "../utility";

import {
  Dialog,
  Button,
  Flex,
  TextField,
  Text,
  Select,
  HoverCard,
  Box,
  Heading,
} from "@radix-ui/themes";

// icons
import { MdOutlinePostAdd } from "react-icons/md";
import { TiVendorMicrosoft } from "react-icons/ti";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RxCheckCircled } from "react-icons/rx";
import { RxCrossCircled } from "react-icons/rx";
import { RxCircle } from "react-icons/rx";

import { isBefore, isEqual, isWithinInterval } from "date-fns";

// import { toast } from "react-toastify";

// import { PiSpinnerGap } from "react-icons/pi";

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
  // const { VITE_REACT_APP_API_URL } = import.meta.env;
  const [open, setOpen] = useState(false);
  const [numberOfReviews, setNumberOfReviews] = useState([]);
  const [dateSelectionErrors, setDateSelectionErrors] = useState([]);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validEmailError, setValidEmailError] = useState("");
  const [validEmailCheck, setValidEmailCheck] = useState(false);
  const [summaryPredecessorError, setSummaryPredecessorError] = useState("");
  const [summaryPredecessorCheck, setSummaryPredecessorCheck] = useState(false);
  const [workTasksResourceError, setWorkTasksResourceError] = useState("");
  const [workTaskResourceCheck, setWorkTaskResourceCheck] = useState(false);

  const uploadError =
    validEmailError || summaryPredecessorError || workTasksResourceError;

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

  return (
    <Dialog.Root
      open={open}
      onOpenChange={() => {
        if (loading) return;
        if (open) {
          if (saving) {
            if (window.confirm("Are you sure you want to save?")) {
              submit(button);
              setOpen(false);
            }
          } else {
            if (window.confirm("Are you sure you want to cancel?")) {
              setValidEmailError("");
              setValidEmailCheck(false);
              setSummaryPredecessorError("");
              setSummaryPredecessorCheck(false);
              setWorkTasksResourceError("");
              setWorkTaskResourceCheck(false);
              setOpen(false);
            }
          }
        } else {
          setProjectTitle("");
          setProjectStart("");
          setProjectEnd("");
          setNumberOfReviews([]);
          setProjectReviews([]);
          setValidEmailError("");
          setValidEmailCheck(false);
          setSummaryPredecessorError("");
          setSummaryPredecessorCheck(false);
          setWorkTasksResourceError("");
          setWorkTaskResourceCheck(false);
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
      <Dialog.Content
        style={{ maxWidth: 450, paddingBottom: "80px" }}

        // className={loading ? "loading" : ""}
      >
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
            <Button variant="soft" color="gray" disabled={loading}>
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
        <Flex align="center" gap="2" mb="4" className="relative">
          <TiVendorMicrosoft />
          <Dialog.Title mb="0">Add new MS Project</Dialog.Title>
          <Text>
            <HoverCard.Root>
              <HoverCard.Trigger>
                <div>
                  <IoIosInformationCircleOutline />
                </div>
              </HoverCard.Trigger>
              <HoverCard.Content className="max-w-80">
                <Flex gap="4">
                  <Box>
                    <Heading size="3" as="h3" mb="1">
                      Importing Ms Project Guidance:
                    </Heading>
                    <Text as="div" size="2" color="gray" mt="3">
                      <ul>
                        {msProjectGuidance.map((g, i) => {
                          return (
                            <li key={i} className="mb-2">
                              {g}
                            </li>
                          );
                        })}
                      </ul>
                    </Text>
                  </Box>
                </Flex>
              </HoverCard.Content>
            </HoverCard.Root>{" "}
          </Text>
          {/* {true && <PiSpinnerGap className="spinner absolute right-0" />} */}
          {loading && <div className="spinner absolute right-0"></div>}
        </Flex>
        <form
          onSubmit={(e) => {
            // document.getElementById("submitMSProjectTrig").click();
            submitMsProject(
              e,
              setLoading,
              setValidEmailError,
              setValidEmailCheck,
              setSummaryPredecessorError,
              setSummaryPredecessorCheck,
              setWorkTasksResourceError,
              setWorkTaskResourceCheck,
              revalidator,
              user,
              setOpen
            );
          }}
          method="post"
          encType="multipart/form"
          className="mb-6"
        >
          <Text as="div" size="2" mb="1" weight="bold">
            Import .xml file from MS Project Desktop
          </Text>
          <Flex gap="4">
            <input
              type="file"
              name="uploadFile"
              accept=".xml"
              id="xml-file"
              required
            />
            <Button mt="2" disabled={loading}>
              Upload
            </Button>
          </Flex>
        </form>
        <Heading size="3" as="h3" mb="2">
          Pre-Checks:{" "}
          <small className="text-red-500">
            {uploadError && "Correct errors and resubmit"}
          </small>
        </Heading>
        <Flex direction="column" gap="8">
          <Flex gap="3">
            {validEmailError ? (
              <RxCrossCircled className="text-3xl text-red-500 min-w-7" />
            ) : validEmailCheck ? (
              <RxCheckCircled className="text-3xl min-w-7 text-green-500" />
            ) : (
              <RxCircle className="text-3xl min-w-7" />
            )}
            <Box className="relative w-full">
              <Text className="absolute">
                All work resources must have a valid email with an existing
                account.
              </Text>
              {validEmailError && (
                <Text className="absolute top-12  text-red-500" size="1">
                  {validEmailError}
                </Text>
              )}
            </Box>
          </Flex>
          <Flex gap="3">
            {workTasksResourceError ? (
              <RxCrossCircled className="text-3xl text-red-500 min-w-7" />
            ) : workTaskResourceCheck ? (
              <RxCheckCircled className="text-3xl min-w-7 text-green-500" />
            ) : (
              <RxCircle className="text-3xl min-w-7" />
            )}
            <Box className="relative w-full">
              <Text className="absolute">
                All work based tasks should be assigned a work resource.
              </Text>
              {workTasksResourceError && (
                <Text className="absolute top-12  text-red-500" size="1">
                  {workTasksResourceError}
                </Text>
              )}
            </Box>
          </Flex>
          <Flex gap="3">
            {summaryPredecessorError ? (
              <RxCrossCircled className="text-3xl text-red-500 min-w-7" />
            ) : summaryPredecessorCheck ? (
              <RxCheckCircled className="text-3xl min-w-7 text-green-500" />
            ) : (
              <RxCircle className="text-3xl min-w-7" />
            )}
            <Box className="relative w-full">
              <Text className="absolute">
                No Summary Tasks as Predecessors.
              </Text>
              {summaryPredecessorError && (
                <Text className="absolute top-6  text-red-500" size="1">
                  {summaryPredecessorError}
                </Text>
              )}
            </Box>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AddProjectDialog;
