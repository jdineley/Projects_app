import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "@radix-ui/themes/styles.css";
import "./index.css";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { NotificationContextProvider } from "./context/NotificationContext.jsx";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <NotificationContextProvider>
    <AuthContextProvider>
      <Theme accentColor="mint">
        <App />
        <ToastContainer />
      </Theme>
    </AuthContextProvider>
  </NotificationContextProvider>
  // </React.StrictMode>
);
