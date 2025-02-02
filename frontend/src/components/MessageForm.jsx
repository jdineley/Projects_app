import { useState } from "react";

// util
import { handleSubmitMessage } from "../utility";

// components
import EmbeddedAttachment from "./EmbeddedAttachment";
import EmbeddedLink from "./EmbeddedLink";

// icons
import { IoSendOutline } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { CiImageOn } from "react-icons/ci";
import { CiVideoOn } from "react-icons/ci";

const MessageForm = ({
  comment,
  setComment,
  inputImages,
  setInputImages,
  inputVideos,
  setInputVideos,
  emmbeddedLinksArr,
  uploadFileButHover,
  setUploadFileButHover,
  uploadPicButHover,
  setUploadPicButHover,
  messButHover,
  setMessageButHover,
  intent,
  target,
  setIsCommenting,
  revalidate,
  user,
  endPoint,
  setIsSending,
  projectId,
  reviewId,
  learning,
}) => {
  const hasAttachedFiles =
    [...inputImages, ...inputVideos].length > 0 ? true : false;

  // const URL_REGEX =
  //   /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  // const urlsArr = comment.match(URL_REGEX) || null;
  // let emmbeddedLinksArr;
  // if (urlsArr) {
  //   emmbeddedLinksArr = urlsArr.map((url) => {
  //     return <EmbeddedLink url={url} />;
  //   });
  // }
  // console.log("urlsArr", urlsArr);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitMessage({
          comment,
          user,
          intent,
          target,
          setIsSending,
          setIsCommenting,
          inputImages,
          inputVideos,
          endPoint,
          setInputImages,
          setInputVideos,
          setComment,
          revalidate,
          projectId,
          reviewId,
        });
      }}
      method="POST"
      encType="multipart/form-data"
      id="submit-comment-form"
      className={`${
        intent === "task" && "sticky"
      } flex mx-auto w-9/12 justify-center items-end bottom-5 bg-white`}
    >
      <div className="flex flex-col gap-4 w-full border-solid border-0.5 border-slate-200 focus-within:border-sky-500">
        <textarea
          placeholder={
            intent === "comment"
              ? `reply to ${target.user.email}`
              : `${user.email} add new comment..`
          }
          className="flex-1 border-none outline-none"
          name="comment"
          required={hasAttachedFiles ? "" : "true"}
          onChange={(e) => {
            setComment(e.target.value);
          }}
          value={comment}
          id={intent === "action" && `comment-${target._id}`}
          rows="5"
        />
        <div className="bg-white flex gap-4 mx-2 flex-wrap">
          {inputImages.map((image) => {
            return (
              <EmbeddedAttachment
                key={image.name}
                fileName={image.name}
                inputImages={inputImages}
                setInputImages={setInputImages}
              />
            );
          })}
          {inputVideos.map((video) => {
            return (
              <EmbeddedAttachment
                key={video.name}
                fileName={video.name}
                inputVideos={inputVideos}
                setInputVideos={setInputVideos}
              />
            );
          })}
          {emmbeddedLinksArr}
        </div>
        <div className="flex justify-end gap-4">
          <label
            htmlFor="video-upload"
            className="my-auto"
            onMouseEnter={(e) => {
              setUploadFileButHover(true);
            }}
            onMouseLeave={(e) => {
              setUploadFileButHover(false);
            }}
          >
            <CiVideoOn
              size={20}
              fontWeight="1"
              color={
                uploadFileButHover
                  ? `rgba(22, 101, 192, 1)`
                  : `rgba(22, 101, 192, 0.6)`
              }
            />
          </label>
          <label
            htmlFor="pic-upload"
            className="my-auto"
            onMouseEnter={(e) => {
              setUploadPicButHover(true);
            }}
            onMouseLeave={(e) => {
              setUploadPicButHover(false);
            }}
          >
            <CiImageOn
              size={20}
              fontWeight="1"
              color={
                uploadPicButHover
                  ? `rgba(22, 101, 192, 1)`
                  : `rgba(22, 101, 192, 0.6)`
              }
            />
          </label>

          <input
            onChange={(event) => {
              console.log(event.target.files);
              setInputVideos([
                ...Object.values(inputVideos),
                ...Object.values(event.target.files),
              ]);
            }}
            name="uploaded_videos"
            id="video-upload"
            accept="video/*"
            type="file"
            className="hidden"
            multiple
          />
          <input
            onChange={(event) => {
              console.log(event.target.files);
              setInputImages([
                ...Object.values(inputImages),
                ...Object.values(event.target.files),
              ]);
            }}
            name="uploaded_images"
            id="pic-upload"
            type="file"
            accept="image/*"
            className="hidden"
            multiple
          />
          <button
            data-testid="submit-message"
            type="submit"
            name="intent"
            value="task-comment"
            className={`bg-white ${learning && "pointer-events-none"}`}
            onMouseEnter={(e) => {
              setMessageButHover(true);
            }}
            onMouseLeave={(e) => {
              setMessageButHover(false);
            }}
          >
            {messButHover ? (
              <IoSend
                className="my-auto"
                size={20}
                fontWeight="1"
                color="rgb(22, 101, 192)"
              />
            ) : (
              <IoSendOutline
                color="rgb(22, 101, 192)"
                className="my-auto"
                size={20}
                fontWeight="1"
              />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageForm;
