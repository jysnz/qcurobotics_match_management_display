'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Trophy, Play, Clock, CheckCircle, Info, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Tournament {
  id: string;
  name: string;
  tournament_date: string;
  status: 'Ongoing' | 'Completed';
  created_at: string;
}

export default function LandingPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    fetchTournaments();

    // Set up real-time subscription
    const channel = supabase
      .channel('tournaments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          fetchTournaments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const fetchTournaments = async () => {
    console.log('Fetching tournaments starting...');
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching tournaments:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log('Tournaments fetched successfully:', data?.length || 0, 'items found');
        if (data && data.length > 0) {
          console.log('First tournament:', data[0].name);
        }
        setTournaments(data || []);
      }
    } catch (err) {
      console.error('Unexpected error in fetchTournaments:', err);
    } finally {
      setLoading(false);
      console.log('Fetching tournaments finished.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ongoing':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-zinc-400" />;
    }
  };

  const activeTournaments = tournaments.filter(t => t.status === 'Ongoing');
  const mostRecentTournament = tournaments.length > 0 ? tournaments[0] : null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-amber-500/30">
      <main className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Hero Section */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            <span>Robotics Tournament Spectator</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Experience the Action <br /> In Real Time.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Select a live tournament below to enter full-screen spectator mode. 
            View real-time rankings, match results, and schedules optimized for big screens.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {mostRecentTournament && mostRecentTournament.status === 'Ongoing' ? (
              <Link
                href={`/spectate/${mostRecentTournament.id}`}
                className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
              >
                <Play className="w-6 h-6 fill-current" />
                Spectate Tournament
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-3 bg-zinc-800 text-zinc-500 px-8 py-4 rounded-full text-xl font-bold cursor-not-allowed opacity-50"
              >
                <Play className="w-6 h-6 fill-current" />
                Spectate Tournament
              </button>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95 border border-white/10"
            >
              <LogOut className="w-6 h-6" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tournament List */}
        <div className="w-full mt-12 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 text-left">
            <h2 className="text-2xl font-bold">Recent & Active Tournaments</h2>
            <span className="text-sm text-zinc-500">{tournaments.length} Tournaments Found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
              <Trophy className="w-16 h-16 text-zinc-700 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-zinc-300">No tournaments are currently available for spectating.</h3>
              <p className="text-zinc-500 max-w-md">When a tournament is created in the system, it will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/spectate/${tournament.id}`}
                  className="group relative flex flex-col items-start p-6 bg-white/5 hover:bg-white/[0.08] rounded-2xl border border-white/10 transition-all hover:border-amber-500/50 hover:shadow-xl"
                >
                  <div className="flex justify-between items-center w-full mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-medium text-zinc-300 border border-white/5">
                      {getStatusIcon(tournament.status)}
                      {tournament.status}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(tournament.tournament_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-amber-500 transition-colors mb-2">
                    {tournament.name}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm text-zinc-500">
                    <span>Click to launch spectator display</span>
                    <Play className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-white/5 text-center text-zinc-600 text-sm">
        <p>© 2026 QCU Robotics Match Management System</p>
      </footer>
    </div>
  );
}
