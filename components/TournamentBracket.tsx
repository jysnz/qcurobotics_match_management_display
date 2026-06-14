'use client';

import { useMemo } from 'react';
import { Trophy, Crown, ArrowRight } from 'lucide-react';

interface Team {
  id: number;
  team_name: string;
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
}

export default function TournamentBracket({ matches, teams }: TournamentBracketProps) {
  const getTeam = (id: number | null) => {
    if (id === null) return null;
    return teams.find(t => t.id === id);
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
    
    if (title === 'GRAND FINALS' && !match) {
        if (winnerSF1) displayRed = getTeam(winnerSF1)?.team_name || 'Winner SF1';
        if (winnerSF2) displayBlue = getTeam(winnerSF2)?.team_name || 'Winner SF2';
    }

    const redScore = (match?.status === 'Completed' || match?.status === 'Ongoing') ? match.red_score : null;
    const blueScore = (match?.status === 'Completed' || match?.status === 'Ongoing') ? match.blue_score : null;

    const isRedWinner = match?.status === 'Completed' && match.red_score > match.blue_score;
    const isBlueWinner = match?.status === 'Completed' && match.blue_score > match.red_score;
    const isNextMatch = match?.id === nextMatchId;

    return (
      <div className={`flex flex-col ${isLarge ? 'w-[500px]' : 'w-[400px]'} group relative`}>
        {/* Match Header */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className={`font-black text-xs uppercase tracking-[0.4em] ${isNextMatch ? 'text-amber-500' : 'text-zinc-500'}`}>
              {title}
            </span>
            {match?.status === 'Ongoing' ? (
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            ) : isNextMatch ? (
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Next Up</span>
            ) : null}
          </div>
          {match?.status === 'Completed' && (
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Official Result</span>
          )}
        </div>

        {/* Card Body */}
        <div className={`relative bg-zinc-950 border-2 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl ${
          isNextMatch ? 'border-amber-500 ring-4 ring-amber-500/20 z-20 scale-[1.02]' :
          isLarge ? 'border-amber-500/30' : 'border-white/5'
        } ${match?.status === 'Ongoing' ? 'ring-2 ring-green-500/20 border-green-500/30' : ''}`}>
          
          {/* Winner Glow Layer */}
          <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
            isRedWinner ? 'bg-gradient-to-r from-red-600/10 to-transparent opacity-100' : 
            isBlueWinner ? 'bg-gradient-to-r from-blue-600/10 to-transparent opacity-100' : 'opacity-0'
          }`} />

          {/* Red Side */}
          <div className={`flex items-center justify-between py-5 px-6 border-b border-white/5 transition-colors relative ${isRedWinner ? 'z-10' : ''}`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-1.5 h-8 rounded-full transition-shadow duration-500 ${
                isRedWinner ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-red-900/50'
              }`} />
              <div className="flex flex-col min-w-0">
                <span className={`text-2xl font-black uppercase tracking-tight truncate transition-colors duration-500 ${
                  isRedWinner ? 'text-white' : 
                  isBlueWinner ? 'text-zinc-600 opacity-50' : 
                  (match?.status === 'Pending' && !isNextMatch) ? 'text-zinc-600' : 'text-zinc-300'
                }`}>
                  {displayRed}
                </span>
                {isRedWinner && <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] -mt-1">Winner Advancing</span>}
              </div>
            </div>
            <div className={`text-4xl font-black tabular-nums tracking-tighter ml-4 transition-colors duration-500 ${
              isRedWinner ? 'text-red-500' : 
              isBlueWinner ? 'text-zinc-800' : 
              redScore !== null ? 'text-white' : 'text-zinc-800'
            }`}>
              {redScore ?? '--'}
            </div>
          </div>

          {/* Blue Side */}
          <div className={`flex items-center justify-between py-5 px-6 transition-colors relative ${isBlueWinner ? 'z-10' : ''}`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-1.5 h-8 rounded-full transition-shadow duration-500 ${
                isBlueWinner ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-blue-900/50'
              }`} />
              <div className="flex flex-col min-w-0">
                <span className={`text-2xl font-black uppercase tracking-tight truncate transition-colors duration-500 ${
                  isBlueWinner ? 'text-white' : 
                  isRedWinner ? 'text-zinc-600 opacity-50' : 
                  (match?.status === 'Pending' && !isNextMatch) ? 'text-zinc-600' : 'text-zinc-300'
                }`}>
                  {displayBlue}
                </span>
                {isBlueWinner && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] -mt-1">Winner Advancing</span>}
              </div>
            </div>
            <div className={`text-4xl font-black tabular-nums tracking-tighter ml-4 transition-colors duration-500 ${
              isBlueWinner ? 'text-blue-500' : 
              isRedWinner ? 'text-zinc-800' : 
              blueScore !== null ? 'text-white' : 'text-zinc-800'
            }`}>
              {blueScore ?? '--'}
            </div>
          </div>
        </div>

        {/* Connector Dots */}
        {!isLarge && (
          <div className="absolute top-1/2 -right-12 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-16 bg-[#050505] relative overflow-hidden">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="flex-1 flex items-center justify-center relative">
        
        <div className="flex items-center gap-0 relative">
          {/* Semi Finals Column */}
          <div className="flex flex-col gap-32 z-10">
            {renderMatchCard(sf1, 'SF 1: UPPER BRACKET')}
            {renderMatchCard(sf2, 'SF 2: LOWER BRACKET')}
          </div>

          {/* Connections SVG Layer */}
          <div className="w-32 h-[600px] relative">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 128 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Connector Paths - Dynamic alignment logic */}
              {/* Y coordinates: 
                  Gap SF1: 145, Red SF1: 110, Blue SF1: 180
                  Gap SF2: 455, Red SF2: 420, Blue SF2: 490
                  Finals Red Port: 250, Finals Blue Port: 350
              */}
              <path 
                d={`M 0 ${isRedWinnerSF1 ? '110' : isBlueWinnerSF1 ? '180' : '145'} L 64 ${isRedWinnerSF1 ? '110' : isBlueWinnerSF1 ? '180' : '145'} L 64 250 L 128 250`} 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="2"
                filter={winnerSF1 ? "url(#glow)" : ""}
                className="transition-all duration-1000"
                style={{ stroke: winnerSF1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)' }}
              />
              <path 
                d={`M 0 ${isRedWinnerSF2 ? '420' : isBlueWinnerSF2 ? '490' : '455'} L 64 ${isRedWinnerSF2 ? '420' : isBlueWinnerSF2 ? '490' : '455'} L 64 350 L 128 350`} 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="2"
                filter={winnerSF2 ? "url(#glow)" : ""}
                className="transition-all duration-1000"
                style={{ stroke: winnerSF2 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)' }}
              />
              
              {/* Node points at junctions */}
              <circle cx="64" cy="250" r="3" fill="rgba(255,255,255,0.2)" />
              <circle cx="64" cy="350" r="3" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>

          {/* Finals Column */}
          <div className="z-10 flex flex-col items-center relative">
            {/* Champion Display Area - Now Absolute to avoid shifting */}
            <div className={`absolute -top-48 left-1/2 -translate-x-1/2 transition-all duration-1000 flex flex-col items-center w-full ${
              championId ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'
            }`}>
               <div className="relative">
                 <Crown className="w-16 h-16 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-2" />
                 <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full" />
               </div>
               <span className="text-zinc-500 font-black text-xs uppercase tracking-[0.8em] mb-2">CHAMPION</span>
               <span className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl text-center whitespace-nowrap">
                 {getTeam(championId)?.team_name}
               </span>
            </div>

            {renderMatchCard(final, 'GRAND FINALS', winnerSF1 ? 'Winner SF1' : 'TBD', winnerSF2 ? 'Winner SF2' : 'TBD', true)}
          </div>
        </div>

      </div>

      {/* Footer Info Panel */}
      <div className="mt-auto h-20 flex items-center justify-between border-t border-white/5 px-4">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500">
              B
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm uppercase tracking-widest leading-none">SEMI FINALS</span>
          </div>
        </div>

        <div className="flex gap-12">
          <div className="flex items-center gap-3 group">
            <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-white uppercase tracking-wider leading-none">RED</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Alliance</span>
            </div>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-white uppercase tracking-wider leading-none">BLUE</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Alliance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
