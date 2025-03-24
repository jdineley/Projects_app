import { useState, useRef, useEffect } from "react";

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

import { Switch, Text, Badge, Button } from "@radix-ui/themes";
// import { set } from "date-fns";

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
  commentWhat,
  type,
  // projectUsers,
  //
  // taggedUsers,
  // atTotal,
  // projectUsersRef,
}) => {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  const token = user?.token ? user?.token : user?.accessToken;

  const [projectUsers, setProjectUsers] = useState([]);

  const atTotal = useRef(0);
  const taggedUsers = useRef([]);
  console.log("taggedUsers.current", taggedUsers.current);
  const projectUsersRef = useRef([]);

  // console.log("projectUsers", projectUsers);
  const hasAttachedFiles =
    [...inputImages, ...inputVideos].length > 0 ? true : false;

  const [importance, setImportance] = useState("medium");

  const AT_REGEX = / @/g;
  const TAG_REGEX = / @\S*/g;

  useEffect(() => {
    console.log("in messageform useEffect");
    if (comment) {
      if (AT_REGEX.test(comment)) {
        const totalAts = comment.match(AT_REGEX).length;
        const currentTags = comment
          .match(TAG_REGEX)
          .map((t) => t.split("@")[1] + "@" + t.split("@")[2]);
        taggedUsers.current = currentTags;
        console.log("currentTags", currentTags);
        // console.log("taggedUsers.current", taggedUsers.current);
        if (taggedUsers.current.length > 0) {
          // if (taggedUsers.current.length > 0) {
          const incorrectEmails = taggedUsers.current.filter(
            // const incorrectEmails = taggedUsers.current.filter(
            (t) => !projectUsersRef.current.includes(t)
          );
          console.log("incorrectEmails", incorrectEmails);
          if (incorrectEmails.length > 0) {
            let newComment;
            // comment config: klkkdfs @jim@mail.com fdsad @jill@mail.com
            for (const incorrectEmail of incorrectEmails) {
              console.log("incorrectEmail", incorrectEmail);
              newComment = comment
                .split(" ")
                .filter((w) => {
                  console.log("w", w);
                  if (w[0] === "@") {
                    w = w.substring(1);
                    return w !== incorrectEmail;
                  } else return true;
                })
                .join(" ");
              console.log("newComment", newComment);
            }
            setComment(newComment);
          }
        }
        // console.log("totalAts", totalAts);
        // console.log("atTotal.current", atTotal.current);
        if (totalAts > atTotal.current) {
          // console.log("SETTING IS NEW AT");
          atTotal.current = totalAts;
          fetch(
            `${VITE_REACT_APP_API_URL}/api/v1/users/getUsers?intent=allProjectUsers&projectId=${projectId}`,
            {
              method: "GET",
              mode: "cors",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              console.log(json);
              setProjectUsers(json);
              projectUsersRef.current = json;
            });
        } else if (totalAts < atTotal.current) {
          atTotal.current = totalAts;
          setProjectUsers([]);
        } else {
          setProjectUsers([]);
        }
      } else {
        atTotal.current = 0;
        setProjectUsers([]);
      }
    }
  }, [comment, atTotal, taggedUsers]);

  return (
    <div className={`${intent === "task" && "sticky bottom-5"} mx-auto w-9/12`}>
      {projectUsers?.length > 0 && (
        <div className="bg-white w-fit flex flex-col gap-1">
          {projectUsers?.map((u) => (
            <Button
              size="1"
              key={u}
              onClick={(e) => {
                console.log(u);
                const textField =
                  document.getElementById("text-field") ||
                  document.getElementById(`comment-${target._id}`);
                const cursorPosition = textField.selectionStart;
                console.log(cursorPosition);
                let commentMut =
                  comment.slice(0, cursorPosition) +
                  u +
                  " " +
                  comment.slice(cursorPosition);
                setComment(commentMut);
              }}
            >
              {u.split("@")[0]}
            </Button>
          ))}
        </div>
      )}

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
            type,
            importance,
            taggedUsers: taggedUsers.current,
            token,
            VITE_REACT_APP_API_URL,
          });
        }}
        method="POST"
        encType="multipart/form-data"
        id="submit-comment-form"
        // className={`${intent === "task" && "sticky"} ${
        className={`${
          commentWhat && commentWhat !== type ? "pointer-events-none" : ""
        } flex justify-center items-end bg-white`}
      >
        <div className="flex flex-col gap-4 w-full border-solid border-0.5 border-slate-200 focus-within:border-sky-500">
          <textarea
            placeholder={
              intent === "comment"
                ? `reply to ${target.user.email}`
                : commentWhat && commentWhat !== type
                ? ""
                : `add new comment..`
            }
            className="flex-1 border-none outline-none"
            name="comment"
            required={hasAttachedFiles ? "" : "true"}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            disabled={commentWhat && commentWhat !== type}
            value={
              commentWhat ? (commentWhat === type ? comment : "") : comment
            }
            id={intent === "action" ? `comment-${target._id}` : "text-field"}
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
                // console.log(event.target.files);
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
                // console.log(event.target.files);
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
          {type && (
            <div className="flex gap-2 items-center">
              <Switch
                onCheckedChange={(checked) => {
                  // console.log("checked", checked);
                  const importance = checked ? "high" : "medium";
                  setImportance(importance);
                }}
              />{" "}
              <Text>Very Important</Text>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageForm;
