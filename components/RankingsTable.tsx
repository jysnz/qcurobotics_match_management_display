'use client';

import { useEffect, useState } from 'react';
import Ticker from './Ticker';

interface Ranking {
  team_id: number;
  teams: { team_name: string };
  wins: number;
  losses: number;
  ties: number;
  wp: number;
  ap: number;
  sp: number;
  ranking_points: number;
  total_points_scored: number;
}

interface RankingsTableProps {
  rankings: Ranking[];
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  const [logos, setLogos] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLogos() {
      try {
        const response = await fetch('/api/logos');
        if (response.ok) {
          const data = await response.json();
          setLogos(data);
        }
      } catch (error) {
        console.error('Failed to fetch logos:', error);
      }
    }
    fetchLogos();
  }, []);

  // Define consistent grid structure for absolute alignment
  const gridLayout = "grid-cols-[60px_140px_1fr_80px_80px_80px_140px]";
  const gridGap = "gap-x-10"; 
  const gridPadding = "px-16";

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Table Header */}
      <div className={`grid ${gridLayout} ${gridGap} ${gridPadding} bg-[#F2F2F2] text-zinc-600 font-black uppercase text-2xl tracking-widest border-b-4 border-zinc-200 py-6 z-20 shrink-0 items-center`}>
        <div>RANK</div>
        <div></div>
        <div>TEAM NAME</div>
        <div className="text-center">WP</div>
        <div className="text-center">AP</div>
        <div className="text-center">SP</div>
        <div className="text-center">W-L-T</div>
      </div>

      {/* Table Body (Infinite Ticker) */}
      <div className="flex-1 overflow-hidden relative z-10">
        {rankings.length > 0 ? (
          <Ticker itemCount={rankings.length * (logos.length || 1)} speed={0.8} className="h-full" gap={0}>
            {/* Cycle through logos, providing a rankings list for each logo */}
            {logos.length > 0 ? logos.map((logo, logoIndex) => (
              <div key={`logo-group-${logoIndex}`}>
                {/* Logo Section - Appears BEFORE the rankings list */}
                <div className="bg-white py-0 flex flex-col items-center justify-center border-b-2 border-zinc-100">
                  <div className="relative w-full max-w-5xl flex justify-center px-20">
                    <img 
                      src={logo} 
                      alt="Sponsor/Event Logo" 
                      className="max-h-[400px] w-auto object-contain transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Current iteration of rankings */}
                {rankings.map((ranking, index) => (
                  <div 
                    key={`${ranking.team_id}-${logoIndex}-${index}`}
                    className={`grid ${gridLayout} ${gridGap} ${gridPadding} items-center py-4 transition-colors border-b-2 border-zinc-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'
                    }`}
                  >
                    <div className="text-3xl font-black text-black leading-none">
                      {index + 1}
                    </div>
                    <div className="text-3xl font-black text-black tracking-tighter uppercase leading-none">
                      {ranking.teams?.team_name?.split(' ')[0] || ranking.team_id}
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 truncate leading-none">
                      {ranking.teams?.team_name || `Team ${ranking.team_id}`}
                    </div>
                    <div className="text-3xl font-black text-center text-black leading-none">
                      {ranking.wp}
                    </div>
                    <div className="text-3xl font-black text-center text-black leading-none">
                      {ranking.ap}
                    </div>
                    <div className="text-3xl font-black text-center text-black leading-none">
                      {ranking.sp}
                    </div>
                    <div className="text-3xl font-bold font-mono text-center text-zinc-500 tracking-tighter leading-none">
                      {ranking.wins}-{ranking.losses}-{ranking.ties}
                    </div>
                  </div>
                ))}
              </div>
            )) : (
              // Fallback if no logos found (just the rankings once)
              rankings.map((ranking, index) => (
                <div 
                  key={`${ranking.team_id}-${index}`}
                  className={`grid ${gridLayout} ${gridGap} ${gridPadding} items-center py-4 transition-colors border-b-2 border-zinc-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'
                  }`}
                >
                  <div className="text-3xl font-black text-black leading-none">
                    {index + 1}
                  </div>
                  <div className="text-3xl font-black text-black tracking-tighter uppercase leading-none">
                    {ranking.teams?.team_name?.split(' ')[0] || ranking.team_id}
                  </div>
                  <div className="text-2xl font-bold text-zinc-900 truncate leading-none">
                    {ranking.teams?.team_name || `Team ${ranking.team_id}`}
                  </div>
                  <div className="text-3xl font-black text-center text-black leading-none">
                    {ranking.wp}
                  </div>
                  <div className="text-3xl font-black text-center text-black leading-none">
                    {ranking.ap}
                  </div>
                  <div className="text-3xl font-black text-center text-black leading-none">
                    {ranking.sp}
                  </div>
                  <div className="text-3xl font-bold font-mono text-center text-zinc-500 tracking-tighter leading-none">
                    {ranking.wins}-{ranking.losses}-{ranking.ties}
                  </div>
                </div>
              ))
            )}
          </Ticker>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic uppercase font-black tracking-widest py-20">
            Waiting for data...
          </div>
        )}
      </div>
    </div>
  );
}
