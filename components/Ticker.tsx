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
  const loopHeightRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content || itemCount === 0) return;

    // Use ResizeObserver to get the most accurate height of the first content block
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === content.firstElementChild) {
          loopHeightRef.current = entry.contentRect.height + gap;
        }
      }
    });

    if (content.firstElementChild) {
      resizeObserver.observe(content.firstElementChild);
    }

    let animationId: number;
    let scrollPos = 0;

    const animate = () => {
      if (loopHeightRef.current > 0) {
        scrollPos += speed;
        
        if (scrollPos >= loopHeightRef.current) {
          scrollPos -= loopHeightRef.current;
        }

        content.style.transform = `translate3d(0, ${-scrollPos}px, 0)`;
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
        
        {/* Second set of content for seamless loop */}
        <div>{children}</div>
      </div>
    </div>
  );
}
