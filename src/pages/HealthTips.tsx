import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, HeartPulse, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function HealthTips() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [imageQueries, setImageQueries] = useState<string[]>([]);

  const generateTips = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a health topic or question!");
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setImageQueries([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-health-tips", {
        body: { prompt: prompt.trim() },
      });

      if (error) {
        throw new Error(error.message);
      }

      setResponse(data.text);
      setImageQueries(data.imageQueries || []);
      toast.success("Health tips generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate health tips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <HeartPulse className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-4xl font-bold tracking-tight text-white">AI Health Advisor</h1>
        <p className="text-muted-foreground text-lg">
          Ask any health-related question to get tips, insights, and visual references.
        </p>
      </div>

      <Card className="border-primary/20 bg-black/40 backdrop-blur">
        <CardHeader>
          <CardTitle>What's on your mind?</CardTitle>
          <CardDescription>Enter a topic, symptom, or general health inquiry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="e.g., Give me 5 tips for better sleep hygiene..." 
            className="min-h-[120px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button 
            onClick={generateTips} 
            disabled={isLoading || !prompt.trim()} 
            className="w-full sm:w-auto"
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Generating..." : "Generate Health Tips"}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card className="border-primary/20 bg-black/40 backdrop-blur mt-8 animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Your Health Tips</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {imageQueries.length > 0 && (
        <Card className="border-secondary/20 bg-secondary/5 backdrop-blur mt-8 animate-in fade-in slide-in-from-bottom-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Suggested Visual References
            </CardTitle>
            <CardDescription>Search for these concepts to enhance understanding.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {imageQueries.map((query, i) => (
              <a 
                key={i} 
                href={`https://unsplash.com/s/photos/${encodeURIComponent(query)}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-secondary/20 text-secondary-foreground hover:bg-secondary/40 transition-colors"
              >
                {query}
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
