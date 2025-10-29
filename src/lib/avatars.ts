export const AVATARS = [
  { id: "poli-1", name: "Chronology Samjhiye", image: "/poli-1.jpeg" },
  { id: "poli-2", name: "Zero Tax", image: "/poli-2.webp" },
  { id: "poli-3", name: "Aam Aadmi", image: "/poli-3.webp" },
];

export const getAvatarImage = (avatarId: string) => {
  const avatar = AVATARS.find((avatar) => avatar.id === avatarId);
  return avatar ? avatar.image : "/placeholder.svg";
};
