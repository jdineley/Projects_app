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
// import { MSIdentitySignInButton } from "../components/MSIdentitySignInButton";

// radixUI
import { Button, DropdownMenu, Flex, Avatar, Text } from "@radix-ui/themes";

import BreadCrumbs from "../components/BreadCrumbs";

// icons
import { FcCollaboration } from "react-icons/fc";
import { IoIosNotifications } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { FaMicrosoft } from "react-icons/fa";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// constants
import { mobileScreenWidth, tabletScreenWidth } from "../utility";

export default function RouteLayout() {
  // const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);

  const { user, dispatch } = useAuthContext();
  const location = useLocation();
  // console.log("location.pathname", location.pathname);
  // console.log("user", user);

  const submit = useSubmit();

  const actionDataMonitor = useRef(false);

  const { userObj, notificationsCleared } = useLoaderData();

  // console.log("userObj", userObj);
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
    if (
      !user &&
      location.pathname !== "/account/signup" &&
      location.pathname !== "/learning" &&
      location.pathname !== "/account/login" &&
      location.pathname !== "/account/microsoft" &&
      location.pathname !== "/account"
    ) {
      navigate("/");
    }
    if (notificationsCleared) {
      if (notification) {
        notificationDispatch({
          type: "CLEAR_NOTIFICATIONS",
        });
        navigate(currentPathNoQuery);
      }
    }

    if (!notification && !userObj?.error) {
      console.log("in redistribute notifications...", notification);

      if (userObj?.recievedNotifications.length > 0) {
        userObj.recievedNotifications.forEach((url) => {
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
      <>
        <header>
          <nav>
            <div id="app-title">
              <FcCollaboration size="40px" />
              <h1>Projects</h1>
            </div>
            {!user && (
              <NavLink to="/">
                <Button variant="ghost" color="gray">
                  Home
                  {/* {!isMobileResolution ? "Home" : "Dash"} */}
                </Button>
              </NavLink>
            )}
            {user && !isTabletResolution && (
              <NavLink to="/dashboard">
                <Button variant="ghost" color="gray">
                  Dahboard
                  {/* {!isMobileResolution ? "Dashboard" : "Dash"} */}
                </Button>
              </NavLink>
            )}
            {user && !isTabletResolution && (
              <NavLink to="/projects">
                <Button variant="ghost" color="gray">
                  Projects
                  {/* {!isMobileResolution ? "Projects" : "Proj"} */}
                </Button>
              </NavLink>
            )}
            {!isTabletResolution && (
              <NavLink to="/learning">
                <Button variant="ghost" color="gray">
                  Learning
                  {/* {!isMobileResolution ? "Learning" : "Learn"} */}
                </Button>
              </NavLink>
            )}
            {user?.isTenantAdmin && !isTabletResolution && (
              <NavLink to="/admin">
                <Button variant="ghost" color="gray">
                  Admin
                </Button>
              </NavLink>
            )}
            {user && !isTabletResolution && (
              <NavLink to="/tickets">
                <Button variant="ghost" color="gray">
                  Ticket
                  {/* {!isMobileResolution ? "Ticket" : "Tick"} */}
                </Button>
              </NavLink>
            )}
            {!user && !isTabletResolution && (
              <NavLink to="/account">
                <VscAccount />
              </NavLink>
            )}
            {/* <NavLink to="https://jdineley.github.io/Projects_app/">
              <Button variant="ghost" color="gray">
                {!isMobileResolution ? "Playwright - CI" : "CI"}
              </Button>
            </NavLink> */}
            {user && !isTabletResolution && (
              <div className="current-user-container">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Flex gap="2" data-testid="avatar">
                      {/* <Button data-testid="avatar" display="none"> */}
                      <Avatar
                        fallback={
                          notification ? (
                            <>
                              <IoIosNotifications color="white" size="1.5em" />
                              <Text
                                size="1"
                                highContrast={true}
                                className="text-white"
                              >
                                {urls.length}
                              </Text>
                            </>
                          ) : (
                            <AvatarCustom user={user} />
                          )
                        }
                        className={notification ? "notification" : "avatar"}
                      />
                      {/* </Button> */}
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
                          // console.log("queryString", queryString);
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
                            } else if (
                              new RegExp("reviewTitle", "i").test(str)
                            ) {
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
                          // console.log("urls", urls);
                          // console.log(
                          //   "notificationControlObj",
                          //   notificationControlObj
                          // );
                          return (
                            <Link key={i} to={url} data-testid="avatar-drop">
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
          <div className="flex justify-between">
            {currentPathNoQuery !== "/user" && <BreadCrumbs />}
            <Text size="1">{user?.email}</Text>
          </div>
          {isTabletResolution && (
            <Text size="1" color="red">
              Currently a Desktop application only
            </Text>
          )}
        </header>
        <main className={navigation.state !== "idle" ? "loading" : ""}>
          <Outlet />
        </main>
      </>
      <footer>
        <small>© Projects-Web 2025</small>
        {/* <a href="https://github.com/jdineley/Projects_app">
          <FaGithub />
        </a> */}
      </footer>
    </div>
  );
}
