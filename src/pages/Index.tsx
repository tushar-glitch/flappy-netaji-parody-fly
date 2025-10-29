import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-background"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 animate-pop">
          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold gradient-text animate-wobble">
            Flappy Netaji
          </h1>
          <p className="text-2xl md:text-4xl font-bold text-primary animate-float">
            Udta hi Phiru! ✈️
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-4 items-center">
            <Button
              size="lg"
              className="text-2xl px-12 py-8 shadow-glow bg-primary hover:bg-primary/90"
              onClick={() => navigate("/game")}
            >
              PLAY NOW
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="text-xl px-8 py-6"
              onClick={() => navigate("/leaderboard")}
            >
              🏆 Leaderboard
            </Button>

            {!isLoggedIn && (
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate("/signup")}
              >
                Sign Up to Rank
              </Button>
            )}
          </div>

          {/* Meme Text */}
          <p className="text-lg md:text-xl text-muted-foreground animate-float">
            Can you dodge the rivals? 😎
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
