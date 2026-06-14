'use client';

import { useMemo } from 'react';
import { Trophy, Crown, ArrowRight } from 'lucide-react';

interface Team {
  id: number;
  team_name: string;
}

interface Ranking {
  team_id: number;
}

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

interface TournamentBracketProps {
  matches: Match[];
  teams: Team[];
  rankings: Ranking[];
}

export default function TournamentBracket({ matches, teams, rankings = [] }: TournamentBracketProps) {
  const getTeam = (id: number | null) => {
    if (id === null) return null;
    return teams.find(t => t.id === id);
  };

  const getRank = (teamId: number) => {
    const index = rankings.findIndex(r => r.team_id === teamId);
    return index !== -1 ? index + 1 : '-';
  };

  const getWinnerId = (match: Match | undefined) => {
    if (!match || match.status !== 'Completed') return null;
    if (match.red_score > match.blue_score) return match.red_team_id;
    if (match.blue_score > match.red_score) return match.blue_team_id;
    return null;
  };

  const sf1 = matches.find(m => m.match_type === 'Semi-Final' && m.match_number === 1);
  const sf2 = matches.find(m => m.match_type === 'Semi-Final' && m.match_number === 2);
  const final = matches.find(m => m.match_type === 'Final');

  const winnerSF1 = getWinnerId(sf1);
  const winnerSF2 = getWinnerId(sf2);
  const championId = getWinnerId(final);

  const isRedWinnerSF1 = sf1?.status === 'Completed' && sf1.red_score > sf1.blue_score;
  const isBlueWinnerSF1 = sf1?.status === 'Completed' && sf1.blue_score > sf1.red_score;
  const isRedWinnerSF2 = sf2?.status === 'Completed' && sf2.red_score > sf2.blue_score;
  const isBlueWinnerSF2 = sf2?.status === 'Completed' && sf2.blue_score > sf2.red_score;

  // Identify the "Next Up" match
  const nextMatchId = useMemo(() => {
    if (sf1?.status === 'Pending') return sf1.id;
    if (sf2?.status === 'Pending') return sf2.id;
    if (final?.status === 'Pending') return final.id;
    return null;
  }, [sf1, sf2, final]);

  const renderMatchCard = (match: Match | undefined, title: string, placeholderRed: string = 'TBD', placeholderBlue: string = 'TBD', isLarge = false) => {
    const redTeam = match ? getTeam(match.red_team_id) : null;
    const blueTeam = match ? getTeam(match.blue_team_id) : null;
    
    let displayRed = redTeam?.team_name || placeholderRed;
    let displayBlue = blueTeam?.team_name || placeholderBlue;
    
    if (title === 'Grand Finals' && !match) {
        if (winnerSF1) displayRed = getTeam(winnerSF1)?.team_name || 'Winner SF1';
        if (winnerSF2) displayBlue = getTeam(winnerSF2)?.team_name || 'Winner SF2';
    }

    const redScore = (match?.status === 'Completed' || match?.status === 'Ongoing') ? match.red_score : null;
    const blueScore = (match?.status === 'Completed' || match?.status === 'Ongoing') ? match.blue_score : null;

    const isRedWinner = match?.status === 'Completed' && match.red_score > match.blue_score;
    const isBlueWinner = match?.status === 'Completed' && match.blue_score > match.red_score;
    const isNextMatch = match?.id === nextMatchId;
    const isPending = match?.status === 'Pending';

    return (
      <div className={`flex flex-col ${isLarge ? 'w-[520px]' : 'w-[420px]'} group relative`}>
        {/* Match Header */}
        <div className="flex items-center justify-between mb-2 px-3">
          <div className="flex items-center gap-3">
            <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
              isNextMatch ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {title}
            </div>
            {match?.status === 'Ongoing' ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live
              </div>
            ) : isNextMatch ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Ready
              </div>
            ) : (
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scheduled</span>
            )}
          </div>
          {match?.status === 'Completed' && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Trophy className="w-3 h-3" />
              Final Result
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className={`relative bg-white border-2 transition-all duration-500 rounded-2xl overflow-hidden ${
          isNextMatch ? 'border-blue-500 shadow-[0_25px_60px_rgba(59,130,246,0.12)] z-20 scale-[1.02]' :
          isLarge ? 'border-amber-200 shadow-[0_15px_40px_rgba(0,0,0,0.04)]' : 'border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)]'
        } ${match?.status === 'Ongoing' ? 'ring-4 ring-emerald-500/5 border-emerald-400/50' : ''}`}>
          
          {/* VS Center Badge for Pending matches */}
          {isPending && !isLarge && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center z-20 shadow-sm group-hover:scale-110 transition-transform">
              <span className="text-[10px] font-black text-slate-400 italic tracking-tighter">VS</span>
            </div>
          )}

          {/* Winner Glow Layer */}
          <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
            isRedWinner ? 'bg-gradient-to-r from-red-50/50 to-transparent' : 
            isBlueWinner ? 'bg-gradient-to-r from-blue-50/50 to-transparent' : 'opacity-0'
          }`} />

          {/* Red Side */}
          <div className={`flex items-center justify-between py-4 px-5 border-b border-slate-50 transition-colors relative ${isRedWinner ? 'z-10' : ''}`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-1.5 h-12 rounded-full transition-shadow duration-500 ${
                isRedWinner ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-slate-200'
              }`} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  {redTeam && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isRedWinner ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                      {getRank(redTeam.id)}
                    </span>
                  )}
                  <span className={`text-xl font-bold uppercase tracking-tight truncate transition-colors duration-500 ${
                    isRedWinner ? 'text-slate-900' : 
                    isBlueWinner ? 'text-slate-300' : 
                    (isPending && !isNextMatch) ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {displayRed}
                  </span>
                </div>
                {isRedWinner && <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.1em] mt-0.5 ml-0.5">Winner Advancing</span>}
              </div>
            </div>
            
            <div className={`w-16 h-12 flex items-center justify-center rounded-xl transition-all duration-500 ${
              isRedWinner ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 
              redScore !== null ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-200 border border-slate-100'
            }`}>
              <span className="text-3xl font-black tabular-nums tracking-tighter">
                {redScore ?? '--'}
              </span>
            </div>
          </div>

          {/* Blue Side */}
          <div className={`flex items-center justify-between py-4 px-5 transition-colors relative ${isBlueWinner ? 'z-10' : ''}`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-1.5 h-12 rounded-full transition-shadow duration-500 ${
                isBlueWinner ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-slate-200'
              }`} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  {blueTeam && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isBlueWinner ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {getRank(blueTeam.id)}
                    </span>
                  )}
                  <span className={`text-xl font-bold uppercase tracking-tight truncate transition-colors duration-500 ${
                    isBlueWinner ? 'text-slate-900' : 
                    isRedWinner ? 'text-slate-300' : 
                    (isPending && !isNextMatch) ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {displayBlue}
                  </span>
                </div>
                {isBlueWinner && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.1em] mt-0.5 ml-0.5">Winner Advancing</span>}
              </div>
            </div>

            <div className={`w-16 h-12 flex items-center justify-center rounded-xl transition-all duration-500 ${
              isBlueWinner ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
              blueScore !== null ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-200 border border-slate-100'
            }`}>
              <span className="text-3xl font-black tabular-nums tracking-tighter">
                {blueScore ?? '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-16 bg-[#F8FAFC] relative overflow-hidden">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1.5px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1px)] bg-[size:100px_100px] opacity-30" />

      <div className="flex-1 flex items-center justify-center relative">
        
        <div className="flex items-center gap-0 relative">
          {/* Semi Finals Column */}
          <div className="flex flex-col gap-32 z-10">
            {renderMatchCard(sf1, 'Semi-Final 1')}
            {renderMatchCard(sf2, 'Semi-Final 2')}
          </div>

          {/* Connections SVG Layer */}
          <div className="w-32 h-[600px] relative">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 128 600" preserveAspectRatio="none">
              {/* Connector Paths - Dynamic alignment logic */}
              <path 
                d={`M 0 ${isRedWinnerSF1 ? '115' : isBlueWinnerSF1 ? '185' : '150'} L 64 ${isRedWinnerSF1 ? '115' : isBlueWinnerSF1 ? '185' : '150'} L 64 250 L 128 250`} 
                fill="none" 
                stroke={winnerSF1 ? "#475569" : "#e2e8f0"} 
                strokeWidth={winnerSF1 ? "3" : "2"}
                className="transition-all duration-1000"
              />
              <path 
                d={`M 0 ${isRedWinnerSF2 ? '415' : isBlueWinnerSF2 ? '485' : '450'} L 64 ${isRedWinnerSF2 ? '415' : isBlueWinnerSF2 ? '485' : '450'} L 64 350 L 128 350`} 
                fill="none" 
                stroke={winnerSF2 ? "#475569" : "#e2e8f0"} 
                strokeWidth={winnerSF2 ? "3" : "2"}
                className="transition-all duration-1000"
              />
              
              <circle cx="64" cy="250" r="4" fill={winnerSF1 ? "#475569" : "#cbd5e1"} className="transition-all duration-1000" />
              <circle cx="64" cy="350" r="4" fill={winnerSF2 ? "#475569" : "#cbd5e1"} className="transition-all duration-1000" />
            </svg>
          </div>

          {/* Finals Column */}
          <div className="z-10 flex flex-col items-center relative">
            {/* Champion Display Area */}
            <div className={`absolute -top-56 left-1/2 -translate-x-1/2 transition-all duration-1000 flex flex-col items-center w-full ${
              championId ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'
            }`}>
               <div className="relative">
                 <Crown className="w-20 h-20 text-amber-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] mb-2" />
                 <div className="absolute -inset-6 bg-amber-400/20 blur-3xl rounded-full" />
               </div>
               <span className="text-slate-400 font-black text-[11px] uppercase tracking-[1.2em] mb-3 ml-3">CHAMPION</span>
               <span className="text-6xl font-black text-slate-900 uppercase tracking-tighter drop-shadow-sm text-center whitespace-nowrap">
                 {getTeam(championId)?.team_name}
               </span>
            </div>

            {renderMatchCard(final, 'Grand Finals', winnerSF1 ? 'Winner SF1' : 'TBD', winnerSF2 ? 'Winner SF2' : 'TBD', true)}
          </div>
        </div>

      </div>

      {/* Footer Info Panel */}
      <div className="mt-auto h-24 flex items-center justify-between border-t border-slate-100 px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-black text-2xl uppercase tracking-widest leading-none italic">SEMI FINALS</span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1.5">Official Tournament Broadcast</span>
            </div>
          </div>
        </div>

        <div className="flex gap-20">
          <div className="flex items-center gap-5 group">
            <div className="w-2 h-8 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.25)]" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">RED</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alliance</span>
            </div>
          </div>
          <div className="flex items-center gap-5 group">
            <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.25)]" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">BLUE</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alliance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
