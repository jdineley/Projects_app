import { Form, useActionData, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import validator from "validator";

export default function Signup() {
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  console.log(passwordError);

  const { dispatch } = useAuthContext();
  const json = useActionData();
  // console.log("signup json:", json);
  const navigate = useNavigate();

  useEffect(() => {
    if (password.length > 7 && !validator.isStrongPassword(password)) {
      setPasswordError(true);
    } else if (validator.isStrongPassword(password)) {
      setPasswordError(false);
    } else setPasswordError(null);

    if (confirmPassword.length < 8) setConfirmPasswordError(null);
    else if (confirmPassword === password) {
      setConfirmPasswordError(false);
    } else setConfirmPasswordError(true);

    if (email.length > 0 && !validator.isEmail(email)) {
      setEmailError(true);
    } else if (validator.isEmail(email)) {
      setEmailError(false);
    } else setEmailError(null);

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
  }, [json, dispatch, navigate, password, confirmPassword]);

  return (
    <div className="login">
      <h2>Sign up</h2>
      {error && <div className="error">{error}</div>}
      <Form method="POST">
        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label
          htmlFor="password"
          name="password"
          id="password"
          // className="mb-1"
        >
          Password
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className={!passwordError ? "text-lime-500" : "text-rose-400"}>
            {passwordError
              ? "Not strong enough"
              : passwordError !== null
              ? "Strong enough"
              : ""}
          </p>
        </label>
        <label htmlFor="password" name="password" id="password">
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <p
            className={
              !confirmPasswordError ? "text-lime-500" : "text-rose-400"
            }
          >
            {confirmPasswordError
              ? "Doesn't match"
              : confirmPasswordError !== null
              ? "Match"
              : ""}
          </p>
        </label>
        <button
          disabled={
            emailError ||
            emailError === null ||
            passwordError ||
            passwordError === null ||
            confirmPasswordError ||
            confirmPasswordError === null
              ? true
              : false
          }
        >
          Submit
        </button>
        <p className="text-rose-400">
          *password must be at least 8 charactures including at least 1
          lowercase, 1 uppercase, 1 number and 1 symbol
        </p>
      </Form>
    </div>
  );
}
