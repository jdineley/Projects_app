import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "../hooks/useNotificationContext";

// components
import UserActiveTaskRow from "./UserActiveTaskRow";

export default function UserActiveTasks({
  // projectTasks,
  userTasks,
  setError,
  newTaskId,
  setPercentCompleteChanged,
  percentChangeButtonsRef,
  addPercentButtons,
}) {
  // const { user } = useAuthContext();

  const { notification } = useNotificationContext();

  // const userTasks = user
  //   ? projectTasks.filter((task) => task.user.email === user.email)
  //   : [];

  const userTableRows = userTasks.map((task) => {
    if (!task.completed) {
      return (
        <UserActiveTaskRow
          key={task._id}
          task={task}
          setError={setError}
          newTaskId={newTaskId}
          notification={notification}
          setPercentCompleteChanged={setPercentCompleteChanged}
          percentChangeButtonsRef={percentChangeButtonsRef}
          addPercentButtons={addPercentButtons}
        />
      );
    }
  });

  return userTableRows;
}
