import { useRef, useState, useEffect } from "react";
import { useImmer } from "use-immer";

import { useRevalidator, useNavigate } from "react-router-dom";

import { goBackToStartOfArrayIndex } from "../utility";

import { format, isWithinInterval } from "date-fns";

import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  RadioGroup,
  Box,
  TextArea,
} from "@radix-ui/themes";

import { FaEdit } from "react-icons/fa";

import ReviewObjectiveEdit from "./ReviewObjectiveEdit";

import { useAuthContext } from "../hooks/useAuthContext";

const ProjectReviewEditDialog = ({
  review,
  projectId,
  searchedUsers,
  actionIndex,
  themeColors,
}) => {
  const [open, setOpen] = useState(false);
  const [reviewTitle, setReviewTitle] = useState(review.title);
  const [reviewDate, setReviewDate] = useState(review.date);
  const [formFieldsCompleted, setFormFieldsCompleted] = useState(true);
  const [selectionErrors, setSelectionErrors] = useState([]);

  const [reviewInState, setReviewInState] = useImmer(review);
  const { user } = useAuthContext();
  let revalidator = useRevalidator();

  const reviewInStateChangedRef = useRef(false);

  // {review: id, notificationTracker: [{objectiveId, actionId, actioneeId}, {...}]}
  const actioneeNotificationData = useRef(null);

  const navigate = useNavigate();
  const currentPathNoQuery = location.pathname.split("?")[0];

  // type = 'add' or 'remove' actionee from action
  function changeActioneeNotificationData(
    objectiveId,
    actionId,
    actioneeId,
    type
  ) {
    console.log("inchangeActioneeNotification", type);
    //the following logic handles if an action is removed or added
    //if removed and added in the same instance then there will be nothing there
    //this can happen multiple times
    //if an actionee is removed as the only operation then this will be sent to the backend
    //for removal and updating the backend - notifications should be sent for all instances of change to the users state
    if (!actioneeNotificationData.current) {
      actioneeNotificationData.current = {
        notificationTracker: [],
      };
    }

    // if (actioneeNotificationData.current) {
    if (type === "remove") {
      const removedActionee =
        actioneeNotificationData.current.notificationTracker.filter(
          (tracker) => {
            if (
              objectiveId === tracker.objectiveId &&
              actionId === tracker.actionId &&
              actioneeId === tracker.actioneeId &&
              tracker.type === "add"
            ) {
              return null;
            } else return tracker;
          }
        );
      if (
        removedActionee.length <
        actioneeNotificationData.current.notificationTracker.length
      ) {
        actioneeNotificationData.current.notificationTracker = removedActionee;
      } else {
        actioneeNotificationData.current.notificationTracker.push({
          objectiveId,
          actionId,
          actioneeId,
          type,
        });
      }
    } else {
      actioneeNotificationData.current.notificationTracker.push({
        objectiveId,
        actionId,
        actioneeId,
        type,
      });
    }
  }
  // function changeActioneeNotificationData(objectiveId, actionId, actioneeId) {
  //   if (actioneeNotificationData.current) {
  //     actioneeNotificationData.current.notificationTracker.push({
  //       objectiveId,
  //       actionId,
  //       actioneeId,
  //     });
  //   }
  // }

  async function handleSaveProjectReview(data, type) {
    try {
      if (reviewInStateChangedRef.current === true) {
        const response = await fetch(
          `http://localhost:4000/api/v1/reviews/${review._id}/projects/${projectId}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              ...reviewInState,
              actioneeNotificationData: actioneeNotificationData.current,
            }),
          }
        );
        if (!response.ok) {
          console.log("something went wrong updating the review");
        }
        reviewInStateChangedRef.current = false;
      }

      if (type === "newObjective") {
        const { reviewId, title } = data;
        const res1 = await fetch(
          `http://localhost:4000/api/v1/reviewObjectives/${reviewId}`,
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ title }),
          }
        );

        const { review } = await res1.json();
        console.log(review);
        if (!res1.ok) {
          throw Error("failed to create new objective");
        }
        setReviewInState(review);
        document.getElementById("newObjectiveTitle").value = "";
      }

      if (type === "newAction") {
        const { objectiveId, content } = data;
        const res2 = await fetch(
          `http://localhost:4000/api/v1/reviewActions/objective/${objectiveId}`,
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ content }),
          }
        );

        const { review } = await res2.json();
        if (!res2.ok) {
          throw Error("failed to create new action");
        }
        setReviewInState(review);
        document.getElementById("newObjectiveAction").value = "";
      }
      revalidator.revalidate();
      actioneeNotificationData.current = null;
    } catch (error) {
      console.log(error.message);
    }
  }

  let saving = false;

  useEffect(() => {
    const errorTracker = [reviewTitle, reviewDate].filter((entry) => {
      if (entry) return entry;
    });
    if (errorTracker.length === 2) setFormFieldsCompleted(true);
    else setFormFieldsCompleted(false);
  }, [reviewDate, reviewTitle, review.end, review.start]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={() => {
        if (open) {
          if (saving) {
            if (window.confirm("Are you sure you want to save?")) {
              handleSaveProjectReview();
              setOpen(false);
            }
          } else {
            if (window.confirm("Are you sure you want to cancel?")) {
              reviewInStateChangedRef.current = false;
              setReviewInState(review);
              setReviewTitle(review.title);
              setReviewDate(review.date);
              setOpen(false);
            }
          }
          navigate(currentPathNoQuery);
        } else {
          console.log(currentPathNoQuery);

          setReviewTitle(review.title);
          setReviewDate(new Date(reviewDate).toISOString().split("T")[0]);
          setOpen(true);
        }
      }}
    >
      <Dialog.Trigger>
        <a href="#">
          <FaEdit />{" "}
        </a>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Edit Review</Dialog.Title>
        <Box as="div" mb="3">
          <Text as="div" size="2" mb="1" weight="bold">
            Title
          </Text>
          <TextField.Input
            // defaultValue={review.title}
            value={reviewTitle}
            onChange={(e) => {
              setReviewTitle(e.target.value);
              setReviewInState((draft) => {
                reviewInStateChangedRef.current = true;
                draft.title = e.target.value;
              });
            }}
          />
        </Box>
        <Box as="div" mb="3">
          <Text as="div" size="2" mb="1" weight="bold">
            Start Date{" "}
            {`(${format(review.project.start, "dd/MM/yyyy")} - 
              ${format(review.project.end, "dd/MM/yyyy")})`}
          </Text>
          <input
            type="date"
            min={format(review.project.start, "yyyy-MM-dd")}
            max={format(review.project.end, "yyyy-MM-dd")}
            // defaultValue={new Date(review.date).toISOString().split("T")[0]}
            // value={
            //   reviewDate
            //     ? new Date(reviewDate).toISOString().split("T")[0]
            //     : null
            // }
            value={reviewDate}
            onChange={(e) => {
              setReviewDate(e.target.value);
              setReviewInState((draft) => {
                reviewInStateChangedRef.current = true;
                draft.date = e.target.value;
              });
            }}
          />
        </Box>
        <Box as="div" mb="3">
          <Text as="div" size="2" mb="1" weight="bold">
            Status
          </Text>
          <RadioGroup.Root
            className="RadioGroupRoot"
            defaultValue={review.complete ? "complete" : "pending"}
            aria-label="View density"
            onValueChange={(value) => {
              console.log(value);
              reviewInStateChangedRef.current = true;
              setReviewInState((draft) => {
                draft.complete = value === "complete" ? true : false;
              });
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <RadioGroup.Item
                className="RadioGroupItem"
                value="pending"
                id="r1"
              />
              <label className="Label" htmlFor="r1" style={{ margin: "0px" }}>
                Pending
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <RadioGroup.Item
                className="RadioGroupItem"
                value="complete"
                id="r2"
              />
              <label className="Label" htmlFor="r2" style={{ margin: "0px" }}>
                Complete
              </label>
            </div>
          </RadioGroup.Root>
        </Box>

        {reviewInState.objectives.map((objective, i) => {
          return (
            <div key={i} style={{ marginBottom: "40px" }}>
              <ReviewObjectiveEdit
                i={i}
                objective={objective}
                setReviewInState={setReviewInState}
                searchedUsers={searchedUsers}
                actionIndex={actionIndex}
                handleSaveProjectReview={handleSaveProjectReview}
                reviewInStateChangedRef={reviewInStateChangedRef}
                accentColor={
                  themeColors[goBackToStartOfArrayIndex(themeColors, i)]
                }
                changeActioneeNotificationData={changeActioneeNotificationData}
                actioneeNotificationData={actioneeNotificationData}
                review={review}
              />
              <Flex justify="end">
                <Button
                  onClick={() => {
                    console.log("clicked");
                    const filteredObjectives = reviewInState.objectives.filter(
                      (objective, j) => {
                        if (i !== j) return objective;
                      }
                    );
                    console.log(filteredObjectives);
                    setReviewInState((draft) => {
                      reviewInStateChangedRef.current = true;
                      draft.objectives = filteredObjectives;
                    });
                  }}
                >
                  delete objective
                </Button>
              </Flex>
            </div>
          );
        })}
        <Text as="div" size="2" mb="1" weight="bold">
          Add new objective
        </Text>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveProjectReview(
              {
                title: document.getElementById("newObjectiveTitle").value,
                reviewId: review._id,
              },
              "newObjective"
            );
          }}
        >
          <Flex gap="2">
            <TextArea
              style={{ flex: "1" }}
              id="newObjectiveTitle"
              name="title"
              placeholder="New objective description"
            />
            <button type="submit">Add</button>
          </Flex>
        </form>
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
  );
};

export default ProjectReviewEditDialog;
