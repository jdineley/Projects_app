import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import UserReply from "./UserReply";
import { useNavigate, useLocation, useRevalidator } from "react-router-dom";

import { useNotificationContext } from "../hooks/useNotificationContext";

import EmbeddedLink from "./EmbeddedLink";
import VideoLinkSent from "./VideoLinkSent";
import MessageForm from "./MessageForm";
// import OptimisticUserComment from "./OptimisticUserComment";
import OptimisticUserReply from "./OptimisticUserReply";

import { Text } from "@radix-ui/themes";

export default function UserComment({
  comment,
  newCommentId,
  projectId,
  reviewId,
  learning,
  ticket,
}) {
  // console.log("**********COMMENT*************", comment);
  // console.log("projectId", projectId);
  // console.log("ticket", ticket);
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const hasOnlyImageAttached =
    (comment || ticket).content === "" &&
    (comment || ticket).images.length === 1 &&
    (comment || ticket).videos.length === 0
      ? true
      : false;
  // console.log("hasOnlyImageAttached", hasOnlyImageAttached);
  const [isReplying, setIsReplying] = useState(false);
  const [isDiscussion, setIsDiscussion] = useState(false);
  const [reply, setReply] = useState("");
  const [messButHover, setMessageButHover] = useState(false);
  const [uploadFileButHover, setUploadFileButHover] = useState(false);
  const [uploadPicButHover, setUploadPicButHover] = useState(false);
  const [inputImages, setInputImages] = useState([]);
  const [inputVideos, setInputVideos] = useState([]);
  // const hasAttachedFiles =
  //   [...inputImages, ...inputVideos].length > 0 ? true : false;
  const [isSending, setIsSending] = useState(false);
  // const navigate = useNavigate();
  // const location = useLocation();

  // const currentPathNoQuery = location.pathname.split("?")[0];

  const { notification } = useNotificationContext();

  const { user } = useAuthContext();
  // console.log("comment", comment);

  const revalidator = useRevalidator();

  function handleShowDiscussion() {
    setIsDiscussion(!isDiscussion);
    setIsReplying(false);
  }

  const URL_REGEX =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  const URL_REGEX_WORD =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/;

  const words = (comment || ticket).content.split(/ |\n/g);
  // console.log("words", words);

  const urlsArr = (comment || ticket).content.match(URL_REGEX) || null;
  // console.log("urlsArr", urlsArr);

  const replyUrlsArr = reply.match(URL_REGEX) || null;
  let emmbeddedLinksArr;
  if (replyUrlsArr) {
    emmbeddedLinksArr = replyUrlsArr.map((url) => {
      return <EmbeddedLink url={url} />;
    });
  }

  return (
    <div
      className={`user-comment-collector ${
        (comment || ticket)._id === newCommentId && notification
          ? "new-comment"
          : ""
      }  ${ticket?.importance === "high" ? "bg-red-500" : "bg-[#1564c0]"} mb-2`}
      id={(comment || ticket)._id}
      // style={
      //   {
      //     marginLeft: "auto",
      //     width: "fit-content",
      //     maxWidth: "80%",
      //   }
      // }
    >
      <div className="user-comment">
        <div className="flex flex-col gap-1">
          {(comment || ticket).content && (
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
          {(comment || ticket).images.length > 0 && (
            <div className="flex gap-4 flex-wrap">
              {(comment || ticket).images.map((img) => {
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
          {(comment || ticket).videos && (
            <div className="flex">
              {(comment || ticket).videos.map((vid) => {
                // console.log("vid", vid);
                return (
                  <a key={vid.url} href={vid.url} target="_blank">
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
          {(comment || ticket).user.email}
        </Text>
      </div>
      {/* modify construct to include an array of replies... */}
      {(comment || ticket).replies?.length > 0 && (
        <button onClick={handleShowDiscussion}>
          {isDiscussion ? "Hide discussion" : "Show discussion"}
        </button>
      )}

      {(comment || ticket).replies?.length > 0 && isDiscussion && (
        <div className="comment-reply-collector">
          {(comment || ticket).replies?.map((reply) => {
            return <UserReply key={reply._id} reply={reply} />;
          })}
          {isSending && (
            <OptimisticUserReply
              reply={reply}
              inputImages={inputImages}
              inputVideos={inputVideos}
              emmbeddedLinksArr={emmbeddedLinksArr}
            />
          )}
        </div>
      )}
      {(comment || ticket).replies?.length === 0 && isSending && (
        <div className="comment-reply-collector">
          {(comment || ticket).replies?.map((reply) => {
            return <UserReply key={reply._id} reply={reply} />;
          })}
          {isSending && (
            <OptimisticUserReply
              reply={reply}
              inputImages={inputImages}
              inputVideos={inputVideos}
              emmbeddedLinksArr={emmbeddedLinksArr}
            />
          )}
        </div>
      )}

      {!comment?.archived && (comment || ticket).replies.length === 0 && (
        <button onClick={() => setIsReplying(!isReplying)}>
          {isReplying ? "Hide reply field" : "Show reply field"}
        </button>
      )}
      {!comment?.archived && isDiscussion && (
        <button onClick={() => setIsReplying(!isReplying)}>
          {isReplying ? "Hide reply field" : "Show reply field"}
        </button>
      )}

      {isReplying && (
        <MessageForm
          comment={reply}
          setComment={setReply}
          inputImages={inputImages}
          setInputImages={setInputImages}
          inputVideos={inputVideos}
          setInputVideos={setInputVideos}
          emmbeddedLinksArr={emmbeddedLinksArr}
          uploadFileButHover={uploadFileButHover}
          setUploadFileButHover={setUploadFileButHover}
          uploadPicButHover={uploadPicButHover}
          setUploadPicButHover={setUploadPicButHover}
          messButHover={messButHover}
          setMessageButHover={setMessageButHover}
          // handleSubmitMessage={handleSubmitMessage}
          setIsCommenting={setIsReplying}
          revalidate={revalidator.revalidate}
          intent={comment ? "comment" : "ticket"}
          target={comment ? comment : ticket}
          user={user}
          // endPoint={`/api/v1/replies/project/${projectId}`}
          endPoint={
            ticket ? "/api/v1/replies" : `/api/v1/replies/project/${projectId}`
          }
          setIsSending={setIsSending}
          projectId={projectId}
          reviewId={reviewId}
          learning={learning}
        />
        // <form onSubmit={handleReplySubmit} className="add-comment-reply-form">
        //   <textarea
        //     id="reply"
        //     rows="8"
        //     name="reply"
        //     placeholder={`reply to ${comment.user.email}`}
        //   ></textarea>
        //   <div className="add-reply-buttons-collector">
        //     <button onClick={() => setIsReplying(false)}>Cancel</button>
        //     <button
        //       type="submit"
        //       className={`${learning && "pointer-events-none"}`}
        //     >
        //       Submit
        //     </button>
        //   </div>
        // </form>
      )}
    </div>
  );
}
