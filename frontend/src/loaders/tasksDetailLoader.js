const taskDetailLoader =
  (user) =>
  async ({ params, request }) => {
    const { taskId } = params;
    const url = new URL(request.url);
    const newCommentId = url.searchParams.get("commentId");
    const newCommenterEmail = url.searchParams.get("user");

    // from Form method=GET
    // const assignUser = url.searchParams?.get("assignUser");
    const taskDep = url.searchParams?.get("taskDep");

    let searchedTasks;

    try {
      if (user) {
        const response = await fetch(
          `http://localhost:4000/api/v1/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer: ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw Error("failed to fetch task");
        }
        const { task, taskComments } = await response.json();
        if (taskDep) {
          const res3 = await fetch(
            `http://localhost:4000/api/v1/tasks/getTasks?task=${taskDep}`,
            {
              method: "GET",
              mode: "cors",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );

          if (!res3.ok) {
            throw Error();
          }
          searchedTasks = await res3.json();
        }
        return {
          task,
          taskComments,
          newCommentId,
          newCommenterEmail,
          taskDep,
          searchedTasks,
        };
      } else {
        return {
          task: null,
          taskComments: null,
          newCommentId: null,
          newCommenterEmail: null,
          taskDep: null,
          searchedTasks: null,
        };
      }
    } catch (error) {
      throw Error("Couldnt fetch task");
    }
  };

export default taskDetailLoader;
