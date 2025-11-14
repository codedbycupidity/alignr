import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Image as ImageIcon, Download } from 'lucide-react';
import { uploadMultipleAlbumImages, deleteAlbumImage } from '../services/storage';

type ImageItem = {
  id: string;
  url: string;
  title?: string;
  uploadedBy?: string;
  uploadedAt: string; // ISO
};

type Props = {
  images?: ImageItem[];
  isOrganizer?: boolean;
  allowParticipantUploads?: boolean;
  currentUserName?: string;
  eventId?: string;
  onChange?: (images: ImageItem[], allowUploads: boolean) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

const SharedAlbumBlock: React.FC<Props> = ({
  images: initialImages = [],
  isOrganizer = false,
  allowParticipantUploads = true,
  currentUserName = 'Anonymous',
  eventId,
  onChange
}) => {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [allowUploads, setAllowUploads] = useState<boolean>(allowParticipantUploads);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update when props change
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  useEffect(() => {
    setAllowUploads(allowParticipantUploads);
  }, [allowParticipantUploads]);

  const onToggle = () => {
    const newValue = !allowUploads;
    setAllowUploads(newValue);
    onChange?.(images, newValue);
  };

  const validateFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return [] as File[];
    const out: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`Each image must be <= ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        continue;
      }
      out.push(f);
    }
    return out;
  };

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    const valid = validateFiles(files);
    if (!valid.length) return;

    if (!eventId) {
      setError('Event ID is required to upload images');
      return;
    }

    // Log file sizes before upload
    console.log('Files to upload:', valid.map(f => ({ name: f.name, size: f.size, type: f.type })));

    setUploading(true);

    try {
      // Upload to Firebase Storage
      const downloadURLs = await uploadMultipleAlbumImages(eventId, valid);

      // Create ImageItem objects with the download URLs
      const uploaded: ImageItem[] = downloadURLs.map((url, index) => ({
        id: Math.random().toString(36).slice(2, 9),
        url,
        title: valid[index].name,
        uploadedBy: currentUserName,
        uploadedAt: new Date().toISOString(),
      }));

      const next = [...uploaded, ...images];
      setImages(next);
      onChange?.(next, allowUploads);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onUploadClick = () => fileInputRef.current?.click();

  const removeImage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const imageToRemove = images.find(img => img.id === id);
    if (!imageToRemove) return;

    try {
      // Delete from Firebase Storage
      await deleteAlbumImage(imageToRemove.url);

      // Update local state
      const next = images.filter((p) => p.id !== id);
      setImages(next);
      onChange?.(next, allowUploads);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
      // Still remove from UI even if storage deletion failed
      const next = images.filter((p) => p.id !== id);
      setImages(next);
      onChange?.(next, allowUploads);
    }
  };

  const downloadImage = async (img: ImageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = img.title || `image-${img.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  };

  const canUpload = allowUploads || isOrganizer;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <ImageIcon className="w-5 h-5 text-[#75619D]" strokeWidth={2} />
        <h3 className="text-lg font-semibold text-[#1E1E2F]">Shared Album</h3>
      </div>

      {/* Organizer toggle */}
      {isOrganizer && (
        <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <label className="text-sm font-medium text-gray-700">Allow participant uploads</label>
          <div
            role="switch"
            aria-checked={allowUploads}
            onClick={onToggle}
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
              allowUploads ? 'bg-[#75619D]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                allowUploads ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      )}

      {/* Upload section */}
      {canUpload && (
        <div className="mb-4 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
            <button
              onClick={onUploadClick}
              className="inline-flex items-center justify-center px-4 py-2 bg-[#75619D] text-white rounded-lg hover:bg-[#624F8A] transition font-medium text-sm disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8l-1-1 1-1V4a8 8 0 100 8z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Images'
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="text-xs text-gray-500">PNG, JPG. Max 5MB per image.</p>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>
      )}

      {/* Image grid or empty state */}
      {images.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          {canUpload ? (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12 text-gray-300" />
              <p className="text-sm">No images uploaded yet. Be the first to add one!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12 text-gray-300" />
              <p className="text-sm">Image uploads are disabled for participants.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group flex-shrink-0">
              <div className="relative w-64 h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img
                  src={img.url}
                  alt={img.title || 'image'}
                  className="w-full h-full object-cover"
                />
                {/* Action buttons - show on hover */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Download button - available to everyone */}
                  <button
                    onClick={(e) => downloadImage(img, e)}
                    className="p-2 bg-[#75619D] text-white rounded-full shadow-lg hover:bg-[#624F8A]"
                    aria-label="Download image"
                  >
                    <Download size={16} />
                  </button>
                  {/* Delete button - for organizers or image uploader */}
                  {(isOrganizer || img.uploadedBy === currentUserName) && (
                    <button
                      onClick={(e) => removeImage(img.id, e)}
                      className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                      aria-label="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedAlbumBlock;
