const dashboardLoader = (user) => async () => {
  console.log("in dashboard loader");
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
    // console.log(projects);
    // return projects;
    // if (!res.ok) {
    //   throw Error("could not fetch the current user");
    // }
    if (user) {
      const res2 = await fetch("http://localhost:4000/api/v1/users/getUser", {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res2.ok) {
        throw Error("could not fetch the current user");
      }

      const userObj = await res2.json();

      return userObj;
    } else return null;
  } catch (error) {
    throw Error(error.message);
  }
};

export default dashboardLoader;
