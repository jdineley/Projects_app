const itTicketsLoader =
  (user) =>
  async ({ request }) => {
    const token = user?.token ? user?.token : user?.accessToken;
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    // const isGlobalAdmin = user.isGlobalAdmin;
    const url = new URL(request.url);
    const ticketId = url.searchParams?.get("ticketId");

    try {
      const res = await fetch(`${VITE_REACT_APP_API_URL}/api/v1/tickets`, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw Error("couldn't fetch your tickets");
      }
      const tickets = await res.json();
      console.log("tickets", tickets);
      return { tickets, ticketId };
    } catch (error) {
      throw Error(error.message);
    }
  };

export default itTicketsLoader;
