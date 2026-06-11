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
  const [scale, setScale] = useState(1);
  const supabase = createClient();

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1920;
      const targetHeight = 1080;
      const scaleW = window.innerWidth / targetWidth;
      const scaleH = window.innerHeight / targetHeight;
      setScale(Math.min(scaleW, scaleH));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!tournamentId) return;
    // ... (rest of data fetching logic)

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
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div 
        style={{ 
          width: '1920px', 
          height: '1080px', 
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0
        }}
        className="bg-black text-white font-sans overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <header className="h-[80px] bg-black flex items-center justify-between px-10 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-8">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              RANKINGS
            </h1>
            <div className="h-10 w-1 bg-white/20" />
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                {tournament.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all border border-white/10 group"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-black uppercase italic tracking-tighter">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-black uppercase italic tracking-tighter">Enter Fullscreen</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => router.push('/')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/10 group"
              title="Close Dashboard"
            >
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex w-full overflow-hidden">
          {/* Left Panel: Rankings (1320px) */}
          <div className="w-[1320px] h-full flex flex-col relative shrink-0">
            <div className="flex-1 overflow-hidden relative z-10">
              <RankingsTable rankings={rankings} />
            </div>
          </div>

          {/* Right Panel: Matches (600px) */}
          <div className="w-[600px] h-full flex flex-col border-l border-white/10 shrink-0">
            <MatchSchedule matches={matches} teams={teams} />
          </div>
        </div>

        {/* Footer */}
        <footer className="h-[48px] bg-zinc-900 flex items-center justify-between px-6 shrink-0">
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

        {/* Match Result Takeover Overlay */}
        {showTakeover && lastMatchResult && (
          <MatchResultTakeover 
            match={lastMatchResult} 
            teams={teams} 
            onClose={() => setShowTakeover(false)} 
          />
        )}
      </div>
    </div>
  );
}
