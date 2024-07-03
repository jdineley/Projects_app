import { Dialog, Button, Flex, Text, RadioGroup } from "@radix-ui/themes";

import { useEffect, useState, useRef } from "react";

import { useFetcher, useSubmit } from "react-router-dom";

import { format } from "date-fns";

const VacationRequestDialog = ({ vac, project, rejected }) => {
  const [vacationAccepted, setVacationAccepted] = useState(null);
  const [reasonForRejection, setResonForRejection] = useState(null);

  const [isRejectedComment, setIsRejectedComment] = useState(false);

  const fetcher = useFetcher();
  const submit = useSubmit();

  const approveVactionRef = useRef(null);

  useEffect(() => {
    if (!rejected) {
      const vacBarDivs = document.querySelectorAll(`[id='${vac._id}']`);
      const vacBarButs = document.querySelectorAll(`[id='${vac._id}but']`);
      vacBarButs.forEach((but, i) => {
        but.style.width = vacBarDivs[i].offsetWidth + "px";
      });
    }
  }, [vac._id, rejected]);

  return (
    <>
      <fetcher.Form method="POST" style={{ display: "none" }}>
        <input type="hidden" name="projectId" value={project._id} />
        <input type="hidden" name="vacationAccepted" value={vacationAccepted} />
        <input
          type="hidden"
          name="reasonForRejection"
          value={reasonForRejection}
        />
        <input type="hidden" name="vacationId" value={vac._id} />
        <input type="hidden" name="vacationApproval" value={true} />

        <button
          ref={approveVactionRef}
          type="submit"
          name="intent"
          value="approve-vacation"
        ></button>
      </fetcher.Form>
      <Dialog.Root>
        <Dialog.Trigger>
          {rejected ? (
            <Flex className="cursor-pointer text-blue-600">
              {" "}
              {vac.user.email}
              {": "}
              {
                <small className="cursor-pointer text-blue-600">
                  {format(vac.lastWorkDate, "MM/dd/yyyy")}-
                  {format(vac.returnToWorkDate, "MM/dd/yyyy")}
                </small>
              }
            </Flex>
          ) : (
            <button
              style={{
                backgroundColor: "transparent",
                position: "relative",
                top: "-8px",
                height: "10px",
                padding: "0px",
                borderRadius: "0px",
              }}
              id={`${vac._id}but`}
            ></button>
          )}
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <Dialog.Title mb="0">
            Vacation request from: {vac.user.email}{" "}
          </Dialog.Title>
          <Text>
            ({format(vac.lastWorkDate, "dd/MM/yyyy")}-
            {format(vac.returnToWorkDate, "dd/MM/yyyy")})
          </Text>
          <Dialog.Description size="2" my="2">
            Choose whether to accept or reject the vaction request:
          </Dialog.Description>
          <RadioGroup.Root
            className="RadioGroupRoot"
            aria-label="View density"
            onValueChange={(value) => {
              console.log(value);
              setVacationAccepted(value);
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <RadioGroup.Item
                className="RadioGroupItem"
                value={true}
                id="r1"
              />
              <label className="Label" htmlFor="r1" style={{ margin: "0px" }}>
                Accept
              </label>
            </div>
            {!rejected && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <RadioGroup.Item
                  className="RadioGroupItem"
                  value={false}
                  id="r2"
                />
                <label className="Label" htmlFor="r2" style={{ margin: "0px" }}>
                  Reject
                </label>
              </div>
            )}
          </RadioGroup.Root>
          {vacationAccepted === false && (
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Reason for rejection
              </Text>
              <input
                type="string"
                value={reasonForRejection}
                onChange={(e) => {
                  setResonForRejection(e.target.value);
                  setIsRejectedComment(true);
                }}
              />
            </label>
          )}
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button
                variant="soft"
                color="gray"
                onClick={() => {
                  setVacationAccepted(null);
                  setResonForRejection("");
                }}
              >
                Cancel
              </Button>
            </Dialog.Close>
            {(vacationAccepted || isRejectedComment) && (
              <Dialog.Close>
                <Button
                  onClick={() => {
                    console.log("clicked");
                    submit(approveVactionRef.current);
                    setVacationAccepted(null);
                    setResonForRejection("");
                  }}
                >
                  Save
                </Button>
              </Dialog.Close>
            )}
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default VacationRequestDialog;
