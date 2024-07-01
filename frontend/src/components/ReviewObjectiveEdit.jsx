import { useState } from "react";
import { Form } from "react-router-dom";

import { Flex, Text, Box, Link, Button, TextArea } from "@radix-ui/themes";

import * as Collapsible from "@radix-ui/react-collapsible";

import {
  RowSpacingIcon,
  Cross2Icon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";

const ReviewObjectiveEdit = ({
  objective,
  setReviewInState,
  i,
  searchedUsers,
  actionIndex,
  handleSaveProjectReview,
  reviewInStateChangedRef,
  accentColor,
  changeActioneeNotificationData,
  actioneeNotificationData,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root
      className="CollapsibleRoot"
      open={open}
      onOpenChange={setOpen}
      style={{
        color: accentColor,
      }}
    >
      <Flex align="center" justify="between" gap="2">
        <div
          className="Repository"
          style={{
            flex: 1,
          }}
        >
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Objective {i + 1}
            </Text>
            <TextArea
              variant="soft"
              color={accentColor}
              defaultValue={objective.title}
              onChange={(e) => {
                setReviewInState((draft) => {
                  reviewInStateChangedRef.current = true;
                  const newObjectives = draft.objectives.map((obj, j) => {
                    if (i === j)
                      return {
                        ...obj,
                        title: e.target.value,
                      };
                    return obj;
                  });
                  draft.objectives = newObjectives;
                });
              }}
            />
          </label>
        </div>
        <Collapsible.Trigger asChild>
          <button className="IconButton">
            {open ? <Cross2Icon /> : <RowSpacingIcon />}
          </button>
        </Collapsible.Trigger>
      </Flex>

      <Collapsible.Content>
        <Box as="div" className="Repository">
          <Text as="div" size="3" mb="1" weight="bold">
            Actions:{" "}
          </Text>
          {objective.actions?.map((action, k, arr) => {
            return (
              <Box as="div" key={action._id} mb="5">
                <label>
                  <Flex align="center" justify="between" mb="1">
                    <Text as="div" size="2" mb="1" weight="bold">
                      Action {k + 1}
                    </Text>
                    <Form>
                      <Flex gap="2">
                        <input
                          placeholder="find actionee.."
                          type="text"
                          name="assignUser"
                        />
                        <input type="hidden" name="actionIndex" value={k} />
                        <button>Search...</button>
                      </Flex>
                    </Form>
                  </Flex>
                  {Number(actionIndex) === k &&
                    searchedUsers?.map((user) => (
                      <Link
                        // href="#"
                        key={user._id}
                        onClick={() => {
                          reviewInStateChangedRef.current = true;
                          if (!changeActioneeNotificationData.current) {
                            actioneeNotificationData.current = {
                              notificationTracker: [],
                            };
                          }
                          changeActioneeNotificationData(
                            objective._id,
                            action._id,
                            user._id
                          );
                          setReviewInState((draft) => {
                            if (
                              !draft.objectives[i].actions[k].actionees
                                .map((act) => act._id)
                                .includes(user._id)
                            ) {
                              draft.objectives[i].actions[k].actionees.push(
                                user
                              );
                            }
                          });
                        }}
                      >
                        {user.email}
                      </Link>
                    ))}
                  <TextArea
                    variant="soft"
                    color={accentColor}
                    defaultValue={action.content}
                    onChange={(e) => {
                      reviewInStateChangedRef.current = true;
                      setReviewInState((draft) => {
                        draft.objectives[i].actions[k].content = e.target.value;
                      });
                      // setReviewObjectives((draft) => {
                      //   return draft.map((obj, j) => {
                      //     if (i === j) {
                      //       return {
                      //         ...obj,
                      //         actions: obj.actions.map((action, l) => {
                      //           if (k === l) {
                      //             return {
                      //               ...action,
                      //               content: e.target.value,
                      //             };
                      //           }
                      //           return action;
                      //         }),
                      //       };
                      //     }
                      //     return obj;
                      //   });
                      // });
                    }}
                  />
                  <Flex wrap="wrap">
                    {action.actionees.map((actionee, m) => (
                      <Flex key={actionee._id} align="center" gap="2" mr="3">
                        <small>{actionee.email}</small>
                        <Button
                          style={{ padding: "0px" }}
                          variant="ghost"
                          onClick={() => {
                            const filteredActionees = action.actionees.filter(
                              (actionee, n) => {
                                if (m !== n) return actionee;
                              }
                            );
                            reviewInStateChangedRef.current = true;
                            setReviewInState((draft) => {
                              draft.objectives[i].actions[k].actionees =
                                filteredActionees;
                            });
                            // setReviewObjectives((draft) => {
                            //   return draft.map((obj, j) => {
                            //     if (i === j) {
                            //       return {
                            //         ...obj,
                            //         actions: obj.actions.map((action, l) => {
                            //           if (k === l) {
                            //             return {
                            //               ...action,
                            //               actionees: action.actionees.filter(
                            //                 (actionee, n) => {
                            //                   if (m !== n) return actionee;
                            //                 }
                            //               ),
                            //             };
                            //           }
                            //           return action;
                            //         }),
                            //       };
                            //     }
                            //     return obj;
                            //   });
                            // });
                          }}
                        >
                          <CrossCircledIcon />
                        </Button>
                      </Flex>
                    ))}
                  </Flex>
                </label>
                <button
                  onClick={() => {
                    console.log("clicked");
                    const filteredActions = arr.filter((action, l) => {
                      if (k !== l) return action;
                    });
                    console.log(filteredActions);
                    setReviewInState((draft) => {
                      reviewInStateChangedRef.current = true;
                      draft.objectives[i].actions = filteredActions;
                    });
                  }}
                >
                  delete action
                </button>
              </Box>
            );
          })}
        </Box>
        <Text as="div" size="2" mb="1" weight="bold">
          Add new action
        </Text>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveProjectReview(
              {
                content: document.getElementById("newObjectiveAction").value,
                objectiveId: objective._id,
              },
              "newAction"
            );
          }}
        >
          <Box as="div" mb="3">
            <Flex align="center" gap="2">
              <TextArea
                style={{ flex: "1" }}
                id="newObjectiveAction"
                name="content"
                placeholder="New action.."
              />

              <button type="submit">Add</button>
            </Flex>
          </Box>
        </form>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default ReviewObjectiveEdit;
