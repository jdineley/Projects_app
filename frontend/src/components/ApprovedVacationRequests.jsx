import {
  Text,
  HoverCard,
  Flex,
  Box,
  Heading,
  Button,
  Badge,
} from "@radix-ui/themes";
import { useFetcher } from "react-router-dom";

import { format } from "date-fns";

const ApprovedVacationRequests = ({ vac, userObj, learning }) => {
  const fetcher = useFetcher();

  return (
    <Text key={vac._id}>
      <HoverCard.Root>
        <Flex
          width="70%"
          justify="between"
          align="center"
          mb="1"
          data-testid="approved-vac"
        >
          <HoverCard.Trigger>
            <p className="cursor-pointer text-blue-600">
              {format(vac.lastWorkDate, "dd/MM/yyyy")}-
              {format(vac.returnToWorkDate, "dd/MM/yyyy")}
            </p>
          </HoverCard.Trigger>
          {/* <fetcher.Form method="POST">
            <input type="hidden" name="vacationId" value={vac._id} />
            <Button name="intent" value="delete-vacation">
              Del.
            </Button>
          </fetcher.Form> */}
          <Button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete vacation?")) {
                fetcher.submit(
                  {
                    vacationId: vac._id,
                    intent: "delete-vacation",
                  },
                  { method: "post" }
                );
              }
            }}
            disabled={fetcher.state === "submitting" ? true : false || learning}
          >
            Del.
          </Button>
        </Flex>
        <HoverCard.Content
          maxWidth="300px"
          data-testid="approved-vac-req-hover"
        >
          <Flex gap="4">
            <Box>
              <Heading size="3" as="h3" mb="1">
                Vacation request summary{" "}
                <small data-testid="vac-id">{vac._id}</small>:
              </Heading>
              {userObj.userInProjects
                .filter((proj) => !proj.archived)
                .map((proj) => {
                  if (proj.vacationRequests.includes(vac._id)) {
                    return (
                      <Box key={proj._id} data-testid="pm-vac-decision">
                        <Heading size="1" as="h4" mb="1">
                          {proj.title}(PM:{proj.owner.email})
                        </Heading>
                        {vac.approvals[proj._id] &&
                          vac.approvals[proj._id].accepted === "true" && (
                            <Badge>Accepted</Badge>
                          )}
                      </Box>
                    );
                  }
                })}
            </Box>
          </Flex>
        </HoverCard.Content>
      </HoverCard.Root>{" "}
    </Text>
  );
};

export default ApprovedVacationRequests;
