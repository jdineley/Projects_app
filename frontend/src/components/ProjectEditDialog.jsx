import { useState, useEffect, useRef } from "react";

import { useRevalidator, useFetcher } from "react-router-dom";

import {
  Dialog,
  Button,
  Flex,
  TextField,
  Text,
  Badge,
  HoverCard,
  Box,
  Heading,
} from "@radix-ui/themes";

import { submitMsProject, msProjectGuidance } from "../utility";

// icons
import { CiTrash } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";
import { TiVendorMicrosoft } from "react-icons/ti";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RxCheckCircled } from "react-icons/rx";
import { RxCrossCircled } from "react-icons/rx";
import { RxCircle } from "react-icons/rx";

import { isBefore, isEqual, isWithinInterval } from "date-fns";

import { toast } from "react-toastify";

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
  freezeProjectButton,
  unFreezeProjectButton,
  submit,
  user,
}) => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const [open, setOpen] = useState(false);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);
  const [dateSelectionErrors, setDateSelectionErrors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [validEmailError, setValidEmailError] = useState("");
  const [validEmailCheck, setValidEmailCheck] = useState(false);
  const [summaryPredecessorError, setSummaryPredecessorError] = useState("");
  const [summaryPredecessorCheck, setSummaryPredecessorCheck] = useState(false);
  const [workTasksResourceError, setWorkTasksResourceError] = useState("");
  const [workTaskResourceCheck, setWorkTaskResourceCheck] = useState(false);

  const uploadError =
    validEmailError || summaryPredecessorError || workTasksResourceError;

  let saving = false;
  // let deleting = false;
  let archiving = false;
  let freezing = false;
  let freeze = false;

  const revalidator = useRevalidator();
  const fetcher = useFetcher();

  // const freezeProjectButtonRef = useRef(null);
  // const unFreezeProjectButtonRef = useRef(null);

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
    <>
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
            } else if (freezing) {
              if (
                window.confirm(
                  "Are you sure you want to change the freeze state?"
                )
              ) {
                // console.log("freezeProjectButton", freezeProjectButton);
                if (freeze) submit(freezeProjectButton);
                else submit(unFreezeProjectButton);
                setOpen(false);
              }
            }
            // else if (!freezing) {
            //   if (
            //     window.confirm("Are you sure you want to unfreeze project?")
            //   ) {
            //     submit(unFreezeProjectButton);
            //     setOpen(false);
            //   }
            // }
            else {
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
            setProjectTitle(project.title);
            setProjectReviews(project.reviews);
            setProjectStart(
              new Date(project.start).toISOString().split("T")[0]
            );
            setProjectEnd(new Date(project.end).toISOString().split("T")[0]);
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
          {/* <a href="#">Edit</a> */}
          <FaEdit className="cursor-pointer text-blue-600" />
        </Dialog.Trigger>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit Project</Dialog.Title>
          {project.inWork && (
            <>
              <Flex direction="column" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Project title
                  </Text>
                  <TextField.Input
                    name="title"
                    // defaultValue={projectTitle}
                    disabled={project.msProjectGUID ? true : false}
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
                    disabled={project.msProjectGUID ? true : false}
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
                    disabled={project.msProjectGUID ? true : false}
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
                        Review Title {!review._id && <Badge>new review</Badge>}
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
                    {review._id && (
                      <button
                        className="review-trash"
                        onClick={() => {
                          // const filteredReviews = arr.filter((rev, index) => {
                          //   if (rev._id) return rev._id !== review._id;
                          //   else {
                          //     return index.toString() !== document.getElementById(i).id;
                          //     // console.log(typeof index);
                          //   }
                          // });
                          // setProjectReviews(filteredReviews);
                          const filteredReviews = arr.filter((rev) => {
                            return rev._id !== review._id;
                          });
                          setProjectReviews(filteredReviews);
                          // ** Delete review and children from the db?
                        }}
                      >
                        <CiTrash size="20px" />
                      </button>
                    )}
                  </div>
                ))}
              </Flex>

              <Flex justify="between">
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
                {projectReviews.some((rev) => !rev._id) && (
                  <button
                    className="review-trash"
                    onClick={() => {
                      const filteredReviews = projectReviews.filter((rev) =>
                        rev._id ? rev : null
                      );
                      setProjectReviews(filteredReviews);
                      // ** Delete review and children from the db?
                    }}
                  >
                    {/* <CiTrash size="20px" /> */}
                    Delete all new reviews
                  </button>
                )}
              </Flex>
            </>
          )}
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
            {project.inWork ? (
              <>
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
                      archiving = true;
                    }}
                  >
                    Archive Project
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button
                    color="tomato"
                    onClick={() => {
                      freezing = true;
                      freeze = true;
                    }}
                  >
                    Freeze
                  </Button>
                </Dialog.Close>
              </>
            ) : (
              <Dialog.Close>
                <Button
                  color="tomato"
                  onClick={() => {
                    freezing = true;
                    freeze = false;
                  }}
                >
                  Unfreeze
                </Button>
              </Dialog.Close>
            )}
          </Flex>
          {project.msProjectGUID && project.owner._id === user._id && (
            <>
              <hr className="mb-5" />
              {
                !project.inWork ? (
                  <>
                    <Flex align="center" gap="2" mb="4" className="relative">
                      <TiVendorMicrosoft />
                      <Dialog.Title mb="0">Update MS Project</Dialog.Title>
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
                                  {msProjectGuidance.map((g, i) => {
                                    return (
                                      <li key={i} className="mb-2">
                                        {g}
                                      </li>
                                    );
                                  })}
                                </Text>
                              </Box>
                            </Flex>
                          </HoverCard.Content>
                        </HoverCard.Root>{" "}
                      </Text>
                      {loading && (
                        <div className="spinner absolute right-0"></div>
                      )}
                    </Flex>
                    <form
                      onSubmit={(e) => {
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
                          setOpen,
                          project
                        );
                      }}
                      method="post"
                      encType="multipart/form"
                      className="mb-4"
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
                        <Button mt="2">Upload</Button>
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
                            All work resources must have a valid email with an
                            existing account.
                          </Text>
                          {validEmailError && (
                            <Text
                              className="absolute top-12  text-red-500"
                              size="1"
                            >
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
                            All work based tasks should be assigned a work
                            resource.
                          </Text>
                          {workTasksResourceError && (
                            <Text
                              className="absolute top-12  text-red-500"
                              size="1"
                            >
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
                            <Text
                              className="absolute top-6  text-red-500"
                              size="1"
                            >
                              {summaryPredecessorError}
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </Flex>
                  </>
                ) : (
                  <Flex justify="between" align="center" gap="2" mb="4">
                    <Flex align="center" gap="2">
                      <TiVendorMicrosoft />
                      <Dialog.Title mb="0">
                        Freeze for schedule review
                      </Dialog.Title>
                    </Flex>
                  </Flex>
                )

                // : (
                //   <Flex justify="between" align="center" gap="2" mb="4">
                //     <Flex align="center" gap="2">
                //       <TiVendorMicrosoft />
                //       <Dialog.Title mb="0">Export to MS Project .xml</Dialog.Title>
                //     </Flex>
                //     <form
                //       onSubmit={exportToMSProject}
                //       method="post"
                //       encType="multipart/form"
                //       className="mb-4"
                //     >
                //       <Button mt="2">Export</Button>
                //     </form>
                //   </Flex>
                // )
              }
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default ProjectTitleEditDialog;

// function submitMsProject(e) {
//   e.preventDefault();
//   if (
//     window.confirm("Are you sure you want to submit a MS Project .xml file?")
//   ) {
//     let file = e.target.uploadFile.files[0];
//     let formData = new FormData();
//     formData.append("file", file);
//     console.log("formData", formData);
//     fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects/${project._id}`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${user.token}`,
//       },
//       body: formData,
//     })
//       .then((resp) => resp.json())
//       .then((data) => {
//         if (data.errors) {
//           alert(data.errors);
//         } else {
//           console.log(data);
//           setOpen(false);
//           toast(`${project.title} synchronised with MS Project`);
//           revalidator.revalidate();
//         }
//       });
//   }
// }

// async function exportToMSProject(e) {
//   e.preventDefault();
//   if (
//     window.confirm(
//       "Are you sure you want to export project to MS Project .xml file?"
//     )
//   ) {
//     try {
//       const resp = await fetch(
//         `${VITE_REACT_APP_API_URL}/api/v1/projects/${project._id}?intent=exportXML`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         }
//       );
//       if (!resp.ok) {
//         throw Error("unsucessful download of .xml");
//       }
//       const filename = resp.headers
//         .get("Content-Disposition")
//         .split("filename=")[1]
//         .split(".")[0];
//       const blob = await resp.blob();
//       console.log("filename", filename);
//       const url = window.URL.createObjectURL(new Blob([blob]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute(
//         "download",
//         `${filename} ${new Date().getTime()}.xml`
//       );
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//       // setLoading(false)
//       setOpen(false);
//       revalidator.revalidate();
//     } catch (error) {
//       alert(error.message);
//       // throw Error(error.message);
//     }
//   }
// }
