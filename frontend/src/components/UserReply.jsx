import { useAuthContext } from "../hooks/useAuthContext";
import { useEffect, useState } from "react";

export default function UserReply({ reply: replyProp }) {
  const { user } = useAuthContext();
  const [reply, setReply] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/v1/replies/${replyProp._id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw Error("fetching reply failed");
        }
        return response.json();
      })
      .then((reply) => {
        setReply(reply);
      })
      .catch((error) => {
        throw Error(error.message);
      });
  }, [replyProp._id, user.token]);

  return (
    <div className="user-reply">
      <div>{replyProp.content}</div>
      <div className="user-reply-email">{reply && reply.user.email}</div>
    </div>
  );
}
