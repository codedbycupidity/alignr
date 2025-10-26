import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { ImageItem } from '../types/block';
import { Timestamp } from 'firebase/firestore';

type Props = {
  blockId: string;
  initialImages?: ImageItem[];
  isOrganizer?: boolean;
  allowParticipantUploads?: boolean;
  onChange?: (images: ImageItem[]) => void;
  onAllowUploadsChange?: (allow: boolean) => void;
  currentUserId: string;
  currentUserName: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatDate(timestamp?: Timestamp | string) {
  if (!timestamp) return '';
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString();
  }

  // If it's a string (ISO date) or already a Date object
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

const ImageBlock: React.FC<Props> = ({
  blockId,
  initialImages = [],
  isOrganizer = false,
  allowParticipantUploads = true,
  onChange,
  onAllowUploadsChange,
  currentUserId,
  currentUserName,
}) => {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [allowUploads, setAllowUploads] = useState<boolean>(allowParticipantUploads);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!showModal) return;
      if (e.key === 'Escape') setShowModal(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal, activeIndex, images]);

  const onToggle = () => {
    setAllowUploads((v) => !v);
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
    setUploading(true);

    try {
      const uploaded: ImageItem[] = await Promise.all(
        valid.map(async (file) => {
          // Create a reference to the file in Firebase Storage
          const storageRef = ref(storage, `events/${blockId}/images/${Date.now()}_${file.name}`);
          
          // Upload the file
          await uploadBytes(storageRef, file);
          
          // Get the download URL
          const url = await getDownloadURL(storageRef);
          
          return {
            id: Math.random().toString(36).slice(2, 9),
            url,
            storageRef: storageRef.fullPath,
            title: file.name,
            uploadedBy: currentUserName,
            uploadedAt: Timestamp.now(),
          };
        }),
      );

      setImages((prev) => {
        const next = [...uploaded, ...prev];
        try { onChange?.(next); } catch {}
        return next;
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onUploadClick = () => fileInputRef.current?.click();

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try { onChange?.(next); } catch {}
      return next;
    });
  };

  const openModal = (index: number) => {
    setActiveIndex(index);
    setShowModal(true);
  };

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <div className="space-y-4">
      {/* Organizer toggle */}
      {isOrganizer && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="font-medium text-gray-700">Allow participant uploads</label>
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
        </div>
      )}

      {/* Conditional upload section */}
      {(isOrganizer || (allowParticipantUploads && !isOrganizer)) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onUploadClick}
              className="inline-flex items-center px-4 py-2 bg-[#75619D] text-white rounded-md hover:opacity-90 transition"
              disabled={uploading}
            >
              {uploading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                </svg>
              ) : (
                'Upload images'
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
            <p className="text-sm text-gray-500">PNG, JPG. Max 5MB per image.</p>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>
      )}

      {/* Empty states */}
      {images.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-600">
          {allowUploads || isOrganizer ? (
            <div>No images uploaded yet — be the first to add one.</div>
          ) : (
            <div>Image uploads are disabled for participants.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group">
              <button
                onClick={() => openModal(idx)}
                className="block w-full h-48 bg-gray-100 rounded-lg overflow-hidden focus:outline-none"
              >
                <img src={img.url} alt={img.title || 'image'} className="w-full h-full object-cover" />
              </button>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 rounded-lg flex items-end p-3">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">{img.title}</div>
                      <div className="text-xs">Uploaded by: {img.uploadedBy}</div>
                      <div className="text-xs">{formatDate(img.uploadedAt)}</div>
                    </div>
                    {isOrganizer && (
                      <button
                        onClick={() => removeImage(img.id)}
                        className="ml-2 p-2 bg-white/20 rounded text-white hover:bg-white/30"
                        aria-label="Delete image"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Lightbox */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onMouseDown={(e) => {
            // click outside to close
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="relative max-w-5xl w-full mx-4 sm:mx-8">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-2 top-2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              aria-label="Close"
            >
              <X />
            </button>

            {/* Prev */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              aria-label="Previous"
            >
              <ChevronLeft />
            </button>

            {/* Next */}
            <button
              onClick={next}
              className="absolute right-12 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              aria-label="Next"
            >
              <ChevronRight />
            </button>

            <div className="bg-transparent flex items-center justify-center">
              <img src={images[activeIndex].url} alt={images[activeIndex].title} className="max-h-[80vh] max-w-full rounded-lg shadow-lg object-contain mx-auto" />
            </div>

            {/* Position counter */}
            <div className="text-white text-sm text-center mt-3">{`${activeIndex + 1} of ${images.length}`}</div>

            {/* Thumbnails */}
            <div className="mt-4 overflow-x-auto py-2">
              <div className="flex gap-2 items-center">
                {images.map((it, i) => (
                  <button key={it.id} onClick={() => setActiveIndex(i)} className={`flex-none rounded-lg overflow-hidden border-2 ${i === activeIndex ? 'border-[#75619D]' : 'border-transparent'}`}>
                    <img src={it.url} alt={it.title} className="w-20 h-14 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
