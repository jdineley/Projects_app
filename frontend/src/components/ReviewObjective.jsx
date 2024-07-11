import { useState, useEffect } from "react";
import { Flex, Text, Box } from "@radix-ui/themes";

import * as Collapsible from "@radix-ui/react-collapsible";

import { RowSpacingIcon, Cross2Icon } from "@radix-ui/react-icons";

//components
import ReviewAction from "./ReviewAction";

const ReviewObjective = ({
  objective,
  accentColor,
  projectId,
  reviewId,
  newCommentId,
  newCommenterEmail,
  setReviewExpanded,
  allSetOpen,
  newActionId,
}) => {
  const [open, setOpen] = useState(false);
  allSetOpen.current.push(setOpen);

  useEffect(() => {
    if (newCommentId || newActionId) {
      setOpen(true);
      setReviewExpanded(true);
    }
  }, [newCommentId, setReviewExpanded, newActionId]);

  return (
    <Collapsible.Root
      style={{
        color: accentColor,
      }}
      className={`CollapsibleRoot objective-container ${
        open ? "open" : "closed"
      }`}
      open={open}
      onOpenChange={() => {
        setReviewExpanded(!open);
        setOpen(!open);
      }}
    >
      <Flex align="center" justify="between" mb="2">
        <div className="Repository">
          <Text className="Text" weight="bold">
            {objective.title}
          </Text>
        </div>
        <Collapsible.Trigger asChild>
          <button className="IconButton">
            {open ? <Cross2Icon /> : <RowSpacingIcon />}
          </button>
        </Collapsible.Trigger>
      </Flex>

      <Collapsible.Content>
        <Box as="div" className="Repository" ml="2">
          <Text className="Text" weight="bold">
            Actions -
          </Text>
          {objective.actions?.map((action, number) => (
            <ReviewAction
              key={action._id}
              action={action}
              projectId={projectId}
              reviewId={reviewId}
              newCommentId={newCommentId}
              newCommenterEmail={newCommenterEmail}
              allSetOpen={allSetOpen}
              number={number}
              newActionId={newActionId}
            />
          ))}
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default ReviewObjective;
