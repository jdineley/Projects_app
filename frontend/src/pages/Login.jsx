import {
  Form,
  useActionData,
  useNavigate,
  useRevalidator,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "../hooks/useNotificationContext";

export default function Login() {
  const [error, setError] = useState(null);
  const { user, dispatch } = useAuthContext();
  let json = useActionData();
  const navigate = useNavigate();

  let revalidator = useRevalidator();

  const { dispatch: notificationDispatch } = useNotificationContext();

  useEffect(() => {
    const userLoginErrorMessages = [
      "Both email & password are required",
      "Email does not exist",
      "Incorrect password",
    ];
    if (json?._id) {
      const { _id, email, token } = json;
      localStorage.setItem("user", JSON.stringify({ _id, email, token }));
      dispatch({
        type: "LOGIN",
        payload: { _id, email, token },
      });
      return navigate("/dashboard");
    } else if (json && userLoginErrorMessages.includes(json.message)) {
      setError(json.message); //incorrect user credentials??
    } else if (json) {
      throw new Error(json.message);
    }
    if (user) {
      navigate("/dashboard");
    }
  }, [json, dispatch, navigate, user, notificationDispatch, revalidator]);

  return (
    <div className="login">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <Form method="POST">
        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            id="email"
            onChange={() => setError(null)}
            required
          />
        </label>
        <label htmlFor="password">
          Password
          <input
            type="password"
            id="password"
            name="password"
            onChange={() => setError(null)}
            required
          />
        </label>
        <button>Submit</button>
      </Form>
    </div>
  );
}
