import { CaretDownIcon } from "@radix-ui/react-icons";

const AvatarCustom = ({ user }) => {
  return (
    <div>
      {user.email[0].toUpperCase()}
      <CaretDownIcon />
    </div>
  );
};

export default AvatarCustom;
