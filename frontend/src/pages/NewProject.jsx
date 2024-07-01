import { Form } from "react-router-dom";

export default function NewProject() {
  return (
    <div className="new-project">
      <h2>Add new project</h2>
      <Form method="POST">
        <label htmlFor="title">Project title</label>
        <input type="text" id="title" name="title" required></input>
        <button>Submit</button>
      </Form>
    </div>
  );
}
