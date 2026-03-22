import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a dental flossing assessment AI. Analyze teeth photos focusing on:
1. Plaque buildup between teeth (interproximal areas)
2. Gum inflammation / gingivitis signs (redness, swelling, bleeding)
3. Food debris trapped between teeth
4. Tartar/calculus deposits
5. Gum recession
6. Crowding that makes flossing difficult

Respond with valid JSON:
{
  "overallCleanliness": "clean" | "moderate" | "needs_attention" | "urgent",
  "plaqueScore": 0-100 (0=no plaque, 100=heavy plaque),
  "gumHealth": "healthy" | "mild_inflammation" | "moderate_gingivitis" | "severe",
  "problemAreas": [
    {
      "location": "string (e.g. 'between upper right molars')",
      "issue": "string (e.g. 'plaque buildup', 'food debris', 'inflamed gums')",
      "severity": "mild" | "moderate" | "severe",
      "flossingTip": "specific flossing advice for this area"
    }
  ],
  "flossingPriority": ["list of tooth areas to focus on during flossing, in priority order"],
  "recommendations": ["string"],
  "estimatedDaysSinceFlossing": "string estimate based on buildup",
  "summary": "2-3 sentence assessment focused on flossing needs"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "Analyze this teeth photo for flossing needs. Focus on plaque between teeth, gum health, and areas needing attention. Provide specific flossing guidance."
              }
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content };
    } catch {
      analysis = { summary: content };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-flossing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
