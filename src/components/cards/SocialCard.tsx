import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InteractionButtons from '../InteractionButtons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingUp, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../../context/UserContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import CreatePostDialog from '../CreatePostDialog';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface SocialCardProps {
  id: string;
  userName: string;
  userAvatar: string | null;
  timestamp: string;
  content: string;
  imageUrl?: string; // Legacy support
  media?: Array<{ url: string; type: string; filename?: string; size?: number }>; // New media array
  authorId: string; // Add author ID to check ownership
  currentUserId?: string; // Pass current user ID from parent to avoid useAuth issues
  group?: {
    _id: string;
    name: string;
    slug: string;
  };
  trending?: boolean;
  isCompact?: boolean;
  // Engagement data will be fetched by useEngagement hook in InteractionButtons
}

const SocialCard: React.FC<SocialCardProps> = ({ 
  id, 
  userName, 
  userAvatar, 
  timestamp, 
  content, 
  imageUrl, 
  media,
  authorId,
  currentUserId,
  group,
  trending = false,
  isCompact = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // State for dropdown menu and edit dialog
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState<boolean[]>([]);
  const [imageError, setImageError] = useState<boolean[]>([]);
  
  // State for full-screen image viewer
  const [showFullScreenViewer, setShowFullScreenViewer] = useState(false);
  useBodyScrollLock(showFullScreenViewer);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0);
   
  // Check if current user is the post owner - use passed currentUserId or fallback to useUser
  const { user: currentUser } = useUser();
  const effectiveCurrentUserId = currentUserId || currentUser?.id;
  const isOwner = String(effectiveCurrentUserId) === String(authorId);
  
  // DEBUG: Log ownership check details (only for debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 SocialCard ownership check:', {
      postId: id,
      authorId,
      currentUserId,
      effectiveCurrentUserId,
      currentUserFromContext: currentUser?.id,
      isOwner,
      authorIdType: typeof authorId,
      currentUserIdType: typeof effectiveCurrentUserId
    });
  }
  
  // DEBUG: Log media data
  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ SocialCard media debug:', {
      postId: id,
      hasImageUrl: !!imageUrl,
      imageUrl,
      media,
      mediaLength: media?.length,
      userName
    });
  }
  




  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  const handleCommentsClick = () => {
    navigate(`/comments/social/${id}`, {
      state: { referrer: location.pathname }
    });
  };

  // Edit and delete handlers
  const handleEdit = () => {
    setShowDropdown(false);
    setShowEditDialog(true);
  };

  const handleDeleteClick = () => {
    setShowDropdown(false);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/social/posts/${id}`);
      
      // Invalidate and refetch social posts
      await queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      await queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      await queryClient.invalidateQueries({ queryKey: ['trendingPosts'] });
      
      console.log('✅ Post deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      // Error is handled by showing in confirmation dialog
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostUpdated = () => {
    setShowEditDialog(false);
    // Invalidate queries to refresh the feed
    queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
    queryClient.invalidateQueries({ queryKey: ['trendingPosts'] });
  };

  // Image carousel navigation handler
  const handleImageNavigation = (action: 'prev' | 'next' | 'goto', index?: number) => {
    if (action === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? media.length - 1 : prev - 1);
    } else if (action === 'next') {
      setCurrentImageIndex(prev => prev === media.length - 1 ? 0 : prev + 1);
    } else if (action === 'goto' && typeof index === 'number') {
      setCurrentImageIndex(index);
    }
  };

  // Full-screen image viewer navigation handler
  const handleFullScreenNavigation = (action: 'prev' | 'next' | 'goto', index?: number) => {
    console.log('🔍 Full-screen navigation:', { action, index, currentIndex: fullScreenImageIndex, mediaLength: media?.length, media });
    
    if (!media || media.length === 0) {
      console.log('❌ No media available for navigation');
      return;
    }
    
    if (action === 'prev') {
      setFullScreenImageIndex(prev => {
        const newIndex = prev === 0 ? media.length - 1 : prev - 1;
        console.log('⬅️ Previous:', { prev, newIndex, mediaLength: media.length });
        return newIndex;
      });
    } else if (action === 'next') {
      setFullScreenImageIndex(prev => {
        const newIndex = prev === media.length - 1 ? 0 : prev + 1;
        console.log('➡️ Next:', { prev, newIndex, mediaLength: media.length });
        return newIndex;
      });
    } else if (action === 'goto' && typeof index === 'number') {
      console.log('🎯 Go to:', { index, mediaLength: media.length });
      if (index >= 0 && index < media.length) {
        setFullScreenImageIndex(index);
      } else {
        console.log('❌ Invalid index:', index);
      }
    }
  };

  // Add loading state for image transitions
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCarouselNavigating, setIsCarouselNavigating] = useState(false);

  const handleFullScreenNavigationWithLoading = async (action: 'prev' | 'next' | 'goto', index?: number) => {
    setIsNavigating(true);
    handleFullScreenNavigation(action, index);
    
    // Small delay to show loading state
    setTimeout(() => {
      setIsNavigating(false);
    }, 150);
  };

  const handleImageNavigationWithLoading = async (action: 'prev' | 'next' | 'goto', index?: number) => {
    setIsCarouselNavigating(true);
    handleImageNavigation(action, index);
    
    // Small delay to show loading state
    setTimeout(() => {
      setIsCarouselNavigating(false);
    }, 150);
  };

  // Open full-screen viewer
  const openFullScreenViewer = (index: number) => {
    console.log('🖼️ Opening full-screen viewer:', { index, media, mediaLength: media?.length });
    if (!media || media.length === 0) {
      console.log('❌ Cannot open viewer: no media available');
      return;
    }
    setFullScreenImageIndex(index);
    setShowFullScreenViewer(true);
    // Lock body scroll - but use a more reliable method
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    console.log('✅ Full-screen viewer opened, scroll locked');
  };

  // Close full-screen viewer
  const closeFullScreenViewer = () => {
    console.log('❌ Closing full-screen viewer');
    setShowFullScreenViewer(false);
    // Restore body scroll - ensure complete restoration
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    console.log('✅ Full-screen viewer closed, scroll restored');
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFullScreenViewer && media && media.length > 1) {
        // Full-screen viewer keyboard navigation
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleFullScreenNavigationWithLoading('prev');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleFullScreenNavigationWithLoading('next');
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeFullScreenViewer();
        }
             } else if (media && media.length > 1) {
         // Regular carousel keyboard navigation
         if (e.key === 'ArrowLeft') {
           e.preventDefault();
           handleImageNavigationWithLoading('prev');
         } else if (e.key === 'ArrowRight') {
           e.preventDefault();
           handleImageNavigationWithLoading('next');
         }
       }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [media, showFullScreenViewer, fullScreenImageIndex]);

  // Reset to first image when media changes and proactively preload images
  useEffect(() => {
    console.log('🖼️ Media changed for post', id, {
      mediaCount: media?.length,
      media
    });
    setCurrentImageIndex(0);
    if (media && media.length > 0) {
      const initialLoading = new Array(media.length).fill(true);
      const initialError = new Array(media.length).fill(false);
      setImageLoading(initialLoading);
      setImageError(initialError);

      // Preload all images and set loading=false as they resolve
      const preloadPromises = media.map((m, idx) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = m.url;
          if (img.complete) {
            console.log('✅ Cached image ready', { idx, url: m.url });
            resolve({ idx, ok: true });
          } else {
            img.onload = () => {
              console.log('✅ Image loaded', { idx, url: m.url });
              resolve({ idx, ok: true });
            };
            img.onerror = () => {
              console.warn('❌ Image failed to load (preload)', { idx, url: m.url });
              resolve({ idx, ok: false });
            };
          }
          // Safety timeout in case onload/onerror never fires
          setTimeout(() => resolve({ idx, ok: true }), 7000);
        }).then((result) => {
          const r: any = result as any;
          setImageLoading((prev) => {
            const next = [...prev];
            next[r.idx] = false;
            return next;
          });
          if (!r.ok) {
            setImageError((prev) => {
              const next = [...prev];
              next[r.idx] = true;
              return next;
            });
          }
        });
      });

      Promise.all(preloadPromises).then(() => {
        console.log('📦 All images preloaded for post', id);
      });
    }
  }, [media, id]);

  // Cleanup scroll lock when component unmounts
  useEffect(() => {
    return () => {
      // Restore body scroll if component unmounts while full-screen viewer is open
      if (showFullScreenViewer) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    };
  }, [showFullScreenViewer]);

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleImageNavigationWithLoading('next');
    } else if (isRightSwipe) {
      handleImageNavigationWithLoading('prev');
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Full-screen touch/swipe support
  const [fullScreenTouchStart, setFullScreenTouchStart] = useState<number | null>(null);
  const [fullScreenTouchEnd, setFullScreenTouchEnd] = useState<number | null>(null);

  const handleFullScreenTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setFullScreenTouchStart(e.targetTouches[0].clientX);
  };

  const handleFullScreenTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    setFullScreenTouchEnd(e.targetTouches[0].clientX);
  };

  const handleFullScreenTouchEnd = () => {
    if (!fullScreenTouchStart || !fullScreenTouchEnd) return;
    
    const distance = fullScreenTouchStart - fullScreenTouchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleFullScreenNavigation('next');
    } else if (isRightSwipe) {
      handleFullScreenNavigation('prev');
    }

    setFullScreenTouchStart(null);
    setFullScreenTouchEnd(null);
  };

  // Enhanced touch handling for full-screen viewer
  const handleFullScreenTouchStartEnhanced = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFullScreenTouchStart(e.targetTouches[0].clientX);
  };

  const handleFullScreenTouchMoveEnhanced = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFullScreenTouchEnd(e.targetTouches[0].clientX);
  };

  const handleFullScreenTouchEndEnhanced = () => {
    if (!fullScreenTouchStart || !fullScreenTouchEnd) return;
    
    const distance = fullScreenTouchStart - fullScreenTouchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleFullScreenNavigationWithLoading('next');
    } else if (isRightSwipe) {
      handleFullScreenNavigationWithLoading('prev');
    }

    setFullScreenTouchStart(null);
    setFullScreenTouchEnd(null);
  };

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };

  const handleImageError = (index: number) => {
    setImageError(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
    setImageLoading(prev => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };

  // Interaction handlers now managed by InteractionButtons component

  const renderHashtags = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span 
            key={index} 
            className="text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
     <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-[#020B1A] border border-slate-300 dark:border-[#0F172A] flex flex-col h-full">
      <CardContent className="p-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-500 dark:text-gray-300">
                  {userName?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{userName}</h3>
                {trending && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTimeAgo(timestamp)}</span>
                {group && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{group.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
                     {/* Post Actions Dropdown - Only show for post owner */}
           {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? 'Deleting...' : 'Delete Post'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Content Section - Takes up space to push engagement bar down */}
        <div className="flex-grow">
          {/* Content */}
          <div className="text-gray-900 dark:text-white leading-relaxed mb-4 text-sm">
            {renderHashtags(content)}
          </div>
        
        {/* Media - Instagram-style carousel for multiple images */}
        {(media && media.length > 0) && (
          <div className="mb-4">
                                      {media.length === 1 ? (
                // Single image - full width
                <div className="rounded-xl overflow-hidden">
                  <img 
                    src={media[0].url} 
                    alt="Post content"
                    className="w-full max-h-96 object-cover cursor-pointer"
                    onClick={() => {
                      console.log('🖼️ Single image clicked');
                      openFullScreenViewer(0);
                    }}
                  />
                </div>
            ) : (
              // Multiple images - Instagram-style carousel
              <div 
                className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Image Container */}
                <div className="relative w-full h-96">
                  {media.map((item, index) => (
                    <div key={item.url || index} className="absolute inset-0">
                      {/* Loading State */}
                      {imageLoading[index] && (
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center z-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                      )}
                      
                      {/* Error State */}
                      {imageError[index] && (
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center z-20">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Failed to load image</p>
                          </div>
                        </div>
                      )}
                      
                                             {/* Image */}
                                               <img 
                          src={item.url} 
                          alt={`Post content ${index + 1}`}
                          className={`w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${
                            index === currentImageIndex 
                              ? 'opacity-100 relative z-10 pointer-events-auto' 
                              : 'opacity-0 relative z-0 pointer-events-none'
                          }`}
                          onLoad={() => handleImageLoad(index)}
                          onError={() => handleImageError(index)}
                          onClick={() => {
                            console.log('🖼️ Carousel image clicked:', { index });
                            openFullScreenViewer(index);
                          }}
                        />
                    </div>
                  ))}
                </div>
                
                                 {/* Navigation Arrows */}
                 {media.length > 1 && (
                   <>
                     {/* Left Arrow (always visible) */}
                     <button
                       onClick={() => handleImageNavigationWithLoading('prev')}
                       disabled={isCarouselNavigating}
                       className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all duration-200 z-20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                       aria-label="Previous image"
                       title="Previous image"
                     >
                       {isCarouselNavigating ? (
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                         </svg>
                       )}
                     </button>
                     
                     {/* Right Arrow (always visible) */}
                     <button
                       onClick={() => handleImageNavigationWithLoading('next')}
                       disabled={isCarouselNavigating}
                       className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all duration-200 z-20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                       aria-label="Next image"
                       title="Next image"
                     >
                       {isCarouselNavigating ? (
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                       )}
                     </button>
                   </>
                 )}
                
                 {/* Slide Indicators */}
                 {media.length > 1 && (
                   <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                     {media.map((_, index) => (
                       <button
                         key={index}
                         onClick={() => handleImageNavigationWithLoading('goto', index)}
                         disabled={isCarouselNavigating}
                         className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer ${
                           index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                         } disabled:opacity-50 disabled:cursor-not-allowed`}
                         aria-label={`Go to image ${index + 1}`}
                       />
                     ))}
                   </div>
                 )}
                
                                 {/* Image Counter */}
                 {media.length > 1 && (
                   <div className="absolute top-3 right-3 bg-black/70 text-white text-sm px-3 py-2 rounded-full z-20 font-medium">
                     {currentImageIndex + 1} / {media.length}
                   </div>
                 )}
              </div>
            )}
          </div>
        )}
        
                           {/* Legacy imageUrl support */}
          {(!media || media.length === 0) && imageUrl && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img 
                src={imageUrl} 
                alt="Post content"
                className="w-full max-h-96 object-cover cursor-pointer"
                onClick={() => {
                  console.log('🖼️ Legacy imageUrl clicked');
                  openFullScreenViewer(0);
                }}
              />
            </div>
          )}
        </div>
        
        {/* Standardized Interactions */}
        <InteractionButtons
          contentType="SocialPost"
          contentId={id}
          onCommentClick={handleCommentsClick}
          shareTitle={`${userName}'s post`}
          shareType="social"
          layout="horizontal"
          size="md"
          showSave={true}
          showBorder={false}
          cardType="social"
        />
      </CardContent>
      
             {/* Edit Post Dialog */}
       {showEditDialog && (
         <CreatePostDialog
           isOpen={showEditDialog}
           onClose={() => setShowEditDialog(false)}
           onPostCreated={handlePostUpdated}
           editMode={true}
                      editData={{
              id,
              content,
              postType: 'text' as const,
              media: media && media.length > 0 ? media : (imageUrl ? [{ url: imageUrl, type: 'image' }] : [])
            }}
         />
       )}

                               {/* Full-Screen Image Viewer Modal */}
         {showFullScreenViewer && media && media.length > 0 && typeof document !== 'undefined' && createPortal(
           <div 
             className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center animate-in fade-in duration-200 overscroll-contain"
             style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
             onTouchStart={handleFullScreenTouchStartEnhanced}
             onTouchMove={handleFullScreenTouchMoveEnhanced}
             onTouchEnd={handleFullScreenTouchEndEnhanced}
             onClick={(e) => {
               // Close viewer when clicking on the backdrop
               if (e.target === e.currentTarget) {
                 closeFullScreenViewer();
               }
             }}
           >
            {/* Close Button */}
            <button
              onClick={() => {
                console.log('❌ Close button clicked');
                closeFullScreenViewer();
              }}
              className="absolute top-4 right-4 z-[9999] w-12 h-12 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
              aria-label="Close full-screen viewer"
              type="button"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => {
                // Close viewer when clicking on the background (not on the image or controls)
                if (e.target === e.currentTarget) {
                  closeFullScreenViewer();
                }
              }}
              onTouchStart={(e) => {
                // Prevent touch events from bubbling up to parent
                e.stopPropagation();
              }}
            >
              {media.map((item, index) => (
                <div key={index} className="absolute inset-0 flex items-center justify-center">
                  {/* Loading State */}
                  {imageLoading[index] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {imageError[index] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <div className="text-center text-white">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg">Failed to load image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Image */}
                  <img 
                    src={item.url} 
                    alt={`Post content ${index + 1}`}
                    className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                      index === fullScreenImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    style={{ zIndex: index === fullScreenImageIndex ? 10 : 0 }}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                </div>
              ))}
            </div>

                       {/* Navigation Arrows */}
            {media && media.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={() => {
                    console.log('⬅️ Left arrow clicked');
                    handleFullScreenNavigationWithLoading('prev');
                  }}
                  disabled={isNavigating}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-all duration-200 z-[9998] cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous image"
                  type="button"
                >
                  {isNavigating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  )}
                </button>
                
                {/* Right Arrow */}
                <button
                  onClick={() => {
                    console.log('➡️ Right arrow clicked');
                    handleFullScreenNavigationWithLoading('next');
                  }}
                  disabled={isNavigating}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-all duration-200 z-[9998] cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next image"
                  type="button"
                >
                  {isNavigating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </>
            )}

                       {/* Slide Indicators */}
            {media && media.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-[9997]">
                {media.map((_, index) => (
                                      <button
                      key={index}
                      onClick={() => {
                        console.log('🎯 Dot clicked:', index);
                        handleFullScreenNavigationWithLoading('goto', index);
                      }}
                      disabled={isNavigating}
                      className={`w-4 h-4 rounded-full transition-all duration-200 cursor-pointer ${
                        index === fullScreenImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label={`Go to image ${index + 1}`}
                      type="button"
                    />
                ))}
              </div>
            )}

                       {/* Image Counter */}
            {media && media.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-3 py-2 rounded-full z-[9997] font-medium">
                {fullScreenImageIndex + 1} / {media.length}
              </div>
            )}


         </div>,
         document.body
       )}
     </Card>
     
     {/* Confirmation Dialog */}
     <ConfirmationDialog
       isOpen={showDeleteConfirm}
       onClose={() => setShowDeleteConfirm(false)}
       onConfirm={handleDelete}
       title="Delete Post"
       message="Are you sure you want to delete this post? This action cannot be undone."
       confirmText="Delete Post"
       cancelText="Cancel"
       type="danger"
       isLoading={isDeleting}
     />
   </>
 );
};

export default SocialCard;
