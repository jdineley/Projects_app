import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "./useNotificationContext";

// import { ssEvents } from "../context/AuthContext";

export const useLogout = () => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;

  const { user, dispatch: dispatchAuth } = useAuthContext();
  const { dispatch: dispatchNotification } = useNotificationContext();
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
              Authorization: `Bearer ${user.token}`,
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
