const dashboardAction =
  (user) =>
  async ({ request }) => {
    console.log("in dashboardAction");
    const token = user?.token ? user?.token : user?.accessToken;
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const data = await request.formData();
    const { intent, ...list } = Object.fromEntries(data);
    console.log("list", list);

    try {
      if (intent === "selfWorkLoad") {
        const { selfWorkLoad } = list;
        const response = await fetch(`${VITE_REACT_APP_API_URL}/api/v1/users`, {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ intent, selfWorkLoad }),
        });
        const json = await response.json();
        if (!response.ok) {
          throw Error(json.error);
        }
        return json;
      }
    } catch (error) {
      throw Error(error.message);
    }
  };

export default dashboardAction;
