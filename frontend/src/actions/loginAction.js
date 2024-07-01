const loginAction = async ({ request }) => {
  const data = await request.formData();
  const submission = Object.fromEntries(data);

  try {
    const response = await fetch("http://localhost:4000/api/v1/users/login", {
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
