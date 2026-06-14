'use client';

import { useMemo, useEffect, useState } from 'react';
import Ticker from './Ticker';

interface Match {
  id: string;
  match_number: number;
  match_type: string;
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
  isEliminationPhase?: boolean;
}

export default function MatchSchedule({ matches, teams, isEliminationPhase = false }: MatchScheduleProps) {
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

  const getTeamName = (id: number) => {
    return teams.find(t => t.id === id)?.team_name || `Team ${id}`;
  };

  const getMatchPrefix = (type: string) => {
    switch (type) {
      case 'Qualification': return 'Q';
      case 'Semi-Final': return 'SF';
      case 'Final': return 'F';
      default: return 'Q';
    }
  };

  const upcomingMatches = useMemo(() => {
    return matches.filter(m => m.status === 'Pending');
  }, [matches]);

  const recentResults = useMemo(() => {
    let filtered = matches.filter(m => m.status === 'Completed');
    
    if (isEliminationPhase) {
      filtered = filtered.filter(m => m.match_type !== 'Qualification');
    }
    
    return filtered.sort((a, b) => b.match_number - a.match_number);
  }, [matches, isEliminationPhase]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Recent Results */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-[#F2F2F2] text-zinc-600 font-black uppercase text-2xl tracking-widest border-b-4 border-zinc-200 py-6 px-10 z-20 shrink-0">
          RESULTS
        </div>
        <div className="flex-1 overflow-hidden">
          {recentResults.length > 0 ? (
            <Ticker itemCount={recentResults.length * (logos.length || 1)} speed={0.8} className="h-full" gap={0}>
              {logos.length > 0 ? logos.map((_, logoIndex) => (
                <div key={`results-group-${logoIndex}`}>
                  {recentResults.map((match, index) => (
                    <div 
                      key={`${match.id}-${logoIndex}-${index}`} 
                      className={`grid grid-cols-[80px_1fr_140px_1fr] gap-x-4 items-center py-4 px-8 transition-colors border-b-2 border-black/5 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'
                      }`}
                    >
                      <div className="text-2xl font-black italic tracking-tighter text-zinc-400 leading-none">
                        {getMatchPrefix(match.match_type)}{match.match_number}
                      </div>
                      <div className="text-2xl font-black text-red-600 uppercase text-right truncate leading-none pr-3">
                        {getTeamName(match.red_team_id).split(' ')[0]}
                      </div>
                      <div className="text-3xl font-black text-black tabular-nums tracking-tighter text-center leading-none bg-black/5 py-3 rounded-lg mx-2">
                        {match.red_score} - {match.blue_score}
                      </div>
                      <div className="text-2xl font-black text-blue-600 uppercase text-left truncate leading-none pl-3">
                        {getTeamName(match.blue_team_id).split(' ')[0]}
                      </div>
                    </div>
                  ))}
                  {/* Tiny gap after EACH iteration */}
                  <div style={{ height: '32px' }} className="bg-white shrink-0" aria-hidden="true" />
                </div>
              )) : (
                recentResults.map((match, index) => (
                  <div 
                    key={`${match.id}-${index}`} 
                    className={`grid grid-cols-[60px_1fr_200px_1fr] items-center py-4 px-6 transition-colors border-b-2 border-black/5 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'
                    }`}
                  >
                    <div className="text-2xl font-black italic tracking-tighter text-zinc-400 leading-none">
                      {getMatchPrefix(match.match_type)}{match.match_number}
                    </div>
                    <div className="text-2xl font-black text-red-600 uppercase text-right truncate leading-none pr-3">
                      {getTeamName(match.red_team_id).split(' ')[0]}
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums tracking-tighter text-center leading-none bg-black/5 py-3 rounded-lg mx-2">
                      {match.red_score} - {match.blue_score}
                    </div>
                    <div className="text-2xl font-black text-blue-600 uppercase text-left truncate leading-none pl-3">
                      {getTeamName(match.blue_team_id).split(' ')[0]}
                    </div>
                  </div>
                ))
              )}
            </Ticker>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 italic uppercase font-black tracking-widest py-20">
              Waiting for results...
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-black/10">
        <div className="bg-[#F2F2F2] text-zinc-600 font-black uppercase text-2xl tracking-widest border-b-4 border-zinc-200 py-6 px-10 z-20 shrink-0">
          SCHEDULE
        </div>
        <div className="flex-1 overflow-hidden">
          {upcomingMatches.length > 0 ? (
            <Ticker itemCount={upcomingMatches.length * (logos.length || 1)} speed={0.8} className="h-full" gap={0}>
              {logos.length > 0 ? logos.map((_, logoIndex) => (
                <div key={`schedule-group-${logoIndex}`}>
                  {upcomingMatches.map((match, index) => (
                    <div 
                      key={`${match.id}-${logoIndex}-${index}`} 
                      className={`grid grid-cols-[80px_1fr_140px_1fr] gap-x-4 items-center py-4 px-8 transition-colors border-b-2 border-black/5 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'
                      }`}
                    >
                      <div className="text-2xl font-black italic tracking-tighter text-zinc-400 leading-none">
                        {getMatchPrefix(match.match_type)}{match.match_number}
                      </div>
                      <div className="text-2xl font-black text-red-600 uppercase text-right truncate leading-none pr-3">
                        {getTeamName(match.red_team_id).split(' ')[0]}
                      </div>
                      <div className="text-xl font-black text-zinc-300 text-center italic uppercase tracking-[0.2em] leading-none">
                        VS
                      </div>
                      <div className="text-2xl font-black text-blue-600 uppercase text-left truncate leading-none pl-3">
                        {getTeamName(match.blue_team_id).split(' ')[0]}
                      </div>
                    </div>
                  ))}
                  {/* Tiny gap after EACH iteration */}
                  <div style={{ height: '32px' }} className="bg-white shrink-0" aria-hidden="true" />
                </div>
              )) : (
                upcomingMatches.map((match, index) => (
                  <div 
                    key={`${match.id}-${index}`} 
                    className={`grid grid-cols-[60px_1fr_120px_1fr] items-center py-4 px-6 transition-colors border-b-2 border-black/5 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'
                    }`}
                  >
                    <div className="text-2xl font-black italic tracking-tighter text-zinc-400 leading-none">
                      {getMatchPrefix(match.match_type)}{match.match_number}
                    </div>
                    <div className="text-2xl font-black text-red-600 uppercase text-right truncate leading-none pr-3">
                      {getTeamName(match.red_team_id).split(' ')[0]}
                    </div>
                    <div className="text-xl font-black text-zinc-300 text-center italic uppercase tracking-[0.2em] leading-none">
                      VS
                    </div>
                    <div className="text-2xl font-black text-blue-600 uppercase text-left truncate leading-none pl-3">
                      {getTeamName(match.blue_team_id).split(' ')[0]}
                    </div>
                  </div>
                ))
              )}
            </Ticker>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 italic uppercase font-black tracking-widest py-20">
              No upcoming matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
