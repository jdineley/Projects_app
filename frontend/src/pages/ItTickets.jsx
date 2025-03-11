import { useState } from "react";

import { useRevalidator, useLoaderData } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import MessageForm from "../components/MessageForm";
import UserTicket from "../components/UserTicket";

import { Button } from "@radix-ui/themes";
import { useAuthContext } from "../hooks/useAuthContext";

const ItTickets = () => {
  // const [isBugReporting, setIsBugReporting] = useState(false);
  // const [isFeatureSuggesting, setIsFeatureSuggesting] = useState(false);
  const revalidator = useRevalidator();
  const { user } = useAuthContext();
  // console.log("user", user);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentWhat, setcommentWhat] = useState("bug");
  const [comment, setComment] = useState("");
  const [messButHover, setMessageButHover] = useState(false);
  const [uploadFileButHover, setUploadFileButHover] = useState(false);
  const [uploadPicButHover, setUploadPicButHover] = useState(false);
  const [inputImages, setInputImages] = useState([]);
  const [inputVideos, setInputVideos] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const { tickets, ticketId } = useLoaderData();
  // console.log("tickets", tickets);
  const bugTickets = tickets.filter((t) => t.type === "bug");
  // sort old and important at the top
  const highImportantBugTickets = bugTickets
    .filter((t) => t.importance === "high")
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
  const mediumImportanceBugTickets = bugTickets
    .filter((t) => t.importance === "medium")
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
  const orderedBugTickets = [
    ...highImportantBugTickets,
    ...mediumImportanceBugTickets,
  ];
  // console.log("orderedBugTickets", orderedBugTickets);

  const featureTickets = tickets.filter((t) => t.type === "feature");
  // sort old and important at the top
  const highImportantfeatureTickets = featureTickets
    .filter((t) => t.importance === "high")
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
  const mediumImportancefeatureTickets = featureTickets
    .filter((t) => t.importance === "medium")
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
  const fururefeatureTickets = featureTickets
    .filter((t) => t.status === "medium")
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
  const orderedfeatureTickets = [
    ...highImportantfeatureTickets,
    ...mediumImportancefeatureTickets,
    ...fururefeatureTickets,
  ];
  const URL_REGEX =
    /https?:\/\/.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/g;
  const urlsArr = comment.match(URL_REGEX) || null;
  let emmbeddedLinksArr;
  if (urlsArr) {
    emmbeddedLinksArr = urlsArr.map((url) => {
      return <EmbeddedLink url={url} />;
    });
  }
  return (
    <div>
      <Button
        onClick={() => {
          const newCommenting = commentWhat === "bug" ? "feature" : "bug";
          setComment("");
          setcommentWhat(newCommenting);
        }}
      >
        Switch comment
      </Button>
      <div className="flex gap-2">
        <div className="flex-1 gap-2">
          <h2 className="text-center">Bugs</h2>
          {/* {isCommenting === "bug" && ( */}
          <MessageForm
            comment={comment}
            setComment={setComment}
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
            setIsCommenting={setIsCommenting}
            revalidate={revalidator.revalidate}
            commentWhat={commentWhat}
            type="bug"
            // intent="bug"
            // target={task}
            user={user}
            endPoint="/api/v1/tickets"
            setIsSending={setIsSending}
            // projectId={projectId}
            // learning={learning}
          />
          <h3>open</h3>
          {orderedBugTickets
            .filter((t) => t.status === "open")
            .map((t) => (
              <UserTicket
                ticket={t}
                user={user}
                revalidator={revalidator}
                ticketId={ticketId}
              />
            ))}
          <h4>closed</h4>
          {orderedBugTickets
            .filter((t) => t.status === "closed")
            .map((t) => (
              <UserTicket
                ticket={t}
                user={user}
                revalidator={revalidator}
                ticketId={ticketId}
              />
            ))}
        </div>
        <div className="flex-1 gap-2">
          <h2 className="text-center">Feature requests</h2>
          {/* {isCommenting === "feature" && ( */}
          <MessageForm
            comment={comment}
            setComment={setComment}
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
            setIsCommenting={setIsCommenting}
            revalidate={revalidator.revalidate}
            commentWhat={commentWhat}
            type="feature"
            // intent="feature"
            // target={task}
            user={user}
            endPoint="/api/v1/tickets"
            setIsSending={setIsSending}
            // projectId={projectId}
            // learning={learning}
          />
          {/* )} */}
          <h3>open</h3>
          {orderedfeatureTickets
            .filter((t) => t.status === "open")
            .map((t) => (
              <UserTicket
                ticket={t}
                user={user}
                revalidator={revalidator}
                ticketId={ticketId}
              />
            ))}
          <h4>closed</h4>
          {orderedfeatureTickets
            .filter((t) => t.status === "closed")
            .map((t) => (
              <UserTicket
                ticket={t}
                user={user}
                revalidator={revalidator}
                ticketId={ticketId}
              />
            ))}
          <h4>Future</h4>
          {orderedfeatureTickets
            .filter((t) => t.status === "future")
            .map((t) => (
              <UserTicket
                ticket={t}
                user={user}
                revalidator={revalidator}
                ticketId={ticketId}
              />
            ))}
        </div>
        {/* <div className="col-span-full">dash</div> */}
      </div>
    </div>
  );
};

export default ItTickets;
