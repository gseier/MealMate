import React from 'react';
import Image from 'next/image';

interface ProfilePictureSelectorProps {
  selected: string;
  onSelect: (avatarUrl: string) => void;
}

// List the avatar paths from the public folder.
const avatars = [
  "/avatar1.png",
  "/avatar2.png",
  "/avatar3.png",
  "/avatar4.png",
];

const ProfilePictureSelector: React.FC<ProfilePictureSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {avatars.map((avatar) => (
        <div
          key={avatar}
          onClick={() => onSelect(avatar)}
          className={`cursor-pointer p-1 rounded-lg border-2 ${
            selected === avatar ? "border-blue-500" : "border-transparent"
          }`}
        >
          <Image src={avatar} alt="Avatar" width={80} height={80} />
        </div>
      ))}
    </div>
  );
};

export default ProfilePictureSelector;
