import { redirect } from "react-router-dom";

const newTaskAction =
  (user) =>
  async ({ request, params }) => {
    const data = await request.formData();
    const projectId = params.projectId;
    const submission = Object.fromEntries(data);

    try {
      await fetch(`http://localhost:4000/api/v1/tasks/project/${projectId}`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(submission),
      });

      return redirect(`/projects/${projectId}`);
    } catch (error) {
      throw Error("Failed to post new project");
    }
  };

export default newTaskAction;
