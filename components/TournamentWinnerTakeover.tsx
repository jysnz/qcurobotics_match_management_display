'use client';

import { useEffect, useState } from 'react';
import { Trophy, Crown, Star, Sparkles } from 'lucide-react';

interface Team {
  id: number;
  team_name: string;
}

interface ChampionStats {
  wp: number;
  ap: number;
  sp: number;
  wins: number;
  losses: number;
  ties: number;
}

interface TournamentWinnerTakeoverProps {
  tournamentName: string;
  winnerTeam: Team;
  winnerRank: number;
  stats?: ChampionStats;
  onClose?: () => void;
}

export default function TournamentWinnerTakeover({ tournamentName, winnerTeam, winnerRank, stats, onClose }: TournamentWinnerTakeoverProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-all duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Celebration Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-amber-400/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-blue-400/5 blur-[120px] rounded-full animate-pulse delay-1000" />
        
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-amber-500 rounded-full opacity-20 animate-float"
            style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDuration: Math.random() * 10 + 10 + 's',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-7xl px-12">
        {/* Championship Header */}
        <div className={`flex flex-col items-center mb-12 transition-all duration-1000 delay-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex items-center gap-4 px-8 py-3 bg-slate-900 rounded-full shadow-2xl mb-8">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span className="text-white font-black text-lg uppercase tracking-[0.5em] italic">Tournament Complete</span>
          </div>
          <h2 className="text-slate-400 font-bold text-2xl uppercase tracking-[0.3em] mb-4 text-center">
            {tournamentName}
          </h2>
        </div>

        {/* The Reveal */}
        <div className="flex flex-col items-center text-center">
          <div className={`relative mb-12 transition-all duration-1000 delay-500 ${visible ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'}`}>
            <Crown className="w-48 h-48 text-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.6)]" />
            <div className="absolute -inset-16 bg-amber-400/10 blur-[100px] rounded-full" />
          </div>

          <div className={`flex flex-col items-center transition-all duration-1000 delay-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <span className="text-amber-600 font-black text-2xl uppercase tracking-[1.5em] mb-8 ml-8 text-center">TOURNAMENT CHAMPION</span>
            <h1 className="text-[10rem] font-black text-slate-900 uppercase tracking-tighter leading-none mb-20 drop-shadow-2xl text-center">
              {winnerTeam.team_name}
            </h1>
            
            {/* Stats Dashboard */}
            <div className="flex flex-col gap-12 items-center w-full">
              {stats && (
                <div className="grid grid-cols-4 w-full max-w-6xl bg-white border-2 border-slate-100 rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] overflow-hidden">
                  {/* Labels Row */}
                  <div className="pt-12 pb-4 px-10 text-center">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.5em] block">Win Points</span>
                  </div>
                  <div className="pt-12 pb-4 px-10 text-center border-l border-slate-50 bg-slate-50/20">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.5em] block">Auto Points</span>
                  </div>
                  <div className="pt-12 pb-4 px-10 text-center border-l border-slate-50">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.5em] block">Strength Points</span>
                  </div>
                  <div className="pt-12 pb-4 px-10 text-center border-l border-slate-50 bg-slate-50/20">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.5em] block">Tournament Record</span>
                  </div>

                  {/* Data Row */}
                  <div className="pb-12 pt-2 px-10 text-center">
                    <span className="text-6xl font-black text-slate-900 tabular-nums leading-none block tracking-tighter">
                      {stats.wp.toFixed(2)}
                    </span>
                  </div>
                  <div className="pb-12 pt-2 px-10 text-center border-l border-slate-50 bg-slate-50/20">
                    <span className="text-6xl font-black text-slate-900 tabular-nums leading-none block tracking-tighter">
                      {stats.ap.toFixed(2)}
                    </span>
                  </div>
                  <div className="pb-12 pt-2 px-10 text-center border-l border-slate-50">
                    <span className="text-6xl font-black text-slate-900 tabular-nums leading-none block tracking-tighter">
                      {stats.sp.toFixed(2)}
                    </span>
                  </div>
                  <div className="pb-12 pt-2 px-10 text-center border-l border-slate-50 bg-slate-50/20">
                    <span className="text-6xl font-black text-slate-900 tabular-nums leading-none block tracking-tighter uppercase">
                      {stats.wins}-{stats.losses}-{stats.ties}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className={`mt-24 flex items-center gap-8 transition-all duration-1000 delay-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-16 h-0.5 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-3">
             <Sparkles className="w-5 h-5 text-amber-400" />
             <span className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">Official Winners Podium</span>
             <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="w-16 h-0.5 bg-slate-200 rounded-full" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 0.2; }
          80% { opacity: 0.2; }
          100% { transform: translateY(-200px) translateX(20px); opacity: 0; }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
