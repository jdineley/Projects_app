const signupAction = async ({ request }) => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const data = await request.formData();
  const submission = Object.fromEntries(data);

  try {
    const response = await fetch(`${VITE_REACT_APP_API_URL}/users/signup`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });
    console.log(response);
    if (response.statusText === "Not Found") {
      throw Error("Server connection error");
    }
    const json = await response.json();
    if (!response.ok) {
      throw Error(json.error);
    }
    console.log("json2:", json);
    return { user: json };
  } catch (error) {
    return error;
  }
};

export default signupAction;
