import {
  Form,
  useActionData,
  useNavigate,
  useRevalidator,
  useSubmit,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button, DropdownMenu, Flex, Avatar, Text } from "@radix-ui/themes";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsObject = Object.fromEntries(searchParams);

  console.log("searchParamsObject", searchParamsObject);
  const entraIDSignedIn = useRef(false);
  console.log("entraIDSignedIn.current", entraIDSignedIn.current);
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress, accounts } = useMsal();

  const [error, setError] = useState(null);
  const [emailVerify, setEmailVerify] = useState("");
  const { user, dispatch } = useAuthContext();
  let json = useActionData();
  // console.log("jsonjsonjsonjsonjsonjson", json);
  // let json = null;
  // if (json) entraIDSignedIn.current = true;

  const navigate = useNavigate();

  let revalidator = useRevalidator();

  const { dispatch: notificationDispatch } = useNotificationContext();

  let submit = useSubmit();
  // const [graphData, setGraphData] = useState(null);

  const location = useLocation();

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
      const { _id, email, token, accessToken, isGlobalAdmin, isTenantAdmin } =
        json;
      const user = token
        ? { _id, email, isGlobalAdmin, isTenantAdmin, token }
        : { _id, email, isGlobalAdmin, isTenantAdmin, accessToken };
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: "LOGIN",
        payload: user,
      });
      navigate("/dashboard");
    } else if (json && userLoginErrorMessages.includes(json.message)) {
      setError(json.message); //incorrect user credentials??
    } else if (
      json?.message ===
      "Email verification required. Go to your inbox to complete the verification. Please check your spam folder"
    ) {
      setEmailVerify(json.message);
    } else if (json) {
      throw new Error(json.message);
    }
    if (searchParamsObject.email === "verified") {
      setEmailVerify("Your email address has been verified, please login.");
    }
    if (searchParamsObject.email === "notVerified") {
      setEmailVerify(
        "Something went wrong verifying your email, please try again. If the problem persists please contact projects"
      );
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
    searchParams,
    // entraIDSignedIn.current,
  ]);

  return (
    <>
      {location.pathname === "/account/login" ? (
        <div className="login mt-6">
          {/* <h2>Login</h2> */}
          {error && <div className="error">{error}</div>}
          {emailVerify && <Text color="orange">{emailVerify}</Text>}
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
      ) : (
        <div className="mt-6 flex gap-4">
          <Text size="3" className="flex items-center">
            Login with your personal, education or work Microsoft account:
          </Text>
          <MSIdentitySignInButton />
        </div>
      )}
    </>
  );
}
