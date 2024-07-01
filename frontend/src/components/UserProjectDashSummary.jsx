import { Link } from "react-router-dom";

import { Box, Card, Flex, Text, Badge } from "@radix-ui/themes";

import { calculatePercentProjectComplete, isTaskAtRisk } from "../utility";

// components
import ProjectTimeline from "./ProjectTimeline";

const UserProjectDashSummary = ({ project, accentColor }) => {
  const percentageProjectComplete = calculatePercentProjectComplete(project);

  const atRiskTasksArray = project.tasks.filter(
    (task) => isTaskAtRisk(task) >= 1
  );

  return (
    <Card
      className="proj-sum-card"
      style={{ color: accentColor, borderColor: accentColor }}
    >
      <Text as="div" size="2" weight="bold" mb="2">
        <Link to={`/projects/${project._id}`}>{project.title}</Link>
      </Text>
      <Box className="dash-card-element">
        <Flex gap="2" align="center">
          <Flex className="project-complete-container" align={"center"} gap="3">
            <Text className="project-complete" size="1" mb="0">
              Project content complete
            </Text>

            <Text className="percent-complete" size="5" weight="medium">
              {percentageProjectComplete ? percentageProjectComplete : 0} %
            </Text>
          </Flex>
        </Flex>
      </Box>
      <Box className="dash-card-element">
        <Text className="project-complete" size="1" mb="0">
          At-risk tasks *(time remaining is critically low)
        </Text>
        <Flex size="2" as="div" gap="2" wrap="wrap">
          {atRiskTasksArray.length > 0
            ? atRiskTasksArray.map((riskyTask) => (
                <Badge key={riskyTask._id} color="tomato">
                  <Link to={`projects/${project._id}/tasks/${riskyTask._id}`}>
                    {riskyTask.title}
                  </Link>
                </Badge>
              ))
            : ""}
        </Flex>
      </Box>
      <ProjectTimeline dashCardElement={true} project={project} />
    </Card>
  );
};

export default UserProjectDashSummary;
