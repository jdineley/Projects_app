import { redirect } from "react-router-dom";

const rootLayoutAction =
  (user) =>
  async ({ request }) => {
    console.log("hit rootLayoutAction");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const data = await request.formData();
    const { intent, path } = Object.fromEntries(data);
    console.log("path", path);
    try {
      if (intent === "clear-notifications") {
        const res = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/users`,
          // `${VITE_REACT_APP_API_URL}/api/v1/users/${user._id}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              intent,
            }),
          }
        );
        const json = await res.json();
        if (!res.ok) {
          throw Error(json.error);
        }
        // console.log("^^^^^UserProfileActionJson", json1);
        // return { json, cleared: true };
        console.log(path);
        return redirect(`${path}?notificationsCleared=true`);

        // return { path };
      }
    } catch (error) {
      console.log("failed to clear notifications");
      throw Error(error.message);
    }
  };

export default rootLayoutAction;
