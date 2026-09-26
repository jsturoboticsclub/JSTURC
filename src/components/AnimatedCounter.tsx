import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string | number;
  duration?: number; // In milliseconds (default 1600ms)
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1500,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const domRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const rawStr = String(value || '');
    // Extract numeric part (e.g. "14" from "14+", "92" from "92+")
    const match = rawStr.match(/^([^\d]*)(\d+)(.*)$/);
    if (!match) {
      setDisplayValue(rawStr);
      return;
    }

    const prefix = match[1];
    const targetNum = parseInt(match[2], 10);
    const suffix = match[3];

    const node = domRef.current;
    if (!node) return;

    const startAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      const startTime = performance.now();

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic: 1 - Math.pow(1 - progress, 3)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * targetNum);

        setDisplayValue(`${prefix}${current}${suffix}`);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          setDisplayValue(rawStr);
        }
      };

      requestAnimationFrame(updateCounter);
    };

    if (!('IntersectionObserver' in window)) {
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={domRef} className={className}>
      {displayValue}
    </span>
  );
};

export default AnimatedCounter;
