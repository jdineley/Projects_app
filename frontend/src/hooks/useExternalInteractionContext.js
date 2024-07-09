import { useContext } from "react";
import { ExternalInteractionContext } from "../context/ExternalInteractionContext";

export const useExternalInteractionContext = () => {
  const context = useContext(ExternalInteractionContext);

  if (!context) {
    throw Error("useNotificationContext must be used within a ContextProvider");
  }

  return context;
};
