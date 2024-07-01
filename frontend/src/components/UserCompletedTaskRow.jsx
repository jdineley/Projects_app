import { useFetcher } from "react-router-dom";

import moment from "moment";

// radix
import { Table } from "@radix-ui/themes";

export const UserCompletedTaskRow = ({ task }) => {
  const fetcher = useFetcher();

  return (
    <Table.Row key={task._id}>
      <Table.Cell>{task.title}</Table.Cell>
      <Table.Cell>{task.description}</Table.Cell>
      <Table.Cell>
        {moment(task.deadline).utc().format("YYYY-MM-DD")}
      </Table.Cell>
      <Table.Cell>
        <fetcher.Form method="POST">
          <input type="hidden" name="completed" value={false} />
          <input type="hidden" name="taskId" value={task._id} />
          <button
            name="intent"
            // value="toggle-task-complete"
            value="edit-task"
            className={`revert-complete ${
              fetcher.state !== "idle" && "submitting"
            } `}
          ></button>
        </fetcher.Form>
      </Table.Cell>
    </Table.Row>
  );
};

export default UserCompletedTaskRow;
