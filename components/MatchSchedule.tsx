'use client';

import { useMemo } from 'react';

interface Match {
  id: string;
  match_number: number;
  red_team_id: number;
  blue_team_id: number;
  red_score: number;
  blue_score: number;
  status: 'Pending' | 'Ongoing' | 'Completed';
}

interface Team {
  id: number;
  team_name: string;
}

interface MatchScheduleProps {
  matches: Match[];
  teams: Team[];
}

export default function MatchSchedule({ matches, teams }: MatchScheduleProps) {
  const getTeamName = (id: number) => {
    return teams.find(t => t.id === id)?.team_name || `Team ${id}`;
  };

  const upcomingMatches = useMemo(() => {
    return matches
      .filter(m => m.status === 'Pending')
      .slice(0, 5);
  }, [matches]);

  const recentResults = useMemo(() => {
    return matches
      .filter(m => m.status === 'Completed')
      .sort((a, b) => b.match_number - a.match_number)
      .slice(0, 10);
  }, [matches]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Upcoming Matches */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-white/10">
        <div className="p-4 bg-zinc-900/50 border-b border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Upcoming Matches
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <div key={match.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                <div className="bg-white/5 py-1 px-3 text-[10px] font-bold text-zinc-500 border-b border-white/5">
                  QUALIFICATION MATCH {match.match_number}
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-white/5 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-red-500 mb-1">RED</span>
                    <span className="text-lg font-black tracking-tighter">{match.red_team_id}</span>
                  </div>
                  <div className="p-3 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-blue-500 mb-1">BLUE</span>
                    <span className="text-lg font-black tracking-tighter">{match.blue_team_id}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic py-10">
              No upcoming matches.
            </div>
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 bg-zinc-900/50 border-b border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Recent Results
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {recentResults.length > 0 ? (
            recentResults.map((match) => (
              <div key={match.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1 bg-white/5 border-b border-white/5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Match {match.match_number}</span>
                  <span className="text-[10px] font-medium text-emerald-500 uppercase">Final Score</span>
                </div>
                <div className="flex">
                  <div className={`flex-1 p-3 flex flex-col items-center ${match.red_score > match.blue_score ? 'bg-red-500/10' : ''}`}>
                    <span className="text-lg font-black tracking-tighter text-red-500">{match.red_team_id}</span>
                    <span className={`text-2xl font-black ${match.red_score > match.blue_score ? 'text-white' : 'text-zinc-600'}`}>
                      {match.red_score}
                    </span>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className={`flex-1 p-3 flex flex-col items-center ${match.blue_score > match.red_score ? 'bg-blue-500/10' : ''}`}>
                    <span className="text-lg font-black tracking-tighter text-blue-500">{match.blue_team_id}</span>
                    <span className={`text-2xl font-black ${match.blue_score > match.red_score ? 'text-white' : 'text-zinc-600'}`}>
                      {match.blue_score}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic py-10">
              Waiting for results...
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
