import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
  username: string;
  avatar: string;
  high_score: number;
  score_date: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc("get_top_scores", { limit_count: 10 });

      if (error) throw error;

      setEntries(data || []);
    } catch (error: any) {
      toast.error("Failed to load leaderboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-destructive" />;
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Medal className="h-6 w-6 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/10 to-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-5xl font-bold gradient-text flex items-center justify-center gap-3">
              <Trophy className="h-12 w-12" />
              Leaderboard
              <Trophy className="h-12 w-12" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">Loading scores...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No scores yet. Be the first!</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/game")}
                >
                  Play Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-105 ${
                      index === 0
                        ? "bg-gradient-to-r from-destructive/20 to-transparent border-2 border-destructive"
                        : index === 1
                        ? "bg-gradient-to-r from-muted/30 to-transparent border border-muted-foreground"
                        : index === 2
                        ? "bg-gradient-to-r from-primary/20 to-transparent border border-primary"
                        : "bg-card border border-border"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getMedalIcon(index + 1) || (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="text-4xl">{entry.avatar || "🦸"}</div>

                    {/* Username */}
                    <div className="flex-1">
                      <p className="text-xl font-bold">{entry.username}</p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        {entry.high_score}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                size="lg"
                onClick={() => navigate("/game")}
                className="shadow-glow"
              >
                Play Now & Compete! 🎮
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
