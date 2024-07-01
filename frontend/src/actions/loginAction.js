const loginAction = async ({ request }) => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const data = await request.formData();
  const submission = Object.fromEntries(data);

  try {
    const response = await fetch(`${VITE_REACT_APP_API_URL}/users/login`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });
    if (response.statusText === "Not Found") {
      throw Error("Server connection error");
    }
    const json = await response.json();
    if (!response.ok) {
      throw Error(json.error);
    }
    return json;
  } catch (error) {
    return error;
  }
};

export default loginAction;
