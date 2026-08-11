import avatar1 from "../assets/avatars/avatar-1.jpg";
import avatar2 from "../assets/avatars/avatar-2.jpg";
import avatar3 from "../assets/avatars/avatar-3.jpg";
import avatar4 from "../assets/avatars/avatar-4.jpg";
import avatar5 from "../assets/avatars/avatar-5.jpg";
import avatar6 from "../assets/avatars/avatar-6.jpg";

export const AVATAR_OPTIONS = [
  {
    id: "avatar-1",
    image: avatar1,
    label: "Avatar 1",
  },
  {
    id: "avatar-2",
    image: avatar2,
    label: "Avatar 2",
  },
  {
    id: "avatar-3",
    image: avatar3,
    label: "Avatar 3",
  },
  {
    id: "avatar-4",
    image: avatar4,
    label: "Avatar 4",
  },
  {
    id: "avatar-5",
    image: avatar5,
    label: "Avatar 5",
  },
  {
    id: "avatar-6",
    image: avatar6,
    label: "Avatar 6",
  },
];

export function getAvatarImage(avatarId) {
  return (
    AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId)?.image ||
    avatar1
  );
}