import {
  Dialog,
  Button,
  Flex,
  TextField,
  Text,
  Badge,
  HoverCard,
  Box,
  Heading,
} from "@radix-ui/themes";

import { msProjectGuidance } from "../../utility";

// icons
import { CiTrash } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";
import { TiVendorMicrosoft } from "react-icons/ti";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RxCircle } from "react-icons/rx";

const ProjectEditDialog_defeatured = ({
  project,

  user,
}) => {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger>
          <FaEdit className="cursor-pointer text-blue-600" />
        </Dialog.Trigger>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit Project</Dialog.Title>
          {project.inWork && (
            <>
              <Flex direction="column" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Project title
                  </Text>
                  <TextField.Input
                    name="title"
                    disabled={project.msProjectGUID ? true : false}
                    defaultValue={project.title}
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Project start date
                  </Text>
                  <input
                    type="date"
                    disabled={project.msProjectGUID ? true : false}
                    defaultValue={
                      new Date(project.start).toISOString().split("T")[0]
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Project end date
                  </Text>
                  <input
                    type="date"
                    disabled={project.msProjectGUID ? true : false}
                    defaultValue={
                      new Date(project.end).toISOString().split("T")[0]
                    }
                  />
                </label>

                {project.reviews.map((review, i, arr) => (
                  <div key={review._id} className="review-form">
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Review Title {!review._id && <Badge>new review</Badge>}
                      </Text>
                      <TextField.Input
                        name="title"
                        defaultValue={review.title}
                      />
                    </label>
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Review date
                      </Text>
                      <input
                        type="date"
                        defaultValue={
                          review.date &&
                          new Date(review.date).toISOString().split("T")[0]
                        }
                      />
                    </label>
                    {review._id && (
                      <button className="review-trash">
                        <CiTrash size="20px" />
                      </button>
                    )}
                  </div>
                ))}
              </Flex>

              <Flex justify="between">
                <Button>Add Review</Button>
                {project.reviews.some((rev) => !rev._id) && (
                  <button className="review-trash">
                    Delete all new reviews
                  </button>
                )}
              </Flex>
            </>
          )}

          <Flex gap="3" mt="4" mb="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            {project.inWork ? (
              <>
                <Dialog.Close>
                  <Button>Save</Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button color="tomato">Archive Project</Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button color="tomato">Freeze</Button>
                </Dialog.Close>
              </>
            ) : (
              <Dialog.Close>
                <Button color="tomato">Unfreeze</Button>
              </Dialog.Close>
            )}
          </Flex>
          {project.msProjectGUID && project.owner._id === user?._id && (
            <>
              <hr className="mb-5" />
              {!project.inWork ? (
                <>
                  <Flex align="center" gap="2" mb="4" className="relative">
                    <TiVendorMicrosoft />
                    <Dialog.Title mb="0">Update MS Project</Dialog.Title>
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
                                {msProjectGuidance.map((g, i) => {
                                  return (
                                    <li key={i} className="mb-2">
                                      {g}
                                    </li>
                                  );
                                })}
                              </Text>
                            </Box>
                          </Flex>
                        </HoverCard.Content>
                      </HoverCard.Root>{" "}
                    </Text>
                    {/* {loading && (
                        <div className="spinner absolute right-0"></div>
                      )} */}
                  </Flex>
                  <div className="mb-4">
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
                    Pre-Checks:
                  </Heading>
                  <Flex direction="column" gap="8">
                    <Flex gap="3">
                      <RxCircle className="text-3xl min-w-7" />

                      <Box className="relative w-full">
                        <Text className="absolute">
                          All work resources must have a valid email with an
                          existing account.
                        </Text>
                      </Box>
                    </Flex>
                    <Flex gap="3">
                      <RxCircle className="text-3xl min-w-7" />

                      <Box className="relative w-full">
                        <Text className="absolute">
                          All work based tasks should be assigned a work
                          resource.
                        </Text>
                      </Box>
                    </Flex>
                    <Flex gap="3">
                      <RxCircle className="text-3xl min-w-7" />

                      <Box className="relative w-full">
                        <Text className="absolute">
                          No Summary Tasks as Predecessors.
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                </>
              ) : (
                <Flex justify="between" align="center" gap="2" mb="4">
                  <Flex align="center" gap="2">
                    <TiVendorMicrosoft />
                    <Dialog.Title mb="0">
                      Freeze for schedule review
                    </Dialog.Title>
                  </Flex>
                </Flex>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default ProjectEditDialog_defeatured;
