const projectAction =
  (user) =>
  async ({ request }) => {
    console.log("in project action");
    const { VITE_REACT_APP_API_URL } = import.meta.env;
    const data = await request.formData();
    const { intent, ...list } = Object.fromEntries(data);
    // const formData = Object.fromEntries(data);
    // console.log("formData", formData);
    // console.log("intent", intent);
    // console.log("list", list);
    // console.log("file", data.get("file"));
    // console.log(request, data);
    if (intent === "edit-project") {
      const { projectId, title, start, end, ...reviews } = list;
      try {
        const res = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/projects/${projectId}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ intent, title, start, end, ...reviews }),
          }
        );
        const json = await res.json();
        console.log(json);
        if (!res.ok) {
          throw Error(json.error);
        }
        return json;
      } catch (error) {
        throw Error(error.message);
      }
    }
    if (intent === "create-new-project") {
      const { title, start, end, ...reviews } = list;

      try {
        const res = await fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ intent, title, start, end, ...reviews }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw Error(json.error);
        }
        console.log(json);
        return json;
      } catch (error) {
        throw Error("Failed to post new project");
      }
    }
    // if (intent === "delete-project") {
    //   if (window.confirm("Are you sure you want to delete?")) {
    //     try {
    //       const { projectId } = list;
    //       const res = await fetch(
    //         `http://localhost:4000/api/v1/projects/${projectId}`,
    //         {
    //           method: "DELETE",
    //           mode: "cors",
    //           headers: {
    //             Authorization: `Bearer ${user.token}`,
    //           },
    //           body: JSON.stringify({ intent }),
    //         }
    //       );
    //       const json = await res.json();
    //       if (!res.ok) {
    //         throw Error(json.error);
    //       }
    //       return json;
    //     } catch (error) {
    //       throw Error(error.message);
    //     }
    //   }
    // }
    if (intent === "archive-project") {
      try {
        const { projectId } = list;
        const res = await fetch(
          `${VITE_REACT_APP_API_URL}/api/v1/projects/${projectId}`,
          {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ intent }),
          }
        );
        const json = await res.json();
        console.log("json", json);
        if (!res.ok) {
          throw Error(json.error);
        }
        return json;
      } catch (error) {
        throw Error(error.message);
      }
    }
    // if (intent === "import-ms-project") {
    // try {
    //   const res = await fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects`, {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${user.token}`,
    //     },
    //     body: formData,
    //   });
    //   const json = await res.json();
    //   if (!res.ok) {
    //     throw Error(json.error);
    //   }
    //   console.log(json);
    //   return json;
    // } catch (error) {
    //   throw Error(error.message);
    // }
    // }
    // return null;
  };

export default projectAction;
