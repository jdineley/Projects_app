import { Link } from "react-router-dom";

import { useState } from "react";

import { useAuthContext } from "../hooks/useAuthContext";

// components
import VacationRequestDialog from "./VacationRequestDialog";

//icons

import {
  Box,
  Flex,
  Text,
  HoverCard,
  Link as RadixLink,
  Heading,
  Badge,
  Switch,
} from "@radix-ui/themes";

import {
  currentDatePercentBetweenDates,
  createMonthScaleArray,
  datePercentBetweenDates,
  percentOfTotalTime,
} from "../utility";

import {
  formatDistanceToNow,
  format,
  isBefore,
  intervalToDuration,
} from "date-fns";

const ProjectTimeline = ({ project, dashCardElement, userProfile }) => {
  const [showApprovedVacs, setShowApprovedVacs] = useState(false);

  const { user } = useAuthContext();

  const projectDurationComposed = intervalToDuration({
    start: new Date(project?.start),
    end: new Date(project?.end),
  });
  const { years, months, days } = projectDurationComposed;
  let projectDurationString = "";
  if (years === 1) projectDurationString += `${years} year `;
  if (years > 1) projectDurationString += `${years} years `;
  if (months === 1) projectDurationString += `${months} month `;
  if (months > 1) projectDurationString += `${months} months `;
  if (days === 1) projectDurationString += `${days} day`;
  if (days > 1) projectDurationString += `${days} days`;

  // refactor to stick users on a project with the same color wether, pending, approved or rejected
  const themeColors = [
    "brown",
    "tomato",
    "purple",
    "blue",
    "green",
    "sky",
    "amber",
    "pink",
    "lime",
    "teal",
    "cyan",
    "iris",
  ];

  function getProjectUserColorIndex(userId) {
    let userColorIndex = project.users.map((user) => user._id).indexOf(userId);

    userColorIndex = userColorIndex % themeColors.length;

    return userColorIndex;
  }

  let pendingVacationRequestsUiObjs = [];
  let approvedVacationRequestsUiObjs = [];
  project?.vacationRequests.forEach((vacReq) => {
    if (vacReq.status === "pending") {
      if (
        pendingVacationRequestsUiObjs.some((el) => el.user === vacReq.user._id)
      ) {
        return;
      }
      pendingVacationRequestsUiObjs.push({
        user: vacReq.user._id,
        color: themeColors[getProjectUserColorIndex(vacReq.user._id)],
      });
    } else if (vacReq.status === "approved") {
      if (
        approvedVacationRequestsUiObjs.some((el) => el.user === vacReq.user._id)
      ) {
        return;
      }
      approvedVacationRequestsUiObjs.push({
        user: vacReq.user._id,
        color: themeColors[getProjectUserColorIndex(vacReq.user._id)],
      });
    }
  });

  const approvedVacationRequests = project?.vacationRequests.filter(
    (vac) => vac.status === "approved"
  );
  const pendingVacationRequests = project?.vacationRequests.filter(
    (vac) => vac.status === "pending"
  );
  const rejectedVacationRequests = project?.vacationRequests?.filter(
    (vac) => vac.status === "rejected"
  );

  return (
    <Box
      className={`project-timeline ${
        dashCardElement ? "dash-card-element" : ""
      }`}
    >
      <Flex direction="column">
        <Text className="project-timeline-header" size="1">
          Project Timeline ({projectDurationString})
        </Text>

        <Flex justify="between" mb="1">
          <Flex gap="2" align="center">
            <Switch
              size="1"
              onClick={(e) => {
                if (e.target.dataset.state === "unchecked") {
                  setShowApprovedVacs(true);
                } else {
                  setShowApprovedVacs(false);
                }
              }}
            />
            <Text>Show approved vacations</Text>
          </Flex>
          {rejectedVacationRequests?.length > 0 &&
            userProfile &&
            project.owner._id === user._id && (
              <Flex direction="column" position="relative" className="dropdown">
                <button>See all rejected vacations</button>
                <div className="dropdown-options">
                  {rejectedVacationRequests?.map((vac) => {
                    return (
                      <VacationRequestDialog
                        key={vac._id}
                        vac={vac}
                        project={project}
                        rejected={true}
                      />
                    );
                  })}
                </div>
              </Flex>
            )}
        </Flex>
        <div className="superpose-reviews">
          <progress
            max="100"
            value={currentDatePercentBetweenDates(project?.start, project?.end)}
          />
          <div className="proj-start-end-marker"></div>

          {project?.reviews.map((review) => (
            <div
              key={review._id}
              className="review-marker"
              style={{
                left: `${datePercentBetweenDates(
                  project.start,
                  project.end,
                  review.date
                )}%`,
              }}
            >
              <Text>
                <HoverCard.Root>
                  <HoverCard.Trigger>
                    <Badge
                      variant="surface"
                      color={review.complete ? "green" : "orange"}
                      radius="full"
                    >
                      R
                    </Badge>
                  </HoverCard.Trigger>
                  <HoverCard.Content maxWidth="300px">
                    <Flex gap="4">
                      <Box>
                        <Heading size="3" as="h3" mb="1">
                          <Link
                            to={`/projects/${project._id}/reviews/${review._id}`}
                          >
                            Project review - {review.title}
                          </Link>
                        </Heading>
                        <Flex align="center" gap="5" mb="1">
                          {review.complete ? (
                            <Badge color="green">Complete</Badge>
                          ) : (
                            <Badge color="orange">Pending</Badge>
                          )}
                          <Text as="div" size="2" color="gray">
                            {format(new Date(review.date), "MM/dd/yyyy")}
                          </Text>
                        </Flex>
                        <Text as="div" size="2">
                          {!review.complete &&
                            `Sheduled: ${
                              isBefore(
                                new Date(Date.now()),
                                new Date(review.date)
                              )
                                ? `in ${formatDistanceToNow(
                                    new Date(review.date)
                                  )}`
                                : `${formatDistanceToNow(
                                    new Date(review.date)
                                  )} ago`
                            }`}
                        </Text>
                      </Box>
                    </Flex>
                  </HoverCard.Content>
                </HoverCard.Root>{" "}
              </Text>
            </div>
          ))}
          {createMonthScaleArray(project?.start, project?.end).map((el) => {
            return (
              <div
                key={el[1]}
                className=""
                style={{
                  left: `${el[1]}%`,
                  top: "70px",
                  fontSize: "10px",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  height: "max-content",
                }}
              >
                {format(el[0], "MMM")} {"'"}
                {format(el[0], "yy")}
              </div>
            );
          })}
          {createMonthScaleArray(project?.start, project?.end).map((el) => {
            return (
              <div
                key={el[1]}
                className=""
                style={{
                  left: `${el[1]}%`,
                  top: "55px",
                  height: "10px",
                  border: "0.5px solid lightGrey",
                }}
              ></div>
            );
          })}
          {userProfile &&
            pendingVacationRequests.length > 0 &&
            pendingVacationRequests.map((vac) => {
              const width = `${percentOfTotalTime(
                project?.start,
                project?.end,
                vac.lastWorkDate,
                vac.returnToWorkDate
              )}%`;
              const backgroundColor = Object.keys(vac.approvals).includes(
                project._id
              )
                ? "red"
                : pendingVacationRequestsUiObjs.find(
                    (usr) => usr.user === vac.user._id
                  ).color || "yellow";
              return (
                <div
                  key={vac._id}
                  id={vac._id}
                  style={{
                    height: "10px",
                    left: `${datePercentBetweenDates(
                      project.start,
                      project.end,
                      vac.lastWorkDate
                    )}%`,
                    width: width,
                    top: `${
                      pendingVacationRequestsUiObjs.indexOf(
                        pendingVacationRequestsUiObjs.find(
                          (usr) => usr.user === vac.user._id
                        )
                      ) *
                        10 +
                      60
                    }px`,
                    backgroundColor,
                  }}
                  className={`${backgroundColor === "red" ? "" : "opacity-50"}`}
                >
                  <HoverCard.Root>
                    <HoverCard.Trigger
                      style={{ display: "block", height: "10px" }}
                    >
                      <RadixLink target="_blank">
                        <VacationRequestDialog vac={vac} project={project} />
                      </RadixLink>
                    </HoverCard.Trigger>
                    <HoverCard.Content maxWidth="300px">
                      <Box>
                        <Text as="div" size="2" color="gray">
                          {vac.user.email}{" "}
                          {backgroundColor === "red" ? (
                            <Badge color="blue">Accepted</Badge>
                          ) : (
                            <Badge color="orange">Pending</Badge>
                          )}
                        </Text>
                      </Box>
                    </HoverCard.Content>
                  </HoverCard.Root>
                </div>
              );
            })}
          {showApprovedVacs &&
            approvedVacationRequests.length > 0 &&
            approvedVacationRequests.map((vac) => {
              const width = `${percentOfTotalTime(
                project.start,
                project.end,
                vac.lastWorkDate,
                vac.returnToWorkDate
              )}%`;
              return (
                <div
                  key={vac._id}
                  id={vac._id}
                  style={{
                    height: "10px",
                    left: `${datePercentBetweenDates(
                      project.start,
                      project.end,
                      vac.lastWorkDate
                    )}%`,
                    width: width,
                    top: `${
                      approvedVacationRequestsUiObjs.indexOf(
                        approvedVacationRequestsUiObjs.find(
                          (usr) => usr.user === vac.user._id
                        )
                      ) * 12
                    }px`,
                    backgroundColor:
                      approvedVacationRequestsUiObjs.find(
                        (usr) => usr.user === vac.user._id
                      ).color || "yellow",
                  }}
                  className="opacity-50"
                >
                  <HoverCard.Root>
                    <HoverCard.Trigger
                      style={{ display: "block", height: "10px" }}
                    >
                      <RadixLink target="_blank">
                        {userProfile && (
                          <VacationRequestDialog vac={vac} project={project} />
                        )}
                      </RadixLink>
                    </HoverCard.Trigger>
                    <HoverCard.Content maxWidth="300px">
                      <Box>
                        <Text as="div" size="2" color="gray">
                          {vac.user.email} <Badge color="green">Approved</Badge>
                        </Text>
                      </Box>
                    </HoverCard.Content>
                  </HoverCard.Root>
                </div>
              );
            })}
        </div>
        <Flex justify="between" mt="4">
          <Text className="proj-start-symbol">
            <HoverCard.Root>
              <HoverCard.Trigger>
                <Badge color="blue">Start</Badge>
              </HoverCard.Trigger>
              <HoverCard.Content maxWidth="300px">
                <Flex gap="4">
                  <Box>
                    <Text as="div" size="2" color="gray" mb="2">
                      {project && format(new Date(project.start), "MM/dd/yyyy")}
                    </Text>
                  </Box>
                </Flex>
              </HoverCard.Content>
            </HoverCard.Root>{" "}
          </Text>
          <Text className="proj-end-symbol">
            <HoverCard.Root>
              <HoverCard.Trigger>
                <Badge color="blue">End</Badge>
              </HoverCard.Trigger>
              <HoverCard.Content maxWidth="300px">
                <Flex gap="4">
                  <Box>
                    <Text as="div" size="2" color="gray" mb="2">
                      {project && format(new Date(project.end), "MM/dd/yyyy")}
                    </Text>
                  </Box>
                </Flex>
              </HoverCard.Content>
            </HoverCard.Root>{" "}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ProjectTimeline;
