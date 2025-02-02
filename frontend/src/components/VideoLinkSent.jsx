import { Box, Card, Flex, Text } from "@radix-ui/themes";

import { MdOndemandVideo } from "react-icons/md";

const VideoLinkSent = ({ fileName }) => {
  return (
    <Box>
      <Card>
        <Flex gap="3" align="center">
          <MdOndemandVideo />
          <Box>
            <Text as="div" size="2" weight="bold">
              {fileName}
            </Text>
          </Box>
        </Flex>
      </Card>
    </Box>
  );
};

export default VideoLinkSent;
