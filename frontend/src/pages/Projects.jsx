import {
  Link,
  useLoaderData,
  useFetcher,
  useSubmit,
  useActionData,
  // useOutletContext
} from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

import { formatDistanceToNow, format } from "date-fns";

// components
import ProjectEditDialog from "../components/ProjectEditDialog";
import AddProjectDialog from "../components/AddProjectDialog";

// radix
import { Table, Flex } from "@radix-ui/themes";

import { toast } from "react-toastify";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// constants
import { mobileScreenWidth } from "../utility";

export default function Projects() {
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);

  // const projects = useLoaderData();
  // const userObj = useOutletContext();

  const loaderJson = useLoaderData();
  let userObj;
  let projectDeleted;
  let userTableRows;
  let userTableRowsArchived;
  let otherUsersTableRows;
  let otherUsersTableRowsArchived;
  let hasSomeUnArchivedProjects;

  if (loaderJson) {
    ({ userObj, projectDeleted } = loaderJson);
  }
  const json = useActionData();
  const [projectTitle, setProjectTitle] = useState("");
  const [projectStart, setProjectStart] = useState("");
  const [projectEnd, setProjectEnd] = useState("");
  const [projectReviews, setProjectReviews] = useState([]); //{title: '...', date: '...'}

  useEffect(() => {
    console.log("in Project useEffect");
    if (json) {
      const { result } = json;
      toast(result);
    }
    if (projectDeleted) {
      toast(projectDeleted);
    }
  }, [json, projectDeleted]);

  const submit = useSubmit();
  const fetcher = useFetcher();

  const { user } = useAuthContext();

  const archiveButtonRef = useRef(null);

  if (userObj) {
    userTableRows = userObj.projects.map((project) => {
      if (!project.archived) {
        return (
          <Table.Row key={project._id}>
            <Table.Cell>
              <Link to={project._id}>{project.title}</Link>
            </Table.Cell>
            {!isMobileResolution && (
              <Table.Cell>
                {formatDistanceToNow(new Date(project.start))}
              </Table.Cell>
            )}
            <Table.Cell>
              {format(new Date(project.end), "MM/dd/yyyy")}
            </Table.Cell>
            {!isMobileResolution && (
              <Table.Cell>{project.tasks.length}</Table.Cell>
            )}
            <Table.Cell>
              <fetcher.Form method="POST" style={{ display: "none" }}>
                <input type="hidden" name="title" value={projectTitle} />
                <input type="hidden" name="start" value={projectStart} />
                <input type="hidden" name="end" value={projectEnd} />
                <input type="text" name="projectId" value={project._id} />
                {projectReviews.map((reviewObj, i) => {
                  if (reviewObj._id) {
                    return (
                      <div key={i}>
                        <input
                          type="hidden"
                          name={`reviewId${i}`}
                          value={reviewObj._id}
                        />
                        <input
                          type="hidden"
                          name={`title${i}`}
                          value={reviewObj.title}
                        />
                        <input
                          type="hidden"
                          name={`date${i}`}
                          value={reviewObj.date}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div key={i}>
                        <input type="hidden" name={`newReview${i}`} />
                        <input
                          type="hidden"
                          name={`Title${i}`}
                          value={reviewObj.title}
                        />
                        <input
                          type="hidden"
                          name={`Date${i}`}
                          value={reviewObj.date}
                        />
                      </div>
                    );
                  }
                })}
                <button
                  id={project._id}
                  type="submit"
                  name="intent"
                  value="edit-project"
                ></button>
              </fetcher.Form>

              <fetcher.Form method="POST" style={{ display: "none" }}>
                <input type="hidden" name="projectId" value={project._id} />
                <button
                  id={`archive-project-button${project._id}`}
                  type="submit"
                  name="intent"
                  value="archive-project"
                  ref={archiveButtonRef}
                ></button>
              </fetcher.Form>

              <ProjectEditDialog
                projectTitle={projectTitle}
                setProjectTitle={setProjectTitle}
                projectStart={projectStart}
                setProjectStart={setProjectStart}
                projectEnd={projectEnd}
                setProjectEnd={setProjectEnd}
                project={project}
                projectReviews={projectReviews}
                setProjectReviews={setProjectReviews}
                editProjectButton={document.getElementById(project._id)}
                archiveProjectButton={document.getElementById(
                  `archive-project-button${project._id}`
                )}
                submit={submit}
              />
            </Table.Cell>
          </Table.Row>
        );
      }
    });
    userTableRowsArchived = userObj.projects.map((project) => {
      if (project.archived) {
        return (
          <Table.Row key={project._id}>
            <Table.Cell>
              <Link to={project._id}>{project.title}</Link>
            </Table.Cell>
            <Table.Cell>
              {format(new Date(project.end), "dd/MM/yyyy")}
            </Table.Cell>
          </Table.Row>
        );
      }
    });

    otherUsersTableRows = userObj.userInProjects
      .map((project) => {
        if (!project.archived) {
          return (
            <Table.Row key={project._id}>
              <Table.Cell>
                <Link to={project._id}>{project.title}</Link>
              </Table.Cell>
              <Table.Cell>
                {format(new Date(project.end), "MM/dd/yyyy")}
              </Table.Cell>
              {!isMobileResolution && (
                <Table.Cell>{project.tasks.length}</Table.Cell>
              )}
              <Table.Cell>{project.owner.email.split("@")[0]}</Table.Cell>
            </Table.Row>
          );
        }
      })
      .filter((el) => el !== undefined);
    otherUsersTableRowsArchived = userObj.userInProjects
      .map((project) => {
        if (project.archived) {
          return (
            <Table.Row key={project._id}>
              <Table.Cell>
                <Link to={project._id}>{project.title}</Link>
              </Table.Cell>
              <Table.Cell>
                {format(new Date(project.end), "MM/dd/yyyy")}
              </Table.Cell>
              <Table.Cell>{project.owner.email}</Table.Cell>
            </Table.Row>
          );
        }
      })
      .filter((el) => el !== undefined);

    hasSomeUnArchivedProjects =
      userObj.projects.filter((project) => !project.archived).length > 0;
  }

  return (
    <div>
      <main>
        {user && (
          <div>
            <div className="title-icon-collect">
              <h3>My Active Projects</h3>
              <fetcher.Form method="POST" style={{ display: "none" }}>
                <input type="hidden" name="title" value={projectTitle} />
                <input type="hidden" name="start" value={projectStart} />
                <input type="hidden" name="end" value={projectEnd} />
                {projectReviews.map((reviewObj, i) => {
                  return (
                    <div key={i}>
                      <input
                        type="hidden"
                        name={`title${i}`}
                        value={reviewObj.title}
                      />
                      <input
                        type="hidden"
                        name={`date${i}`}
                        value={reviewObj.date}
                      />
                    </div>
                  );
                })}
                <button
                  id="create-project"
                  type="submit"
                  name="intent"
                  value="create-new-project"
                ></button>
              </fetcher.Form>
              <AddProjectDialog
                projectTitle={projectTitle}
                projectStart={projectStart}
                projectEnd={projectEnd}
                setProjectTitle={setProjectTitle}
                setProjectStart={setProjectStart}
                setProjectEnd={setProjectEnd}
                setProjectReviews={setProjectReviews}
                projectReviews={projectReviews}
                button={document.getElementById("create-project")}
                submit={submit}
              />
            </div>
            {hasSomeUnArchivedProjects && (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                    {!isMobileResolution && (
                      <Table.ColumnHeaderCell>Lifetime</Table.ColumnHeaderCell>
                    )}
                    <Table.ColumnHeaderCell>End date</Table.ColumnHeaderCell>
                    {!isMobileResolution && (
                      <Table.ColumnHeaderCell>
                        Active tasks
                      </Table.ColumnHeaderCell>
                    )}
                    <Table.ColumnHeaderCell>Edit</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{userTableRows}</Table.Body>
              </Table.Root>
            )}
          </div>
        )}
        {otherUsersTableRows?.length > 0 && (
          <div className="other-users-container">
            <h3>Other Active Projects</h3>
            {userObj.userInProjects.length > 0 && (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>End date</Table.ColumnHeaderCell>
                    {!isMobileResolution && (
                      <Table.ColumnHeaderCell>
                        Active tasks
                      </Table.ColumnHeaderCell>
                    )}
                    <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{otherUsersTableRows}</Table.Body>
              </Table.Root>
            )}
          </div>
        )}
        <Flex gap="5">
          {userObj?.archivedProjects?.length > 0 && (
            <div className="flex-1">
              <h3>My Archived Projects</h3>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>End date</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{userTableRowsArchived}</Table.Body>
              </Table.Root>
            </div>
          )}
          {otherUsersTableRowsArchived?.length > 0 && (
            <div className="flex-1">
              <h3>Other Archived Projects</h3>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>End date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{otherUsersTableRowsArchived}</Table.Body>
              </Table.Root>
            </div>
          )}
        </Flex>
      </main>
    </div>
  );
}
