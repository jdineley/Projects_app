import { Form, useOutletContext, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
// import { useState } from "react";

export default function TaskEdit() {
  const { selectedTask } = useOutletContext();
  const { user } = useAuthContext();
  // const [formInputs, setFormInputs] = useState({
  //   title: selectedTask.title,
  //   description: selectedTask.description,
  // });
  const navigate = useNavigate();

  // function handleFormInputs(e) {
  //   const input = e.target.name;
  //   console.log(input);
  //   setFormInputs({
  //     ...formInputs,
  //     [input]: e.target.value,
  //   });
  // }

  async function handleTaskDelete() {
    console.log("handle delete task");
    console.log("taskId:", selectedTask._id);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/tasks/${selectedTask._id}`,
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log("response:", response.ok);
      if (!response.ok) {
        throw Error();
      }
      navigate(-2);
    } catch (error) {
      throw Error("Could not delete the project");
    }
  }

  // protect the route from unauthorized user accessing the url manually
  if (user._id !== selectedTask.user._id) {
    throw Error("Not authorized to view this page");
  }

  return (
    <div className="task-edit">
      <h1 className="page-title">Edit Task</h1>
      <h2>{selectedTask.title}</h2>
      <Form
        method="PATCH"
        // action={`/projects/${project._id}/tasks/${selectedTask._id}/edit`}
      >
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={selectedTask.title}
          placeholder="enter a task title.."
          // value={formInputs.title}
          // onChange={handleFormInputs}
          required
        />
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows="5"
          defaultValue={selectedTask.description}
          placeholder="enter a task description.."
          // value={formInputs.description}
          // onChange={handleFormInputs}
          required
        />
        <label htmlFor="deadline">Target completion date</label>
        <input type="date" name="deadline" id="deadline" />
        <button>Submit</button>
      </Form>
      <button className="delete-task" onClick={handleTaskDelete}>
        Delete Task
      </button>
    </div>
  );
}
