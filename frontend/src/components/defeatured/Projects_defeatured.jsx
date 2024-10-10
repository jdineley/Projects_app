import {
  Link,
  useLoaderData,
  useFetcher,
  useSubmit,
  useActionData,
  useSearchParams,
  // useOutletContext
} from "react-router-dom";
import { useState, useRef, useEffect } from "react";
// import { useAuthContext } from "../hooks/useAuthContext";

import { formatDistanceToNow, format } from "date-fns";

// components
// import ProjectEditDialog from "../components/ProjectEditDialog";
// import AddProjectDialog from "../components/AddProjectDialog";
// import ImportProjectDialog from "../components/ImportProjectDialog";
import { TiVendorMicrosoft } from "react-icons/ti";
import AddProjectDialog_defeatured from "./AddProjectDialog_defeatured";
// radix
import { Table, Flex, Tooltip } from "@radix-ui/themes";

import { toast } from "react-toastify";

// hooks
import useMatchMedia from "../../hooks/useMatchMedia";

// constants
import { mobileScreenWidth } from "../../utility";

// components
import ProjectTitleEditDialogDefeatured from "./ProjectEditDialog_defeatured";

export default function ProjectsDefeatured({ userObj }) {
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);

  // const projects = useLoaderData();
  // const userObj = useOutletContext();

  // const loaderJson = useLoaderData();
  // let userObj;
  let projectDeleted;
  let userTableRows;
  let userTableRowsArchived;
  let otherUsersTableRows;
  let otherUsersTableRowsArchived;
  let hasSomeUnArchivedProjects;

  // if (loaderJson) {
  //   ({ userObj, projectDeleted } = loaderJson);
  // }
  // console.log("userObj", userObj);
  // const json = useActionData();
  // const [projectTitle, setProjectTitle] = useState("");
  // const [projectStart, setProjectStart] = useState("");
  // const [projectEnd, setProjectEnd] = useState("");
  // const [projectReviews, setProjectReviews] = useState([]); //{title: '...', date: '...'}

  // const [searchParams, setSearchParams] = useSearchParams();

  // useEffect(() => {
  //   console.log("in Project useEffect");
  //   if (json) {
  //     const { result } = json;
  //     toast(result);
  //   }
  //   if (projectDeleted) {
  //     toast(projectDeleted);
  //     searchParams.delete("projectDeleted");
  //     setSearchParams(searchParams);
  //   }
  // }, [json, projectDeleted]);

  // const submit = useSubmit();
  // const fetcher = useFetcher();

  // const { user } = useAuthContext();

  // const archiveButtonRef = useRef(null);

  if (userObj) {
    userTableRows = userObj.projects.map((project) => {
      if (!project.archived) {
        return (
          <Table.Row key={project._id}>
            <Table.Cell>
              <Link
                to={project._id}
                className={`flex items-center gap-2 pointer-events-none ${
                  !project.inWork && "text-slate-500"
                } `}
              >
                {project.msProjectGUID && <TiVendorMicrosoft />}
                {project.title}
              </Link>
              {/* {project.inWork ? (
                <Link to={project._id} className={`flex items-center gap-2`}>
                  {project.msProjectGUID && <TiVendorMicrosoft />}
                  {project.title}
                </Link>
              ) : (
                <Tooltip content="Not in work">
                  <Link
                    to={null}
                    className={`flex items-center gap-2  text-slate-500 
                `}
                  >
                    {project.msProjectGUID && <TiVendorMicrosoft />}
                    {project.title}
                  </Link>
                </Tooltip>
              )} */}
            </Table.Cell>
            {!isMobileResolution && (
              <Table.Cell>
                {/* {formatDistanceToNow(new Date(project.start))} */}
                {format(new Date(project.start), "dd/MM/yyyy")}
              </Table.Cell>
            )}
            <Table.Cell>
              {format(new Date(project.end), "dd/MM/yyyy")}
            </Table.Cell>
            {!isMobileResolution && (
              <Table.Cell>{project.tasks.length}</Table.Cell>
            )}
            <Table.Cell>
              {/* <fetcher.Form method="POST" style={{ display: "none" }}>
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
              </fetcher.Form> */}

              {/* <fetcher.Form method="POST" style={{ display: "none" }}>
                <input type="hidden" name="projectId" value={project._id} />
                <button
                  id={`archive-project-button${project._id}`}
                  type="submit"
                  name="intent"
                  value="archive-project"
                  ref={archiveButtonRef}
                ></button>
              </fetcher.Form>
              <fetcher.Form method="POST" style={{ display: "none" }}>
                <input type="hidden" name="freeze" value="true" />
                <input type="hidden" name="projectId" value={project._id} />
                <button
                  mt="2"
                  id={`freezeProjectButton${project._id}`}
                  type="submit"
                  name="intent"
                  value="change-freeze-state"
                  // ref={freezeProjectButtonRef}
                ></button>
              </fetcher.Form>
              <fetcher.Form method="POST" style={{ display: "none" }}>
                <input type="hidden" name="freeze" value="false" />
                <input type="hidden" name="projectId" value={project._id} />
                <button
                  mt="2"
                  id={`unFreezeProjectButton${project._id}`}
                  type="submit"
                  name="intent"
                  value="change-freeze-state"
                  // ref={unFreezeProjectButtonRef}
                ></button>
              </fetcher.Form> */}

              <ProjectTitleEditDialogDefeatured
                // projectTitle={projectTitle}
                // setProjectTitle={setProjectTitle}
                // projectStart={projectStart}
                // setProjectStart={setProjectStart}
                // projectEnd={projectEnd}
                // setProjectEnd={setProjectEnd}
                project={project}
                // projectReviews={projectReviews}
                // setProjectReviews={setProjectReviews}
                // editProjectButton={document.getElementById(project._id)}
                // archiveProjectButton={document.getElementById(
                //   `archive-project-button${project._id}`
                // )}
                // freezeProjectButton={document.getElementById(
                //   `freezeProjectButton${project._id}`
                // )}
                // unFreezeProjectButton={document.getElementById(
                //   `unFreezeProjectButton${project._id}`
                // )}
                // submit={submit}
                // user={user}
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
              <Link
                className="flex items-center gap-2 pointer-events-none"
                to={project._id}
              >
                {project.msProjectGUID && <TiVendorMicrosoft />}
                {project.title}
              </Link>
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
                <Link
                  to={project._id}
                  className={`flex items-center gap-2 pointer-events-none ${
                    !project.inWork && "text-slate-500 pointer-events-none"
                  }`}
                >
                  {project.msProjectGUID && <TiVendorMicrosoft />}
                  {project.title}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {format(new Date(project.end), "dd/MM/yyyy")}
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
                <Link
                  className="flex items-center gap-2 pointer-events-none"
                  to={project._id}
                >
                  {project.msProjectGUID && <TiVendorMicrosoft />}
                  {project.title}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {format(new Date(project.end), "dd/MM/yyyy")}
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
    <main>
      <div>
        <div className="flex items-center gap-2">
          <h3>My Active Projects</h3>
          {/* <fetcher.Form method="POST" style={{ display: "none" }}>
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
          </fetcher.Form> */}
          <AddProjectDialog_defeatured />
          {/* <AddProjectDialog
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
            user={user}
            defeatured={true}
          /> */}
        </div>

        {hasSomeUnArchivedProjects && (
          <Table.Root variant="surface" className="mb-7">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                {!isMobileResolution && (
                  <Table.ColumnHeaderCell>Start date</Table.ColumnHeaderCell>
                )}
                <Table.ColumnHeaderCell>End date</Table.ColumnHeaderCell>
                {!isMobileResolution && (
                  <Table.ColumnHeaderCell>Active tasks</Table.ColumnHeaderCell>
                )}
                <Table.ColumnHeaderCell>Edit</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>{userTableRows}</Table.Body>
          </Table.Root>
        )}
      </div>

      {otherUsersTableRows?.length > 0 && (
        <>
          <h3>Other Active Projects</h3>
          {userObj.userInProjects.length > 0 && (
            <Table.Root variant="surface" className="mb-7">
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
        </>
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
  );
}
