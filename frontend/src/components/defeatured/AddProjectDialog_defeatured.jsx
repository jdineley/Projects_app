// import { useState, useEffect } from "react";
// import { useRevalidator } from "react-router-dom";
// import xml2js from "xml2js";

import { msProjectGuidance } from "../../utility";

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

// import { isBefore, isEqual, isWithinInterval } from "date-fns";

// import { toast } from "react-toastify";

// import { PiSpinnerGap } from "react-icons/pi";

const AddProjectDialog_defeatured = (
  {
    // projectTitle,
    // projectStart,
    // projectEnd,
    // setProjectTitle,
    // setProjectStart,
    // setProjectEnd,
    // setProjectReviews,
    // projectReviews,
    // button,
    // submit,
    // user,
  }
) => {
  // const { VITE_REACT_APP_API_URL } = import.meta.env;
  // const [open, setOpen] = useState(false);
  // const [numberOfReviews, setNumberOfReviews] = useState([]);
  // const [dateSelectionErrors, setDateSelectionErrors] = useState([]);
  // const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);
  // const [loading, setLoading] = useState(false);
  // const [validEmailError, setValidEmailError] = useState("");
  // const [validEmailCheck, setValidEmailCheck] = useState(false);
  // const [summaryPredecessorError, setSummaryPredecessorError] = useState("");
  // const [summaryPredecessorCheck, setSummaryPredecessorCheck] = useState(false);
  // const [workTasksResourceError, setWorkTasksResourceError] = useState("");
  // const [workTaskResourceCheck, setWorkTaskResourceCheck] = useState(false);

  // const uploadError =
  //   validEmailError || summaryPredecessorError || workTasksResourceError;

  // let revalidator = useRevalidator();

  // let saving = false;

  // useEffect(() => {
  //   let localDateSelectionErrors = [];

  //   if (
  //     projectStart &&
  //     projectEnd &&
  //     isBefore(new Date(projectEnd), new Date(projectStart))
  //   ) {
  //     localDateSelectionErrors.push(
  //       "project end must come after project start"
  //     );
  //   }
  //   if (
  //     projectEnd &&
  //     projectStart &&
  //     isEqual(new Date(projectEnd), new Date(projectStart))
  //   ) {
  //     localDateSelectionErrors.push("start and end dates must be different");
  //   }
  //   if (projectReviews.length > 0) {
  //     projectReviews.forEach((rev) => {
  //       if (
  //         rev.date &&
  //         !isWithinInterval(new Date(rev.date), {
  //           start: new Date(projectStart),
  //           end: new Date(projectEnd),
  //         })
  //       ) {
  //         localDateSelectionErrors.push(
  //           "review dates must between project start and end"
  //         );
  //       }
  //     });
  //   }
  //   setDateSelectionErrors(localDateSelectionErrors);

  //   const errorTracker = [projectTitle, projectStart, projectEnd].filter(
  //     (entry) => {
  //       if (entry) return entry;
  //     }
  //   );
  //   if (errorTracker.length === 3) setFormFieldsCompleted(true);
  //   else setFormFieldsCompleted(false);
  // }, [projectEnd, projectStart, projectTitle, projectReviews]);

  return (
    <Dialog.Root
    // open={open}
    // onOpenChange={() => {
    //   if (loading) return;
    //   if (open) {
    //     if (saving) {
    //       if (window.confirm("Are you sure you want to save?")) {
    //         submit(button);
    //         setOpen(false);
    //       }
    //     } else {
    //       if (window.confirm("Are you sure you want to cancel?")) {
    //         setValidEmailError("");
    //         setValidEmailCheck(false);
    //         setSummaryPredecessorError("");
    //         setSummaryPredecessorCheck(false);
    //         setWorkTasksResourceError("");
    //         setWorkTaskResourceCheck(false);
    //         setOpen(false);
    //       }
    //     }
    //   } else {
    //     setProjectTitle("");
    //     setProjectStart("");
    //     setProjectEnd("");
    //     setNumberOfReviews([]);
    //     setProjectReviews([]);
    //     setValidEmailError("");
    //     setValidEmailCheck(false);
    //     setSummaryPredecessorError("");
    //     setSummaryPredecessorCheck(false);
    //     setWorkTasksResourceError("");
    //     setWorkTaskResourceCheck(false);
    //     setOpen(true);
    //   }
    // }}
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
        <Heading>Add new Project</Heading>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project title
            </Text>
            <TextField.Input
              name="title"
              value="Sample Project"
              // onChange={(e) => {
              //   setProjectTitle(e.target.value);
              // }}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project start date
            </Text>
            <input type="date" value={new Date("2024-04-15")} />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project end date
            </Text>
            <input type="date" value={new Date("2025-04-15")} />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Select number of project reviews
            </Text>
            <Select.Root
              // defaultValue="0"
              value="3"
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
          {[1, 2, 3].map((el) => (
            <div key={el} className="review-form">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Review Title
                </Text>
                <TextField.Input name="title" value={`Review ${el}`} />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Review date
                </Text>
                <input
                  type="date"
                  value={
                    [
                      new Date("2024-08-14"),
                      new Date("2024-11-14", new Date("2025-03-14")),
                    ][el]
                  }
                />
              </label>
            </div>
          ))}
        </Flex>

        <Flex gap="3" mt="4" mb="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
        </Flex>
        <hr className="mb-5" />
        <Flex align="center" gap="2" mb="4" className="relative">
          <TiVendorMicrosoft />
          <Heading mb="0">Add new MS Project</Heading>
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
          {/* {loading && <div className="spinner absolute right-0"></div>} */}
        </Flex>
        <div
          // onSubmit={(e) => {
          //   // document.getElementById("submitMSProjectTrig").click();
          //   submitMsProject(
          //     e,
          //     setLoading,
          //     setValidEmailError,
          //     setValidEmailCheck,
          //     setSummaryPredecessorError,
          //     setSummaryPredecessorCheck,
          //     setWorkTasksResourceError,
          //     setWorkTaskResourceCheck,
          //     revalidator,
          //     user,
          //     setOpen
          //   );
          // }}
          // method="post"
          // encType="multipart/form"
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
              disabled
              required
            />
            <Button mt="2">Upload</Button>
          </Flex>
        </div>
        <Heading size="3" as="h3" mb="2">
          Pre-Checks:{" "}
          {/* <small className="text-red-500">
          {uploadError && "Correct errors and resubmit"}
        </small> */}
        </Heading>
        <Flex direction="column" gap="8">
          <Flex gap="3">
            <RxCircle className="text-3xl min-w-7" />

            <Box className="relative w-full">
              <Text className="absolute">
                All work resources must have a valid email with an existing
                account.
              </Text>
            </Box>
          </Flex>
          <Flex gap="3">
            <RxCircle className="text-3xl min-w-7" />

            <Box className="relative w-full">
              <Text className="absolute">
                All work based tasks should be assigned a work resource.
              </Text>
            </Box>
          </Flex>
          <Flex gap="3">
            <RxCircle className="text-3xl min-w-7" />

            <Box className="relative w-full">
              <Text className="absolute">
                No Summary Tasks as Predecessors.
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AddProjectDialog_defeatured;
