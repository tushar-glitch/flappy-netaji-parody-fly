import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Home, Play, UserPlus } from "lucide-react";

interface GameOverProps {
  score: number;
  highScore: number;
  isLoggedIn: boolean;
  onRestart: () => void;
  onHome: () => void;
  onSignup: () => void;
  onSignin: () => void;
}

const GameOver = ({ score, highScore, isLoggedIn, onRestart, onHome, onSignup, onSignin }: GameOverProps) => {
  const isNewHighScore = score === highScore && score > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-pop">
      <Card className="w-full max-w-md mx-4 shadow-glow">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-4xl font-bold gradient-text">
            {isNewHighScore ? "🎉 New High Score! 🎉" : "Game Over!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">Your Score</p>
              <p className="text-6xl font-bold text-primary animate-wobble">{score}</p>
            </div>

            {!isNewHighScore && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Best Score</p>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-destructive" />
                  <p className="text-2xl font-bold text-secondary">{highScore}</p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full text-lg py-6 shadow-glow"
              onClick={onRestart}
            >
              <Play className="mr-2 h-5 w-5" />
              Play Again
            </Button>

            {!isLoggedIn && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="w-full text-lg py-6"
                  onClick={onSignup}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign Up
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-lg py-6"
                  onClick={onSignin}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={onHome}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>

          {/* Meme encouragement */}
          <p className="text-center text-sm text-muted-foreground animate-float">
            {score > 10
              ? "Kya baat hai! Keep going! 🚀"
              : score > 5
              ? "Not bad! Try again! 💪"
              : "Practice makes perfect! 😊"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOver;
