const tenantAdminAction =
  (user) =>
  async ({ request }) => {
    console.log("in tenantAdminAction");
    const token = user?.token ? user?.token : user?.accessToken;
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const data = await request.formData();
    const dataObj = Object.fromEntries(data);
    console.log("dataObj", dataObj);
    const { intent, ...changedVacAlloc } = dataObj;
    console.log("changedVacAlloc", changedVacAlloc);

    try {
      if (intent === "vacAllocUpdate") {
        const res = await fetch(`${VITE_REACT_APP_API_URL}/api/v1/users`, {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ intent, ...changedVacAlloc }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw Error(json.error);
        }
        console.log("json", json);
        // json:
        //   {
        //     "upatedUsersId": [
        //         "67c8d7431fc885bd673d0192",
        //         "67ca2265fba235c553e210c4"
        //     ]
        // }
        return json;
      }
    } catch (error) {
      throw Error(error.message);
    }

    // return null;
  };

export default tenantAdminAction;
