import {
  useLoaderData,
  useSearchParams,
  useRevalidator,
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
import EmbeddedLink from "../components/EmbeddedLink";
import OptimisticUserComment from "../components/OptimisticUserComment";
import MessageForm from "../components/MessageForm";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// date
import { format } from "date-fns";

// constants
import { mobileScreenWidth, tabletScreenWidth } from "../utility";

// export default function TaskDetail() {
export default function TaskDetail({ learning, task, taskComments, user }) {
  ({ user } = !learning ? useAuthContext() : { user });
  console.log("USER", user);
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);
  const loaderData = !learning ? useLoaderData() : {};
  // const { task, taskComments, projectId } = loaderData;
  if (!learning) {
    ({ task, taskComments } = loaderData);
  }
  const { newCommentId, taskDep, searchedTasks, projectId } = loaderData;

  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [messButHover, setMessageButHover] = useState(false);
  const [uploadFileButHover, setUploadFileButHover] = useState(false);
  const [uploadPicButHover, setUploadPicButHover] = useState(false);
  const [inputImages, setInputImages] = useState([]);
  const [inputVideos, setInputVideos] = useState([]);

  const [isSending, setIsSending] = useState(false);
  let [searchParams, setSearchParams] = useSearchParams();

  const revalidator = useRevalidator();
  // get urls as typed:
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
  const isUserTask = user?._id === task?.user._id;

  const { notification } = useNotificationContext();

  // console.log("isNewAt", isNewAt);
  useEffect(() => {
    console.log("in TaskDetail useEffect");
    if (notification) {
      document.getElementById(newCommentId)?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "end",
      });
    }
    // if (comment) {
    //   if (AT_REGEX.test(comment)) {
    //     const totalAts = comment.match(AT_REGEX).length;
    //     const currentTags = comment
    //       .match(TAG_REGEX)
    //       .map((t) => t.split("@")[1] + "@" + t.split("@")[2]);
    //     taggedUsers.current = currentTags;
    //     console.log("currentTags", currentTags);
    //     // console.log("taggedUsers.current", taggedUsers.current);
    //     if (taggedUsers.current.length > 0) {
    //       // if (taggedUsers.current.length > 0) {
    //       const incorrectEmails = taggedUsers.current.filter(
    //         // const incorrectEmails = taggedUsers.current.filter(
    //         (t) => !projectUsersRef.current.includes(t)
    //       );
    //       console.log("incorrectEmails", incorrectEmails);
    //       if (incorrectEmails.length > 0) {
    //         let newComment;
    //         // comment config: klkkdfs @jim@mail.com fdsad @jill@mail.com
    //         for (const incorrectEmail of incorrectEmails) {
    //           console.log("incorrectEmail", incorrectEmail);
    //           newComment = comment
    //             .split(" ")
    //             .filter((w) => {
    //               console.log("w", w);
    //               if (w[0] === "@") {
    //                 w = w.substring(1);
    //                 return w !== incorrectEmail;
    //               } else return true;
    //             })
    //             .join(" ");
    //           console.log("newComment", newComment);
    //         }
    //         setComment(newComment);
    //       }
    //     }
    //     // console.log("totalAts", totalAts);
    //     // console.log("atTotal.current", atTotal.current);
    //     if (totalAts > atTotal.current) {
    //       // console.log("SETTING IS NEW AT");
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
    //           projectUsersRef.current = json;
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
  }, [task, notification, newCommentId]);

  // console.log("!!!!!!projectUsers", projectUsers);

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
          // projectUsers={projectUsers}
          // taggedUsers={taggedUsers}
          // projectUsersRef={projectUsersRef}
          learning={learning}
          //
          // atTotal={atTotal}
        />
      )}
    </div>
  );
}
