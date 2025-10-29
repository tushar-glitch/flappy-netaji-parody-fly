export const AVATARS = [
  { id: "poli-1", name: "Politician 1", image: "/poli-1.jpeg" },
  { id: "poli-2", name: "Politician 2", image: "/poli-2.webp" },
  { id: "poli-3", name: "Politician 3", image: "/poli-3.webp" },
];

export const getAvatarImage = (avatarId: string) => {
  const avatar = AVATARS.find((avatar) => avatar.id === avatarId);
  return avatar ? avatar.image : "/placeholder.svg";
};
