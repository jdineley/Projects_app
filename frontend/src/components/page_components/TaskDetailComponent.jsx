import TaskDetail from "../../pages/TaskDetail";

import React from "react";

const TaskDetailComponent = ({ learning, task, taskComments, user }) => {
  return (
    <TaskDetail
      learning={learning}
      task={task}
      taskComments={taskComments}
      user={user}
    />
  );
};

export default TaskDetailComponent;
