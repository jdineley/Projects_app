const projectReviewLoader =
  (user) =>
  async ({ params, request }) => {
    console.log("calling project review loader");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const { projectId, reviewId } = params;
    const url = new URL(request.url);

    // from Form method=GET
    const assignUser = url.searchParams?.get("assignUser");
    const actionIndex = url.searchParams?.get("actionIndex");

    const newCommentId = url.searchParams.get("commentId");
    const newCommenterEmail = url.searchParams.get("user");
    const newActionId = url.searchParams.get("actionId");
    let searchedUsers;

    try {
      if (user) {
        const res1 = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/reviews/${reviewId}`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!res1.ok) {
          throw Error();
        }
        const review = await res1.json();

        if (assignUser) {
          const res2 = await fetch(
            `${VITE_REACT_APP_API_URL}/api/v1/users/getUsers?assignUser=${assignUser}`,
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
          searchedUsers = await res2.json();
        }

        return {
          review,
          projectId,
          searchedUsers,
          actionIndex,
          newCommentId,
          newCommenterEmail,
          newActionId,
        };
      } else {
        return {
          review: null,
          projectId: null,
          searchedUsers: null,
          actionIndex: null,
          newCommentId: null,
          newCommenterEmail: null,
          newActionId: null,
        };
      }
    } catch (error) {
      throw Error("Couldnt fetch the review");
    }
  };

export default projectReviewLoader;
