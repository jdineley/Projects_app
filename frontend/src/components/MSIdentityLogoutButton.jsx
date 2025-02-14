import { useMsal } from "@azure/msal-react";

import { DropdownMenu, Button } from "@radix-ui/themes";

const MSIdentityLogoutButton = () => {
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

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft">
          MS sign out
          {/* <DropdownMenu.TriggerIcon /> */}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => handleLogout("popup")}>
          Sign out using Popup
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => handleLogout("redirect")}>
          Sign out using Redirect
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default MSIdentityLogoutButton;
