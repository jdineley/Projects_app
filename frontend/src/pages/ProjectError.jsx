import { useRouteError, Link } from "react-router-dom";

export default function ProjectError() {
  const error = useRouteError();

  return (
    <div className="project-error">
      <h2>Error</h2>
      <p>{error.message}</p>
      <Link to="/">To Dashboard</Link>
    </div>
  );
}
