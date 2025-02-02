import { useState } from "react";
// icons
import { IoIosAttach } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";

// radix ui
import { Box, Card, Flex, Text } from "@radix-ui/themes";

const EmbeddedAttachment = ({
  fileName,
  inputImages,
  inputVideos,
  setInputImages,
  setInputVideos,
}) => {
  const [deleteAttachmentHover, setDeleteAttachementHover] = useState(false);

  return (
    <Box>
      <Card>
        <Flex gap="3" align="center">
          <IoIosAttach />
          <Box>
            <Text as="div" size="2" weight="bold">
              {fileName}
            </Text>
          </Box>
          {(inputImages || inputVideos) && (
            <RxCross1
              className="cursor-pointer"
              color={
                deleteAttachmentHover
                  ? `rgba(22, 101, 192, 1)`
                  : `rgba(22, 101, 192, 0.6)`
              }
              onMouseEnter={(e) => {
                setDeleteAttachementHover(true);
              }}
              onMouseLeave={(e) => {
                setDeleteAttachementHover(false);
              }}
              onClick={() => {
                if (inputImages) {
                  const newInputImagesArr = inputImages.filter(
                    (file) => file.name !== fileName
                  );
                  setInputImages(newInputImagesArr);
                } else {
                  const newInputVideosArr = inputVideos.filter(
                    (file) => file.name !== fileName
                  );
                  setInputVideos(newInputVideosArr);
                }
              }}
            />
          )}
        </Flex>
      </Card>
    </Box>
  );
};

export default EmbeddedAttachment;
