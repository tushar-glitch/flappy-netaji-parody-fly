import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const Signin = () => {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let email = emailOrUsername;
      const isEmail = /@/.test(emailOrUsername);

      if (!isEmail) {
        // It's a username, so we need to get the email
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", emailOrUsername)
          .single();

        if (error || !data) {
          throw new Error("User not found");
        }

        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.user_id);

        if (userError || !userData) {
            throw new Error("User not found");
        }
        
        email = userData.user.email;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      toast.success("Welcome back! Let's get flying! 🚀");
      navigate("/game");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="text-4xl font-bold gradient-text">Welcome Back!</CardTitle>
            <CardDescription className="text-lg">
              Sign in to continue your journey on the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email</Label>
                <Input
                  id="emailOrUsername"
                  placeholder="your@email.com"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full text-lg py-6 shadow-glow"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In & Fly! 🚀"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="underline hover:text-primary">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signin;
