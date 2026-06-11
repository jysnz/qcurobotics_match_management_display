'use client';

import { useRef } from 'react';
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
  // Define consistent grid structure for absolute alignment
  // Rank: 140px, Team: 300px (Fixed basis for straight-line margin), Team Name: 1fr, Stats: 140px each, W-L-T: 300px
  const gridLayout = "grid-cols-[140px_300px_1fr_140px_140px_140px_300px]";
  const gridGap = "gap-x-16"; // Fixed gap for broadcast stability
  const gridPadding = "px-32"; // Fixed padding for TV safe-areas

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Table Header */}
      <div className={`grid ${gridLayout} ${gridGap} ${gridPadding} bg-[#F2F2F2] text-zinc-600 font-black uppercase text-6xl tracking-widest border-b-8 border-zinc-200 py-12 z-20 shrink-0 items-center`}>
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
          <Ticker itemCount={rankings.length} speed={0.5} className="h-full" gap={120}>
            {rankings.map((ranking, index) => (
              <div 
                key={`${ranking.team_id}-${index}`}
                className={`grid ${gridLayout} ${gridGap} ${gridPadding} items-center py-12 transition-colors border-b-4 border-zinc-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'
                }`}
              >
                <div className="text-6xl font-black text-black leading-none">
                  {index + 1}
                </div>
                <div className="text-6xl font-black text-black tracking-tighter uppercase leading-none">
                  {ranking.teams?.team_name?.split(' ')[0] || ranking.team_id}
                </div>
                <div className="text-5xl font-bold text-zinc-900 truncate leading-none">
                  {ranking.teams?.team_name || `Team ${ranking.team_id}`}
                </div>
                <div className="text-6xl font-black text-center text-black leading-none">
                  {ranking.wp}
                </div>
                <div className="text-6xl font-black text-center text-black leading-none">
                  {ranking.ap}
                </div>
                <div className="text-6xl font-black text-center text-black leading-none">
                  {ranking.sp}
                </div>
                <div className="text-6xl font-bold font-mono text-center text-zinc-500 tracking-tighter leading-none">
                  {ranking.wins}-{ranking.losses}-{ranking.ties}
                </div>
              </div>
            ))}
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
