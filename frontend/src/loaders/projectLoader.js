const projectsLoader =
  (user) =>
  async ({ request }) => {
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const url = new URL(request.url);
    // from project delete redirect()
    const projectDeleted = url.searchParams.get("projectDeleted");
    try {
      // const res = await fetch("http://localhost:4000/api/v1/projects", {
      //   method: "GET",
      //   mode: "cors",
      //   headers: {
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // });

      // if (!res.ok) {
      //   throw Error("could not fetch the list of projects");
      // }

      // const projects = await res.json();

      // return projects;
      if (user) {
        const res = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/users/getUser`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!res.ok) {
          throw Error("could not fetch the logged in user");
        }

        const userObj = await res.json();

        return { userObj, projectDeleted };
      } else return null;
    } catch (error) {
      throw Error(error.message);
    }
  };

export default projectsLoader;
