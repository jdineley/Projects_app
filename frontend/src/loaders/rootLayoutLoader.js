const rootLayoutLoader =
  (user) =>
  async ({ request }) => {
    console.log("hit rootLayoutLoader");

    const url = new URL(request.url);
    const newCommentId = url.searchParams.get("commentId");
    const newCommenterEmail = url.searchParams.get("user");
    const notificationsCleared = url.searchParams.get("notificationsCleared");

    try {
      if (user) {
        const resp1 = await fetch(
          "http://localhost:4000/api/v1/users/getUser",
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const userObj = await resp1.json();
        if (!resp1.ok && userObj.error) {
          return { userObj };
        } else if (!resp1.ok) {
          throw Error(user.error);
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

    return { newCommentId, newCommenterEmail };
  };

export default rootLayoutLoader;
