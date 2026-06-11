'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface TickerProps {
  children: ReactNode;
  speed?: number; // Pixels per frame
  className?: string;
  itemCount: number;
  gap?: number; // Gap in pixels between loops
}

export default function Ticker({ children, speed = 0.5, className = "", itemCount, gap = 120 }: TickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content || itemCount === 0) return;

    let animationId: number;
    let scrollPos = 0;

    const animate = () => {
      scrollPos += speed;
      
      // Calculate the height of one loop iteration
      // We have: [Content A] [Gap] [Content B] [Gap]
      // One loop is exactly [Content A] + [Gap]
      // To find this, we can measure the first child's height + the gap
      const firstChild = content.firstElementChild as HTMLElement;
      if (!firstChild) return;
      
      const loopHeight = firstChild.offsetHeight + gap;
      
      if (scrollPos >= loopHeight) {
        scrollPos -= loopHeight; // Precise reset for sub-pixel continuity
      }

      content.style.transform = `translate3d(0, ${-scrollPos}px, 0)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [speed, itemCount, gap]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden relative ${className}`}
    >
      <div ref={contentRef} className="flex flex-col will-change-transform">
        {/* First set of content */}
        <div>{children}</div>
        
        {/* The Gap (White background) */}
        <div style={{ height: `${gap}px` }} className="bg-white shrink-0" aria-hidden="true" />
        
        {/* Second set of content for seamless loop */}
        <div>{children}</div>

        {/* Extra gap at the very bottom (White background) */}
        <div style={{ height: `${gap}px` }} className="bg-white shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
