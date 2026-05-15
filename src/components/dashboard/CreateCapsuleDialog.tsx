import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Clock } from "lucide-react";

interface Friend {
  user_id: string;
  name: string;
  username: string;
}

export default function CreateCapsuleDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDateTime, setUnlockDateTime] = useState("");
  const [intensity, setIntensity] = useState([5]);
  const [recipientType, setRecipientType] = useState<"self" | "friend">("self");
  const [selectedFriend, setSelectedFriend] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const fetchFriends = async () => {
      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (!friendships?.length) return;

      const friendIds = friendships.map(f =>
        f.requester_id === userId ? f.addressee_id : f.requester_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, username")
        .in("user_id", friendIds);

      setFriends(profiles || []);
    };
    fetchFriends();
  }, [open, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim() || !unlockDateTime) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    const unlockDateObj = new Date(unlockDateTime);
    if (unlockDateObj <= new Date()) {
      toast({ title: "Invalid time", description: "The unlock time must be in the future.", variant: "destructive" });
      return;
    }

    const recipientId = recipientType === "self" ? userId : selectedFriend;
    if (!recipientId) {
      toast({ title: "Select recipient", description: "Please select a friend.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("capsules").insert({
        sender_id: userId,
        recipient_id: recipientId,
        title: title.trim(),
        message: message.trim(),
        unlock_date: unlockDateObj.toISOString(),
        emotional_intensity: intensity[0],
        is_public: isPublic,
      });

      if (error) throw error;

      if (recipientType === "friend" && recipientId !== userId) {
        await supabase.from("notifications").insert({
          user_id: recipientId,
          type: "capsule_received",
          title: "New Time Capsule!",
          message: `Someone sent you a capsule: "${title.trim()}"`,
        });
      }

      toast({ title: "Capsule sealed! 🔒", description: "Your message is locked in time." });
      onOpenChange(false);
      setTitle("");
      setMessage("");
      setUnlockDateTime("");
      setIntensity([5]);
      setRecipientType("self");
      setSelectedFriend("");
      setIsPublic(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Generate local datetime string for 'min' attribute: YYYY-MM-DDTHH:mm
  const now = new Date();
  const minDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gradient-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Create Time Capsule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground/80">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Open this on your graduation day..."
              className="bg-muted/50 border-border/50"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your future message..."
              className="bg-muted/50 border-border/50 min-h-[120px]"
              maxLength={5000}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Unlock Date & Time
            </Label>
            <Input
              type="datetime-local"
              value={unlockDateTime}
              onChange={(e) => setUnlockDateTime(e.target.value)}
              min={minDateTime}
              className="bg-muted/50 border-border/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">Recipient</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={recipientType === "self" ? "default" : "outline"}
                size="sm"
                onClick={() => setRecipientType("self")}
                className="font-display text-xs"
              >
                Myself
              </Button>
              <Button
                type="button"
                variant={recipientType === "friend" ? "default" : "outline"}
                size="sm"
                onClick={() => setRecipientType("friend")}
                className="font-display text-xs"
                disabled={friends.length === 0}
              >
                A Friend
              </Button>
            </div>
            {recipientType === "friend" && (
              <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select a friend" />
                </SelectTrigger>
                <SelectContent>
                  {friends.map((f) => (
                    <SelectItem key={f.user_id} value={f.user_id}>
                      {f.name} (@{f.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">
              Emotional Intensity: <span className="text-primary font-display">{intensity[0]}/10</span>
            </Label>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
          </div>

          <Button type="submit" className="w-full font-display" disabled={loading}>
            {loading ? "Sealing..." : "Seal Capsule 🔒"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
