const assignUserLoader =
  (user) =>
  async ({ request }) => {
    console.log("in assignUser loader");
    const url = new URL(request.url);
    const assignUser = url.searchParams?.get("assignUser");
    console.log(assignUser);

    try {
      if (assignUser) {
        const res2 = await fetch(
          `http://localhost:4000/api/v1/users/getUsers?assignUser=${assignUser}`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${user.token}`,
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
