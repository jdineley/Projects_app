import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw Error(
      "useNotificationContext must be used within an NotificationContextProvider"
    );
  }

  return context;
};
