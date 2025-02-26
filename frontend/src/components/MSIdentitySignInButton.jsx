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
      {/* <DropdownMenu.TriggerIcon /> */}
    </Button>
    // <DropdownMenu.Root>
    //   <DropdownMenu.Trigger>
    //     <Button variant="soft">
    //       MS sign in
    //       {/* <DropdownMenu.TriggerIcon /> */}
    //     </Button>
    //   </DropdownMenu.Trigger>
    //   <DropdownMenu.Content>
    //     <DropdownMenu.Item onClick={() => handleLogin("popup")}>
    //       Sign in using Popup
    //     </DropdownMenu.Item>
    //     <DropdownMenu.Item onClick={() => handleLogin("redirect")}>
    //       Sign in using Redirect
    //     </DropdownMenu.Item>
    //   </DropdownMenu.Content>
    // </DropdownMenu.Root>
  );
};
