import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPanel({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
  };

  const typeIcon: Record<string, string> = {
    friend_request: "👋",
    friend_accepted: "🤝",
    capsule_received: "💌",
    capsule_unlocked: "🔓",
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notifications
        </h3>
        {notifications.some(n => !n.is_read) && (
          <Button size="sm" variant="ghost" onClick={markAllRead} className="text-xs">
            <Check className="w-3 h-3 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-muted-foreground text-sm glass rounded-xl p-6 text-center">
          No notifications yet.
        </p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                !n.is_read ? "border-primary/30 glow-primary" : "opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{typeIcon[n.type] || "📬"}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow mt-1" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
