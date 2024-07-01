const ActionComments = ({ comments }) => {
  return comments.map((comment) => (
    <div key={comment._id}>{comment.content}</div>
  ));
};

export default ActionComments;
