'use client';

import { useMemo } from 'react';
import Ticker from './Ticker';

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
    return matches.filter(m => m.status === 'Pending');
  }, [matches]);

  const recentResults = useMemo(() => {
    return matches
      .filter(m => m.status === 'Completed')
      .sort((a, b) => b.match_number - a.match_number);
  }, [matches]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Recent Results */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-black/10 z-10 bg-white">
          <h2 className="text-xl font-black italic tracking-tighter text-black uppercase">
            Results
          </h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {recentResults.length > 0 ? (
            <Ticker itemCount={recentResults.length} speed={0.4} className="h-full">
              {recentResults.map((match, index) => (
                <div key={`${match.id}-${index}`} className={`p-4 border-b border-black/5 flex items-center justify-between ${index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'}`}>
                  <div className="text-xl font-black italic text-zinc-400 w-16">
                    Q{match.match_number}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black tracking-tighter text-red-600 uppercase">
                        {getTeamName(match.red_team_id).split(' ')[0]}
                      </span>
                      <span className="text-xl font-black text-black">{match.red_score}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black tracking-tighter text-blue-600 uppercase">
                        {getTeamName(match.blue_team_id).split(' ')[0]}
                      </span>
                      <span className="text-xl font-black text-black">{match.blue_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </Ticker>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-black italic uppercase py-10 bg-white">
              Waiting for results...
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-black/10">
        <div className="p-4 border-b border-black/10 z-10 bg-white">
          <h2 className="text-xl font-black italic tracking-tighter text-black uppercase">
            Schedule
          </h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {upcomingMatches.length > 0 ? (
            <Ticker itemCount={upcomingMatches.length} speed={0.4} className="h-full">
              {upcomingMatches.map((match, index) => (
                <div 
                  key={`${match.id}-${index}`} 
                  className={`px-4 py-3 border-b border-black/5 flex items-center gap-3 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'}`}
                >
                  <div className="text-lg font-black italic text-zinc-400 shrink-0">
                    Q{match.match_number}
                  </div>
                  <div className="w-px h-4 bg-black/10 shrink-0" />
                  <div className="flex-1 flex items-center gap-2 overflow-hidden">
                    <span className="text-sm font-black text-red-600 uppercase truncate">
                      {getTeamName(match.red_team_id).split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-black text-zinc-300 shrink-0">VS</span>
                    <span className="text-sm font-black text-blue-600 uppercase truncate">
                      {getTeamName(match.blue_team_id).split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </Ticker>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-black italic uppercase py-10 bg-white">
              No upcoming matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
