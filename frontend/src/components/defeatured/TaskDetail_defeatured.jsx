import { useLoaderData, Form, useFetcher } from "react-router-dom";
// import { useAuthContext } from "../hooks/useAuthContext";
import UserComment from "../UserComment";
import { useState, useEffect } from "react";
// import { useNotificationContext } from "../hooks/useNotificationContext";

import { Table, Box, Flex, Card, Text } from "@radix-ui/themes";

// components
import TaskPercentageCompleteGUI from "../TaskPercentageCompleteGUI";
import UserActiveTaskRow from "../UserActiveTaskRow";
import TaskEditDialog from "../TaskEditDialog";
import MessageForm from "../MessageForm";

// hooks
import useMatchMedia from "../../hooks/useMatchMedia";

// date
import { format } from "date-fns";

// constants
import { mobileScreenWidth, tabletScreenWidth } from "../../utility";

export default function TaskDetail_defeatured({ task, taskComments, user }) {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);

  // const { task, taskComments, newCommentId, taskDep, searchedTasks } =
  //   useLoaderData();
  // const { user } = useAuthContext();
  const [isCommenting, setIsCommenting] = useState(false);

  const isUserTask = user._id === task?.user._id;

  // const { notification } = useNotificationContext();

  // const fetcher = useFetcher();
  // console.log(fetcher.formAction);

  // console.log(task);

  useEffect(() => {
    // setIsCommenting(false);
    // if (notification) {
    //   document.getElementById(newCommentId)?.scrollIntoView({
    //     behavior: "smooth",
    //     block: "end",
    //     inline: "nearest",
    //   });
    // }
    if (isCommenting) {
      document.getElementById("taskCommentText").scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [isCommenting]);

  async function handleAddComment() {
    setIsCommenting(true);
  }

  return (
    <>
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
        {/* {isUserTask && ( */}
        <TaskEditDialog
          task={task}
          // searchedTasks={searchedTasks}
          // taskDep={taskDep}
          taskDetail={true}
          learning={true}
        />
        {/* )} */}
      </Flex>
      <Flex direction="column" gap="2" mb="4">
        {!task?.archived && (
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
                    {/* <Table.ColumnHeaderCell>Edit</Table.ColumnHeaderCell> */}
                  </>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <UserActiveTaskRow
                taskDetail={true}
                task={task}
                // searchedTasks={searchedTasks}
                // taskDep={taskDep}
                isTabletResolution={isTabletResolution}
                isMobileResolution={isMobileResolution}
                user={user}
                learning={true}
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
      <div className="task-comments mb-2">
        <div className="task-detail-button-collector">
          <h3>Comments..</h3>
          {!task?.archived && (
            <button onClick={handleAddComment}>Add comment...</button>
          )}
        </div>
      </div>
      {taskComments?.map((comment) => (
        <UserComment
          key={comment._id}
          comment={comment}
          learning={true}
          // newCommentId={newCommentId}
        />
      ))}
      {isCommenting && (
        // <MessageForm />
        <div className="add-task-comment-form">
          <textarea
            id="taskCommentText"
            rows="8"
            placeholder={`${user.email} add new comment...`}
            name="comment"
            required
          ></textarea>
          <div className="comment-action-buttons">
            <button
              onClick={() => {
                setIsCommenting(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" name="intent" value="task-comment">
              Submit comment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
