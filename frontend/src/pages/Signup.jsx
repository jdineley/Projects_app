import { Form, useActionData, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import validator from "validator";

import {
  Button,
  DropdownMenu,
  Flex,
  Avatar,
  Text,
  Heading,
} from "@radix-ui/themes";

export default function Signup() {
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [emailVerify, setEmailVerify] = useState("");

  // console.log(passwordError);

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
      navigate("/");
    } else if (json && userLoginErrorMessages.includes(json.error?.message)) {
      setError(json.error.message);
    } else if (
      json?.message ===
      "Email verification required. Go to your inbox to complete the verification. Please check your spam folder"
    ) {
      setEmailVerify(json.message);
    } else if (json) {
      throw new Response("", {
        status: 404,
        statusText: json.message,
      });
    }
    // console.log("bar");
  }, [json, dispatch, navigate, password, confirmPassword]);

  return (
    <div className="signup mt-6">
      {/* <Heading>Sign up</Heading> */}
      <Text>
        Your account will require verification. Check your email inbox for a
        welcome email and click the verification link to activate your account.
      </Text>
      <br />
      {emailVerify && <Text color="red">{emailVerify}</Text>}
      {error && <div className="error">{error}</div>}
      <Form method="POST">
        <label htmlFor="email">
          Email:
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

          // className="mb-1"
        >
          Password:
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
        <label htmlFor="confirm-password">
          Confirm Password:
          <input
            type="password"
            id="confirm-password"
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
          *password must be at least 8 characters including at least 1
          lowercase, 1 uppercase, 1 number and 1 symbol
        </p>
      </Form>
    </div>
  );
}
