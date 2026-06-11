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
  return (
    <div className="h-full flex flex-col bg-black">
      {/* Table Header */}
      <div className="grid grid-cols-[100px_140px_1fr_100px_100px_100px_140px] bg-black text-zinc-500 font-black uppercase text-sm tracking-tighter border-b border-white/10 py-4 px-8 z-20">
        <div>RANK</div>
        <div>TEAM</div>
        <div>TEAM NAME</div>
        <div className="text-center">WP</div>
        <div className="text-center">AP</div>
        <div className="text-center">SP</div>
        <div className="text-right">W-L-T</div>
      </div>

      {/* Table Body (Infinite Ticker) */}
      <div className="flex-1 overflow-hidden relative">
        {rankings.length > 0 ? (
          <Ticker itemCount={rankings.length} speed={0.5} className="h-full">
            {rankings.map((ranking, index) => (
              <div 
                key={`${ranking.team_id}-${index}`}
                className={`grid grid-cols-[100px_140px_1fr_100px_100px_100px_140px] items-center py-5 px-8 transition-colors border-b border-black/5 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'
                }`}
              >
                <div className="text-3xl font-black italic tracking-tighter text-black">
                  {index + 1}
                </div>
                <div className="text-2xl font-black text-black tracking-tight uppercase">
                  {ranking.teams?.team_name?.split(' ')[0] || ranking.team_id}
                </div>
                <div className="text-xl font-bold text-zinc-800 truncate pr-4">
                  {ranking.teams?.team_name || `Team ${ranking.team_id}`}
                </div>
                <div className="text-2xl font-black text-center text-black">
                  {ranking.wp}
                </div>
                <div className="text-2xl font-black text-center text-black">
                  {ranking.ap}
                </div>
                <div className="text-2xl font-black text-center text-black">
                  {ranking.sp}
                </div>
                <div className="text-2xl font-bold font-mono text-right text-zinc-600 tracking-tighter">
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
