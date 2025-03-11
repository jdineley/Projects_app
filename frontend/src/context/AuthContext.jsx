import { createContext, useReducer, useEffect } from "react";
import { useNotificationContext } from "../hooks/useNotificationContext";

import { toast } from "react-toastify";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload,
      };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

let ssEvents;

export const AuthContextProvider = ({ children }) => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  // primitive variable to trigger effect when there is a new login
  const currentUserId = state.user?._id || null;

  const { dispatch: notificationDispatch } = useNotificationContext();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (!currentUserId) {
        dispatch({
          type: "LOGIN",
          payload: user,
        });
      }

      ssEvents = new EventSource(`${VITE_REACT_APP_API_URL}/api/v1/stream`);

      ssEvents.addEventListener(`new-task-notification${user._id}`, (e) => {
        console.log("in notification dispatch");
        notificationDispatch({
          type: "NEW_NOTIFICATION",
          payload: {
            url: e.data,
          },
        });
        toast("New task notification");
        // updateUser(user, e.data, "task");
      });
      ssEvents.addEventListener(`new-comment-notification${user._id}`, (e) => {
        console.log("in notification dispatch");
        notificationDispatch({
          type: "NEW_NOTIFICATION",
          payload: {
            url: e.data,
          },
        });
        toast("New comment notification");
        // updateUser(user, e.data, "comment");
      });
      ssEvents.addEventListener(`new-reply-notification${user._id}`, (e) => {
        console.log("in notification dispatch new-reply-notification");
        notificationDispatch({
          type: "NEW_NOTIFICATION",
          payload: {
            url: e.data,
          },
        });
        toast("Comment reply notification");
        // updateUser(user, e.data, "reply");
      });
      ssEvents.addEventListener(`new-vacation-notification${user._id}`, (e) => {
        console.log("in notification dispatch");
        notificationDispatch({
          type: "NEW_NOTIFICATION",
          payload: {
            url: e.data,
          },
        });
        toast(`New vacation request notification`);
        // updateUser(user, e.data, "vacation");
      });
      ssEvents.addEventListener(
        `vacation-accepted-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`Vacation accepted notification`);
          // updateUser(user, e.data, "vacation-accepted");
        }
      );
      ssEvents.addEventListener(
        `vacation-rejected-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`Vacation rejected notification`);
          // updateUser(user, e.data, "vacation-rejected");
        }
      );
      ssEvents.addEventListener(
        `vacation-approved-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`Vacation approved notification`);
          // updateUser(user, e.data, "vacation-approved");
        }
      );
      ssEvents.addEventListener(
        `vacation-deleted-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`Vacation deleted notification`);
          // updateUser(user, e.data, "vacation-deleted");
        }
      );
      ssEvents.addEventListener(
        `new-reviewAction-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`New review action notification`);
          // updateUser(user, e.data, "new-reviewAction");
        }
      );
      ssEvents.addEventListener(
        `removed-reviewAction-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`Removed review action notification`);
          // updateUser(user, e.data, "removed-reviewAction");
        }
      );
      ssEvents.addEventListener(`ms-project-resync${user._id}`, (e) => {
        console.log("in notification dispatch");
        notificationDispatch({
          type: "NEW_NOTIFICATION",
          payload: {
            url: e.data,
          },
        });
        toast(`MS Project Resynchronisation of ....`);
        // toast(
        //   `MS Project Resynchronisation of ${
        //     e.data[
        //       e.data.split(new RegExp("?|=|&", "g").indexOf("projectTitle")) + 1
        //     ]
        //   }`
        // );
      });
      ssEvents.addEventListener(
        `project-freeze-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`${e.data.split("=")[1]}`);
        }
      );
      ssEvents.addEventListener(
        `project-unfreeze-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`${e.data.split("=")[1]}`);
        }
      );
      ssEvents.addEventListener(`task-owner-change${user._id}`, (e) => {
        console.log("in notification dispatch");
        notificationDispatch({
          type: "NEW_NOTIFICATION",
          payload: {
            url: e.data,
          },
        });
        toast(`task-owner-change`);
      });
      ssEvents.addEventListener(`new-ticket-notification${user._id}`, (e) => {
        console.log("in notification dispatch");
        notificationDispatch({
          type: "NEW_NOTIFICATION",
          payload: {
            url: e.data,
          },
        });
        toast(`new-ticket-received`);
      });
      ssEvents.addEventListener(
        `ticket-update-notification${user._id}`,
        (e) => {
          console.log("in notification dispatch");
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url: e.data,
            },
          });
          toast(`ticket-update`);
        }
      );
      ssEvents.addEventListener("open", () => {
        console.log("Connection opened");
      });
    } else {
      if (ssEvents) {
        ssEvents.close();
      }
    }

    return () => {
      if (ssEvents) {
        ssEvents.close();
      }
    };
  }, [notificationDispatch, currentUserId]);

  console.log("AuthContext state: ", state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
