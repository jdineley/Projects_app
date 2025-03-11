import { useState, useRef, useEffect } from "react";
import { useFetcher, useSubmit, Form } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";

import { Button, Dialog, Flex, Text } from "@radix-ui/themes";

import { FaFileImport } from "react-icons/fa6";
import { TiVendorMicrosoft } from "react-icons/ti";

const ImportProjectDialog = () => {
  const token = user?.token ? user?.token : user?.accessToken;
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const { user } = useAuthContext();
  // const [open, setOpen] = useState(false);
  // const fetcher = useFetcher();
  // const submit = useSubmit();

  // const importProjectButtonRef = useRef(null);

  // let importing = false;

  // const uploadFile = () => {
  //   const file = document.getElementById("xml-file").files[0];
  //   console.dir(file);
  //   const formData = new FormData();

  //   formData.append("file", file);
  //   formData.append("intent", "import-ms-project");
  //   fetcher.submit(formData, { method: "Post" });
  // };

  useEffect(() => {
    const uploadForm = document.querySelector(".upload");
    uploadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let file = e.target.uploadFile.files[0];
      let formData = new FormData();
      formData.append("file", file);
      fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.errors) {
            alert(data.errors);
          } else {
            console.log(data);
          }
        });
    });
  }, []);

  return (
    <form method="post" className="upload" enctype="multipart/form-data">
      <input
        type="file"
        name="uploadFile"
        accept=".xml"
        id="xml-file"
        required
      />
      {/* <Dialog.Root
        open={open}
        onOpenChange={() => {
          if (open) {
            if (importing) {
              if (window.confirm("Are you sure you want to import?")) {
                submit(importProjectButtonRef.current);
                // uploadFile();
                setOpen(false);
              }
            } else {
              if (window.confirm("Are you sure you want to cancel?")) {
                setOpen(false);
              }
            }
          } else {
            setOpen(true);
          }
        }}
      >
        <Dialog.Trigger>
          <FaFileImport className="cursor-pointer text-blue-600" />
        </Dialog.Trigger>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Flex justify="between">
            <Dialog.Title>Import MS Project</Dialog.Title>
            <TiVendorMicrosoft />
          </Flex>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Upload MS Project .xml file
            </Text>
            <input
              type="file"
              name="uploadFile"
              accept=".xml"
              id="xml-file"
              required
            />
          </label>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button
                onClick={() => {
                  importing = true;
                }}
              >
                Import Project
                <TiVendorMicrosoft />
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root> */}
      <input
        type="submit"
        // name="intent"
        // value="import-ms-project"
        // ref={importProjectButtonRef}
        // style={{ display: "none" }}
      />
    </form>
  );
};

export default ImportProjectDialog;
