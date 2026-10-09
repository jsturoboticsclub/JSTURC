import { useEffect } from 'react';

/**
 * Global lock counter and style cache to support nested/overlapping modals
 * without clobbering the initial window scroll position or document styles.
 */
let lockCount = 0;
let savedScrollY = 0;
let originalStyles: {
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  htmlOverflow: string;
  bodyPaddingRight: string;
  htmlOverscroll: string;
  bodyOverscroll: string;
} | null = null;

/**
 * Custom hook to lock document background scrolling when a modal or popup is open.
 * Bulletproof on both desktop browsers and mobile touch devices (iOS Safari & Android Chrome).
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked || typeof window === 'undefined') return;

    if (lockCount === 0) {
      // Capture current scroll offset and initial inline styles
      savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      originalStyles = {
        bodyOverflow: document.body.style.overflow,
        bodyPosition: document.body.style.position,
        bodyTop: document.body.style.top,
        bodyWidth: document.body.style.width,
        htmlOverflow: document.documentElement.style.overflow,
        bodyPaddingRight: document.body.style.paddingRight,
        htmlOverscroll: document.documentElement.style.overscrollBehavior,
        bodyOverscroll: document.body.style.overscrollBehavior,
      };

      // Compensate for scrollbar width to prevent layout shift on desktop
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Lock both HTML and BODY, fixing body position to freeze mobile touch scroll completely
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = '100%';
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0 && originalStyles) {
        const {
          bodyOverflow,
          bodyPosition,
          bodyTop,
          bodyWidth,
          htmlOverflow,
          bodyPaddingRight,
          htmlOverscroll,
          bodyOverscroll,
        } = originalStyles;

        document.documentElement.style.overflow = htmlOverflow;
        document.documentElement.style.overscrollBehavior = htmlOverscroll;
        document.body.style.overflow = bodyOverflow;
        document.body.style.overscrollBehavior = bodyOverscroll;
        document.body.style.position = bodyPosition;
        document.body.style.top = bodyTop;
        document.body.style.width = bodyWidth;
        document.body.style.paddingRight = bodyPaddingRight;

        originalStyles = null;
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [isLocked]);
}
