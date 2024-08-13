import React from "react";

interface LetteredAvatarProps {
  name: string;
}

const LetteredAvatar: React.FC<LetteredAvatarProps> = ({ name }) => {
  const getInitials = (name: string): string => {
    const [firstName = "", lastName = ""] = name.split(" ");
    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  };

  return <>{getInitials(name)}</>;
};

export default LetteredAvatar;
