import { Outlet } from "react-router-dom";

export default function ProjectDetailLayout() {
  // const { project, projectTasks } = useLoaderData();
  return (
    <div className="project-detail-layout">
      {/* <Outlet context={{ project, projectTasks }} /> */}
      <Outlet />
    </div>
  );
}
