import { getAvatarImage } from "../data/avatarOptions";

export default function UserAvatar({
  avatarId,
  name = "User",
  size = 64,
  className = "",
}) {
  const avatarImage = getAvatarImage(avatarId);

  return (
    <img
      src={avatarImage}
      alt={`${name}'s avatar`}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}