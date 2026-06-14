'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface TickerProps {
  children: ReactNode;
  speed?: number; // Pixels per frame
  className?: string;
  itemCount: number;
  gap?: number; // Gap in pixels between loops
}

export default function Ticker({ children, speed = 0.5, className = "", itemCount, gap = 0 }: TickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loopHeightRef = useRef<number>(0);
  const scrollPosRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content || itemCount === 0) return;

    // Use ResizeObserver to get the most accurate height of the first content block
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === content.firstElementChild) {
          loopHeightRef.current = entry.contentRect.height + gap;
          // Ensure scrollPos doesn't exceed loopHeight if height decreased
          if (scrollPosRef.current >= loopHeightRef.current) {
            scrollPosRef.current = 0;
          }
        }
      }
    });

    if (content.firstElementChild) {
      resizeObserver.observe(content.firstElementChild);
    }

    let animationId: number;

    const animate = () => {
      if (loopHeightRef.current > 0) {
        scrollPosRef.current += speed;
        
        if (scrollPosRef.current >= loopHeightRef.current) {
          scrollPosRef.current -= loopHeightRef.current;
        }

        content.style.transform = `translate3d(0, ${-scrollPosRef.current}px, 0)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [speed, itemCount, gap]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden relative ${className}`}
    >
      <div ref={contentRef} className="flex flex-col will-change-transform">
        {/* First set of content */}
        <div>{children}</div>
        
        {speed > 0 && (
          <>
            {/* The Gap (White background) */}
            {gap > 0 && <div style={{ height: `${gap}px` }} className="bg-white shrink-0" aria-hidden="true" />}
            
            {/* Second set of content for seamless loop */}
            <div>{children}</div>

            {/* Extra gap at the very bottom (White background) */}
            {gap > 0 && <div style={{ height: `${gap}px` }} className="bg-white shrink-0" aria-hidden="true" />}
          </>
        )}
      </div>
    </div>
  );
}
