import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const SuggestAvatar = () => {
  const navigate = useNavigate();
  const [tagline, setTagline] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagline.trim()) {
      toast.error("Please enter a tagline");
      return;
    }

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const suggestionData = {
        tagline,
        image_path: `suggestions/${image.name}`,
      };

      const json = JSON.stringify(suggestionData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "suggestion.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const imageUrl = URL.createObjectURL(image);
      const imageLink = document.createElement("a");
      imageLink.href = imageUrl;
      imageLink.download = image.name;
      document.body.appendChild(imageLink);
      imageLink.click();
      document.body.removeChild(imageLink);
      URL.revokeObjectURL(imageUrl);


      toast.success("Suggestion files downloaded! Please move the image to the public/suggestions folder and add the content of suggestion.json to a new file in the same folder.");
      navigate("/signup");
    } catch (error: any) {
      toast.error(error.message || "Failed to create suggestion files");
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
          onClick={() => navigate("/signup")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Signup
        </Button>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold gradient-text">Suggest an Avatar</CardTitle>
            <CardDescription className="text-lg">
              Have a great idea for a new avatar? Share it with us!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSuggestion} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  placeholder="A catchy tagline for your avatar"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full text-lg py-6 shadow-glow"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Suggestion 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuggestAvatar;
