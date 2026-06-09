'use client';

import { useEffect, useRef, useState } from 'react';

interface Ranking {
  team_id: number;
  teams: { team_name: string };
  wins: number;
  losses: number;
  ties: number;
  ranking_points: number;
  total_points_scored: number;
}

interface RankingsTableProps {
  rankings: Ranking[];
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPos = 0;
    let direction = 1; // 1 for down, -1 for snap back to top
    let pauseCounter = 0;
    const scrollSpeed = 0.5; // pixels per frame
    const pauseDuration = 200; // frames to pause at bottom

    const animate = () => {
      if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      if (pauseCounter > 0) {
        pauseCounter--;
        animationId = requestAnimationFrame(animate);
        return;
      }

      scrollPos += scrollSpeed;
      
      if (scrollPos >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        scrollPos = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        pauseCounter = pauseDuration;
        // After pause, snap to top
        setTimeout(() => {
          scrollPos = 0;
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }, pauseDuration * 16); // rough estimate of ms
      }

      scrollContainer.scrollTop = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [rankings]);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Table Header */}
      <div className="grid grid-cols-[80px_120px_1fr_80px_80px_80px_120px] bg-zinc-900 text-zinc-400 font-bold uppercase text-xs tracking-widest border-b border-white/5 py-4 px-6">
        <div>Rank</div>
        <div>Team #</div>
        <div>Team Name</div>
        <div className="text-center">WP</div>
        <div className="text-center">AP</div>
        <div className="text-center">SP</div>
        <div className="text-right">W-L-T</div>
      </div>

      {/* Table Body (Scrollable) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-hidden scroll-smooth"
      >
        {rankings.map((ranking, index) => (
          <div 
            key={ranking.team_id}
            className={`grid grid-cols-[80px_120px_1fr_80px_80px_80px_120px] items-center py-6 px-6 border-b border-white/5 transition-colors ${
              index < 3 ? 'bg-amber-500/5' : ''
            } ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
          >
            <div className={`text-3xl font-black italic tracking-tighter ${index < 3 ? 'text-amber-500' : 'text-zinc-500'}`}>
              {index + 1}
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {ranking.team_id}
            </div>
            <div className="text-xl font-medium text-zinc-300 truncate pr-4">
              {ranking.teams?.team_name || `Team ${ranking.team_id}`}
            </div>
            <div className="text-xl font-bold text-center text-zinc-500">
              0
            </div>
            <div className="text-xl font-bold text-center text-zinc-500">
              0
            </div>
            <div className="text-xl font-bold text-center text-zinc-500">
              0
            </div>
            <div className="text-xl font-mono text-right text-zinc-400">
              {ranking.wins}-{ranking.losses}-{ranking.ties}
            </div>
          </div>
        ))}
        
        {rankings.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic">
            No rankings available yet.
          </div>
        )}
      </div>
    </div>
  );
}
