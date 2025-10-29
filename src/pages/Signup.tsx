import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import AvatarCard from "@/components/ui/AvatarCard";

import { AVATARS } from "@/lib/avatars";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!selectedAvatar) {
      toast.error("Please select an avatar");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            avatar: selectedAvatar,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.user.id,
            username,
            avatar: selectedAvatar,
          });

        if (profileError) throw profileError;

        toast.success("Account created! Welcome to Flappy Netaji! 🎉");
        navigate("/game");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold gradient-text">Join the Rally!</CardTitle>
            <CardDescription className="text-lg">
              Create your account to compete on the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Choose Your Avatar</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AVATARS.map((avatar) => (
                    <AvatarCard
                      key={avatar.id}
                      avatar={avatar}
                      isSelected={selectedAvatar === avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                    />
                  ))}
                </div>
                {/* <div className="text-center mt-4">
                  <Link to="/suggest-avatar" className="text-sm text-muted-foreground hover:text-primary">
                    Want to suggest an avatar? Click here!
                  </Link>
                </div> */}
              </div>

              <Button
                type="submit"
                className="w-full text-lg py-6 shadow-glow"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up & Play! 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
