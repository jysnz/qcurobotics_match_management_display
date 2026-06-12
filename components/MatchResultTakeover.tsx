'use client';

import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MatchResultTakeoverProps {
  match: any;
  teams: any[];
  tournamentName: string;
  onClose: () => void;
}

export default function MatchResultTakeover({ match, teams, tournamentName, onClose }: MatchResultTakeoverProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log(`[RESULT_SCREEN] Rendering match result UI for match ${match.id}`);
    setVisible(true);
    // Start exit animation 500ms before the 10s mark
    const timer = setTimeout(() => {
      console.log(`[RESULT_SCREEN] Starting exit animation for match ${match.id}`);
      setVisible(false);
    }, 9500);
    return () => {
      console.log(`[RESULT_SCREEN] MatchResultTakeover unmounting for match ${match.id}`);
      clearTimeout(timer);
    };
  }, [match.id]);

  const getTeam = (id: number) => {
    return teams.find(t => t.id === id) || { id, team_name: `Team ${id}` };
  };

  const getMatchPrefix = (type: string) => {
    switch (type) {
      case 'Qualification': return 'Q';
      case 'Semi-Final': return 'SF';
      case 'Final': return 'F';
      default: return 'Q';
    }
  };

  const winner = match.red_score > match.blue_score ? 'RED' : match.blue_score > match.red_score ? 'BLUE' : 'TIE';
  const redTeam = getTeam(match.red_team_id);
  const blueTeam = getTeam(match.blue_team_id);

  const statsRows = [
    { label: 'Blocks Scored', red: '-', blue: '-' },
    { label: 'Long Goals Controlled', red: '-', blue: '-' },
    { label: 'Upper Goal Controlled', red: '-', blue: '-' },
    { label: 'Lower Goal Controlled', red: '-', blue: '-' },
    { label: 'Parked Robots', red: '-', blue: '-' },
    { label: 'Autonomous Bonus', red: match.autonomous_winner === 'Red' ? 'WIN' : '-', blue: match.autonomous_winner === 'Blue' ? 'WIN' : '-' },
    { label: 'Autonomous Win Point', red: '-', blue: '-' },
  ];

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-[#050505] text-white transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-[10%] top-[20%] w-[40%] h-[60%] bg-red-600/10 blur-[150px] rounded-full" />
        <div className="absolute -right-[10%] top-[20%] w-[40%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Header Section (Top-Left) */}
      <div className="absolute top-12 left-16 z-20">
        <div className="text-2xl font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">
          {tournamentName}
        </div>
        <div className="text-[12rem] font-black italic tracking-tighter leading-[0.8] text-white">
          {getMatchPrefix(match.match_type)}<span className="text-amber-500">{match.match_number}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center px-16 pt-32 pb-48">
        <div className="w-full grid grid-cols-[1fr_2px_600px_2px_1fr] items-center gap-0 h-[600px]">
          
          {/* Red Score */}
          <div className="flex flex-col items-center justify-center h-full">
             <div className="text-red-500 font-black text-3xl uppercase tracking-widest mb-4">RED SCORE</div>
             <div className="text-[25rem] font-black leading-none tabular-nums tracking-tighter text-white drop-shadow-[0_0_50px_rgba(220,38,38,0.3)]">
               {match.red_score}
             </div>
          </div>

          {/* Separator */}
          <div className="h-full bg-zinc-800/50" />

          {/* Center Statistics Panel */}
          <div className="h-full bg-zinc-900/30 backdrop-blur-xl border-x border-white/5 px-12 py-8 flex flex-col justify-between">
            <div className="text-center mb-8">
              <span className="text-xl font-black text-zinc-400 uppercase tracking-[0.3em]">MATCH STATISTICS</span>
            </div>
            
            <div className="space-y-4">
              {statsRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[100px_1fr_100px] items-center gap-4 py-2 border-b border-white/5 last:border-0">
                  <div className={`text-2xl font-black text-center ${row.red === 'WIN' ? 'text-red-500' : 'text-zinc-600'}`}>{row.red}</div>
                  <div className="text-lg font-bold text-zinc-400 uppercase tracking-widest text-center">{row.label}</div>
                  <div className={`text-2xl font-black text-center ${row.blue === 'WIN' ? 'text-blue-500' : 'text-zinc-600'}`}>{row.blue}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-shrink" />
              </div>
              <span className="mt-4 text-xs font-black text-zinc-600 uppercase tracking-[0.4em]">POSTING RESULTS...</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-full bg-zinc-800/50" />

          {/* Blue Score */}
          <div className="flex flex-col items-center justify-center h-full">
             <div className="text-blue-500 font-black text-3xl uppercase tracking-widest mb-4">BLUE SCORE</div>
             <div className="text-[25rem] font-black leading-none tabular-nums tracking-tighter text-white drop-shadow-[0_0_50px_rgba(37,99,235,0.3)]">
               {match.blue_score}
             </div>
          </div>

        </div>
      </div>

      {/* Winner Banner (Bottom Center) */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30">
        <div className={`px-24 py-6 rounded-full border-4 flex items-center gap-6 shadow-2xl transition-transform duration-1000 ${visible ? 'scale-100' : 'scale-0'} ${
          winner === 'RED' ? 'bg-red-600 border-red-400 shadow-red-600/40' : 
          winner === 'BLUE' ? 'bg-blue-600 border-blue-400 shadow-blue-600/40' : 
          'bg-zinc-800 border-zinc-600'
        }`}>
          <Trophy className="w-12 h-12 text-white fill-white" />
          <span className="text-6xl font-black italic text-white uppercase tracking-tighter">
            {winner === 'TIE' ? "MATCH IS A TIE!" : `${winner} ALLIANCE WINS!`}
          </span>
        </div>
      </div>

      {/* Bottom Alliance Panels */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex">
        {/* Red Panel */}
        <div className="flex-1 bg-gradient-to-r from-red-600 to-red-700 flex items-center px-12 border-t-4 border-red-400">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-red-200 uppercase tracking-[0.2em] italic">RED ALLIANCE</span>
            <div className="h-10 w-px bg-red-400/50" />
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-white italic">{redTeam.team_id}</span>
              <span className="text-2xl font-bold text-red-100 uppercase tracking-tighter truncate max-w-md">{redTeam.team_name}</span>
            </div>
          </div>
        </div>

        {/* Blue Panel */}
        <div className="flex-1 bg-gradient-to-l from-blue-600 to-blue-700 flex items-center justify-end px-12 border-t-4 border-blue-400">
          <div className="flex items-center gap-8">
            <div className="flex items-baseline gap-4 text-right">
              <span className="text-2xl font-bold text-blue-100 uppercase tracking-tighter truncate max-w-md">{blueTeam.team_name}</span>
              <span className="text-5xl font-black text-white italic">{blueTeam.team_id}</span>
            </div>
            <div className="h-10 w-px bg-blue-400/50" />
            <span className="text-2xl font-black text-blue-200 uppercase tracking-[0.2em] italic">BLUE ALLIANCE</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink 10s linear forwards;
        }
      `}</style>
    </div>
  );
}
