import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage, deleteImage } from '../../services/api';
import { Button } from './Button';

export const ImageUploader = ({
  value, // { url, publicId, ... } or array of objects
  onChange,
  folder = 'portfolio/general',
  multiple = false,
  label = 'Upload Image',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const images = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files);
    }
  };

  const handleUpload = async (files) => {
    setError(null);
    setIsUploading(true);

    const filesToUpload = multiple ? Array.from(files) : [files[0]];
    const newImages = [...images];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      try {
        const response = await uploadImage(formData);
        if (multiple) {
          newImages.push(response.data);
        } else {
          // If replacing a single image, try to delete the old one first, 
          // or at least notify the backend (handled manually via UI or left as orphan handling strategy)
          // For simplicity, we just overwrite the value here and the form submission handles the rest
          newImages[0] = response.data;
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.response?.data?.message || 'Failed to upload image. Max 5MB, JPG/PNG/WEBP only.');
        break;
      }
    }

    if (multiple) {
      onChange(newImages);
    } else {
      onChange(newImages[0] || null);
    }
    
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (indexToRemove, e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();

    const imageToRemove = images[indexToRemove];
    
    // We could delete from Cloudinary immediately, but it's safer to just remove it from the UI state
    // and let the backend handle cleanup when the form is saved, or we can do it here:
    // try {
    //   if (imageToRemove.publicId) {
    //     await deleteImage(imageToRemove.publicId);
    //   }
    // } catch (err) {
    //   console.error("Failed to delete from Cloudinary immediately", err);
    // }

    if (multiple) {
      const newImages = images.filter((_, idx) => idx !== indexToRemove);
      onChange(newImages);
    } else {
      onChange(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-300">{label}</label>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-700 hover:border-slate-500'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple={multiple}
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-slate-400" />
          )}
          <div className="text-sm text-slate-400">
            {isUploading ? (
              <p>Uploading...</p>
            ) : (
              <p>
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </p>
            )}
          </div>
          <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {images.map((img, idx) => (
            <div key={img.publicId || idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
              <img
                src={img.url}
                alt="Preview"
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => handleRemove(idx, e)}
                  title="Remove image"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
