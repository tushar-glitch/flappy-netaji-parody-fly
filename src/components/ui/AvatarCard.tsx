import { Card } from "@/components/ui/card";

interface Avatar {
  id: string;
  name: string;
  image: string;
}

interface AvatarCardProps {
  avatar: Avatar;
  isSelected: boolean;
  onClick: () => void;
}

const AvatarCard = ({ avatar, isSelected, onClick }: AvatarCardProps) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:scale-110 hover:shadow-glow ${
        isSelected ? "border-4 border-primary shadow-glow" : "border-2 border-border"
      }`}
      onClick={onClick}
    >
      <div className="p-4 text-center space-y-2">
        <img src={avatar.image} alt={avatar.name} className="w-24 h-24 mx-auto rounded-full object-cover" />
        <p className="text-sm font-medium">{avatar.name}</p>
      </div>
    </Card>
  );
};

export default AvatarCard;
