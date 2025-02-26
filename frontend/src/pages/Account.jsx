import React from "react";
import { Button, Heading, Text } from "@radix-ui/themes";
import { NavLink, Link, Outlet } from "react-router-dom";

import { FaMicrosoft } from "react-icons/fa";
import { FaArrowTurnDown } from "react-icons/fa6";

const Account = () => {
  return (
    // <div className="flex flex-col gap-4">
    <div data-testid="account-page">
      {/* <Heading mb="2">Create an Account</Heading>
      <Text>Choose you prefered account type:</Text> */}
      <div className="flex gap-3 mb-2">
        <img src="/projects.svg" width="25px" />
        <Text size="2" className="flex items-center">
          Signup / Login are ideal for independent use and to try out Projects
        </Text>
        {/* <FaArrowTurnDown className="self-end" /> */}
      </div>
      <div className="flex align-middle gap-3 mb-5">
        <img src="/projects.svg" width="25px" />
        <Text size="2" className="flex items-center">
          Use your Microsoft Account if you are part of an organisation
        </Text>
        {/* <FaArrowTurnDown className="self-end" /> */}
      </div>
      {/* <hr className="mb-3" color="#e6e6e6" size="1" width="50%" /> */}
      <div className="flex gap-12">
        <NavLink to="/account/signup">
          <Button variant="ghost" color="gray">
            Signup
          </Button>
        </NavLink>
        <NavLink to="/account/login">
          {" "}
          <Button variant="ghost" color="gray">
            Login
          </Button>
        </NavLink>
        <NavLink to="/account/microsoft">
          {" "}
          <Button variant="ghost" color="gray">
            <FaMicrosoft />
            Microsoft Account
          </Button>
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default Account;
