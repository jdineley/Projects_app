const loginLoader = async () => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const res = await fetch(`${VITE_REACT_APP_API_URL}/users/login`);

  if (!res.ok) {
    throw Error("LOGIN FAILED");
  }

  const user = await res.json();

  //   localStorage.setItem("user", JSON.stringify(user));

  return user;
};

export default loginLoader;
