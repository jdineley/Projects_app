const userProfileAction =
  (user) =>
  async ({ request }) => {
    console.log("hit userProfileAction");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const data = await request.formData();
    const {
      intent,
      lastWorkDate,
      returnToWorkDate,
      vacationAccepted,
      reasonForRejection,
      vacationId,
      projectId,
      vacationApproval,
    } = Object.fromEntries(data);
    // console.log(lastWorkDate, returnToWorkDate);

    try {
      if (intent === "create-vacation") {
        const resp1 = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/vacations`,
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              lastWorkDate,
              returnToWorkDate,
            }),
          }
        );
        const json1 = await resp1.json();
        if (!resp1.ok) {
          throw Error(json1.error);
        }
        console.log("^^^^^UserProfileActionJson", json1);
        return json1;
      }

      if (intent === "approve-vacation") {
        const resp2 = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/vacations/${vacationId}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              vacationAccepted,
              reasonForRejection,
              vacationId,
              projectId,
              vacationApproval,
            }),
          }
        );
        const json2 = await resp2.json();
        if (!resp2.ok) {
          throw Error(json2.error);
        }
        return json2;
      }

      if (intent === "delete-vacation") {
        const resp3 = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/vacations/${vacationId}`,
          {
            method: "DELETE",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              vacationId,
            }),
          }
        );
        const json3 = await resp3.json();
        if (!resp3.ok) {
          throw Error(json3.error);
        }
        return json3;
      }
    } catch (error) {
      console.log("failed to post new vacation request");
      throw Error(error.message);
    }
  };

export default userProfileAction;
