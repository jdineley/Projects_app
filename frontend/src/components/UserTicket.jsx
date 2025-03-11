// import { useLoaderData } from "react-router-dom";
import { useState } from "react";
import UserComment from "./UserComment";

import { useNotificationContext } from "../hooks/useNotificationContext";

import { Text, RadioGroup } from "@radix-ui/themes";
// import * as RadioGroup from "@radix-ui/react-radio-group";

const UserTicket = ({ ticket, user, revalidator, ticketId }) => {
  // console.log("user", user);
  // console.log("ticket", ticket);
  // console.log("user?.email", user?.email);
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const { notification } = useNotificationContext();

  const token = user?.token ? user?.token : user?.accessToken;

  const [status, setStatus] = useState(ticket.status);

  function handleStatusChange(val) {
    fetch(`${VITE_REACT_APP_API_URL}/api/v1/tickets/${ticket._id}`, {
      method: "PATCH",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: val }),
    })
      .then((res) => {
        setStatus(val);
        revalidator.revalidate();
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  return (
    <div
      style={{
        // border: "grey solid 0.5px",
        borderRadius: "5px",
        padding: "4px",
        marginBlockStart: "4px",
      }}
      className={`${
        ticket._id === ticketId && notification ? "ticket-change" : ""
      } `}
    >
      <Text size="1">ticket#{ticket.ticketNumber}</Text>
      <UserComment ticket={ticket} />
      <RadioGroup.Root
        className="RadioGroupRoot flex gap-2"
        defaultValue="open"
        value={status}
        aria-label="View density"
        onValueChange={(val) => {
          // setStatus(val);
          handleStatusChange(val);
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <RadioGroup.Item
            size="1"
            className="RadioGroupItem"
            value="open"
            id="r1"
          >
            <RadioGroup.Indicator className="RadioGroupIndicator" />
          </RadioGroup.Item>
          <label className="Label" htmlFor="r1">
            Open
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <RadioGroup.Item className="RadioGroupItem" value="closed" id="r2">
            <RadioGroup.Indicator className="RadioGroupIndicator" />
          </RadioGroup.Item>
          <label className="Label" htmlFor="r2">
            Closed
          </label>
        </div>
        {ticket.type === "feature" && user?.isGlobalAdmin && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <RadioGroup.Item className="RadioGroupItem" value="future" id="r3">
              <RadioGroup.Indicator className="RadioGroupIndicator" />
            </RadioGroup.Item>
            <label className="Label" htmlFor="r3">
              Future
            </label>
          </div>
        )}
      </RadioGroup.Root>
    </div>
  );
};

export default UserTicket;
