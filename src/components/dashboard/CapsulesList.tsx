import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Unlock, Lock, Sparkles } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import CapsuleReveal from "./CapsuleReveal";

interface Capsule {
  id: string;
  title: string;
  message: string;
  unlock_date: string;
  emotional_intensity: number;
  is_opened: boolean;
  is_public: boolean;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
}

export default function CapsulesList({ userId }: { userId: string }) {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealCapsule, setRevealCapsule] = useState<Capsule | null>(null);

  const fetchCapsules = async () => {
    // Fetch capsules where the user is either the sender OR the recipient
    const { data, error } = await supabase
      .from("capsules")
      .select("*")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("unlock_date", { ascending: true });

    if (!error && data) {
      // Fetch sender and recipient names from profiles
      const userIds = [...new Set(data.flatMap(c => [c.sender_id, c.recipient_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, username")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const enriched = data.map(c => ({
        ...c,
        sender_name: profileMap.get(c.sender_id)?.name || "Unknown",
        recipient_name: profileMap.get(c.recipient_id)?.name || "You",
      }));
      setCapsules(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCapsules();

    // Set up realtime listener for instant updates
    const channel = supabase
      .channel("capsules-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "capsules" }, () => {
        fetchCapsules();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const handleOpen = async (capsule: Capsule) => {
    if (!isPast(new Date(capsule.unlock_date))) return;
    
    // Mark as opened in the database if the current user is the recipient
    if (!capsule.is_opened && capsule.recipient_id === userId) {
      await supabase.from("capsules").update({ is_opened: true }).eq("id", capsule.id);
    }
    setRevealCapsule(capsule);
  };

  const locked = capsules.filter(c => !isPast(new Date(c.unlock_date)));
  const unlocked = capsules.filter(c => isPast(new Date(c.unlock_date)));

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground font-display">Accessing the Vault...</div>;
  }

  return (
    <>
      <div className="space-y-8">
        {/* Unlocked Capsules */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Unlock className="w-5 h-5 text-primary" /> Unlocked Capsules
          </h2>
          {unlocked.length === 0 ? (
            <p className="text-muted-foreground text-sm glass rounded-xl p-6 text-center border border-white/5">
              No unlocked capsules yet. Your future messages will appear here!
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlocked.map((capsule) => (
                <motion.button
                  key={capsule.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpen(capsule)}
                  className="glass rounded-2xl p-5 text-left glow-primary transition-all hover:border-primary/50 w-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {!capsule.is_opened && capsule.recipient_id === userId && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full font-bold">NEW</span>
                    )}
                  </div>
                  <h3 className="font-display text-sm font-semibold text-white mb-1">{capsule.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    From: {capsule.sender_id === userId ? "You" : capsule.sender_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                    Unlocked {formatDistanceToNow(new Date(capsule.unlock_date))} ago
                  </p>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Locked / Upcoming Capsules */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" /> Upcoming & Locked
          </h2>
          {locked.length === 0 ? (
            <p className="text-muted-foreground text-sm glass rounded-xl p-6 text-center border border-white/5">
              No upcoming messages. Create one to send a message to the future!
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locked.map((capsule) => (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 border-l-4 border-l-primary/40 bg-card/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Lock className="w-4 h-4 text-muted-foreground animate-pulse" />
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                      capsule.sender_id === userId ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    }`}>
                      {capsule.sender_id === userId ? "Outgoing" : "Incoming"}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-semibold text-white mb-1">{capsule.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {capsule.sender_id === userId
                      ? `To: ${capsule.recipient_id === userId ? "Yourself" : capsule.recipient_name}`
                      : `From: ${capsule.sender_name}`}
                  </p>
                  
                  <div className="mt-4 bg-black/40 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <Clock className="w-3 h-3 text-primary" />
                      <p className="text-[11px] font-display text-primary font-bold">
                        Unlocks in {formatDistanceToNow(new Date(capsule.unlock_date))}
                      </p>
                    </div>
                    <p className="text-[9px] text-muted-foreground text-center uppercase tracking-widest opacity-60">
                      {format(new Date(capsule.unlock_date), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {revealCapsule && (
          <CapsuleReveal capsule={revealCapsule} onClose={() => setRevealCapsule(null)} />
        )}
      </AnimatePresence>
    </>
  );
}