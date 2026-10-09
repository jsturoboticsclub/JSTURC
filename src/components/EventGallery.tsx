import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface GalleryImage {
  data?: string;
  contentType?: string;
  originalName?: string;
  caption?: string;
}

interface EventGalleryProps {
  eventId: string;
  gallery: GalleryImage[];
}

const EventGallery: React.FC<EventGalleryProps> = ({ eventId, gallery }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  useBodyScrollLock(selectedIndex !== null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (!gallery || gallery.length === 0) {
    return null;
  }

  const handleImageClick = (index: number) => {
    if (!imageErrors.has(index)) {
      setSelectedIndex(index);
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < gallery.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // Get image source - use embedded data if available, otherwise use API endpoint
  const getImageSrc = (index: number) => {
    const image = gallery[index];
    if (image?.data) {
      return image.data;
    }
    return `/api/past-events/${eventId}/gallery/${index}`;
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Event Gallery
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({gallery.length} {gallery.length === 1 ? 'photo' : 'photos'})
          </span>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {gallery.map((image, index) => (
            <div
              key={index}
              onClick={() => handleImageClick(index)}
              className={`
                relative aspect-square rounded-lg overflow-hidden
                bg-gray-100 dark:bg-gray-700
                ${imageErrors.has(index) ? 'cursor-not-allowed' : 'cursor-pointer'}
                group
              `}
            >
              {!imageErrors.has(index) ? (
                <>
                  <img
                    src={getImageSrc(index)}
                    alt={image.caption || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={() => handleImageError(index)}
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  {/* Caption Preview (if exists) */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs truncate">{image.caption}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center overscroll-contain"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          onClick={handleClose}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close gallery"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
            {selectedIndex + 1} / {gallery.length}
          </div>

          {/* Previous Button */}
          {selectedIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < gallery.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Image */}
          <div
            className="relative flex items-center justify-center w-full h-full px-4 py-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageSrc(selectedIndex)}
              alt={gallery[selectedIndex]?.caption || `Gallery image ${selectedIndex + 1}`}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
            />
            
            {/* Caption (if exists) */}
            {gallery[selectedIndex]?.caption && (
              <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg mx-4">
                <p className="text-white text-center text-lg">
                  {gallery[selectedIndex].caption}
                </p>
              </div>
            )}
          </div>

          {/* Keyboard hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>,
        document.body
      )}

      {/* Keyboard Navigation */}
      {selectedIndex !== null && (
        <div
          style={{ position: 'fixed', top: -1000, left: -1000 }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowLeft' && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
            if (e.key === 'ArrowRight' && selectedIndex < gallery.length - 1) setSelectedIndex(selectedIndex + 1);
          }}
          ref={(el) => el?.focus()}
        />
      )}
    </>
  );
};

export default EventGallery;

