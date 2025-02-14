const loginAction = async ({ request }) => {
  console.log("hit loginAction");
  const { VITE_REACT_APP_API_URL } = import.meta.env;

  const data = await request.formData();
  const submission = Object.fromEntries(data);
  const { accessToken } = submission;
  console.log("accessToken", accessToken);

  try {
    // if (!accessToken) {
    const response = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/users/login`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(submission),
      }
    );
    if (response.statusText === "Not Found") {
      throw Error("Server connection error");
    }
    const json = await response.json();
    if (!response.ok) {
      throw Error(json.error);
    }
    return json;
    // }

    // return null;
  } catch (error) {
    return error;
  }
};

export default loginAction;
