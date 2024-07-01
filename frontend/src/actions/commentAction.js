const commentAction =
  (user) =>
  async ({ request, params }) => {
    console.log("in commentAction");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const taskId = params.taskId;
    const reviewId = params.reviewId;
    const data = await request.formData();
    const { intent, ...list } = Object.fromEntries(data);

    // const submission = {
    //   user: user._id,
    //   task: taskId,
    //   review: reviewId,
    //   content: formData.get("comment"),
    // };
    if (intent === "task-comment") {
      const { comment } = list;
      try {
        const response = await fetch(`${VITE_REACT_APP_API_URL}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            user: user._id,
            task: taskId,
            review: reviewId,
            content: comment,
          }),
        });

        if (!response.ok) {
          throw Error("failed to create comment");
        }
        return null;
      } catch (error) {
        throw Error(error.message);
      }
    }

    if (intent === "edit-task") {
      console.log("hit edit task");
      const {
        title,
        description,
        deadline,
        taskId,
        percentageComplete,
        completed,
        daysToComplete,
        editPercent,
        ...taskDeps
      } = list;

      const taskDepsIds = Object.values(taskDeps);

      try {
        const response = await fetch(
          `${VITE_REACT_APP_API_URL}/tasks/${taskId}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              title,
              description,
              deadline,
              percentageComplete,
              completed,
              daysToComplete,
              editPercent,
              dependencies: taskDepsIds,
            }),
          }
        );
        const json = await response.json();
        if (!response.ok) {
          throw Error(json.error);
        }
        return json;
      } catch (error) {
        throw Error("Failed to post new project");
      }
    }
  };

export default commentAction;
