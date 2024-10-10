const learningLoader = async ({ params, request }) => {
  console.log("calling learningLoader");
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  try {
    const resp1 = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/users/getLearnerUser?email=mario@mail.com`,
      {
        method: "GET",
        mode: "cors",
      }
    );
    if (!resp1.ok) {
      throw Error("something went wrong getting the learner user");
    }
    const userObj = await resp1.json();
    const resp2 = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/projects/getLearnerProject/${userObj.projects[0]._id}`,
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
      `${VITE_REACT_APP_API_URL}/api/v1/reviews/getLearnerReview/${project.reviews[0]._id}`,
      {
        method: "GET",
        mode: "cors",
      }
    );
    if (!resp3.ok) {
      throw Error("something went wrong getting the learner project review");
    }
    const review = await resp3.json();

    return { userObj, project, projectTasks, review };
  } catch (error) {
    throw Error(error.message);
  }
};

export default learningLoader;
