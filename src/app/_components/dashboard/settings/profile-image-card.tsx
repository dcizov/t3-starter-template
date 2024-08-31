import { useState, type ChangeEvent } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import Image from "next/image";

interface ProfileImageCardProps {
  currentImageUrl: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

const ProfileImageCard: React.FC<ProfileImageCardProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageRemove();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gray-100">
        {preview ? (
          <Image
            src={preview}
            alt="Profile Image"
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="profile-image-upload"
      />
      <label htmlFor="profile-image-upload">
        <Button type="button" variant="outline">
          Upload Image
        </Button>
      </label>
      {preview && (
        <Button type="button" variant="destructive" onClick={handleRemoveImage}>
          Remove Image
        </Button>
      )}
    </div>
  );
};

export default ProfileImageCard;
