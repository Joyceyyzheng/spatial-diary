import React, { useState, useEffect } from "react";
import "./ImageUploader.css";

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

  // 当外部图片变化时更新内部状态
  useEffect(() => {
    setImage(existingImage);
    setPreviewUrl(existingImage);
  }, [existingImage]);

  // 当内部图片状态变化时通知父组件
  useEffect(() => {
    if (image) {
      onImageReady(image);
    }
  }, [image, onImageReady]);

  // 处理图片文件上传
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

  // 清除图片
  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    onImageReady("");
  };

  return (
    <div className="image-uploader">
      <div className="upload-section">
        <label htmlFor="image-upload" className="upload-label">
          上传图片
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
          disabled={disabled}
        />
      </div>

      {previewUrl && (
        <div className="image-preview">
          <img
            src={previewUrl}
            alt="预览图片"
            className="preview-image"
            onError={(e) => {
              console.error("图片加载失败");
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button onClick={clearImage} className="clear-image-button">
            删除图片
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
