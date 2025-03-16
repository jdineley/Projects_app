import {
  useLoaderData,
  Form,
  useFetcher,
  useSearchParams,
  useRevalidator,
  // useNavigate,
} from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useState, useEffect, useRef } from "react";
import { useNotificationContext } from "../hooks/useNotificationContext";

import { Table, Box, Flex, Card, Text, TextArea } from "@radix-ui/themes";

// components
import UserComment from "../components/UserComment";
import TaskPercentageCompleteGUI from "../components/TaskPercentageCompleteGUI";
import UserActiveTaskRow from "../components/UserActiveTaskRow";
import TaskEditDialog from "../components/TaskEditDialog";
// import EmbeddedAttachment from "../components/EmbeddedAttachment";
import EmbeddedLink from "../components/EmbeddedLink";
import OptimisticUserComment from "../components/OptimisticUserComment";
import MessageForm from "../components/MessageForm";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// date
import { format } from "date-fns";

// constants
import { mobileScreenWidth, tabletScreenWidth } from "../utility";

// utility
// import { handleSubmitMessage } from "../utility";

// icons
// import { IoSendOutline } from "react-icons/io5";
// import { IoSend } from "react-icons/io5";
// import { CiImageOn } from "react-icons/ci";
// import { CiVideoOn } from "react-icons/ci";

// export default function TaskDetail() {
export default function TaskDetail({ learning, task, taskComments, user }) {
  // const { VITE_REACT_APP_API_URL } = import.meta.env;
  ({ user } = !learning ? useAuthContext() : { user });
  console.log("USER", user);
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const token = user?.token ? user?.token : user?.accessToken;
  console.log("token", token);
  // const loaderData = useLoaderData();
  const loaderData = !learning ? useLoaderData() : {};
  // const { task, taskComments, projectId } = loaderData;
  if (!learning) {
    ({ task, taskComments } = loaderData);
  }
  const { newCommentId, taskDep, searchedTasks, projectId } = loaderData;

  // const { task, taskComments, newCommentId, taskDep, searchedTasks } =
  //   useLoaderData();
  // const { user } = useAuthContext();

  console.log("newCommentId", newCommentId);
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [messButHover, setMessageButHover] = useState(false);
  const [uploadFileButHover, setUploadFileButHover] = useState(false);
  const [uploadPicButHover, setUploadPicButHover] = useState(false);
  const [inputImages, setInputImages] = useState([]);
  const [inputVideos, setInputVideos] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  // const [isNewAt, setIsNewAt] = useState(false);
  // console.log("isNewAt", isNewAt);
  const atTotal = useRef(0);
  const taggedUsers = useRef([]);
  // const isNewAt = useRef(false);
  // const hasAttachedFiles =
  //   [...inputImages, ...inputVideos].length > 0 ? true : false;
  const [isSending, setIsSending] = useState(false);
  let [searchParams, setSearchParams] = useSearchParams();

  const revalidator = useRevalidator();
  // get urls as typed:
  const URL_REGEX =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  const AT_REGEX = / @/g;
  const TAG_REGEX = / @\S*/g;
  console.log(comment.match(TAG_REGEX));
  // Need to handle if the user deletes a tagged person. render the @tags in a non-editable text, but remain part of the main flow..  result is that taggedUsers.current[] stays insync with comment.match(TAG_REGEX).  Remind myself how to return only a section of the returned match [' @catherineTest@mail.com', ' @jamesTest@mail.com'] => [catherineTest, jamesTest]

  const urlsArr = comment.match(URL_REGEX) || null;

  // console.log("isNewAt", isNewAt);
  let emmbeddedLinksArr;
  if (urlsArr) {
    emmbeddedLinksArr = urlsArr.map((url) => {
      return <EmbeddedLink url={url} />;
    });
  }
  console.log("urlsArr", urlsArr);
  const isUserTask = user?._id === task?.user._id;

  const { notification } = useNotificationContext();

  // const fetcher = useFetcher();

  // console.log("isNewAt", isNewAt);
  // let projectUsers;
  useEffect(() => {
    console.log("in TaskDetail useEffect");
    if (notification) {
      document.getElementById(newCommentId)?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "end",
      });
    }
    if (comment) {
      if (AT_REGEX.test(comment)) {
        const totalAts = comment.match(AT_REGEX).length;
        const currentTags = comment
          .match(TAG_REGEX)
          .map((t) => t.split("@")[1] + t.split("@")[2]);
        taggedUsers.current = currentTags;
        // console.log("currentTags", currentTags);
        console.log("taggedUsers.current", taggedUsers.current);
        // console.log("totalAts", totalAts);
        // console.log("atTotal.current", atTotal.current);
        if (totalAts > atTotal.current) {
          // console.log("SETTING IS NEW AT");
          atTotal.current = totalAts;
          fetch(
            `${VITE_REACT_APP_API_URL}/api/v1/users/getUsers?intent=allProjectUsers&projectId=${projectId}`,
            {
              method: "GET",
              mode: "cors",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              console.log(json);
              setProjectUsers(json);
            });
        } else if (totalAts < atTotal.current) {
          atTotal.current = totalAts;
          setProjectUsers([]);
        } else {
          setProjectUsers([]);
        }
      } else {
        atTotal.current = 0;
        setProjectUsers([]);
      }
    }
  }, [task, notification, newCommentId, comment]);

  console.log("!!!!!!projectUsers", projectUsers);

  function handleAddComment() {
    if (searchParams.size > 0) {
      setSearchParams();
    }
    setIsCommenting(!isCommenting);
  }

  return (
    <div data-testid="task-detail" className="relative pb-4">
      <Flex justify="between" align="center" mb="4">
        <h1>
          {task?.title}
          {!isUserTask && (
            <span className="owner">
              {" - "}
              {task?.user.email}
            </span>
          )}
          {task?.archived && " *ARCHIVED*"}
        </h1>
        {isUserTask && (
          <TaskEditDialog
            task={task}
            searchedTasks={searchedTasks}
            taskDep={taskDep}
            taskDetail={true}
          />
        )}
      </Flex>
      <Flex direction="column" gap="2" mb="4">
        {!task?.archived && isUserTask && (
          <Table.Root variant="surface" style={{ maxWidth: "700px" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  <div id="percent-complete-th">Completion status</div>
                </Table.ColumnHeaderCell>

                {!isMobileResolution && (
                  <>
                    <Table.ColumnHeaderCell>
                      <Flex direction="column">
                        Estimated duration (days)
                        <small>(with assigned resource)</small>
                      </Flex>
                    </Table.ColumnHeaderCell>

                    <Table.ColumnHeaderCell>Start date</Table.ColumnHeaderCell>

                    <Table.ColumnHeaderCell>Finish date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Owner(s)</Table.ColumnHeaderCell>
                  </>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <UserActiveTaskRow
                taskDetail={true}
                task={task}
                searchedTasks={searchedTasks}
                taskDep={taskDep}
                isTabletResolution={isTabletResolution}
                isMobileResolution={isMobileResolution}
                user={user}
              />
            </Table.Body>
          </Table.Root>
        )}
        {isMobileResolution && isUserTask && (
          <Card size="1" style={{ width: "200px" }}>
            <Flex justify="between">
              <Text size="1" weight="bold">
                Days to complete
              </Text>
              <Text size="1">{task.daysToComplete}</Text>
            </Flex>
          </Card>
        )}
        {isMobileResolution && isUserTask && (
          <Card size="1" style={{ width: "200px" }}>
            <Flex justify="between">
              <Text size="1" weight="bold">
                Finish date
              </Text>
              <Text size="1">
                {format(new Date(task.deadline), "MM/dd/yyyy")}
              </Text>
            </Flex>
          </Card>
        )}
      </Flex>
      <Box style={{ maxWidth: "700px" }} mb="4">
        <h3 className="mb-3">Task completion history</h3>
        <TaskPercentageCompleteGUI task={task} />
      </Box>
      <h3>Description</h3>
      <p>{task?.description}</p>
      {!task?.archived && (
        <button className="my-2 sticky top-10" onClick={handleAddComment}>
          {isCommenting ? "Close comment.." : "Add comment.."}
        </button>
      )}
      {taskComments?.map((comment) => (
        <UserComment
          key={comment._id}
          comment={comment}
          newCommentId={newCommentId}
          projectId={projectId}
          // learning={learning}
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
          setIsCommenting={setIsCommenting}
          revalidate={revalidator.revalidate}
          intent="task"
          target={task}
          user={user}
          endPoint={`/api/v1/comments/project/${projectId}`}
          setIsSending={setIsSending}
          projectId={projectId}
          // isNewAt={isNewAt}
          projectUsers={projectUsers}
          taggedUsers={taggedUsers}
          // learning={learning}
        />
        // <form
        //   onSubmit={(e) => handleSubmitComment(e, comment)}
        //   method="POST"
        //   encType="multipart/form-data"
        //   id="submit-comment-form"
        //   className="sticky flex mx-auto w-9/12 justify-center items-end bottom-5 bg-white"
        // >
        //   <div className="flex flex-col w-full border-solid border-0.5 border-slate-200 focus-within:border-sky-500">
        //     <textarea
        //       placeholder="add new comment..."
        //       className="flex-1 border-none outline-none"
        //       name="comment"
        //       required={hasAttachedFiles ? "" : "true"}
        //       onChange={(e) => {
        //         setComment(e.target.value);
        //       }}
        //       value={comment}
        //     />
        //     <div className="bg-white flex gap-4 mx-2 flex-wrap">
        //       {inputImages.map((image) => {
        //         return (
        //           <EmbeddedAttachment
        //             key={image.name}
        //             fileName={image.name}
        //             inputImages={inputImages}
        //             setInputImages={setInputImages}
        //           />
        //         );
        //       })}
        //       {inputVideos.map((video) => {
        //         return (
        //           <EmbeddedAttachment
        //             key={video.name}
        //             fileName={video.name}
        //             inputVideos={inputVideos}
        //             setInputVideos={setInputVideos}
        //           />
        //         );
        //       })}
        //       {emmbeddedLinksArr}
        //     </div>
        //     <div className="flex justify-end gap-4">
        //       <label
        //         htmlFor="video-upload"
        //         className="my-auto"
        //         onMouseEnter={(e) => {
        //           setUploadFileButHover(true);
        //         }}
        //         onMouseLeave={(e) => {
        //           setUploadFileButHover(false);
        //         }}
        //       >
        //         <CiVideoOn
        //           size={20}
        //           fontWeight="1"
        //           color={
        //             uploadFileButHover
        //               ? `rgba(22, 101, 192, 1)`
        //               : `rgba(22, 101, 192, 0.6)`
        //           }
        //         />
        //       </label>
        //       <label
        //         htmlFor="pic-upload"
        //         className="my-auto"
        //         onMouseEnter={(e) => {
        //           setUploadPicButHover(true);
        //         }}
        //         onMouseLeave={(e) => {
        //           setUploadPicButHover(false);
        //         }}
        //       >
        //         <CiImageOn
        //           size={20}
        //           fontWeight="1"
        //           color={
        //             uploadPicButHover
        //               ? `rgba(22, 101, 192, 1)`
        //               : `rgba(22, 101, 192, 0.6)`
        //           }
        //         />
        //       </label>

        //       <input
        //         onChange={(event) => {
        //           console.log(event.target.files);
        //           setInputVideos([
        //             ...Object.values(inputVideos),
        //             ...Object.values(event.target.files),
        //           ]);
        //         }}
        //         name="uploaded_videos"
        //         id="video-upload"
        //         accept="video/*"
        //         type="file"
        //         className="hidden"
        //         multiple
        //       />
        //       <input
        //         onChange={(event) => {
        //           console.log(event.target.files);
        //           setInputImages([
        //             ...Object.values(inputImages),
        //             ...Object.values(event.target.files),
        //           ]);
        //         }}
        //         name="uploaded_images"
        //         id="pic-upload"
        //         type="file"
        //         accept="image/*"
        //         className="hidden"
        //         multiple
        //       />
        //       <button
        //         type="submit"
        //         name="intent"
        //         value="task-comment"
        //         className="bg-white"
        //         onMouseEnter={(e) => {
        //           setMessageButHover(true);
        //         }}
        //         onMouseLeave={(e) => {
        //           setMessageButHover(false);
        //         }}
        //       >
        //         {messButHover ? (
        //           <IoSend
        //             className="my-auto"
        //             size={20}
        //             fontWeight="1"
        //             color="rgb(22, 101, 192)"
        //           />
        //         ) : (
        //           <IoSendOutline
        //             color="rgb(22, 101, 192)"
        //             className="my-auto"
        //             size={20}
        //             fontWeight="1"
        //           />
        //         )}
        //       </button>
        //     </div>
        //   </div>
        // </form>
      )}
    </div>
  );
}
