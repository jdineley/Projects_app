import { useRouteError, Link } from "react-router-dom";

export default function SignupError() {
  const error = useRouteError();

  return (
    <div className="signup-error">
      <h2>Error</h2>
      <p>{error.message}</p>
      <Link to="/">To Dashboard</Link>
    </div>
  );
}
