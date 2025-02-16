const loginAction = async ({ request }) => {
  console.log("hit loginAction");
  const { VITE_REACT_APP_API_URL } = import.meta.env;

  const data = await request.formData();
  const submission = Object.fromEntries(data);
  const { accessToken } = submission;
  console.log("accessToken", accessToken);

  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (accessToken) {
      headers.append("Authorization", `Bearer ${accessToken}`);
    }
    const options = {
      method: "POST",
      mode: "cors",
      headers: headers,
      body: JSON.stringify(submission),
    };
    const response = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/users/${
        accessToken ? "loginEntraID" : "login"
      }`,
      options
    );
    if (response.statusText === "Not Found") {
      throw Error("Server connection error");
    }
    const json = await response.json();
    if (!response.ok) {
      throw Error(json.error);
    }
    console.log("JSON@@£@£@£@£@@£@£@£@£", json);
    return json;
  } catch (error) {
    return error;
  }
};

export default loginAction;
