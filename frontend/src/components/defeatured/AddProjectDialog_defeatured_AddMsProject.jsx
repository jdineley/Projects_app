import { msProjectGuidance } from "../../utility";

import {
  Dialog,
  Button,
  Flex,
  TextField,
  Text,
  Select,
  HoverCard,
  Box,
  Heading,
} from "@radix-ui/themes";

// icons
import { MdOutlinePostAdd } from "react-icons/md";
import { TiVendorMicrosoft } from "react-icons/ti";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RxCheckCircled } from "react-icons/rx";
import { RxCrossCircled } from "react-icons/rx";
import { RxCircle } from "react-icons/rx";

const AddProjectDialog_defeatured_AddMsProject = ({
  err1,
  err2,
  err3,
  chk1,
  chk2,
  chk3,
}) => {
  return (
    <Box
      style={{
        maxWidth: "350px",
        border: "1px solid lightGrey",
        borderRadius: "10px",
        padding: "10px",
        // margin: "auto",
        // marginTop: "20px",
        paddingBottom: err3 ? "90px" : "80px",
      }}
    >
      <Flex align="center" gap="2" mb="4" className="relative">
        <TiVendorMicrosoft />
        <Heading mb="0">Add new MS Project</Heading>
        <Text>
          <HoverCard.Root>
            <HoverCard.Trigger>
              <div>
                <IoIosInformationCircleOutline />
              </div>
            </HoverCard.Trigger>
            <HoverCard.Content className="max-w-80">
              <Flex gap="4">
                <Box>
                  <Heading size="3" as="h3" mb="1">
                    Importing Ms Project Guidance:
                  </Heading>
                  <Text as="div" size="2" color="gray" mt="3">
                    <ul>
                      {msProjectGuidance.map((g, i) => {
                        return (
                          <li key={i} className="mb-2">
                            {g}
                          </li>
                        );
                      })}
                    </ul>
                  </Text>
                </Box>
              </Flex>
            </HoverCard.Content>
          </HoverCard.Root>{" "}
        </Text>
        {!err1 && !err2 && !err3 && (
          <div className="spinner absolute right-0"></div>
        )}
      </Flex>
      <div>
        <Text as="div" size="2" mb="1" weight="bold">
          Import .xml file from MS Project Desktop
        </Text>
        <Flex gap="4">
          <input
            type="file"
            name="uploadFile"
            accept=".xml"
            id="xml-file"
            disabled
            required
          />
          <Button mt="2">Upload</Button>
        </Flex>
      </div>
      <Heading size="3" as="h3" mb="2">
        Pre-Checks:{" "}
        <small className="text-red-500">
          {err1 || err2 || (err3 && "Correct errors and resubmit")}
        </small>
      </Heading>
      <Flex direction="column" gap="8">
        <Flex gap="3">
          {err1 ? (
            <RxCrossCircled className="text-3xl text-red-500 min-w-7" />
          ) : chk1 ? (
            <RxCheckCircled className="text-3xl min-w-7 text-green-500" />
          ) : (
            <RxCircle className="text-3xl min-w-7" />
          )}
          <Box className="relative w-full">
            <Text className="absolute" size="2">
              All work resources must have a valid email with an existing
              account.
            </Text>
            {err1 && (
              <Text className="absolute top-12  text-red-500" size="1">
                {err1}
              </Text>
            )}
          </Box>
        </Flex>
        <Flex gap="3">
          {err2 ? (
            <RxCrossCircled className="text-3xl text-red-500 min-w-7" />
          ) : chk2 ? (
            <RxCheckCircled className="text-3xl min-w-7 text-green-500" />
          ) : (
            <RxCircle className="text-3xl min-w-7" />
          )}
          <Box className="relative w-full">
            <Text className="absolute" size="2">
              All work based tasks should be assigned a work resource.
            </Text>
            {err2 && (
              <Text className="absolute top-12  text-red-500" size="1">
                {err2}
              </Text>
            )}
          </Box>
        </Flex>
        <Flex gap="3">
          {err3 ? (
            <RxCrossCircled className="text-3xl text-red-500 min-w-7" />
          ) : chk3 ? (
            <RxCheckCircled className="text-3xl min-w-7 text-green-500" />
          ) : (
            <RxCircle className="text-3xl min-w-7" />
          )}
          <Box className="relative w-full">
            <Text className="absolute" size="2">
              No Summary Tasks as Predecessors.
            </Text>
            {err3 && (
              <Text className="absolute top-6  text-red-500" size="1">
                {err3}
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
    // </Dialog.Root>
  );
};

export default AddProjectDialog_defeatured_AddMsProject;
