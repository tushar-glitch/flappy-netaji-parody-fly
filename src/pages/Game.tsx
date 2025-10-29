import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GameCanvas from "@/components/game/GameCanvas";
import GameOver from "@/components/game/GameOver";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home } from "lucide-react";

const Game = () => {
  const navigate = useNavigate();
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("highScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Check login status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const handleGameOver = async (finalScore: number) => {
    setScore(finalScore);
    setGameOver(true);

    // Update local high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("highScore", finalScore.toString());
    }

    // Save to database if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { error } = await supabase
        .from("leaderboard")
        .insert({ user_id: session.user.id, score: finalScore });

      if (error) {
        console.error("Error saving score:", error);
        toast.error("Failed to save score to leaderboard");
      } else {
        toast.success("Score saved to leaderboard! 🎉");
      }
    }
  };

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/")}
          className="shadow-card"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-3xl font-bold text-primary">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">High Score</p>
            <p className="text-3xl font-bold text-secondary">{highScore}</p>
          </div>
        </div>

        <GameCanvas onGameOver={handleGameOver} onScoreUpdate={setScore} />

        {gameOver && (
          <GameOver
            score={score}
            highScore={highScore}
            isLoggedIn={isLoggedIn}
            onRestart={handleRestart}
            onHome={() => navigate("/")}
            onSignup={() => navigate("/signup")}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
