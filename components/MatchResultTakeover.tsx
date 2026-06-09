'use client';

import { Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MatchResultTakeoverProps {
  match: any;
  teams: any[];
  onClose: () => void;
}

export default function MatchResultTakeover({ match, teams, onClose }: MatchResultTakeoverProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const getTeamName = (id: number) => {
    return teams.find(t => t.id === id)?.team_name || `Team ${id}`;
  };

  const winner = match.red_score > match.blue_score ? 'RED' : match.blue_score > match.red_score ? 'BLUE' : 'TIE';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`w-full max-w-6xl p-8 transition-all duration-1000 delay-300 ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        
        {/* Match Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Match Result</h2>
          <h1 className="text-8xl font-black italic tracking-tighter text-white">
            QUALIFICATION <span className="text-amber-500">{match.match_number}</span>
          </h1>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-12">
          
          {/* Red Alliance */}
          <div className={`relative p-12 rounded-[2rem] border-4 transition-all duration-1000 delay-500 ${winner === 'RED' ? 'bg-red-600 border-red-400 shadow-[0_0_100px_rgba(220,38,38,0.4)]' : 'bg-red-950/20 border-red-900/40 opacity-40'}`}>
            {winner === 'RED' && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-2 rounded-full font-black italic flex items-center gap-2 shadow-xl animate-bounce">
                <Trophy className="w-5 h-5" /> WINNER
              </div>
            )}
            <div className="text-center">
              <span className="text-2xl font-black text-white/50 mb-4 block uppercase tracking-widest">RED ALLIANCE</span>
              <span className="text-6xl font-black text-white block mb-8 tracking-tighter">{match.red_team_id}</span>
              <span className="text-9xl font-black text-white leading-none">{match.red_score}</span>
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-4xl font-black text-zinc-800 italic">VS</div>

          {/* Blue Alliance */}
          <div className={`relative p-12 rounded-[2rem] border-4 transition-all duration-1000 delay-500 ${winner === 'BLUE' ? 'bg-blue-600 border-blue-400 shadow-[0_0_100px_rgba(37,99,235,0.4)]' : 'bg-blue-950/20 border-blue-900/40 opacity-40'}`}>
            {winner === 'BLUE' && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-2 rounded-full font-black italic flex items-center gap-2 shadow-xl animate-bounce">
                <Trophy className="w-5 h-5" /> WINNER
              </div>
            )}
            <div className="text-center">
              <span className="text-2xl font-black text-white/50 mb-4 block uppercase tracking-widest">BLUE ALLIANCE</span>
              <span className="text-6xl font-black text-white block mb-8 tracking-tighter">{match.blue_team_id}</span>
              <span className="text-9xl font-black text-white leading-none">{match.blue_score}</span>
            </div>
          </div>

        </div>

        {/* Tie Message */}
        {winner === 'TIE' && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-zinc-800 text-zinc-300 px-10 py-4 rounded-full text-3xl font-black italic border border-white/10">
              IT'S A TIE!
            </div>
          </div>
        )}

        {/* Closing Soon indicator */}
        <div className="mt-20 flex flex-col items-center">
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 animate-shrink" />
          </div>
          <span className="mt-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">Returning to Rankings...</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink 20s linear forwards;
        }
      `}</style>
    </div>
  );
}
