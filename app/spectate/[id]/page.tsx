'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import RankingsTable from '@/components/RankingsTable';
import MatchSchedule from '@/components/MatchSchedule';
import MatchResultTakeover from '@/components/MatchResultTakeover';
import { Maximize2, Minimize2, X } from 'lucide-react';

export default function SpectatorPage() {
  const { id: tournamentId } = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [lastMatchResult, setLastMatchResult] = useState<any>(null);
  const [showTakeover, setShowTakeover] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!tournamentId) return;

    fetchInitialData();

    // Subscribe to rankings changes
    const rankingsChannel = supabase
      .channel(`rankings_${tournamentId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'rankings',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          fetchRankings();
        }
      )
      .subscribe();

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel(`matches_${tournamentId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          handleMatchChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rankingsChannel);
      supabase.removeChannel(matchesChannel);
    };
  }, [tournamentId]);

  const fetchInitialData = async () => {
    // Fetch Tournament
    const { data: tData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();
    setTournament(tData);

    // Fetch Teams
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*');
    setTeams(teamsData || []);

    fetchRankings();
    fetchMatches();
  };

  const fetchRankings = async () => {
    const { data } = await supabase
      .from('rankings')
      .select('*, teams(team_name)')
      .eq('tournament_id', tournamentId)
      .order('wp', { ascending: false })
      .order('ap', { ascending: false })
      .order('sp', { ascending: false });
    
    setRankings(data || []);
  };

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('match_number', { ascending: true });
    
    setMatches(data || []);
  };

  const handleMatchChange = (payload: any) => {
    fetchMatches();
    
    // Check if a match was just completed
    if (payload.eventType === 'UPDATE' && payload.new.status === 'Completed' && payload.old.status !== 'Completed') {
      triggerTakeover(payload.new);
    }
    
    // If a match is inserted as completed (e.g. bulk import)
    if (payload.eventType === 'INSERT' && payload.new.status === 'Completed') {
      triggerTakeover(payload.new);
    }
  };

  const triggerTakeover = (match: any) => {
    setLastMatchResult(match);
    setShowTakeover(true);
    
    // Auto-hide after 20 seconds
    setTimeout(() => {
      setShowTakeover(false);
    }, 20000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (!tournament) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans uppercase tracking-widest">Loading Spectator Display...</div>;

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-20 bg-black flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            RANKINGS
          </h1>
          <div className="h-8 w-px bg-white/20" />
          <div className="flex flex-col justify-center">
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">2026 VEX Robotics World Championship</span>
            <span className="text-xl font-black text-white uppercase italic tracking-tight">{tournament.name}</span>
          </div>
        </div>

        <div className="flex items-center h-full">
          <div className="flex items-center gap-4 mr-8">
            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center italic font-black text-xs">VEX U</div>
          </div>
          <div className="h-full bg-white text-black px-12 flex items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-8 h-full bg-black -skew-x-[20deg] -translate-x-1/2" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-tighter mb-0.5">PRESENTED BY</span>
              <div className="h-6 w-20 bg-zinc-200 flex items-center justify-center font-black italic text-sm">GOOGLE</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Left Panel: Rankings (66% width) */}
        <div className="w-[66%] h-full flex flex-col relative">
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <div className="w-[500px] h-[500px] border-[40px] border-white rounded-full flex items-center justify-center">
              <span className="text-9xl font-black italic">VEX U</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden relative z-10">
            <RankingsTable rankings={rankings} />
          </div>
        </div>

        {/* Right Panel: Matches (34% width) */}
        <div className="w-[34%] h-full flex flex-col border-l border-white/10">
          <MatchSchedule matches={matches} teams={teams} />
        </div>
      </div>

      {/* Footer */}
      <footer className="h-12 bg-zinc-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex-1 max-w-xl bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 w-[45%]" />
        </div>
        <div className="flex items-center gap-8 ml-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-zinc-700 rounded-sm" />
            <div className="w-4 h-4 bg-zinc-700 rounded-sm" />
            <div className="w-4 h-4 bg-zinc-700 rounded-sm" />
          </div>
          <div className="text-xl font-bold font-mono">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </footer>

      {/* Control Overlays (Top-right corner, subtle) */}
      <div className="absolute top-24 right-4 z-50 flex gap-2 opacity-5 hover:opacity-100 transition-opacity">
        <button 
          onClick={toggleFullscreen}
          className="p-1.5 bg-white/10 rounded hover:bg-white/20"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => router.push('/')}
          className="p-1.5 bg-white/10 rounded hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Match Result Takeover Overlay */}
      {showTakeover && lastMatchResult && (
        <MatchResultTakeover 
          match={lastMatchResult} 
          teams={teams} 
          onClose={() => setShowTakeover(false)} 
        />
      )}
    </div>
  );
}
