import { Form, useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

export default function ProjectEdit() {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const { project } = useLoaderData();
  const [projectInState, setProjectInState] = useState(project);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  console.log("user", user);

  function handleProjectChange(e) {
    setProjectInState({
      ...projectInState,
      title: e.target.value,
    });
  }

  async function handleProjectDelete() {
    console.log("handle delete project");
    const token = user?.token ? user?.token : user?.accessToken;
    console.log("projectId:", project._id);
    try {
      const response = await fetch(
        `${VITE_REACT_APP_API_URL}/api/v1/projects/${project._id}`,
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response:", response.ok);
      if (!response.ok) {
        throw Error();
      }
      navigate("/projects");
    } catch (error) {
      throw Error("Could not delete the project");
    }
  }

  return (
    <div className="new-project">
      <div className="project-title-collector">
        <h2>Edit - {project.title}</h2>
        <button onClick={handleProjectDelete}>Delete</button>
      </div>
      <Form method="PATCH">
        <label htmlFor="title">Edit title</label>
        <input
          type="text"
          id="title"
          name="title"
          onChange={handleProjectChange}
          value={projectInState.title}
          required
        />
        <button>Submit</button>
      </Form>
    </div>
  );
}

// action={`/projects/${project._id}/edit`}
