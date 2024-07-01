const userProfileLoader = (user) => async () => {
  console.log("hit userProfileLoader");
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  // const url = new URL(request.url);
  // const intent = url.searchParams.get("vacation-request");
  // const requestedVacationId = url.searchParams.get("vacationId");
  try {
    if (user) {
      const resp1 = await fetch(`${VITE_REACT_APP_API_URL}/users/getUser`, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const userObj = await resp1.json();
      if (!resp1.ok) {
        throw Error(user.error);
      }

      // if (intent) {
      //   const resp2 = await fetch("http://localhost:4000/api/v1/vacations", {});
      // }

      return userObj;
    } else return null;
  } catch (error) {
    throw Error(error.message);
  }
};

export default userProfileLoader;
