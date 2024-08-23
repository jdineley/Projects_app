import { useState, useEffect } from "react";

import { Card, Text, Grid } from "@radix-ui/themes";
import { useLoaderData, useFetcher } from "react-router-dom";

import ProjectTimeline from "../components/ProjectTimeline";

import {
  differenceInBusinessDays,
  isWithinInterval,
  isPast,
  isBefore,
  isEqual,
  isToday,
} from "date-fns";

import PendingVacationRequests from "../components/PendingVacationRequests";
import ApprovedVacationRequests from "../components/ApprovedVacationRequests";
import RejectedVacationRequests from "../components/RejectedVacationRequests";

//hooks
import useMatchMedia from "../hooks/useMatchMedia";

// constants
import { tabletScreenWidth } from "../utility";

export default function UserProfile() {
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);

  const [vacStartInState, setVacStartInState] = useState(null);
  const [vacEndInState, setVacEndInState] = useState(null);
  const [dateSelectionErrors, setDateSelectionErrors] = useState([]);
  const userObj = useLoaderData();

  // if (!userObj || userObj.error) return null;

  const fetcher = useFetcher();

  // useEffect(() => {
  //   console.log("in UserProfile useEffect");
  //   if (fetcher.data) {
  //     setVacStartInState("");
  //     setVacEndInState("");
  //   }
  // }, [fetcher.data]);

  const pendingVacationRequests = userObj?.vacationRequests.filter((vacReq) => {
    return vacReq.status === "pending";
  });
  const approvedVacationRequests = userObj?.vacationRequests.filter(
    (vacReq) => {
      return vacReq.status === "approved";
    }
  );

  const rejectedVacationRequests = userObj?.vacationRequests.filter(
    (vacReq) => {
      return vacReq.status === "rejected";
    }
  );

  let localVacDaysRemainingRendered;
  let localVacDaysRemaining;

  if (vacStartInState && vacEndInState) {
    localVacDaysRemaining =
      userObj?.remainingVacationDays -
      differenceInBusinessDays(
        new Date(vacEndInState),
        new Date(vacStartInState)
      );
    localVacDaysRemainingRendered =
      localVacDaysRemaining < 0 ? 0 : localVacDaysRemaining;
  }

  // check for integrity of vacation date selection on the UI
  // Does the start or end date sit within an existing vacation ...
  // is the start or end date in the past...
  // end date is ahead of the start date...
  // start and end dates are different

  useEffect(() => {
    let localDateSelectionErrors = [];

    if (fetcher.data) {
      setVacStartInState("");
      setVacEndInState("");
    }

    if (
      vacStartInState &&
      vacEndInState &&
      isBefore(new Date(vacEndInState), new Date(vacStartInState))
    ) {
      localDateSelectionErrors.push(
        "return to work must precede last day at work"
      );
    }
    if (
      vacEndInState &&
      vacStartInState &&
      isEqual(new Date(vacEndInState), new Date(vacStartInState))
    ) {
      localDateSelectionErrors.push("start and return dates must be different");
    }
    if (
      vacStartInState &&
      userObj?.vacationRequests.some((vacReq) => {
        return isWithinInterval(new Date(vacStartInState), {
          start: new Date(vacReq.lastWorkDate),
          end: new Date(vacReq.returnToWorkDate),
        });
      })
    ) {
      localDateSelectionErrors.push("vacation request clash");
    }
    if (
      vacEndInState &&
      userObj?.vacationRequests.some((vacReq) => {
        return isWithinInterval(new Date(vacEndInState), {
          start: new Date(vacReq.lastWorkDate),
          end: new Date(vacReq.returnToWorkDate),
        });
      })
    ) {
      localDateSelectionErrors.push("vacation request clash");
    }
    if (vacStartInState && isPast(new Date(vacStartInState))) {
      if (!isToday(new Date(vacStartInState))) {
        localDateSelectionErrors.push(
          "last work date selection is in the past"
        );
      }
    }
    if (vacEndInState && isPast(new Date(vacEndInState))) {
      if (!isToday(new Date(vacEndInState))) {
        localDateSelectionErrors.push(
          "return to work date selection is in the past"
        );
      }
    }
    setDateSelectionErrors(localDateSelectionErrors);
  }, [userObj?.vacationRequests, vacEndInState, vacStartInState, fetcher.data]);

  return (
    <>
      <h1 className="mb-4">User Profile</h1>
      <Grid
        columns={isTabletResolution ? "1" : "2"}
        gap="3"
        width="auto"
        style={
          isTabletResolution ? { maxWidth: "600px" } : { maxWidth: "1000px" }
        }
      >
        <Card className="flex-1">
          <h2>Personal vacation management</h2>
          <div className="border-b border-solid border-0 border-slate-200">
            <h3>
              Remaining vacation days:{" "}
              <small>
                {(localVacDaysRemainingRendered ||
                  localVacDaysRemainingRendered === 0) &&
                dateSelectionErrors.length === 0
                  ? localVacDaysRemainingRendered
                  : userObj?.remainingVacationDays}
              </small>
            </h3>
          </div>
          <div className="border-b border-solid border-0 border-slate-200">
            <h3>Vacation request</h3>
            <fetcher.Form method="post" className="mb-4">
              <label htmlFor="lastWorkDate">
                Enter last date at work:
                <input
                  type="date"
                  name="lastWorkDate"
                  id="lastWorkDate"
                  placeholder="Last date at work"
                  disabled={userObj?.remainingVacationDays === 0 ? true : false}
                  onChange={(e) => {
                    setVacStartInState(e.target.value);
                  }}
                  value={vacStartInState}
                />
              </label>
              <label>
                Enter return to work date:
                <input
                  type="date"
                  id="returnToWorkDate"
                  name="returnToWorkDate"
                  placeholder="Return to work date"
                  disabled={userObj?.remainingVacationDays === 0 ? true : false}
                  onChange={(e) => {
                    setVacEndInState(e.target.value);
                  }}
                  value={vacEndInState}
                />
              </label>
              {localVacDaysRemaining >= 0 &&
                dateSelectionErrors.length === 0 && (
                  <button
                    disabled={fetcher.state === "submitting" ? true : false}
                    name="intent"
                    value="create-vacation"
                  >
                    Send vacation request
                  </button>
                )}
              {localVacDaysRemaining && localVacDaysRemaining < 0 ? (
                <Text as="p" color="tomato">
                  You have exceeded your vacation allocation
                </Text>
              ) : null}
              {dateSelectionErrors.map((msg, i) => {
                return (
                  <Text key={i} as="p" color="tomato">
                    {msg}
                  </Text>
                );
              })}
            </fetcher.Form>
          </div>

          {pendingVacationRequests?.length > 0 && (
            <div className="border-b border-solid border-0 border-slate-200">
              <h3>Pending vacation requests:</h3>
              {pendingVacationRequests?.map((vac) => {
                return (
                  <PendingVacationRequests
                    key={vac._id}
                    userObj={userObj}
                    vac={vac}
                  />
                );
              })}
            </div>
          )}
          {approvedVacationRequests?.length > 0 && (
            <div className="border-b border-solid border-0 border-slate-200">
              <h3>Approved vacation requests:</h3>
              {approvedVacationRequests?.map((vac) => {
                return (
                  <ApprovedVacationRequests
                    key={vac._id}
                    vac={vac}
                    userObj={userObj}
                  />
                );
              })}
            </div>
          )}
          {rejectedVacationRequests?.length > 0 && (
            <div className="border-b border-solid border-0 border-slate-200">
              <h3>Rejected vacation requests:</h3>
              {rejectedVacationRequests?.map((vac) => {
                return (
                  <RejectedVacationRequests
                    key={vac._id}
                    vac={vac}
                    userObj={userObj}
                  />
                );
              })}
            </div>
          )}
        </Card>
        <Card className="flex-1">
          <h2>Project vacation management</h2>
          <div className="flex flex-col gap-9">
            {userObj?.projects.map((proj) => (
              <div key={proj._id}>
                <h3>{proj.title}</h3>
                <div>
                  <ProjectTimeline project={proj} userProfile={true} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </>
  );
}
