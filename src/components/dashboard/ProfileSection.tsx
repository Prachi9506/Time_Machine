import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Save } from "lucide-react";
import { format } from "date-fns";

export default function ProfileSection({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<{ name: string; username: string; created_at: string } | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, username, created_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setName(data.name);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated! ✨" });
      setProfile(prev => prev ? { ...prev, name: name.trim() } : prev);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading...</div>;

  return (
    <div className="max-w-md mx-auto">
      <div className="glass rounded-2xl p-6 glow-primary">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            {profile?.created_at && (
              <p className="text-xs text-muted-foreground">
                Member since {format(new Date(profile.created_at), "PPP")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground/80">Display Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50 border-border/50"
              maxLength={100}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full font-display">
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
