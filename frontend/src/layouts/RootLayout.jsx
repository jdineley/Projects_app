import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  useNavigation,
  useLoaderData,
  Form,
  useActionData,
  useSubmit,
} from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNotificationContext } from "../hooks/useNotificationContext";
import { useLogout } from "../hooks/useLogout";
import { useEffect, useRef } from "react";

// components
import AvatarCustom from "../Avatar";

// radixUI
import { Button, DropdownMenu, Flex, Avatar, Text } from "@radix-ui/themes";

import BreadCrumbs from "../components/BreadCrumbs";

// incons
import { FcCollaboration } from "react-icons/fc";
import { IoIosNotifications } from "react-icons/io";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// constants
import { mobileScreenWidth } from "../utility";

export default function RouteLayout() {
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);

  const { user, dispatch } = useAuthContext();
  const location = useLocation();

  const submit = useSubmit();

  const actionDataMonitor = useRef(false);

  const { userObj, notificationsCleared } = useLoaderData();
  console.log(userObj);
  const path = useActionData();
  if (path) {
    actionDataMonitor.current = true;
  }

  const currentPathNoQuery = location.pathname.split("?")[0];

  const {
    notification,
    urls,
    dispatch: notificationDispatch,
  } = useNotificationContext();

  const navigate = useNavigate();
  const navigation = useNavigation();

  const { logout } = useLogout();

  useEffect(() => {
    console.log("in RootLayout useEffect");
    if (user && location.pathname === "/") {
      navigate("/dashboard");
    }
    if (user && userObj?.error) {
      localStorage.removeItem("user");
      dispatch({
        type: "LOGOUT",
      });
    }
    if (!user && location.pathname !== "/signup") {
      navigate("/login");
    }
    if (notificationsCleared) {
      if (notification) {
        notificationDispatch({
          type: "CLEAR_NOTIFICATIONS",
        });
      }
      // navigate(location.pathname);
    }
    if (!notification && !userObj?.error) {
      if (userObj?.recentReceivedComments.length > 0) {
        console.log("Notification - new comments received");
        userObj.recentReceivedComments.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
      if (userObj?.recentReceivedReplies?.length > 0) {
        console.log("Notification - new replies received");
        userObj.recentReceivedReplies.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
      if (userObj?.recentReceivedTasks?.length > 0) {
        console.log("Notification - new tasks received");
        userObj.recentReceivedTasks.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
      if (userObj?.recentReceivedVacRequest?.length > 0) {
        console.log("Notification - new vacation requests received");
        userObj.recentReceivedVacRequest.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
      if (userObj?.recentReceivedVacAccepted?.length > 0) {
        console.log("Notification - new vacation accepted received");
        userObj.recentReceivedVacAccepted.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
      if (userObj?.recentReceivedVacRejected?.length > 0) {
        console.log("Notification - new vacation rejected received");
        userObj.recentReceivedVacRejected.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
      if (userObj?.recentReceivedVacApproved?.length > 0) {
        console.log("Notification - new vacation approved received");
        userObj.recentReceivedVacApproved.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
      if (userObj?.recentReceivedVacDeleted?.length > 0) {
        console.log("Notification - new vacation approved received");
        userObj.recentReceivedVacDeleted.forEach((url) => {
          notificationDispatch({
            type: "NEW_NOTIFICATION",
            payload: {
              url,
            },
          });
        });
      }
    }
  }, [
    user,
    navigate,
    notification,
    userObj,
    notificationDispatch,
    location.pathname,
    notificationsCleared,
    dispatch,
  ]);

  return (
    <div className="root-layout">
      <header>
        <nav>
          <div id="app-title">
            <FcCollaboration size="40px" />
            <h1>Projects</h1>
            {/* {currentPathNoQuery === "/user" ? <p>- user profile</p> : ""} */}
          </div>
          {user && (
            <NavLink to="/dashboard">
              <Button variant="ghost" color="gray">
                {!isMobileResolution ? "Dashboard" : "Dash"}
              </Button>
            </NavLink>
          )}
          {user && (
            <NavLink to="/projects">
              <Button variant="ghost" color="gray">
                {!isMobileResolution ? "Projects" : "Proj"}
              </Button>
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login">
              <Button variant="ghost" color="gray">
                Login
              </Button>
            </NavLink>
          )}
          {!user && (
            <NavLink to="/signup">
              <Button variant="ghost" color="gray">
                Signup
              </Button>
            </NavLink>
          )}
          {user && (
            <div className="current-user-container">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Flex gap="2">
                    <Avatar
                      fallback={
                        notification ? (
                          <>
                            <IoIosNotifications color="white" size="1.5em" />
                            <Text size="1" highContrast={true}>
                              ({urls.length})
                            </Text>
                          </>
                        ) : (
                          <AvatarCustom user={user} />
                        )
                      }
                      className={notification ? "notification" : "avatar"}
                    />
                  </Flex>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {notification
                    ? urls.map((url, i) => {
                        const notificationControlObj = {
                          intent: "",
                          projectTitle: "",
                          user: "",
                          date: "",
                          reviewTitle: "",
                          objectiveTitle: "",
                          actionContent: "",
                        };
                        const queryString = url.split("?")[1];
                        queryString.split("&").forEach((str) => {
                          if (new RegExp("intent", "i").test(str)) {
                            notificationControlObj.intent = str.split("=")[1];
                          } else if (new RegExp("date", "i").test(str)) {
                            notificationControlObj.date = str.split("=")[1];
                          } else if (new RegExp("user", "i").test(str)) {
                            notificationControlObj.user = str.split("=")[1];
                          } else if (
                            new RegExp("projectTitle", "i").test(str)
                          ) {
                            notificationControlObj.projectTitle =
                              str.split("=")[1];
                          } else if (new RegExp("reviewTitle", "i").test(str)) {
                            notificationControlObj.reviewTitle =
                              str.split("=")[1];
                          } else if (
                            new RegExp("objectiveTitle", "i").test(str)
                          ) {
                            notificationControlObj.objectiveTitle =
                              str.split("=")[1];
                          } else if (
                            new RegExp("actionContent", "i").test(str)
                          ) {
                            notificationControlObj.actionContent =
                              str.split("=")[1].slice(0, 15) + "...";
                          }
                        });

                        return (
                          <Link key={url} to={url}>
                            <DropdownMenu.Item>
                              {`${notificationControlObj.intent}`}

                              {notificationControlObj.projectTitle &&
                                ` *  ${notificationControlObj.projectTitle}`}
                              {notificationControlObj.user &&
                                ` *  ${notificationControlObj.user}`}
                              {notificationControlObj.reviewTitle &&
                                ` / ${notificationControlObj.reviewTitle}`}
                              {notificationControlObj.objectiveTitle &&
                                ` / ${notificationControlObj.objectiveTitle}`}
                              {notificationControlObj.actionContent &&
                                ` / ${notificationControlObj.actionContent}`}
                              {notificationControlObj.date &&
                                ` * ${notificationControlObj.date}`}

                              {" - "}
                              {i + 1}
                            </DropdownMenu.Item>
                          </Link>
                        );
                      })
                    : "no notifications"}
                  {notification && (
                    <>
                      <Form method="POST" style={{ display: "none" }}>
                        <input name="intent" value={"clear-notifications"} />
                        <input name="path" value={location.pathname} />
                        <button id="clearNotifications"></button>
                      </Form>
                      <DropdownMenu.Item
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Are you sure you want clear all notifications"
                            )
                          ) {
                            submit(
                              document.getElementById("clearNotifications")
                            );
                          }
                        }}
                      >
                        <Text>Clear all notifications</Text>
                      </DropdownMenu.Item>
                    </>
                  )}

                  <DropdownMenu.Separator />
                  {currentPathNoQuery !== "/user" && (
                    <DropdownMenu.Item shortcut="">
                      <Link to="/user">User Profile</Link>
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item shortcut="" onClick={logout}>
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          )}
        </nav>
        {currentPathNoQuery !== "/user" && <BreadCrumbs />}
      </header>
      <main className={navigation.state === "loading" ? "loading" : ""}>
        <Outlet />
      </main>
    </div>
  );
}
