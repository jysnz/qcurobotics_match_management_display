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
      .order('ranking_points', { ascending: false })
      .order('total_points_scored', { ascending: false });
    
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

  if (!tournament) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Spectator Display...</div>;

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden flex flex-col">
      {/* Header Overlay (Hidden in full performance, but available for exit) */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-20 hover:opacity-100 transition-opacity">
        <button 
          onClick={toggleFullscreen}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20"
          title={isFullscreen ? "Minimize" : "Full Screen"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => router.push('/')}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20"
          title="Exit Spectator Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex w-full">
        {/* Left Panel: Rankings (72% width) */}
        <div className="w-[72%] border-r border-white/10 h-full flex flex-col">
          <div className="p-4 bg-[#D97706]/10 border-b border-amber-500/20 flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-amber-500">
              Live Rankings <span className="text-zinc-500 ml-2 font-normal text-lg">— {tournament.name}</span>
            </h1>
          </div>
          <div className="flex-1 overflow-hidden">
            <RankingsTable rankings={rankings} />
          </div>
        </div>

        {/* Right Panel: Matches (28% width) */}
        <div className="w-[28%] h-full flex flex-col bg-[#0F172A]">
          <MatchSchedule matches={matches} teams={teams} />
        </div>
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
