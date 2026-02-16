import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Bell, Users, Clock, Unlock, User } from "lucide-react";
import FriendsList from "@/components/dashboard/FriendsList";
import CapsulesList from "@/components/dashboard/CapsulesList";
import CreateCapsuleDialog from "@/components/dashboard/CreateCapsuleDialog";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import FriendSearch from "@/components/dashboard/FriendSearch";
import ProfileSection from "@/components/dashboard/ProfileSection";

type Tab = "capsules" | "friends" | "notifications" | "profile";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("capsules");
  const [createOpen, setCreateOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <Clock className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const tabs = [
    { id: "capsules" as Tab, label: "Capsules", icon: Clock },
    { id: "friends" as Tab, label: "Friends", icon: Users },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
    { id: "profile" as Tab, label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-gradient-primary">Time Machine</h1>
          <div className="flex items-center gap-3">
            <Button onClick={() => setCreateOpen(true)} size="sm" className="font-display text-xs">
              <Plus className="w-4 h-4 mr-1" /> New Capsule
            </Button>
            <Button onClick={signOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "capsules" && <CapsulesList userId={user.id} />}
          {activeTab === "friends" && (
            <div className="space-y-6">
              <FriendSearch userId={user.id} />
              <FriendsList userId={user.id} />
            </div>
          )}
          {activeTab === "notifications" && <NotificationsPanel userId={user.id} />}
          {activeTab === "profile" && <ProfileSection userId={user.id} />}
        </motion.div>
      </div>

      <CreateCapsuleDialog open={createOpen} onOpenChange={setCreateOpen} userId={user.id} />
    </div>
  );
}
