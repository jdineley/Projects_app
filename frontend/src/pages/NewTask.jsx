import { Form, useLoaderData } from "react-router-dom";
import { useState } from "react";

export default function NewTask() {
  // const { project } = useOutletContext();
  const { project, users } = useLoaderData();
  const [assignee, setAssignee] = useState();

  return (
    <div className="new-task">
      <div className="new-task-title-collector">
        <h1>
          New Task
          <span className="owner">
            {" - "}
            {project.title}
          </span>
        </h1>
      </div>
      <div className="new-task-assign-user">
        <div className="find-user">
          <h3>Find user</h3>
          <Form id="search-form" role="search">
            <input
              id="assignUser"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="assignUser"
            />
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          {users?.map((user) => (
            <a href="#" key={user._id} onClick={() => setAssignee(user.email)}>
              {user.email}
            </a>
          ))}
        </div>
        <Form id="assign-task" method="POST">
          <label htmlFor="title">
            Title
            <input
              type="text"
              id="title"
              name="title"
              placeholder="enter a task title.."
              required
            />
          </label>
          <label htmlFor="description">
            Description
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="enter a task description.."
              required
            />
          </label>
          <label htmlFor="email">
            Assign task to user
            <input
              type="text"
              name="email"
              id="email"
              value={assignee && assignee}
            />
          </label>
          <label htmlFor="deadline">
            Target completion date
            <input type="date" name="deadline" id="deadline" />
          </label>
          <button>Submit</button>
        </Form>
      </div>
    </div>
  );
}
