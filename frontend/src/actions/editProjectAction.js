import { redirect } from "react-router-dom";

const editProjectAction =
  (user) =>
  async ({ request, params }) => {
    console.log("hit editProjectAction");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const data = await request.formData();
    const { projectId } = params;
    console.log("params", params);
    const submission = {
      title: data.get("title"),
    };

    console.log("submission", submission);

    try {
      const response = await fetch(
        `${VITE_REACT_APP_API_URL}/projects/${projectId}`,
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
      throw Error("Failed to edit project");
    }
  };

export default editProjectAction;
