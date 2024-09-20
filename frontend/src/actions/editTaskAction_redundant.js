import { redirect } from "react-router-dom";

const editTaskAction =
  (user) =>
  async ({ request, params }) => {
    console.log("hit editTaskAction");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const data = await request.formData();
    const { taskId, projectId } = params;
    console.log("params", params);
    const submission = {
      title: data.get("title"),
      description: data.get("description"),
      deadline: data.get("deadline"),
    };

    console.log("submission", submission);

    try {
      const response = await fetch(
        `${VITE_REACT_APP_API_URL}/api/v1/tasks/${taskId}`,
        {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(submission),
        }
      );

      if (!response.ok) {
        throw Error();
      }

      return redirect(`/projects/${projectId}`);
    } catch (error) {
      throw Error(error.message);
    }
  };

export default editTaskAction;
