import React from 'react';
import Image from 'next/image';

interface ProfilePictureSelectorProps {
  selected: string;
  onSelect: (avatarUrl: string) => void;
}

const avatars = [
  "/avatar1.png",
  "/avatar2.png",
  "/avatar3.png",
  "/avatar4.png",
];

const ProfilePictureSelector: React.FC<ProfilePictureSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {avatars.map((avatar) => (
        <div
          key={avatar}
          onClick={() => onSelect(avatar)}
          // Force the container to 80×80, hide overflow, apply border only if selected.
          className={`cursor-pointer w-[80px] h-[80px] overflow-hidden rounded-lg border-2 ${
            selected === avatar ? "border-blue-500" : "border-transparent"
          }`}
        >
          <Image
            src={avatar}
            alt="Avatar"
            width={80}
            height={80}
            className="object-cover" // fill container, maintain aspect ratio
          />
        </div>
      ))}
    </div>
  );
};

export default ProfilePictureSelector;
