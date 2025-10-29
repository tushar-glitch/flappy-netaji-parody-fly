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
  const [gameId, setGameId] = useState(0);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    const audioContext = new AudioContext();
    if (audioContext.state === "suspended") {
      toast.info("Click on the screen to enable audio.", {
        duration: 5000,
      });
    }

    return () => subscription.unsubscribe();
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
    setGameId(prevId => prevId + 1);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Score Display - Floating on top */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-between items-center px-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/")}
          className="shadow-card bg-background/80 backdrop-blur-sm"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-8 items-center">
          <div className="text-center bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-card">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-primary">{score}</p>
          </div>
          <div className="text-center bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-card">
            <p className="text-xs text-muted-foreground">High Score</p>
            <p className="text-2xl font-bold text-secondary">{highScore}</p>
          </div>
          {isLoggedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => supabase.auth.signOut()}
              className="shadow-card bg-background/80 backdrop-blur-sm"
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>

      <GameCanvas key={gameId} onGameOver={handleGameOver} onScoreUpdate={setScore} />

      {gameOver && (
        <GameOver
          score={score}
          highScore={highScore}
          isLoggedIn={isLoggedIn}
          onRestart={handleRestart}
          onHome={() => navigate("/")}
          onSignup={() => navigate("/signup")}
          onSignin={() => navigate("/signin")}
        />
      )}
    </div>
  );
};

export default Game;
