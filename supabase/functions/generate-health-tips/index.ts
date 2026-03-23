import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "No prompt provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in the environment");
    }

    // Call the Gemini API via REST
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert Health and Wellness API. Provide insightful health tips based on the user's prompt. 
Format your response using Markdown.
Additionally, you MUST conclude your response with a JSON block at the very end wrapped in triple backticks with 'json' identifier. 
This JSON block should contain a list of 2 suggested image search queries that relate strictly to the health tips provided.
Format for the JSON:
\`\`\`json
{
  "imageQueries": ["search query 1", "search query 2"]
}
\`\`\`

User Prompt: ${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("Gemini API request failed");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // We will extract the text and the JSON array of image queries
    let imageQueries = [];
    let cleanText = content;

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.imageQueries) {
          imageQueries = parsed.imageQueries;
        }
        // Remove the JSON block from the readable text
        cleanText = content.replace(/```json\n[\s\S]*?\n```/, "").trim();
      } catch (e) {
        console.error("Failed to parse imageQueries JSON", e);
      }
    }

    return new Response(
      JSON.stringify({ text: cleanText, imageQueries }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("generate-health-tips error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
