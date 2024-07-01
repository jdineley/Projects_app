const loginLoader = async () => {
  const res = await fetch("http://localhost:4000/api/v1/users/login");

  if (!res.ok) {
    throw Error("LOGIN FAILED");
  }

  const user = await res.json();

  //   localStorage.setItem("user", JSON.stringify(user));

  return user;
};

export default loginLoader;
