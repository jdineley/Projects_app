import { Outlet } from "react-router-dom";

export default function TasksLayout() {
  // const { project, projectTasks } = useOutletContext();
  return (
    <div className="tasks-layout">
      {/* <Outlet context={{ project, projectTasks }} /> */}
      <Outlet />
    </div>
  );
}
