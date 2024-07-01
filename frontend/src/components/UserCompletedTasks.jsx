import { useAuthContext } from "../hooks/useAuthContext";

// components
import UserCompletedTaskRow from "./UserCompletedTaskRow";

// radix

// icons

export default function UserCompletedTasks({ projectTasks }) {
  const { user } = useAuthContext();

  const userTasks = user
    ? projectTasks.filter((task) => task.user.email === user.email)
    : [];

  const userTableRows = userTasks.map((task) => {
    if (task.completed) {
      return <UserCompletedTaskRow key={task._id} task={task} />;
    }
  });

  return userTableRows;
}
