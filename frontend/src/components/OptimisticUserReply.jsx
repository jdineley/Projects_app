import EmbeddedAttachment from "./EmbeddedAttachment";
// import EmbeddedLink from "./EmbeddedLink";
// import VideoLinkSent from "./videoLinkSent";

import { Text } from "@radix-ui/themes";

export default function OptimisticUserReply({
  reply,
  inputImages,
  inputVideos,
  emmbeddedLinksArr,
}) {
  const URL_REGEX =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  const URL_REGEX_WORD =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/;

  const words = reply.split(/ |\n/g);

  return (
    <div className="user-reply">
      <div className="user-comment">
        <div className="flex flex-col gap-1">
          {reply.content && (
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

          <div className="flex gap-4 flex-wrap">
            {inputImages.map((img) => {
              return <EmbeddedAttachment key={img.name} fileName={img.name} />;
            })}
          </div>

          <div className="flex">
            {inputVideos.map((vid) => {
              // console.log("vid", vid);
              return <EmbeddedAttachment key={vid.name} fileName={vid.name} />;
            })}
          </div>
          {emmbeddedLinksArr}
        </div>
      </div>
      {/* <div className="user-reply-email">{reply && reply.user.email}</div> */}
    </div>
  );
}
