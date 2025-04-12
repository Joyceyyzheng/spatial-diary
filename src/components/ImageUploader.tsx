import React, { useState, useEffect } from "react";
import "./ImageUploader.css";
import Upload from "../assets/note-entry-upload.svg";

interface ImageUploaderProps {
  onImageReady: (imageUrl: string) => void;
  disabled?: boolean;
  existingImage?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageReady,
  disabled = false,
  existingImage = null,
}) => {
  const [image, setImage] = useState<string | null>(existingImage);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImage);

  useEffect(() => {
    setImage(existingImage);
    setPreviewUrl(existingImage);
  }, [existingImage]);

  useEffect(() => {
    if (image) {
      onImageReady(image);
    }
  }, [image, onImageReady]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImage(imageUrl);
        setPreviewUrl(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    onImageReady("");
  };

  return (
    <div className="image-uploader">
      <div className="upload-section">
        <label htmlFor="image-upload" className="upload-label">
          <img src={Upload} alt="upload" /> Upload Files (image/audio)
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*,audio/*"
          onChange={handleImageUpload}
          className="file-input hidden "
          disabled={disabled}
        />
      </div>

      {previewUrl && (
        <div className="image-preview">
          <img
            src={previewUrl}
            alt="preview"
            className="preview-image"
            onError={(e) => {
              console.error("fail to load the image");
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button onClick={clearImage} className="clear-image-button">
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
