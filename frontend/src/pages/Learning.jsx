import { useRef, useEffect } from "react";

import { useLoaderData } from "react-router-dom";

// hooks
import useMatchMedia from "../hooks/useMatchMedia";

// constants
import { tabletScreenWidth, mobileScreenWidth } from "../utility";

// radix
import {
  Flex,
  Box,
  Heading,
  Text,
  Grid,
  Link,
  DropdownMenu,
  Button,
} from "@radix-ui/themes";

// icons
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineMenuOpen } from "react-icons/md";

// components
import AddProjectDialog_defeatured_AddMsProject from "../components/defeatured/AddProjectDialog_defeatured_AddMsProject";
import HomeDefeatured from "../components/defeatured/Dashboard_defeatured";
import ProjectsDefeatured from "../components/defeatured/Projects_defeatured";
import ProjectsDetail_Defeatured from "../components/defeatured/ProjectsDetail_defeatured";
import TaskDetail_defeatured from "../components/defeatured/TaskDetail_defeatured";
import ProjectReview_defeatured from "../components/defeatured/ProjectReview_defeatured";
import UserProfile_defeatured from "../components/defeatured/UserProfile_defeatured";

const Learning = () => {
  const { userObj, project, projectTasks, review, task, taskComments } =
    useLoaderData();
  const isTabletResolution = useMatchMedia(`${tabletScreenWidth}`, true);
  const isMobileResolution = useMatchMedia(`${mobileScreenWidth}`, true);
  const subHeadElemsRef = useRef([]);
  const quickNavElemsRef = useRef([]);

  function scrollTo(e, id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  const quickNav = [
    ["Overview", "overview"],
    ["MS Project integration", "ms-project-integration"],
    ["Project Dashboard Page", "project-dashboard"],
    ["Projects Page", "projects-page"],
    ["Project Details Page", "project-details-page"],
    ["Task Details Page", "task-details-page"],
    ["Project Review Page", "project-review-page"],
    ["User Profile Page", "user-profile-page"],
  ];

  useEffect(() => {
    if (subHeadElemsRef.current.length === 0) {
      let i = 0;
      for (const subHead of quickNav) {
        const subHeadElem = document.getElementById(subHead[1]);
        subHeadElemsRef.current.push(subHeadElem);
      }
    }
    if (!isTabletResolution) {
      document.addEventListener("scroll", update);
      for (const subHead of quickNav) {
        const quickNavElem = document.getElementById(`quickNav-${subHead[1]}`);
        quickNavElemsRef.current.push(quickNavElem);
      }
    }
    return document.removeEventListener("scroll");
  }, [isTabletResolution]);

  function update(e) {
    quickNavElemsRef.current.forEach((el) => {
      el.style.textDecoration = "none";
    });
    const currentElemPosns = [];
    for (const elem of subHeadElemsRef.current) {
      const posnPairTB = [];
      const rect = elem.getBoundingClientRect();
      posnPairTB.push(rect.top);
      posnPairTB.push(rect.bottom);
      currentElemPosns.push(posnPairTB);
    }
    for (let i = 0; i < currentElemPosns.length; i++) {
      if (
        (currentElemPosns[i][0] > 0 &&
          currentElemPosns[i][0] < window.innerHeight) ||
        (currentElemPosns[i][0] < 0 &&
          currentElemPosns[i][1] > window.innerHeight)
      ) {
        quickNavElemsRef.current[i].style.textDecoration = "underline";
        break;
      }
    }
  }

  return (
    <main>
      <div className={`flex ${!isTabletResolution ? "gap-3" : "gap-1"}`}>
        <Box
          style={{ minWidth: "0px" }}
          className={`${!isTabletResolution && "w-4/5"}`}
        >
          <Heading size="8" mb="2">
            What is <span className="logo-highlight">Projects</span>?
          </Heading>

          {/* </Flex> */}
          <Text size="5" color="gray">
            An online application for managing communication between team
            members of any project.{" "}
          </Text>
          <Box id="overview">
            <Heading size="6" mt="6" mb="2">
              Overview
            </Heading>
            <Text>
              Whilst MS Project excels at project sheduling and is driven by a
              single member of the project, the Project Manager.{" "}
              <span className="logo-highlight">Projects</span> opens up the
              project plan to the entire project team, to be used by team
              members to manage the progress of their own tasks, set up
              commmunications streams centred on project specifics between other
              members of the project whilst also enabling the Project Manager
              the opportunity to gather information about the project progress
              at anytime and feed this into the MS Project schedule.
            </Text>
            <Heading size="4" mb="1" mt="2" ml="2">
              <span className="logo-highlight">Projects</span> feature summary:
            </Heading>
            <Flex
              mt="3"
              ml="6"
              gap={!isTabletResolution && "3"}
              // align="center"
              // direction="row"
              direction={`${isTabletResolution ? "column" : "row"}`}
            >
              <Box>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  MS Project integration
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Project Dashboard
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Interactive project timeline
                </Flex>

                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Project complete %
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Project milestones
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Project archiving
                </Flex>

                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Project freezing
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Task complete %
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Task predecessors
                </Flex>
              </Box>
              <Box>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Task completion tracking
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Task risk %
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Review scheduling
                </Flex>

                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Review objectives
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  Review objective action assignments
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  User comment/reply structures
                </Flex>

                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  User notifications
                </Flex>
                <Flex align="center" gap="3">
                  <IoIosCheckmarkCircleOutline className="text-2xl logo-highlight" />{" "}
                  User vacation management
                </Flex>
              </Box>
            </Flex>
          </Box>
          <Box id="ms-project-integration">
            <Heading size="6" mt="6" mb="2">
              MS Project integration
            </Heading>
            <Text>
              <span className="logo-highlight">Projects</span> is built to
              enable any MS Project plan to be imported and in doing so all
              tasks are created and assigned to the associated resources.
            </Text>

            <Box ml="2">
              <Heading size="3" mb="1" mt="5">
                Example UI for uploading MS Project plan:
              </Heading>{" "}
              <Flex gap="2" direction={isTabletResolution && "column"}>
                {/* <AddProjectDialog_defeatured_AddMsProject /> */}
                <AddProjectDialog_defeatured_AddMsProject
                  chk1="true"
                  chk2="true"
                  chk3="true"
                />
                <AddProjectDialog_defeatured_AddMsProject
                  err3="Predecessor task with name: 'Perform departmental training needs analysis' was not found, the likely cause is this task is a summary task.  Please ensure summary tasks are not used as predecessors."
                  chk1="true"
                  chk2="true"
                />
              </Flex>
              <Heading size="3" mb="2 " mt="5">
                General workflow between MS Project &{" "}
                <span className="logo-highlight">Projects</span>
              </Heading>{" "}
              <Box mb="2">
                <Text>
                  Once an MS Project plan is embedded within{" "}
                  <span className="logo-highlight">Projects</span> the cycle of
                  'project work' to 'project progress review' will begin. During
                  'project work', team members will use{" "}
                  <span className="logo-highlight">Projects</span> to capture
                  their progress and also update the expected finish dates of
                  tasks if and when that is appropriate. At regular intervals
                  during the project, the PM will conduct 'project progress
                  review'. The updated completion % and finish date data
                  captured in <span className="logo-highlight">Projects</span>,
                  by the team members, will assist the PM in adjusting the
                  project plan using the most accurate data at that time.
                </Text>
              </Box>
              <Box mb="2">
                <Text>
                  The adjusted MS Project plan can then be re-exported and
                  imported back into{" "}
                  <span className="logo-highlight">Projects</span> as means of
                  keeping the two insync at those regular intervals. The
                  adjustments made at the time can be more than task progress
                  and rescheduling changes, new tasks with changes in resourcing
                  is also handled during the import update cycle accompanied
                  with user notifications to interested parties.
                </Text>
              </Box>
              <Box className="w-4/5 mx-auto">
                <img src="/msproj_import.drawio.svg" className="w-full" />
              </Box>
            </Box>
          </Box>
          <Box id="project-dashboard">
            <Heading size="6" mt="6" mb="2">
              Project Dashboard Page
            </Heading>
            <Text>
              <span className="logo-highlight">Projects</span>' Dashboard page
              summarises the entire user's project portfolio from the point of
              Project and Task management.
            </Text>
            <Box
              mt="2"
              className="p-3 border-4 border-solid rounded-xl"
              style={{
                borderColor: "var(--logo)",
              }}
            >
              <HomeDefeatured userObj={userObj} />
            </Box>
          </Box>
          <Box id="projects-page">
            <Heading size="6" mt="6" mb="2">
              Projects Page
            </Heading>
            <Text>
              The Project Page provides a complete list of the users self
              managaged projects and projects for which they are members of,
              including whether a project is archived or in a frozen state.
            </Text>
            <Box
              mt="2"
              className="p-3 border-4 border-solid rounded-xl"
              style={{
                borderColor: "var(--logo)",
              }}
            >
              <ProjectsDefeatured userObj={userObj} />
            </Box>
          </Box>
          <Box id="project-details-page">
            <Heading size="6" mt="6" mb="2">
              Project Details Page
            </Heading>
            <Text>
              The Project Details Page provides a complete list of all project
              tasks in chronological order. Tasks can be filtered to show only
              currently in-work tasks based on the active date range and also
              filter to show specific users' tasks. <br /> The project may be
              edited by the PM via the Edit Project Dialog, which provides a
              different set of editing opportunities depending on whether the
              project is derived natively or via a linked MS Project. Native
              projects are fully editiable were as projects coming from MS
              Project rely on imports from MS Project to maintain
              synchronisation between the two. MS Project derived instances can
              manually have Reviews added or subtracted as this is a feature
              separate from MS Project. Rebaslining a{" "}
              <span className="logo-highlight">Projects</span>' instance through
              an import from MS Project, it is necessary to put the project in a
              freeze state.
              <br /> Tasks are shown individually as rows in the table, which
              provides access to the individual task detail pages via the
              clickable title link. Also, tasks belonging to the logged in user
              may have their percentage complete changed and, via the edit task
              dialog, be edited appropriately.
              <br /> The project timeline provides an information dense
              description of the key milestones, reviews, current time and
              provides the facility to show approved vacations as an overlay.
            </Text>
            <Box
              mt="2"
              className="p-3 border-4 border-solid rounded-xl"
              style={{
                borderColor: "var(--logo)",
              }}
            >
              <ProjectsDetail_Defeatured
                user={userObj._id}
                project={project}
                projectTasks={projectTasks}
              />
            </Box>
          </Box>
          <Box id="task-details-page">
            <Heading size="6" mt="6" mb="2">
              Task Details Page
            </Heading>
            <Text>
              The Task Details Page provides further information about a
              specific task. A full task description is given, a task completion
              history graph highlights when the task has been worked on and a
              comment reply section allows members of the project team to
              discuss aspects of the task.
            </Text>
            <Box
              mt="2"
              className="p-3 border-4 border-solid rounded-xl"
              style={{
                borderColor: "var(--logo)",
              }}
            >
              <TaskDetail_defeatured
                task={task}
                taskComments={taskComments}
                user={userObj._id}
              />
            </Box>
          </Box>
          <Box id="project-review-page">
            <Heading size="6" mt="6" mb="2">
              Project Review Page
            </Heading>
            <Text>
              The Project Review Page provides project managers the ability to
              craft well directed project reviews through Objective creation
              with specific Actions to which project members are assigned
              responsibility. Project members receive a notification when they
              are assigned an Action to be resposible for. Each action has a
              Comment/Reply structure to allow for discussion between interested
              parties.
            </Text>
            <Box
              mt="2"
              className="p-3 border-4 border-solid rounded-xl"
              style={{
                borderColor: "var(--logo)",
              }}
            >
              <ProjectReview_defeatured review={review} />
            </Box>
          </Box>
          <Box id="user-profile-page">
            <Heading size="6" mt="6" mb="2">
              User Profile Page
            </Heading>
            <Text>
              The User Profile Page provides team members access to submitting
              vacation requests to be reviewed by their project managers for
              acceptance or rejection. Vacation requests are listed as either
              'pending', 'accepted' or 'rejected'. Further details about the
              vacation requests and the projects to which they affect are found
              when hovering the blue vacation dates. <br /> Project managers who
              receive vacation requests from members within their projects, can
              view those requests within the project timeline cards under
              Project vacation management. Managers can act on those requests by
              hovering and clicking on the coloured blocks placed on the
              timeline month scale. All PMs must accept a vacation request
              before that request becomes approved. Approved vacations appear
              behind the 'Show approved vacations' switch, retrospective
              ammendments can be made to approved vacations from the blocks
              revealed here. Rejected vacations appear under the drop down as
              shown. Again, retrospective ammendents can be made to previously
              rejected vacations from this drop down.
            </Text>
            <Box
              mt="2"
              className="p-3 border-4 border-solid rounded-xl"
              style={{
                borderColor: "var(--logo)",
              }}
            >
              <UserProfile_defeatured userObj={userObj} />
            </Box>
          </Box>
        </Box>

        {isTabletResolution ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="self-start sticky top-5">
              <div className="cursor-pointer">
                <MdOutlineMenuOpen />
              </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {quickNav.map((el, i) => {
                return (
                  <DropdownMenu.Item
                    key={i}
                    onClick={(e) => scrollTo(e, el[1])}
                  >
                    {el[0]}
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <Box className="self-start sticky top-5">
            <Heading size="4">Quick Nav</Heading>
            <ul>
              {quickNav.map((el, i) => {
                return (
                  <li key={i} onClick={(e) => scrollTo(e, el[1])}>
                    <Link id={`quickNav-${el[1]}`}>{el[0]}</Link>
                  </li>
                );
              })}
            </ul>
          </Box>
        )}
      </div>
      {/* <div className={!isTabletResolution ? "w-10/12 ml-auto mr-auto" : ""}>
        <div className={!isTabletResolution ? "flex gap-3" : ""}>
          <div className={`${!isTabletResolution ? "w-5/12" : ""} mb-5`}>
            <a
              href="https://youtu.be/VmMYp2oiDcs"
              target="_blank"
              className="block mb-2"
            >
              1. Beginner's introduction: Users, Projects, Tasks
            </a>
            <a
              href="https://youtu.be/1bXMdWaUqLc"
              target="_blank"
              className="block mb-2"
            >
              2. The basics of collaboration
            </a>
            <a
              href="https://youtu.be/AYxSah6yviY"
              target="_blank"
              className="block mb-2"
            >
              3. Multiple user collaboration & Project Reviews
            </a>
            <a
              href="https://youtu.be/MY3Sb0lJmw4"
              target="_blank"
              className="block mb-2"
            >
              4. Managing user vacations
            </a>
            <a
              href="https://youtu.be/POOGlQWMS8c"
              target="_blank"
              className="block mb-2"
            >
              5. Project Dashboard and archiving projects
            </a>
          </div>
          <div className={`object-contain ${!isTabletResolution && "w-7/12"}`}>
            <img src="/Projects flyer.1.jpeg" className="w-full" />
          </div>
        </div>
        <div className="object-contain">
          <img src="/Project short 2_cropped.gif" className="w-full" />
        </div>
      </div> */}
    </main>
  );
};

export default Learning;
