import {
  Form,
  useActionData,
  useNavigate,
  useRevalidator,
  useSubmit,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";

import {
  InteractionRequiredAuthError,
  InteractionStatus,
} from "@azure/msal-browser";

import { useIsAuthenticated } from "@azure/msal-react";

import { loginRequest } from "../../authConfig";
import { callMsGraph } from "../../graph";
import { ProfileData } from "../components/ProfileData";

import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "../hooks/useNotificationContext";

import { MSIdentitySignInButton } from "../components/MSIdentitySignInButton";
import MSIdentityLogoutButton from "../components/MSIdentityLogoutButton";

export default function Login() {
  const entraIDSignedIn = useRef(false);
  console.log("entraIDSignedIn.current", entraIDSignedIn.current);
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress, accounts } = useMsal();

  const [error, setError] = useState(null);
  const { user, dispatch } = useAuthContext();
  let json = useActionData();
  console.log("jsonjsonjsonjsonjsonjson", json);
  // let json = null;
  // if (json) entraIDSignedIn.current = true;

  const navigate = useNavigate();

  let revalidator = useRevalidator();

  const { dispatch: notificationDispatch } = useNotificationContext();

  let submit = useSubmit();
  // const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    console.log("in useEffect Login");
    const userLoginErrorMessages = [
      "Both email & password are required",
      "Email does not exist",
      "Incorrect password",
    ];
    // if (!entraIDSignedIn.current || inProgress === InteractionStatus.None) {
    if (!entraIDSignedIn.current && inProgress) {
      // Acquire access tokens
      // make post request to /login
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })
        .then((response) => {
          submit(
            { accessToken: response.accessToken },
            {
              method: "post",
              encType: "application/x-www-form-urlencoded",
            }
          );
          entraIDSignedIn.current = true;
        })
        .catch((error) => {
          if (error instanceof InteractionRequiredAuthError) {
            instance.acquireTokenRedirect(accessTokenRequest);
          }
          console.log(error);
        });
    }
    if (json?._id) {
      const { _id, email, token, accessToken } = json;
      const user = token ? { _id, email, token } : { _id, email, accessToken };
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: "LOGIN",
        payload: user,
      });
      navigate("/dashboard");
    } else if (json && userLoginErrorMessages.includes(json.message)) {
      setError(json.message); //incorrect user credentials??
    } else if (json) {
      throw new Error(json.message);
    }
    if (user) {
      navigate("/dashboard");
    }
  }, [
    json,
    dispatch,
    navigate,
    user,
    notificationDispatch,
    revalidator,
    inProgress,
    // entraIDSignedIn.current,
  ]);

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
      {isAuthenticated ? (
        <>
          <h2>Logged In</h2>
          <MSIdentityLogoutButton />
          <h5 className="card-title">Welcome {accounts[0].name}</h5>
        </>
      ) : (
        <>
          <h2>Not logged in</h2>
          <MSIdentitySignInButton />
        </>
      )}
    </div>
  );
}
