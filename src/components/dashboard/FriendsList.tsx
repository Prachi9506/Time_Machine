import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { UserPlus, UserCheck, UserX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  friend_name: string;
  friend_username: string;
}

export default function FriendsList({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([]);
  const [pendingSent, setPendingSent] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFriendships = async () => {
    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error || !data) { setLoading(false); return; }

    const otherIds = data.map(f => f.requester_id === userId ? f.addressee_id : f.requester_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, username")
      .in("user_id", otherIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const enriched = data.map(f => {
      const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
      const profile = profileMap.get(otherId);
      return {
        ...f,
        friend_name: profile?.name || "Unknown",
        friend_username: profile?.username || "unknown",
      };
    });

    setFriends(enriched.filter(f => f.status === "accepted"));
    setPendingReceived(enriched.filter(f => f.status === "pending" && f.addressee_id === userId));
    setPendingSent(enriched.filter(f => f.status === "pending" && f.requester_id === userId));
    setLoading(false);
  };

  useEffect(() => { fetchFriendships(); }, [userId]);

  const acceptRequest = async (id: string, requesterId: string) => {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    await supabase.from("notifications").insert({
      user_id: requesterId,
      type: "friend_accepted",
      title: "Friend request accepted!",
      message: "Your friend request was accepted.",
      related_id: id,
    });
    toast({ title: "Friend added! 🤝" });
    fetchFriendships();
  };

  const rejectRequest = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    toast({ title: "Request rejected" });
    fetchFriendships();
  };

  const removeFriend = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    toast({ title: "Friend removed" });
    fetchFriendships();
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading friends...</div>;

  return (
    <div className="space-y-6">
      {/* Pending Received */}
      {pendingReceived.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> Friend Requests
          </h3>
          <div className="space-y-2">
            {pendingReceived.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground text-sm">{f.friend_name}</p>
                  <p className="text-xs text-muted-foreground">@{f.friend_username}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptRequest(f.id, f.requester_id)}>
                    <UserCheck className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => rejectRequest(f.id)}>
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Sent */}
      {pendingSent.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">Sent Requests</h3>
          <div className="space-y-2">
            {pendingSent.map((f) => (
              <div key={f.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{f.friend_name}</p>
                  <p className="text-xs text-muted-foreground">@{f.friend_username} · Pending</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends */}
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" /> Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-muted-foreground text-sm glass rounded-xl p-6 text-center">
            No friends yet. Search for users to connect!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {friends.map((f) => (
              <div key={f.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{f.friend_name}</p>
                  <p className="text-xs text-muted-foreground">@{f.friend_username}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeFriend(f.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
