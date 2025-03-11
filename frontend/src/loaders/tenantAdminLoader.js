const tenantAdminLoader = (user) => async () => {
  console.log("in tenantAdminLoader");
  const token = user?.token ? user?.token : user?.accessToken;
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  try {
    if (user) {
      const res = await fetch(
        `${VITE_REACT_APP_API_URL}/api/v1/users/getUsers?intent=allTenantUsers`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const allDomainUsers = await res.json();
      console.log("allDomainUsers", allDomainUsers);
      if (!res.ok) {
        throw Error("something went wrong fetching the necessary data");
      }
      return { allDomainUsers };
    }
    return {};
  } catch (error) {
    throw Error(error.message);
  }
};

export default tenantAdminLoader;
