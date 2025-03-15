import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";

import { DropdownMenu, Button } from "@radix-ui/themes";

import { FaMicrosoft } from "react-icons/fa";

export const MSIdentitySignInButton = () => {
  const { instance } = useMsal();

  const handleLogin = (loginType) => {
    if (loginType === "popup") {
      instance.loginPopup(loginRequest).catch((e) => {
        console.log(e);
      });
    } else if (loginType === "redirect") {
      instance.loginRedirect(loginRequest).catch((e) => {
        console.log(e);
      });
    }
  };
  return (
    <Button variant="soft" onClick={() => handleLogin("redirect")}>
      <FaMicrosoft />
      MS sign in
    </Button>
  );
};
