'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import RankingsTable from '@/components/RankingsTable';
import MatchSchedule from '@/components/MatchSchedule';
import MatchResultTakeover from '@/components/MatchResultTakeover';
import TournamentBracket from '@/components/TournamentBracket';
import { Maximize2, Minimize2, X } from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  status: string;
}

interface Team {
  id: number;
  team_name: string;
}

interface Ranking {
  id: string;
  team_id: number;
  wp: number;
  ap: number;
  sp: number;
  wins: number;
  losses: number;
  ties: number;
  ranking_points: number;
  total_points_scored: number;
  teams: {
    team_name: string;
  };
}

interface Match {
  id: string;
  match_number: number;
  match_type: string;
  status: 'Pending' | 'Ongoing' | 'Completed';
  red_score: number;
  blue_score: number;
  red_team_id: number;
  blue_team_id: number;
  // VEX specific fields used in takeover
  red_blocks_scored?: number;
  blue_blocks_scored?: number;
  red_long_goals_controlled?: number;
  blue_long_goals_controlled?: number;
  red_upper_goals_controlled?: number;
  blue_upper_goals_controlled?: number;
  red_lower_goals_controlled?: number;
  blue_lower_goals_controlled?: number;
  red_parked_robots?: number;
  blue_parked_robots?: number;
  autonomous_bonus?: 'Red' | 'Blue' | 'None';
  red_awp?: boolean;
  blue_awp?: boolean;
  red_disqualified?: boolean;
  blue_disqualified?: boolean;
}

export default function SpectatorPage() {
  const { id: tournamentId } = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [resultQueue, setResultQueue] = useState<Match[]>([]);
  const [currentResult, setCurrentResult] = useState<Match | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to avoid stale closures in real-time handlers
  const resultQueueRef = useRef<Match[]>([]);
  const currentResultRef = useRef<Match | null>(null);

  // Elimination phase logic
  const isEliminationPhase = useMemo(() => {
    if (matches.length === 0) return false;
    
    const hasElimMatches = matches.some(m => m.match_type === 'Semi-Final' || m.match_type === 'Final');
    const qualMatches = matches.filter(m => m.match_type === 'Qualification');
    
    // If there are no qualifications, but there are elims, it's elim phase
    if (qualMatches.length === 0) return hasElimMatches;
    
    // If all qualifications are completed and there are elim matches
    const allQualsCompleted = qualMatches.every(m => m.status === 'Completed');
    return allQualsCompleted && hasElimMatches;
  }, [matches]);

  // Sync refs with state
  useEffect(() => {
    resultQueueRef.current = resultQueue;
  }, [resultQueue]);

  useEffect(() => {
    currentResultRef.current = currentResult;
  }, [currentResult]);

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  const fetchRankings = useCallback(async () => {
    console.log('[REALTIME] Fetching latest rankings data');
    const { data, error } = await supabase
      .from('rankings')
      .select('*, teams(team_name)')
      .eq('tournament_id', tournamentId)
      .order('wp', { ascending: false })
      .order('ap', { ascending: false })
      .order('sp', { ascending: false });
    
    if (error) {
      console.error(`[ERROR] Rankings fetch failed: ${error.message}`, { tournamentId, timestamp: new Date().toISOString() });
      return;
    }
    console.log('[REALTIME] Rankings data loaded successfully');
    setRankings(data || []);
  }, [supabase, tournamentId]);

  const fetchMatches = useCallback(async () => {
    console.log('[REALTIME] Fetching latest match data');
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('match_number', { ascending: true });
    
    if (error) {
      console.error(`[ERROR] Match fetch failed: ${error.message}`, { tournamentId, timestamp: new Date().toISOString() });
      return;
    }
    console.log('[REALTIME] Match data loaded successfully');
    setMatches(data || []);
  }, [supabase, tournamentId]);

  const fetchInitialData = useCallback(async () => {
    console.log('[REALTIME] Fetching initial tournament data');
    try {
      // Fetch Tournament
      const { data: tData, error: tError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (tError) throw tError;
      setTournament(tData);

      // Fetch Teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');
      
      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      fetchRankings();
      fetchMatches();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ERROR] Initial data fetch failed: ${message}`);
    }
  }, [supabase, tournamentId, fetchRankings, fetchMatches]);

  const handleMatchChange = useCallback(async (payload: { eventType: string, table: string, new: any, old: any }) => {
    console.log(`[REALTIME_DEBUG] Event: ${payload.eventType}, Table: ${payload.table}`);
    
    // Always refetch matches to ensure local list is current
    fetchMatches();
    
    const isAlreadyInQueue = (matchId: string) => {
      // Use refs to avoid stale closures in the subscription handler
      const inQueue = resultQueueRef.current.some(m => m.id === matchId) || currentResultRef.current?.id === matchId;
      console.log(`[REALTIME_DEBUG] Match ${matchId} in queue/active: ${inQueue}`);
      return inQueue;
    };

    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      const matchId = payload.new.id;
      const isCompleted = payload.new.status === 'Completed';
      
      console.log(`[REALTIME_DEBUG] Match ${matchId} ${payload.eventType}: status ${payload.new.status}. isCompleted: ${isCompleted}`);
      
      if (isCompleted && !isAlreadyInQueue(matchId)) {
        console.log(`[RESULT_QUEUE] Fetching full record for match ${matchId}`);
        
        // Fetch full record to ensure we have all fields (scores, teams, etc)
        // especially if REPLICA IDENTITY is not FULL
        const { data: fullMatch, error: fullMatchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();
          
        if (fullMatchError) {
          console.error(`[ERROR] Failed to fetch full match data: ${fullMatchError.message}`);
          // Fallback to payload data if fetch fails
          setResultQueue(prev => [...prev, payload.new as Match]);
        } else {
          console.log(`[RESULT_QUEUE] Adding full match ${matchId} to queue`);
          setResultQueue(prev => [...prev, fullMatch as Match]);
        }
      }
    }
  }, [supabase, fetchMatches]);

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

    console.log(`[REALTIME] Initializing robust subscription for tournament ${tournamentId}`);
    fetchInitialData();

    let retryCount = 0;
    const maxRetries = 5;
    let mainChannel: any = null;
    const retryTimerRef = { current: null as NodeJS.Timeout | null };

    const setupSubscription = () => {
      // Cleanup existing channel if any
      if (mainChannel) {
        supabase.removeChannel(mainChannel);
        mainChannel = null;
      }

      // Consolidate into a single channel
      mainChannel = supabase
        .channel(`tournament_display_${tournamentId}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'rankings',
            filter: `tournament_id=eq.${tournamentId}`
          },
          (payload) => {
            console.log(`[REALTIME] Rankings change detected: ${payload.eventType}`);
            fetchRankings();
          }
        )
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'matches',
            filter: `tournament_id=eq.${tournamentId}`
          },
          (payload) => {
            const matchId = (payload.new as any)?.id || (payload.old as any)?.id;
            console.log(`[REALTIME] Match ${payload.eventType} received: match_id=${matchId}`);
            handleMatchChange(payload);
          }
        )
        .subscribe(async (status) => {
          // Use console.log instead of error for status changes to keep console clean
          console.log(`[REALTIME] Status: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            retryCount = 0; 
            if (retryTimerRef.current) {
              clearTimeout(retryTimerRef.current);
              retryTimerRef.current = null;
            }
          } 
          
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            // Only attempt recovery if the page is actually visible (not sleeping)
            if (document.visibilityState === 'visible') {
              if (retryCount < maxRetries && !retryTimerRef.current) {
                retryCount++;
                const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); 
                console.log(`[REALTIME] Reconnecting in ${delay}ms...`);
                
                retryTimerRef.current = setTimeout(() => {
                  retryTimerRef.current = null;
                  fetchInitialData();
                  setupSubscription();
                }, delay);
              }
            } else {
              // If page is hidden (lid closed), just clear everything and wait for visibilitychange
              if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
                retryTimerRef.current = null;
              }
            }
          }
        });
    };

    setupSubscription();

    // Listen for wake-up/tab return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[REALTIME] Page visible: Resyncing data and restoring connection');
        fetchInitialData();
        setupSubscription();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Fallback periodic refresh
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('[REALTIME] Heartbeat refresh');
        fetchRankings();
        fetchMatches();
      }
    }, 300000); 

    return () => {
      console.log('[REALTIME] Cleaning up subscriptions');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      if (mainChannel) {
        supabase.removeChannel(mainChannel);
      }
      clearInterval(heartbeatInterval);
    };
    }, [tournamentId, supabase, fetchInitialData, fetchRankings, fetchMatches, handleMatchChange]);

  // Effect 1: Queue Processing (Watch queue, set active result)
  useEffect(() => {
    if (resultQueue.length > 0 && !currentResult) {
      const nextResult = resultQueue[0];
      console.log(`[RESULT_SCREEN] Opening match result screen for match ${nextResult.id}`);
      setCurrentResult(nextResult);
      setResultQueue(prev => prev.slice(1));
    }
  }, [resultQueue, currentResult]);

  // Effect 2: Timer Management (Watch active result, set auto-hide)
  useEffect(() => {
    if (currentResult) {
      console.log(`[RESULT_SCREEN] Starting 10s timer for match ${currentResult.id}`);
      
      resultTimerRef.current = setTimeout(() => {
        console.log(`[RESULT_SCREEN] Timer completed for ${currentResult.id}, closing takeover`);
        setCurrentResult(null);
        resultTimerRef.current = null;
      }, 10000);

      return () => {
        if (resultTimerRef.current) {
          clearTimeout(resultTimerRef.current);
          resultTimerRef.current = null;
        }
      };
    }
  }, [currentResult]);

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
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">
              {isEliminationPhase ? 'BRACKET' : 'RANKINGS'}
            </h1>
            <div className="h-10 w-1 bg-white/20" />
            <div className="flex flex-col justify-center">
              <span className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
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
          {/* Left Panel: Rankings or Bracket (1320px) */}
          <div className="w-[1320px] h-full flex flex-col relative shrink-0">
            <div className="flex-1 overflow-hidden relative z-10">
              {isEliminationPhase ? (
                <TournamentBracket matches={matches} teams={teams} rankings={rankings} />
              ) : (
                <RankingsTable rankings={rankings} />
              )}
            </div>
          </div>

          {/* Right Panel: Matches (600px) */}
          <div className="w-[600px] h-full flex flex-col border-l border-white/10 shrink-0">
            <MatchSchedule 
              matches={matches} 
              teams={teams} 
              isEliminationPhase={isEliminationPhase} 
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="h-[48px] bg-zinc-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex-1" />
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
        {currentResult && (
          <MatchResultTakeover 
            match={currentResult} 
            teams={teams} 
            rankings={rankings}
            tournamentName={tournament.name}
            onClose={() => setCurrentResult(null)} 
          />
        )}
      </div>
    </div>
  );
}
