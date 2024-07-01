import { createContext, useReducer } from "react";

export const NotificationContext = createContext();

export const notificationReducer = (state, action) => {
  switch (action.type) {
    case "NEW_NOTIFICATION":
      return {
        notification: true,
        urls: [...state.urls, action.payload.url].filter(
          (url, i, arr) => arr.indexOf(url) === i
        ),
      };
    case "CLEAR_NOTIFICATION":
      return {
        notification: state.urls.length > 1,
        urls: state.urls.filter((url) => url !== action.payload.url),
      };
    case "CLEAR_NOTIFICATIONS":
      return {
        notification: false,
        urls: [],
      };
    default:
      return state;
  }
};

export const NotificationContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notification: false,
    urls: [],
  });

  console.log("notification:", state);

  return (
    <NotificationContext.Provider value={{ ...state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};
