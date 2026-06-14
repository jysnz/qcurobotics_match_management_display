'use client';

import { useEffect, useState } from 'react';

interface Team {
  id: number;
  team_name: string;
  team_id?: string | number;
}

interface Ranking {
  team_id: number;
}

interface Match {
  id: string;
  match_type: string;
  match_number: number;
  red_score: number;
  blue_score: number;
  red_team_id: number;
  blue_team_id: number;
  red_blocks_scored?: number;
  blue_blocks_scored?: number;
  red_long_goals_controlled?: number;
  blue_long_goals_controlled?: number;
  red_upper_goals_controlled?: number;
  blue_upper_goals_controlled?: number;
  red_lower_goals_controlled?: number;
  blue_lower_goals_controlled?: number;
  red_parked_robots?: number;
  blue_parked_robots?: number;
  autonomous_bonus?: 'Red' | 'Blue' | 'None';
  red_awp?: boolean;
  blue_awp?: boolean;
  red_disqualified?: boolean;
  blue_disqualified?: boolean;
}

interface MatchResultTakeoverProps {
  match: Match;
  teams: Team[];
  rankings: Ranking[];
  tournamentName: string;
  onClose?: () => void;
}

export default function MatchResultTakeover({ match, teams, rankings, tournamentName }: MatchResultTakeoverProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Stagger entry
    const entryTimer = setTimeout(() => setVisible(true), 50);
    
    // Start exit animation 500ms before the 10s mark
    const exitTimer = setTimeout(() => {
      setVisible(false);
    }, 9500);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
    };
  }, [match.id]);

  const getTeam = (id: number) => {
    return teams.find(t => t.id === id) || { id, team_name: `Team ${id}`, team_id: id };
  };

  const getRank = (teamId: number) => {
    const index = rankings.findIndex(r => r.team_id === teamId);
    return index !== -1 ? index + 1 : '-';
  };

  const winner = match.red_score > match.blue_score ? 'RED' : match.blue_score > match.red_score ? 'BLUE' : 'TIE';
  const redTeam = getTeam(match.red_team_id);
  const blueTeam = getTeam(match.blue_team_id);
  
  const redRank = getRank(match.red_team_id);
  const blueRank = getRank(match.blue_team_id);

  // VEX Official Score Breakdown Rows
  const statsRows = [
    { label: 'Blocks Scored', red: match.red_blocks_scored || 0, blue: match.blue_blocks_scored || 0 },
    { label: 'Long Goals Controlled', red: match.red_long_goals_controlled || 0, blue: match.blue_long_goals_controlled || 0 },
    { label: 'Upper Goal Controlled', red: match.red_upper_goals_controlled || 0, blue: match.blue_upper_goals_controlled || 0 },
    { label: 'Lower Goal Controlled', red: match.red_lower_goals_controlled || 0, blue: match.blue_lower_goals_controlled || 0 },
    { label: 'Parked Robots', red: match.red_parked_robots || 0, blue: match.blue_parked_robots || 0 },
    { label: 'Autonomous Bonus', red: match.autonomous_bonus === 'Red' ? '10' : '0', blue: match.autonomous_bonus === 'Blue' ? '10' : '0' },
    { label: 'Autonomous Win Point', red: match.red_awp ? '1' : '0', blue: match.blue_awp ? '1' : '0' },
  ];

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#050505] text-white transition-all duration-700 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Subtle VEX-style elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#333,transparent)]" />
      </div>

      {/* Header Section */}
      <div className="pt-10 px-16 relative z-10">
        <div className={`transition-all duration-1000 delay-200 ${visible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <div className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2 drop-shadow-md">
            {tournamentName}
          </div>
          <div className="text-7xl font-black uppercase text-white tracking-tight drop-shadow-xl">
            {match.match_type} {match.match_number}
          </div>
        </div>
      </div>

      {/* Main Scoring Arena: Centered Layout */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-[1800px] grid grid-cols-[1fr_minmax(400px,650px)_1fr] items-center gap-8 md:gap-16">
          
          {/* RED SCORE */}
          <div className={`text-right transition-all duration-1000 delay-400 ${visible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
             <div className="text-[10rem] md:text-[13rem] font-black leading-none text-white drop-shadow-2xl">
               {match.red_score}
             </div>
          </div>

          {/* STATISTICS TABLE (Centered) */}
          <div className={`px-4 transition-all duration-1000 delay-600 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="w-full">
              {/* Table Header Labels */}
              <div className="grid grid-cols-[80px_1fr_80px] border-b-2 border-white/20 pb-4 mb-4">
                <div className="text-[#e21e26] font-black text-3xl text-center">RED</div>
                <div className="text-zinc-400 font-black text-sm uppercase tracking-[0.5em] text-center self-end pb-1">MATCH DATA</div>
                <div className="text-[#005da1] font-black text-3xl text-center">BLUE</div>
              </div>

              {/* Stats Rows */}
              <div className="divide-y divide-white/10">
                {statsRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[100px_1fr_100px] items-center py-5 px-2">
                    <div className="text-3xl font-black text-center text-white">{row.red}</div>
                    <div className="text-3xl font-normal text-white/90 uppercase tracking-tighter text-center px-4 leading-tight">
                      {row.label}
                    </div>
                    <div className="text-3xl font-black text-center text-white">{row.blue}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Winner Announcement below Stats */}
            <div className={`mt-10 text-center transition-all duration-1000 delay-1000 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
               <div className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter drop-shadow-2xl">
                 {winner === 'TIE' ? "MATCH IS A TIE!" : `${winner} ALLIANCE WINS!`}
               </div>
            </div>
          </div>

          {/* BLUE SCORE */}
          <div className={`text-left transition-all duration-1000 delay-400 ${visible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
             <div className="text-[10rem] md:text-[13rem] font-black leading-none text-white drop-shadow-2xl">
               {match.blue_score}
             </div>
          </div>

        </div>
      </div>

      {/* Bottom Alliance Information Panels */}
      <div className="h-44 flex items-end overflow-hidden relative z-20">
        
        {/* Red Panel */}
        <div 
          className={`h-40 bg-[#e21e26] relative flex items-center pl-16 pr-32 transition-all duration-1000 delay-800 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ 
            width: '52%',
            clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)'
          }}
        >
          <div className="flex items-center gap-12">
            <div className="flex flex-col items-center relative">
              <div className="absolute -top-12 flex flex-col items-center gap-2">
                <div className="bg-white text-[#e21e26] px-4 py-1 font-black text-lg skew-x-[-15deg] shadow-lg">
                  <span className="skew-x-[15deg] inline-block">RANK #{redRank}</span>
                </div>
                {match.red_disqualified && (
                  <div className="bg-white text-[#e21e26] px-3 py-0.5 font-black text-xl skew-x-[-15deg] shadow-lg border-2 border-[#e21e26] z-20">
                    <span className="skew-x-[15deg] inline-block">DQ</span>
                  </div>
                )}
              </div>
              <span className="text-9xl font-black text-white leading-none drop-shadow-2xl">{redTeam.team_id}</span>
            </div>
            <div className="h-16 w-2 bg-white/30 skew-x-[-15deg]" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-white/70 uppercase tracking-[0.4em] mb-1">RED ALLIANCE</span>
              <span className="text-5xl font-bold text-white uppercase tracking-tight truncate max-w-2xl drop-shadow-lg">{redTeam.team_name}</span>
            </div>
          </div>
        </div>

        {/* Blue Panel */}
        <div 
          className={`h-40 bg-[#005da1] relative flex items-center justify-end pr-16 pl-32 -ml-[4%] transition-all duration-1000 delay-800 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ 
            width: '52%',
            clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)'
          }}
        >
          <div className="flex items-center gap-12 text-right">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-white/70 uppercase tracking-[0.4em] mb-1">BLUE ALLIANCE</span>
              <span className="text-5xl font-bold text-white uppercase tracking-tight truncate max-w-2xl drop-shadow-lg">{blueTeam.team_name}</span>
            </div>
            <div className="h-16 w-2 bg-white/30 skew-x-[-15deg]" />
            <div className="flex flex-col items-center relative">
              <div className="absolute -top-12 flex flex-col items-center gap-2">
                <div className="bg-white text-[#005da1] px-4 py-1 font-black text-lg skew-x-[-15deg] shadow-lg">
                  <span className="skew-x-[15deg] inline-block">RANK #{blueRank}</span>
                </div>
                {match.blue_disqualified && (
                  <div className="bg-white text-[#005da1] px-3 py-0.5 font-black text-xl skew-x-[-15deg] shadow-lg border-2 border-[#005da1] z-20">
                    <span className="skew-x-[15deg] inline-block">DQ</span>
                  </div>
                )}
              </div>
              <span className="text-9xl font-black text-white leading-none drop-shadow-2xl">{blueTeam.team_id}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar (Integrated subtly) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-30">
          <div className="h-full bg-white/30 animate-progress origin-left" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-progress {
          animation: progress 10s linear forwards;
        }
      `}</style>
    </div>
  );
}
