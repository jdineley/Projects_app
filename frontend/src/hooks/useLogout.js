import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "./useNotificationContext";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

// import { ssEvents } from "../context/AuthContext";

export const useLogout = () => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const navigate = useNavigate();
  const { user, dispatch: dispatchAuth } = useAuthContext();
  const token = user?.token ? user?.token : user?.accessToken;
  const { dispatch: dispatchNotification } = useNotificationContext();

  const { instance } = useMsal();

  const handleLogout = (logoutType) => {
    if (logoutType === "popup") {
      instance.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/",
      });
    } else if (logoutType === "redirect") {
      instance.logoutRedirect({
        postLogoutRedirectUri: "/",
      });
    }
  };
  // const ssEvents = new EventSource("http://localhost:4000/api/v1/stream");
  const logout = async () => {
    // remove user from storage
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        const response = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/users/logout`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          console.log("in logout");
          localStorage.removeItem("user");
          // dispatch logout action
          dispatchAuth({
            type: "LOGOUT",
          });
          dispatchNotification({
            type: "CLEAR_NOTIFICATIONS",
          });
          navigate(0);
          handleLogout("redirect");
          // ssEvents.close();
          // console.log("connection closed");
        } else {
          throw Error();
        }
      } catch (error) {
        throw Error("could not logout");
      }
    }
  };

  return { logout };
};
