'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface TickerProps {
  children: ReactNode;
  speed?: number; // Pixels per frame
  className?: string;
  itemCount: number;
  gap?: number; // Gap in pixels between loops
}

export default function Ticker({ children, speed = 0.5, className = "", itemCount, gap = 100 }: TickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content || itemCount === 0) return;

    let animationId: number;
    let scrollPos = container.scrollTop;

    const animate = () => {
      scrollPos += speed;
      
      // The total height of one loop is (total scrollHeight - gap) / 2
      // However, it's easier to just use the height of the first child set + gap
      const firstSetHeight = (content.scrollHeight - gap) / 2;
      const loopHeight = firstSetHeight + gap;
      
      if (scrollPos >= loopHeight) {
        scrollPos = 0;
      }

      container.scrollTop = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [speed, itemCount, gap]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden pointer-events-none ${className}`}
    >
      <div ref={contentRef} className="flex flex-col">
        {/* First set of content */}
        <div>{children}</div>
        
        {/* The Gap (White background) */}
        <div style={{ height: `${gap}px` }} className="bg-white" aria-hidden="true" />
        
        {/* Second set of content for seamless loop */}
        <div>{children}</div>

        {/* Extra gap at the very bottom (White background) */}
        <div style={{ height: `${gap}px` }} className="bg-white" aria-hidden="true" />
      </div>
    </div>
  );
}
