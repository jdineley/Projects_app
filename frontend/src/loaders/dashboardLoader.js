const dashboardLoader = (user) => async () => {
  console.log("in dashboard loader");
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  try {
    if (user) {
      const res2 = await fetch(
        `${VITE_REACT_APP_API_URL}/api/v1/users/getUser`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

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
