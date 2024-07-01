import { Outlet, useLoaderData, useParams } from "react-router-dom";

export default function TasksDetailLayout() {
  // const { project, projectTasks } = useOutletContext();
  // const { project, projectTasks } = useLoaderData();
  // const { taskId } = useParams();

  // const selectedTask = projectTasks.find((task) => task._id === taskId);
  return (
    <div className="tasks-details-layout">
      {/* <Outlet context={{ project, selectedTask }} /> */}
      <Outlet />
    </div>
  );
}
