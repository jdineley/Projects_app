const learningLoader = async ({ params, request }) => {
  console.log("calling learningLoader");
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  try {
    const resp1 = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/users/getLearnerUser?email=henryTest@mail.com`,
      {
        method: "GET",
        mode: "cors",
      }
    );
    if (!resp1.ok) {
      throw Error("something went wrong getting the learner user");
    }
    const userObj = await resp1.json();
    console.log("learningLoader userObj:", userObj);
    const resp2 = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/projects/getLearnerProject/${userObj.projects[0]._id}?intent=getLearnerProject`,
      {
        method: "GET",
        mode: "cors",
      }
    );
    if (!resp2.ok) {
      throw Error(
        "something went wrong getting the learner user project and project tasks"
      );
    }

    const { project, projectTasks } = await resp2.json();

    const resp3 = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/reviews/getLearnerReview/${project.reviews[0]._id}?intent=getLearnerProject`,
      {
        method: "GET",
        mode: "cors",
      }
    );
    if (!resp3.ok) {
      throw Error("something went wrong getting the learner project review");
    }
    const review = await resp3.json();

    const resp4 = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/tasks/getLearnerTask/${project.tasks[2]}?intent=getLearnerProject`,
      {
        method: "GET",
        mode: "cors",
      }
    );
    if (!resp4.ok) {
      throw Error("something went wrong getting the learner task");
    }

    const { task, taskComments } = await resp4.json();

    return { userObj, project, projectTasks, review, task, taskComments };
  } catch (error) {
    throw Error(error.message);
  }
};

export default learningLoader;
