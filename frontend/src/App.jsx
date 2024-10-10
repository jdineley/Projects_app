import "react-loading-skeleton/dist/skeleton.css";

import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Link,
} from "react-router-dom";

// Layouts
import RootLayout from "./layouts/RootLayout";
import ProjectLayout from "./layouts/ProjectLayout";
import ProjectDetailLayout from "./layouts/ProjectDetailLayout";
import TasksLayout from "./layouts/TasksLayout";
import TasksDetailLayout from "./layouts/TasksDetailLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectError from "./pages/ProjectError";
import ProjectsDetail from "./pages/ProjectsDetail";
import TaskDetail from "./pages/TaskDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LoginError from "./pages/errors/LoginError";
import Error from "./pages/errors/Error";
import ProjectReview from "./pages/ProjectReview";
import UserProfile from "./pages/UserProfile";
import Learning from "./pages/Learning";

// loaders
import projectsLoader from "./loaders/projectLoader";
import projectDetailLoader from "./loaders/projectDetailLoader";
import taskDetailLoader from "./loaders/tasksDetailLoader";
import rootLayoutLoader from "./loaders/rootLayoutLoader";
import dashboardLoader from "./loaders/dashboardLoader";
import projectReviewLoader from "./loaders/projectReviewLoader";
import userProfileLoader from "./loaders/userProfileLoader";
import learningLoader from "./loaders/learningLoader";

// actions
import projectAction from "./actions/projectAction";
import signupAction from "./actions/signupAction";
import loginAction from "./actions/loginAction";
// import commentAction from "./actions/commentAction";
import projectDetailAction from "./actions/projectDetailAction";
import reviewAction from "./actions/reviewAction";
import userProfileAction from "./actions/userProfileAction";
import rootLayoutAction from "./actions/rootLayoutAction";

// auth context
import { useAuthContext } from "./hooks/useAuthContext";

function App() {
  const { user } = useAuthContext();
  console.log(user);
  const router = (user) =>
    createBrowserRouter(
      createRoutesFromElements(
        <>
          <Route
            path="/"
            element={<RootLayout />}
            errorElement={<Error />}
            loader={rootLayoutLoader(user)}
            action={rootLayoutAction(user)}
          >
            <Route
              path="dashboard"
              element={<Dashboard />}
              loader={dashboardLoader(user)}
            />
            <Route
              path="login"
              element={<Login />}
              action={loginAction}
              errorElement={<LoginError />}
            />
            <Route
              path="signup"
              element={<Signup />}
              action={signupAction}
              errorElement={<LoginError />}
            />
            <Route
              path="learning"
              element={<Learning />}
              loader={learningLoader}
            />
            <Route
              path="projects"
              element={<ProjectLayout />}
              errorElement={<ProjectError />}
              handle={{
                crumb: () => <Link to="/projects">Projects</Link>,
              }}
            >
              <Route
                index
                element={<Projects />}
                action={projectAction(user)}
                loader={projectsLoader(user)}
              />
              <Route
                path=":projectId"
                element={<ProjectDetailLayout />}
                // loader={projectDetailLoader(user)}
                handle={{
                  crumb: ({ projectId }) => (
                    <Link to={`/projects/${projectId}`}>Project detail</Link>
                  ),
                }}
              >
                <Route
                  index
                  element={<ProjectsDetail />}
                  action={projectDetailAction(user)}
                  loader={projectDetailLoader(user)}
                />
                <Route path="reviews">
                  <Route
                    path=":reviewId"
                    element={<ProjectReview />}
                    action={reviewAction(user)}
                    loader={projectReviewLoader(user)}
                    handle={{
                      crumb: ({ projectId, reviewId }) => (
                        <Link to={`/projects/${projectId}/reviews/${reviewId}`}>
                          Project review
                        </Link>
                      ),
                    }}
                  />
                </Route>
                <Route path="tasks" element={<TasksLayout />}>
                  <Route
                    path=":taskId"
                    element={<TasksDetailLayout />}
                    // loader={projectDetailLoader(user)}
                  >
                    <Route
                      index
                      element={<TaskDetail />}
                      loader={taskDetailLoader(user)}
                      action={projectDetailAction(user)}
                      // action={commentAction(user)}
                      handle={{
                        crumb: ({ projectId, taskId }) => (
                          <Link to={`/projects/${projectId}/tasks/${taskId}`}>
                            Task detail
                          </Link>
                        ),
                      }}
                    />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route
              path="/user"
              element={<UserProfile />}
              errorElement={<Error />}
              loader={userProfileLoader(user)}
              action={userProfileAction(user)}
            />
          </Route>
        </>
      )
    );

  return <RouterProvider router={router(user)} />;
}

export default App;
