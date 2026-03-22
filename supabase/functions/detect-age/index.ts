import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: `You are an age detection system for a dental app. Analyze the photo and determine if the person is a child (under ~13) or an adult/elder. Return ONLY a JSON object with these fields:
- "isChild": boolean (true if the person appears to be a child under 13)
- "confidence": number (0-100, how confident you are)
- "estimatedAge": string (e.g. "5-8", "10-12", "25-35", "40+")
- "greeting": string (a fun greeting if child, a professional greeting if adult)

If you cannot clearly see a face or determine age, default to isChild: true for safety.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this person's approximate age from the photo." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_age",
              description: "Classify the person in the image as child or adult",
              parameters: {
                type: "object",
                properties: {
                  isChild: { type: "boolean", description: "True if person appears under 13" },
                  confidence: { type: "number", description: "Confidence 0-100" },
                  estimatedAge: { type: "string", description: "Estimated age range" },
                  greeting: { type: "string", description: "Appropriate greeting" },
                },
                required: ["isChild", "confidence", "estimatedAge", "greeting"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_age" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(JSON.stringify({ isChild: true, confidence: 50, estimatedAge: "unknown", greeting: "Welcome, Hunter!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-age error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
