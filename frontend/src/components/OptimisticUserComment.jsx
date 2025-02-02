import EmbeddedAttachment from "./EmbeddedAttachment";

import { Text } from "@radix-ui/themes";

const OptimisticUserComment = ({
  comment,
  inputImages,
  inputVideos,
  emmbeddedLinksArr,
}) => {
  const URL_REGEX =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  const URL_REGEX_WORD =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/;

  const words = comment.split(/ |\n/g);

  return (
    <div
      className="user-comment-collector bg-[#1564c0] border-white"
      // style={{
      //   marginLeft: "auto",
      //   width: "fit-content",
      //   maxWidth: "80%",
      // }}
    >
      <div className="user-comment">
        <div className="flex flex-col gap-1">
          {comment && (
            <Text className="text-white">
              {words.map((word, i) => {
                return URL_REGEX_WORD.test(word) ? (
                  <a key={i} href={word} target="_blank" className="text-white">
                    {word}{" "}
                  </a>
                ) : (
                  word + " "
                );
              })}
            </Text>
          )}
          <div className="flex gap-4 mx-2 flex-wrap">
            {inputImages.map((image) => {
              return (
                <EmbeddedAttachment key={image.name} fileName={image.name} />
              );
            })}
            {inputVideos.map((video) => {
              return (
                <EmbeddedAttachment key={video.name} fileName={video.name} />
              );
            })}
            {emmbeddedLinksArr}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimisticUserComment;
