import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  user_id: string;
  name: string;
  username: string;
}

export default function FriendSearch({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setSearching(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, name, username")
      .ilike("username", `%${query.trim()}%`)
      .neq("user_id", userId)
      .limit(10);

    setResults(data || []);
    setSearching(false);
  };

  const sendRequest = async (toUserId: string) => {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${toUserId}),and(requester_id.eq.${toUserId},addressee_id.eq.${userId})`)
        .maybeSingle();

      if (existing) {
        toast({ title: "Already connected", description: "A friendship or request already exists." });
        return;
      }

      const { error } = await supabase.from("friendships").insert({
        requester_id: userId,
        addressee_id: toUserId,
      });

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: toUserId,
        type: "friend_request",
        title: "New Friend Request",
        message: "Someone wants to be your friend!",
      });

      toast({ title: "Request sent! 🚀" });
      setResults(results.filter(r => r.user_id !== toUserId));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-primary" /> Find Users
      </h3>
      <div className="flex gap-2 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="bg-muted/50 border-border/50"
          maxLength={50}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={searching} size="sm">
          <Search className="w-4 h-4" />
        </Button>
      </div>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.user_id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">@{r.username}</p>
              </div>
              <Button size="sm" onClick={() => sendRequest(r.user_id)}>
                <UserPlus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
