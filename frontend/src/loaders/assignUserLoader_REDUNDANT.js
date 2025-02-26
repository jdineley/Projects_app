const assignUserLoader =
  (user) =>
  async ({ request }) => {
    console.log("in assignUser loader");
    const token = user?.token ? user?.token : user?.accessToken;
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const url = new URL(request.url);
    const assignUser = url.searchParams?.get("assignUser");
    console.log(assignUser);

    try {
      if (assignUser) {
        const res2 = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/users/getUsers?assignUser=${assignUser}`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res2.ok) {
          throw Error();
        }
        const { users } = await res2.json();
        return { users };
      }
    } catch (error) {
      throw Error("Couldnt find similar users");
    }
  };

export default assignUserLoader;
