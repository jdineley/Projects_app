import { redirect } from "react-router-dom";

const projectDetailAction =
  (user) =>
  async ({ request, params }) => {
    console.log("in project detail action");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const { projectId, taskId, reviewId } = params;
    const data = await request.formData();
    const { intent, ...list } = Object.fromEntries(data);
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
        throw Error("Failed to edit task");
      }
    }
    if (intent === "create-task") {
      const {
        title,
        description,
        deadline,
        projectId,
        assigneeId,
        daysToComplete,
        ...taskDeps
      } = list;
      console.log({ title, description, deadline, taskDeps });

      const taskDepsIds = Object.values(taskDeps);
      console.log(taskDepsIds);
      try {
        const response = await fetch(
          `${VITE_REACT_APP_API_URL}/tasks/project/${projectId}`,
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              title,
              description,
              deadline,
              assigneeId,
              daysToComplete,
              dependencies: taskDepsIds,
            }),
          }
        );
        const json = await response.json();
        if (!response.ok) {
          throw Error(json.error);
        }
        console.log(json);
        return json;
      } catch (error) {
        throw Error("Failed to post new task");
      }
    }
    if (intent === "delete-project") {
      if (window.confirm("Are you sure you want to delete?")) {
        try {
          const { projectId } = list;
          const res = await fetch(
            `${VITE_REACT_APP_API_URL}/projects/${projectId}`,
            {
              method: "DELETE",
              mode: "cors",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({ intent }),
            }
          );
          const { project } = await res.json();
          if (!res.ok) {
            throw Error("failed to delete project");
          }
          return redirect(
            `/projects?projectDeleted=${project.title} was deleted`
          );
        } catch (error) {
          throw Error(error.message);
        }
      }
      return null;
    }
    if (intent === "unarchive-project") {
      if (window.confirm("Are you sure you want to Restore?")) {
        try {
          const { projectId } = list;
          const res = await fetch(
            `${VITE_REACT_APP_API_URL}/projects/${projectId}`,
            {
              method: "PATCH",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({ intent }),
            }
          );
          const json = await res.json();
          console.log("json in action", json);
          if (!res.ok) {
            throw Error("failed to restore project");
          }
          return json;
        } catch (error) {
          throw Error(error.message);
        }
      }
      return null;
    }
    if (intent === "delete-task") {
      try {
        const { taskDetail } = list;
        const { taskId } = list;
        const res = await fetch(`${VITE_REACT_APP_API_URL}/tasks/${taskId}`, {
          method: "DELETE",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const json = await res.json();
        if (!res.ok) {
          throw Error("failed to delete task");
        }
        if (taskDetail === "true") {
          return redirect(`/projects/${projectId}`);
        }
        return json;
      } catch (error) {
        throw Error(error.message);
      }
    }
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
    if (intent === "edit-project") {
      const { projectId, title, start, end, ...reviews } = list;
      try {
        const res = await fetch(
          `${VITE_REACT_APP_API_URL}/projects/${projectId}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ intent, title, start, end, ...reviews }),
          }
        );
        const json = await res.json();
        console.log(json);
        if (!res.ok) {
          throw Error(json.error);
        }
        return json;
      } catch (error) {
        throw Error(error.message);
      }
    }
    if (intent === "archive-project") {
      try {
        const { projectId } = list;
        const res = await fetch(
          `${VITE_REACT_APP_API_URL}/projects/${projectId}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ intent }),
          }
        );
        const json = await res.json();
        console.log("json", json);
        if (!res.ok) {
          throw Error(json.error);
        }
        return redirect(`/projects`);
      } catch (error) {
        throw Error(error.message);
      }
    }
  };

export default projectDetailAction;
