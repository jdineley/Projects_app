const rootLayoutLoader =
  (user) =>
  async ({ request }) => {
    console.log("hit rootLayoutLoader");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    // console.log("$$$$$$$$$$$$$$$$$$$$", import.meta.env.VITE_REACT_APP_API_URL);
    const url = new URL(request.url);
    const newCommentId = url.searchParams.get("commentId");
    const newCommenterEmail = url.searchParams.get("user");
    const notificationsCleared = url.searchParams.get("notificationsCleared");
    try {
      if (user) {
        const resp1 = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/users/getUser`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const userObj = await resp1.json();
        console.log(userObj);
        if (!resp1.ok && userObj.error) {
          return { userObj };
        } else if (!resp1.ok) {
          throw Error("something went wrong fetching the necessary data");
        }

        return {
          newCommentId,
          newCommenterEmail,
          notificationsCleared,
          userObj,
        };
      }
    } catch (error) {
      throw Error(error.message);
    }
    return {
      userObj: null,
      notificationsCleared: null,
      newCommentId,
      newCommenterEmail,
    };
  };

export default rootLayoutLoader;
