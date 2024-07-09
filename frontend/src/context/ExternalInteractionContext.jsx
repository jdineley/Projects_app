import { createContext, useReducer } from "react";

export const ExternalInteractionContext = createContext();

export const externalInteractionReducer = (state, action) => {
  switch (action.type) {
    case "RECEIVING":
      return {
        receiving: true,
      };
    case "RECEIVED":
      return {
        receiving: false,
      };
    default:
      return state;
  }
};

export const ExternalInteractionContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(externalInteractionReducer, {
    receiving: false,
  });

  return (
    <ExternalInteractionContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ExternalInteractionContext.Provider>
  );
};
