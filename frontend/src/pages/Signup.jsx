import { Form, useActionData, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

export default function Signup() {
  const [error, setError] = useState(null);

  const { dispatch } = useAuthContext();
  const json = useActionData();
  console.log("signup json:", json);
  const navigate = useNavigate();

  useEffect(() => {
    const userLoginErrorMessages = [
      "Both email & password are required",
      "Email provided is not valid",
      "Password not strong enough",
      "Email already in use",
    ];
    if (json && json.user) {
      localStorage.setItem("user", JSON.stringify(json.user));
      dispatch({
        type: "LOGIN",
        payload: json.user,
      });
      return navigate("/");
    } else if (json && userLoginErrorMessages.includes(json.message)) {
      setError(json.message);
    } else if (json) {
      throw new Response("", {
        status: 404,
        statusText: json.message,
      });
    }
    console.log("bar");
  }, [json, dispatch, navigate]);

  return (
    <div className="login">
      <h2>Sign up</h2>
      {error && <div className="error">{error}</div>}
      <Form method="POST">
        <label htmlFor="email">
          Email
          <input type="email" name="email" id="email" required />
        </label>
        <label htmlFor="password" name="password" id="password">
          Password
          <input type="password" id="password" name="password" required />
        </label>
        <button>Submit</button>
      </Form>
    </div>
  );
}
