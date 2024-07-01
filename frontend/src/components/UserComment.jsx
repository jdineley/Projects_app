import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import UserReply from "./UserReply";
import { useNavigate, useLocation } from "react-router-dom";

import { useNotificationContext } from "../hooks/useNotificationContext";

export default function UserComment({
  comment,
  newCommentId,
  projectId,
  reviewId,
}) {
  console.log(comment);
  const [isReplying, setIsReplying] = useState(false);
  const [isDiscussion, setIsDiscussion] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPathNoQuery = location.pathname.split("?")[0];

  const { notification } = useNotificationContext();

  const { user } = useAuthContext();

  useEffect(() => {
    if (comment._id === newCommentId && notification) {
      setTimeout(() => {
        navigate(currentPathNoQuery);
      }, 1000);
    }
  }, [comment._id, newCommentId, notification, navigate, currentPathNoQuery]);

  async function handleReplySubmit(e) {
    e.preventDefault();
    const reply = document.querySelector("#reply").value;
    setIsReplying(false);
    try {
      const response = await fetch("http://localhost:4000/api/v1/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content: reply,
          comment: comment._id,
          user: user._id,
          projectId,
          reviewId,
        }),
      });

      if (!response.ok) {
        throw Error("failed to create reply");
      }
      navigate("");
    } catch (error) {
      throw Error(error.message);
    }
  }

  function handleShowDiscussion() {
    setIsDiscussion(!isDiscussion);
  }

  return (
    <div
      className={`user-comment-collector ${
        comment._id === newCommentId && notification ? "new-comment" : ""
      } `}
      id={comment._id}
      style={{
        marginLeft: "auto",
        width: "80%",
      }}
    >
      <div className="user-comment">
        <div>{comment.content}</div>
        <div className="user-comment-email">{comment.user.email}</div>
      </div>
      {/* modify construct to include an array of replies... */}
      {comment.replies?.length ? (
        <button onClick={handleShowDiscussion}>
          {isDiscussion ? "Hide discussion" : "Show discussion"}
        </button>
      ) : (
        !comment.archived && (
          <button onClick={() => setIsReplying(true)}>Reply..</button>
        )
      )}

      {comment.replies?.length > 0 && isDiscussion && (
        <div className="comment-reply-collector">
          {comment.replies?.map((reply) => {
            return <UserReply key={reply._id} reply={reply} />;
          })}
          {!comment.archived && (
            <button onClick={() => setIsReplying(true)}>Reply</button>
          )}
        </div>
      )}

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="add-comment-reply-form">
          <textarea
            id="reply"
            rows="8"
            name="reply"
            placeholder={`reply to ${comment.user.email}`}
          ></textarea>
          <div className="add-reply-buttons-collector">
            <button onClick={() => setIsReplying(false)}>Cancel</button>
            <button type="submit">Submit</button>
          </div>
        </form>
      )}
    </div>
  );
}
