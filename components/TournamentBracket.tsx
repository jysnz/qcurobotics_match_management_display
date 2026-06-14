'use client';

import { useMemo } from 'react';
import { Trophy, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  
  const finalsMatches = matches.filter(m => m.match_type === 'Final').sort((a, b) => a.match_number - b.match_number);
  
  const seriesScore = useMemo(() => {
    let redWins = 0;
    let blueWins = 0;
    finalsMatches.forEach(m => {
      if (m.status === 'Completed') {
        if (m.red_score > m.blue_score) redWins++;
        else if (m.blue_score > m.red_score) blueWins++;
      }
    });
    return { red: redWins, blue: blueWins };
  }, [finalsMatches]);

  const winnerSF1 = getWinnerId(sf1);
  const winnerSF2 = getWinnerId(sf2);

  const isFinalsPhase = useMemo(() => {
    return sf1?.status === 'Completed' && sf2?.status === 'Completed';
  }, [sf1, sf2]);
  
  const championTeamId = seriesScore.red >= 2 ? finalsMatches[0]?.red_team_id : seriesScore.blue >= 2 ? finalsMatches[0]?.blue_team_id : null;

  const isRedWinnerSF1 = sf1?.status === 'Completed' && sf1.red_score > sf1.blue_score;
  const isBlueWinnerSF1 = sf1?.status === 'Completed' && sf1.blue_score > sf1.red_score;
  const isRedWinnerSF2 = sf2?.status === 'Completed' && sf2.red_score > sf2.blue_score;
  const isBlueWinnerSF2 = sf2?.status === 'Completed' && sf2.blue_score > sf2.red_score;

  const nextMatchId = useMemo(() => {
    if (sf1?.status === 'Pending') return sf1.id;
    if (sf2?.status === 'Pending') return sf2.id;
    const nextFinal = finalsMatches.find(m => m.status === 'Pending' || m.status === 'Ongoing');
    return nextFinal?.id || null;
  }, [sf1, sf2, finalsMatches]);

  const renderMatchCard = (match: Match | undefined, title: string, placeholderRed: string = 'TBD', placeholderBlue: string = 'TBD', isLarge = false) => {
    const redTeam = match ? getTeam(match.red_team_id) : null;
    const blueTeam = match ? getTeam(match.blue_team_id) : null;
    
    let displayRed = redTeam?.team_name || placeholderRed;
    let displayBlue = blueTeam?.team_name || placeholderBlue;
    
    const redScore = (match?.status === 'Completed' || match?.status === 'Ongoing') ? match.red_score : null;
    const blueScore = (match?.status === 'Completed' || match?.status === 'Ongoing') ? match.blue_score : null;

    const isRedWinner = match?.status === 'Completed' && match.red_score > match.blue_score;
    const isBlueWinner = match?.status === 'Completed' && match.blue_score > match.red_score;
    const isNextMatch = match?.id === nextMatchId;
    const isPending = match?.status === 'Pending';

    return (
      <div className={`flex flex-col ${isLarge ? 'w-[520px]' : 'w-[420px]'} group relative`}>
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

        <div className={`relative bg-white border-2 transition-all duration-500 rounded-2xl overflow-hidden ${
          isNextMatch ? 'border-blue-500 shadow-[0_25px_60px_rgba(59,130,246,0.12)] z-20 scale-[1.02]' :
          isLarge ? 'border-amber-200 shadow-[0_15px_40px_rgba(0,0,0,0.04)]' : 'border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)]'
        } ${match?.status === 'Ongoing' ? 'ring-4 ring-emerald-500/5 border-emerald-400/50' : ''}`}>
          
          {isPending && !isLarge && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center z-20 shadow-sm group-hover:scale-110 transition-transform">
              <span className="text-[10px] font-black text-slate-400 italic tracking-tighter">VS</span>
            </div>
          )}

          <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
            isRedWinner ? 'bg-gradient-to-r from-red-50/50 to-transparent' : 
            isBlueWinner ? 'bg-gradient-to-r from-blue-50/50 to-transparent' : 'opacity-0'
          }`} />

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

  const renderFinalsHero = () => {
    const match = finalsMatches.find(m => m.status === 'Ongoing' || m.status === 'Completed') || finalsMatches[0];
    const redTeam = match ? getTeam(match.red_team_id) : (winnerSF1 ? getTeam(winnerSF1) : null);
    const blueTeam = match ? getTeam(match.blue_team_id) : (winnerSF2 ? getTeam(winnerSF2) : null);

    return (
      <div className="flex flex-col items-center w-[1000px] relative">
        <div className="flex flex-col items-center mb-16">
          <div className="group flex items-center gap-6 px-10 py-4 bg-white border-2 border-slate-100 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] mb-8 transition-all hover:border-amber-200">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-slate-900 font-black text-2xl uppercase tracking-[0.6em] leading-none italic">Grand Finals</span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Championship Series • Best of 3</span>
            </div>
          </div>
          
          <div className={`transition-all duration-1000 flex flex-col items-center ${championTeamId ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-20 h-0 overflow-hidden'}`}>
             <div className="relative mb-8">
               <Crown className="w-32 h-32 text-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]" />
               <div className="absolute -inset-12 bg-amber-400/20 blur-[80px] rounded-full" />
             </div>
             <div className="flex flex-col items-center">
                <span className="text-amber-600 font-black text-sm uppercase tracking-[1.5em] mb-4 ml-6">CHAMPION</span>
                <span className="text-9xl font-black text-slate-900 uppercase tracking-tighter drop-shadow-md">
                  {getTeam(championTeamId)?.team_name}
                </span>
             </div>
          </div>
        </div>

        <div className="w-full flex items-stretch gap-12">
          <div className={`flex-1 bg-white border-2 rounded-[48px] p-12 flex flex-col items-center justify-between transition-all duration-700 relative overflow-hidden ${championTeamId === redTeam?.id ? 'border-amber-400 shadow-[0_40px_100px_rgba(245,158,11,0.15)] ring-1 ring-amber-200 z-10' : 'border-slate-100 shadow-2xl'}`}>
            <div className={`absolute top-0 inset-x-0 h-2 ${championTeamId === redTeam?.id ? 'bg-amber-400' : 'bg-red-600'}`} />
            
            <div className="flex flex-col items-center mb-8">
              <span className="text-slate-400 font-black text-3xl mb-4 opacity-50">#{redTeam ? getRank(redTeam.id) : '-'}</span>
              <span className="text-7xl font-black text-slate-900 uppercase tracking-tighter text-center leading-[1.1]">
                {redTeam?.team_name || 'Winner SF1'}
              </span>
              <span className="text-red-600 font-black text-xs uppercase tracking-[0.4em] mt-6">Red Alliance</span>
            </div>

            <div className="flex gap-6 mt-auto">
              {[1, 2].map(i => (
                <div key={`red-win-${i}`} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${i <= seriesScore.red ? 'bg-red-600 shadow-lg shadow-red-200 scale-110' : 'bg-slate-50 border border-slate-100'}`}>
                  {i <= seriesScore.red ? <div className="w-4 h-4 rounded-full bg-white/40" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-10 px-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-8">
                <span className={`text-[120px] font-black tabular-nums tracking-tighter leading-none ${seriesScore.red > seriesScore.blue ? 'text-red-600' : 'text-slate-900'}`}>{seriesScore.red}</span>
                <span className="text-4xl font-black text-slate-200 mt-4">:</span>
                <span className={`text-[120px] font-black tabular-nums tracking-tighter leading-none ${seriesScore.blue > seriesScore.red ? 'text-blue-600' : 'text-slate-900'}`}>{seriesScore.blue}</span>
              </div>
              <div className="px-6 py-1.5 bg-slate-100 rounded-full">
                <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.8em] ml-2">Series Score</span>
              </div>
            </div>
            
            <div className="w-full flex flex-col gap-3">
              {finalsMatches.map((m, idx) => {
                const isActive = m.id === nextMatchId;
                const isFinished = m.status === 'Completed';
                return (
                  <div key={m.id} className={`flex items-center justify-between gap-6 px-6 py-4 rounded-2xl border-2 transition-all duration-500 ${isActive ? 'border-blue-500 bg-blue-50/50 shadow-lg scale-105' : 'border-slate-50 bg-white opacity-80'}`}>
                     <div className="flex items-center gap-4">
                       <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>G{idx + 1}</span>
                       <div className="h-4 w-px bg-slate-100" />
                       {isFinished ? (
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       ) : m.status === 'Ongoing' ? (
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                       ) : (
                         <div className="w-2 h-2 rounded-full bg-slate-200" />
                       )}
                     </div>
                     {isFinished ? (
                       <span className="text-lg font-black tabular-nums text-slate-900">{m.red_score} <span className="text-slate-200 text-sm mx-1">-</span> {m.blue_score}</span>
                     ) : (
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-300'}`}>{isActive ? 'Starting' : 'Scheduled'}</span>
                     )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`flex-1 bg-white border-2 rounded-[48px] p-12 flex flex-col items-center justify-between transition-all duration-700 relative overflow-hidden ${championTeamId === blueTeam?.id ? 'border-amber-400 shadow-[0_40px_100px_rgba(245,158,11,0.15)] ring-1 ring-amber-200 z-10' : 'border-slate-100 shadow-2xl'}`}>
            <div className={`absolute top-0 inset-x-0 h-2 ${championTeamId === blueTeam?.id ? 'bg-amber-400' : 'bg-blue-600'}`} />
            
            <div className="flex flex-col items-center mb-8">
              <span className="text-slate-400 font-black text-3xl mb-4 opacity-50">#{blueTeam ? getRank(blueTeam.id) : '-'}</span>
              <span className="text-7xl font-black text-slate-900 uppercase tracking-tighter text-center leading-[1.1]">
                {blueTeam?.team_name || 'Winner SF2'}
              </span>
              <span className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mt-6">Blue Alliance</span>
            </div>

            <div className="flex gap-6 mt-auto">
              {[1, 2].map(i => (
                <div key={`blue-win-${i}`} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${i <= seriesScore.blue ? 'bg-blue-600 shadow-lg shadow-blue-200 scale-110' : 'bg-slate-50 border border-slate-100'}`}>
                  {i <= seriesScore.blue ? <div className="w-4 h-4 rounded-full bg-white/40" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-16 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1.5px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1px)] bg-[size:100px_100px] opacity-30" />

      <div className="flex-1 flex items-center justify-center relative">
        {isFinalsPhase ? (
          <div className="z-10 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-12">
            {renderFinalsHero()}
          </div>
        ) : (
          <div className="flex items-center gap-0 relative">
            <div className="flex flex-col gap-32 z-10">
              {renderMatchCard(sf1, 'Semi-Final 1')}
              {renderMatchCard(sf2, 'Semi-Final 2')}
            </div>

            <div className="w-32 h-[600px] relative">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 128 600" preserveAspectRatio="none">
                <path 
                  d={`M 0 ${isRedWinnerSF1 ? '115' : isBlueWinnerSF1 ? '185' : '150'} L 64 ${isRedWinnerSF1 ? '115' : isBlueWinnerSF1 ? '185' : '150'} L 64 300 L 128 300`} 
                  fill="none" 
                  stroke={winnerSF1 ? "#475569" : "#e2e8f0"} 
                  strokeWidth={winnerSF1 ? "3" : "2"}
                  className="transition-all duration-1000"
                />
                <path 
                  d={`M 0 ${isRedWinnerSF2 ? '415' : isBlueWinnerSF2 ? '485' : '450'} L 64 ${isRedWinnerSF2 ? '415' : isBlueWinnerSF2 ? '485' : '450'} L 64 300 L 128 300`} 
                  fill="none" 
                  stroke={winnerSF2 ? "#475569" : "#e2e8f0"} 
                  strokeWidth={winnerSF2 ? "3" : "2"}
                  className="transition-all duration-1000"
                />
                <circle cx="64" cy="300" r="4" fill={winnerSF1 || winnerSF2 ? "#475569" : "#cbd5e1"} className="transition-all duration-1000" />
              </svg>
            </div>

            <div className="z-10">
              {renderMatchCard(finalsMatches[0], 'Grand Finals', winnerSF1 ? 'Winner SF1' : 'TBD', winnerSF2 ? 'Winner SF2' : 'TBD')}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto h-24 flex items-center justify-between border-t border-slate-100 px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-black text-2xl uppercase tracking-widest leading-none italic">
                {isFinalsPhase ? 'GRAND FINALS' : 'SEMI FINALS'}
              </span>
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
