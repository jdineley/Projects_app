const reviewAction =
  (user) =>
  async ({ request, params }) => {
    console.log("in the review action");
    const token = user?.token ? user?.token : user?.accessToken;
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const { projectId, reviewId } = params;
    const data = await request.formData();
    const { intent, comment, actionId } = Object.fromEntries(data);

    try {
      if (intent === "newComment") {
        console.log("in newComment");
        const response = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/comments/project/${projectId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user: user._id,
              action: actionId,
              content: comment,
              projectId,
              reviewId,
            }),
          }
        );
        console.log(response);
        if (!response.ok) {
          throw Error("failed to create comment");
        }
        console.log("here");
        const json3 = await response.json();
        console.log(json3);
        return json3;
      }
    } catch (error) {
      throw Error("Failed to post new project");
    }
  };

export default reviewAction;
