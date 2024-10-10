import { useState, useRef, useEffect } from "react";
// import { useLoaderData } from "react-router-dom";

import { Card, Text, Flex, Badge, Button } from "@radix-ui/themes";

import { goBackToStartOfArrayIndex } from "../../utility";

import { format } from "date-fns";

// import { useAuthContext } from "../hooks/useAuthContext";

import { BsArrowsCollapse } from "react-icons/bs";

// components
import ProjectReviewEditDialog from "../ProjectReviewEditDialog";
import ReviewObjective from "../ReviewObjective";

const ProjectReview_defeatured = ({ review }) => {
  // const {
  //   review,
  //   projectId,
  //   searchedUsers,
  //   actionIndex,
  //   newCommentId,
  //   newCommenterEmail,
  //   newActionId,
  // } = useLoaderData();

  // const { user } = useAuthContext();

  const themeColors = ["brown", "tomato", "purple", "blue", "green", "sky"];

  const [reviewExpanded, setReviewExpanded] = useState(false);

  const allSetOpen = useRef([]);

  // useEffect(() => {
  //   if (reviewExpanded) {
  //     document.getElementById(newCommentId)?.scrollIntoView({
  //       behavior: "smooth",
  //       block: "end",
  //       inline: "nearest",
  //     });
  //     document.getElementById(newActionId)?.scrollIntoView({
  //       behavior: "smooth",
  //       block: "end",
  //       inline: "nearest",
  //     });
  //   }
  // }, [newCommentId, reviewExpanded, newActionId]);

  return (
    <div>
      <Flex justify="between" align="center" gap="2">
        <Flex gap="2" mb="4" align="center">
          <div>
            <h1>{review?.title} review</h1>
            <small>({review?.project.title})</small>
          </div>

          <Card variant="surface">
            <Text as="div" size="2" weight="bold">
              Start date
            </Text>
            <Text as="div" color="gray" size="2">
              {review && format(new Date(review.date), "MM/dd/yyyy")}
            </Text>
          </Card>
          <Card variant="surface">
            <Text as="div" size="2" weight="bold">
              Status
            </Text>
            <Text as="div" color="gray" size="2">
              <Badge color={review?.complete ? "green" : "orange"}>
                {review?.complete ? "Complete" : "Pending"}
              </Badge>
            </Text>
          </Card>
          {review?.archived && <h1> *ARCHIVED*</h1>}
        </Flex>
        {!review?.archived && (
          <ProjectReviewEditDialog
            review={review}
            projectId={review.project._id}
            // searchedUsers={searchedUsers}
            // actionIndex={actionIndex}
            themeColors={themeColors}
            learning={true}
          />
        )}
      </Flex>
      <Flex align="center" justify="between">
        <h2>Objectives:</h2>
        <Button
          variant="outline"
          color="tomato"
          className="iconButton mr-2.5 p-2"
          onClick={() => {
            allSetOpen.current.forEach((setOpen) => {
              setReviewExpanded(false);
              setOpen(false);
            });
          }}
        >
          <BsArrowsCollapse />
        </Button>
      </Flex>
      {review?.objectives.length > 0 &&
        review?.objectives.map((objective, i) => {
          return (
            <ReviewObjective
              key={i}
              objective={objective}
              accentColor={
                themeColors[goBackToStartOfArrayIndex(themeColors, i)]
              }
              projectId={review.project._id}
              reviewId={review?._id}
              // newCommentId={newCommentId}
              // newCommenterEmail={newCommenterEmail}
              setReviewExpanded={setReviewExpanded}
              allSetOpen={allSetOpen}
              // newActionId={newActionId}
              learning={true}
            />
          );
        })}
    </div>
  );
};

export default ProjectReview_defeatured;
