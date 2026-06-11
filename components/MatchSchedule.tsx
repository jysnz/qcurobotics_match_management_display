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
        <div className="bg-black text-white font-black uppercase text-[clamp(1rem,1.5vw,2rem)] tracking-[0.2em] border-b border-white/10 py-[clamp(1rem,2vh,2rem)] px-[clamp(1.5rem,3vw,4rem)] z-20 shrink-0">
          RESULTS
        </div>
        <div className="flex-1 overflow-hidden">
          {recentResults.length > 0 ? (
            <Ticker itemCount={recentResults.length} speed={0.4} className="h-full" gap={120}>
              {recentResults.map((match, index) => (
                <div 
                  key={`${match.id}-${index}`} 
                  className={`grid grid-cols-[clamp(4rem,8vw,8rem)_1fr_clamp(12rem,18vw,24rem)_1fr] items-center py-[clamp(1.5rem,3vh,3rem)] px-[clamp(1.5rem,3vw,4rem)] transition-colors border-b border-black/5 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'
                  }`}
                >
                  <div className="text-[clamp(2rem,4vw,4rem)] font-black italic tracking-tighter text-zinc-400 leading-none">
                    #{match.match_number}
                  </div>
                  <div className="text-[clamp(1.75rem,3vw,3rem)] font-black text-red-600 uppercase text-right truncate leading-none pr-10">
                    {getTeamName(match.red_team_id).split(' ')[0]}
                  </div>
                  <div className="text-[clamp(2.5rem,5vw,5rem)] font-black text-black tabular-nums tracking-tighter text-center leading-none bg-black/5 py-6 rounded-2xl mx-4">
                    {match.red_score}—{match.blue_score}
                  </div>
                  <div className="text-[clamp(1.75rem,3vw,3rem)] font-black text-blue-600 uppercase text-left truncate leading-none pl-10">
                    {getTeamName(match.blue_team_id).split(' ')[0]}
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
        <div className="bg-black text-white font-black uppercase text-[clamp(1rem,1.5vw,2rem)] tracking-[0.2em] border-b border-white/10 py-[clamp(1rem,2vh,2rem)] px-[clamp(1.5rem,3vw,4rem)] z-20 shrink-0">
          SCHEDULE
        </div>
        <div className="flex-1 overflow-hidden">
          {upcomingMatches.length > 0 ? (
            <Ticker itemCount={upcomingMatches.length} speed={0.4} className="h-full" gap={120}>
              {upcomingMatches.map((match, index) => (
                <div 
                  key={`${match.id}-${index}`} 
                  className={`grid grid-cols-[clamp(4rem,8vw,8rem)_1fr_clamp(12rem,18vw,24rem)_1fr] items-center py-[clamp(1.5rem,3vh,3rem)] px-[clamp(1.5rem,3vw,4rem)] transition-colors border-b border-black/5 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'
                  }`}
                >
                  <div className="text-[clamp(2rem,4vw,4rem)] font-black italic tracking-tighter text-zinc-400 leading-none">
                    #{match.match_number}
                  </div>
                  <div className="text-[clamp(1.5rem,3vw,3rem)] font-black text-red-600 uppercase text-right truncate leading-none pr-8">
                    {getTeamName(match.red_team_id).split(' ')[0]}
                  </div>
                  <div className="text-[clamp(1.25rem,2vw,2rem)] font-black text-zinc-300 text-center italic uppercase tracking-[0.2em] leading-none">
                    VS
                  </div>
                  <div className="text-[clamp(1.5rem,3vw,3rem)] font-black text-blue-600 uppercase text-left truncate leading-none pl-8">
                    {getTeamName(match.blue_team_id).split(' ')[0]}
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
