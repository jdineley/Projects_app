const projectDetailLoader =
  (user) =>
  async ({ params, request }) => {
    console.log("calling project detail loader..");
    const token = user.token ? user.token : user.accessToken;
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const { projectId, reviewId } = params;
    const url = new URL(request.url);

    // from Form method=GET
    const assignUser = url.searchParams?.get("assignUser");
    const taskDep = url.searchParams?.get("taskDep");
    console.log(assignUser, taskDep);
    // from notifications
    const newTaskId = url.searchParams.get("taskId");
    const newTaskAssigner = url.searchParams.get("user");

    let searchedUsers, searchedTasks;

    try {
      if (user) {
        const res1 = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/projects/${projectId}`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res1.ok) {
          throw Error();
        }
        if (assignUser) {
          const res2 = await fetch(
            `${VITE_REACT_APP_API_URL}/api/v1/users/getUsers?assignUser=${assignUser}`,
            {
              method: "GET",
              mode: "cors",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res2.ok) {
            throw Error();
          }
          searchedUsers = await res2.json();
        }

        if (taskDep) {
          const res3 = await fetch(
            `${VITE_REACT_APP_API_URL}/api/v1/tasks/getTasks?task=${taskDep}`,
            {
              method: "GET",
              mode: "cors",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res3.ok) {
            throw Error();
          }
          searchedTasks = await res3.json();
        }

        const { project, projectTasks } = await res1.json();

        return {
          project,
          projectTasks,
          searchedUsers,
          newTaskId,
          newTaskAssigner,
          searchedTasks,
          taskDep,
          assignUser,
          reviewId,
        };
      } else
        return {
          project: null,
          projectTasks: null,
          searchedUsers: null,
          newTaskId: null,
          newTaskAssigner: null,
          searchedTasks: null,
          taskDep: null,
          assignUser: null,
          reviewId: null,
        };
    } catch (error) {
      throw Error("Couldnt fetch the project");
    }
  };

export default projectDetailLoader;
