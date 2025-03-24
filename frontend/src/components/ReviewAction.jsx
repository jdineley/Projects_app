import { useState, useEffect, useRef } from "react";
import {
  useFetcher,
  useNavigate,
  useLocation,
  useRevalidator,
} from "react-router-dom";
import { Flex, Badge, Box } from "@radix-ui/themes";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "../hooks/useNotificationContext";

import * as Collapsible from "@radix-ui/react-collapsible";

import { RowSpacingIcon, Cross2Icon } from "@radix-ui/react-icons";

import UserComment from "./UserComment";
import MessageForm from "./MessageForm";
import OptimisticUserComment from "./OptimisticUserComment";
import EmbeddedLink from "./EmbeddedLink";

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
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const [open, setOpen] = useState(() => (newCommentId ? true : false));
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [messButHover, setMessageButHover] = useState(false);
  const [uploadFileButHover, setUploadFileButHover] = useState(false);
  const [uploadPicButHover, setUploadPicButHover] = useState(false);
  const [inputImages, setInputImages] = useState([]);
  const [inputVideos, setInputVideos] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const atTotal = useRef(0);
  const AT_REGEX = / @/g;
  // const hasAttachedFiles =
  //   [...inputImages, ...inputVideos].length > 0 ? true : false;
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthContext();
  const token = user?.token ? user?.token : user?.accessToken;
  const { notification } = useNotificationContext();

  const navigate = useNavigate();
  const location = useLocation();

  const currentPathNoQuery = location.pathname.split("?")[0];

  allSetOpen.current.push(setOpen);

  const fetcher = useFetcher();
  console.log("fetcher.data", fetcher.data);

  const revalidator = useRevalidator();

  const URL_REGEX =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  const urlsArr = comment.match(URL_REGEX) || null;
  let emmbeddedLinksArr;
  if (urlsArr) {
    emmbeddedLinksArr = urlsArr.map((url) => {
      return <EmbeddedLink url={url} />;
    });
  }
  console.log("urlsArr", urlsArr);

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
      // document.getElementById("reviewActionCommentText").scrollIntoView({
      document.getElementById(`comment-${action._id}`).scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
    // if (comment) {
    //   if (AT_REGEX.test(comment)) {
    //     const totalAts = comment.match(AT_REGEX).length;
    //     console.log("totalAts", totalAts);
    //     console.log("atTotal.current", atTotal.current);
    //     if (totalAts > atTotal.current) {
    //       console.log("SETTING IS NEW AT");
    //       atTotal.current = totalAts;
    //       fetch(
    //         `${VITE_REACT_APP_API_URL}/api/v1/users/getUsers?intent=allProjectUsers&projectId=${projectId}`,
    //         {
    //           method: "GET",
    //           mode: "cors",
    //           headers: {
    //             Authorization: `Bearer ${token}`,
    //           },
    //         }
    //       )
    //         .then((res) => {
    //           return res.json();
    //         })
    //         .then((json) => {
    //           console.log(json);
    //           setProjectUsers(json);
    //         });
    //     } else if (totalAts < atTotal.current) {
    //       atTotal.current = totalAts;
    //       setProjectUsers([]);
    //     } else {
    //       setProjectUsers([]);
    //     }
    //   } else {
    //     atTotal.current = 0;
    //     setProjectUsers([]);
    //   }
    // }
  }, [
    action._id,
    newActionId,
    notification,
    navigate,
    currentPathNoQuery,
    isCommenting,
    fetcher.data,
    // comment,
  ]);

  async function handleAddComment() {
    setIsCommenting(!isCommenting);
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
              <button onClick={handleAddComment}>
                {isCommenting ? "Close comment.." : "Add comment.."}
              </button>
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
          {isSending && (
            <OptimisticUserComment
              comment={comment}
              inputImages={inputImages}
              inputVideos={inputVideos}
              emmbeddedLinksArr={emmbeddedLinksArr}
            />
          )}
          {isCommenting && (
            // <div
            //   style={{
            //     marginLeft: "auto",
            //     width: "50%",
            //   }}
            // >
            <MessageForm
              comment={comment}
              setComment={setComment}
              inputImages={inputImages}
              setInputImages={setInputImages}
              inputVideos={inputVideos}
              setInputVideos={setInputVideos}
              emmbeddedLinksArr={emmbeddedLinksArr}
              uploadFileButHover={uploadFileButHover}
              setUploadFileButHover={setUploadFileButHover}
              uploadPicButHover={uploadPicButHover}
              setUploadPicButHover={setUploadPicButHover}
              messButHover={messButHover}
              setMessageButHover={setMessageButHover}
              // handleSubmitMessage={handleSubmitMessage}
              setIsCommenting={setIsCommenting}
              revalidate={revalidator.revalidate}
              intent="action"
              target={action}
              user={user}
              endPoint={`/api/v1/comments/project/${projectId}`}
              setIsSending={setIsSending}
              projectId={projectId}
              reviewId={reviewId}
              projectUsers={projectUsers}
              learning={learning}
            />
            /* <fetcher.Form method="POST" className="add-task-comment-form">
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
              </fetcher.Form> */
            // </div>
          )}
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default ReviewAction;
