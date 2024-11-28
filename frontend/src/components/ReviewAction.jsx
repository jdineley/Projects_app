import { useState, useEffect } from "react";
import { useFetcher, useNavigate, useLocation } from "react-router-dom";
import { Flex, Badge, Box } from "@radix-ui/themes";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "../hooks/useNotificationContext";

import * as Collapsible from "@radix-ui/react-collapsible";

import { RowSpacingIcon, Cross2Icon } from "@radix-ui/react-icons";

import UserComment from "./UserComment";

const ReviewAction = ({
  action,
  projectId,
  reviewId,
  newCommentId,
  newCommenterEmail,
  allSetOpen,
  number,
  newActionId,
  learning,
}) => {
  const [open, setOpen] = useState(() => (newCommentId ? true : false));
  const [isCommenting, setIsCommenting] = useState(false);
  const { user } = useAuthContext();

  const { notification } = useNotificationContext();

  const navigate = useNavigate();
  const location = useLocation();

  const currentPathNoQuery = location.pathname.split("?")[0];

  allSetOpen.current.push(setOpen);

  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      setIsCommenting(false);
      fetcher.data = null;
    }
    if (action._id === newActionId && notification) {
      setTimeout(() => {
        navigate(currentPathNoQuery);
      }, 1000);
    }
    if (isCommenting) {
      document.getElementById("reviewActionCommentText").scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [
    action._id,
    newActionId,
    notification,
    navigate,
    currentPathNoQuery,
    isCommenting,
    fetcher.data,
  ]);

  async function handleAddComment() {
    setIsCommenting(true);
  }

  return (
    <Collapsible.Root
      className="CollapsibleRoot action"
      open={open}
      onOpenChange={setOpen}
    >
      <Flex
        id={action._id}
        align="center"
        justify="between"
        mb="6"
        className={`${
          action._id === newActionId && notification ? "new-comment" : ""
        } `}
      >
        <div className="Repository">
          <span className="Text">
            {number + 1}. {action.content}
          </span>
          <Flex gap="2">
            {action.actionees.map((actionee) => (
              <Badge key={actionee._id} color="orange" highContrast>
                {" "}
                {actionee.email}
              </Badge>
            ))}
          </Flex>
        </div>
        <Collapsible.Trigger asChild>
          <button className="IconButton">
            {open ? <Cross2Icon /> : <RowSpacingIcon />}
          </button>
        </Collapsible.Trigger>
      </Flex>
      <Collapsible.Content>
        <Box as="div" className="task-comments Repository" mb="9">
          <div className="task-detail-button-collector">
            <h4>Comments..</h4>
            {!action.archived && (
              <button onClick={handleAddComment}>Add comment...</button>
            )}
          </div>
          {action.comments.map((comment) => (
            <UserComment
              key={comment._id}
              comment={comment}
              projectId={projectId}
              reviewId={reviewId}
              newCommentId={newCommentId}
              newCommenterEmail={newCommenterEmail}
              learning={learning}
            />
          ))}
          {isCommenting && (
            <div
              style={{
                marginLeft: "auto",
                width: "50%",
              }}
            >
              <fetcher.Form method="POST" className="add-task-comment-form">
                <textarea
                  id="reviewActionCommentText"
                  rows="8"
                  placeholder={`${user.email} add new comment...`}
                  name="comment"
                  required
                ></textarea>
                <input type="hidden" name="actionId" value={action._id} />
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="reviewId" value={reviewId} />
                <div className="comment-action-buttons">
                  <button
                    onClick={() => {
                      setIsCommenting(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    name="intent"
                    value="newComment"
                    disabled={learning}
                  >
                    Submit comment
                  </button>
                </div>
              </fetcher.Form>
            </div>
          )}
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default ReviewAction;
