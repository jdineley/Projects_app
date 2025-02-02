import EmbeddedLink from "./EmbeddedLink";
import VideoLinkSent from "./VideoLinkSent";

import { Text } from "@radix-ui/themes";

export default function UserReply({ reply }) {
  console.log("REPLY", reply);
  const hasOnlyImageAttached =
    reply.content === "" &&
    reply.images.length === 1 &&
    reply.videos.length === 0
      ? true
      : false;
  // const { VITE_REACT_APP_API_URL } = import.meta.env;

  // const { user } = useAuthContext();
  // const [reply, setReply] = useState(null);

  // useEffect(() => {
  //   fetch(`${VITE_REACT_APP_API_URL}/api/v1/replies/${replyProp._id}`, {
  //     headers: {
  //       Authorization: `Bearer ${user.token}`,
  //     },
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw Error("fetching reply failed");
  //       }
  //       return response.json();
  //     })
  //     .then((reply) => {
  //       setReply(reply);
  //     })
  //     .catch((error) => {
  //       throw Error(error.message);
  //     });
  // }, [replyProp._id, user?.token]);

  const URL_REGEX =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  const URL_REGEX_WORD =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/;

  const words = reply.content.split(/ |\n/g);
  // console.log("words", words);

  const urlsArr = reply.content.match(URL_REGEX) || null;
  // console.log("urlsArr", urlsArr);

  // const replyUrlsArr = reply.match(URL_REGEX) || null;
  // let emmbeddedLinksArr;
  // if (replyUrlsArr) {
  //   emmbeddedLinksArr = replyUrlsArr.map((url) => {
  //     return <EmbeddedLink url={url} />;
  //   });
  // }

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
          {reply.images.length > 0 && (
            <div className="flex gap-4 flex-wrap">
              {reply.images.map((img) => {
                return (
                  <a key={img.url} href={img.url} target="_blank">
                    <img
                      className={`h-60 ${
                        hasOnlyImageAttached ? "" : "w-60 object-cover"
                      } rounded-md`}
                      src={img.url}
                      alt={img.originalname}
                    />
                  </a>
                );
              })}
            </div>
          )}
          {reply.videos && (
            <div className="flex">
              {reply.videos.map((vid) => {
                // console.log("vid", vid);
                return (
                  <a href={vid.url} target="_blank">
                    <VideoLinkSent fileName={vid.originalname} />
                  </a>
                );
              })}
            </div>
          )}
          {urlsArr && (
            <div className="flex flex-wrap gap-4">
              {urlsArr.map((url) => (
                <EmbeddedLink key={url} url={url} />
              ))}
            </div>
          )}
        </div>

        <Text size="1" className="user-comment-email text-white">
          {reply.user.email}
        </Text>
      </div>
      {/* <div className="user-reply-email">{reply && reply.user.email}</div> */}
    </div>
  );
}
