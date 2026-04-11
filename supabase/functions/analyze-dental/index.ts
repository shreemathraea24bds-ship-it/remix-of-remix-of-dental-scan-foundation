// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;

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
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Clean base64 string
    const base64Data = imageBase64.includes("base64,") ? imageBase64.split("base64,")[1] : imageBase64;
    const mimeType = imageBase64.includes("base64,") ? imageBase64.split(";")[0].split(":")[1] : "image/jpeg";

    const systemInstruction = `You are DentaScan AI, an advanced dental health analysis assistant. Analyze dental photos thoroughly covering teeth arrangement, alignment, defects, cavities, plaque, and gum health. Always respond with valid JSON in this exact format:
{
  "overallHealth": "healthy" | "monitor" | "emergency",
  "confidence": 0-100,
  "findings": [
    {
      "area": "string describing the tooth/area (e.g. Upper front teeth, Lower molars, etc.)",
      "condition": "string describing what was found",
      "severity": "healthy" | "monitor" | "emergency",
      "recommendation": "string with action to take"
    }
  ],
  "summary": "A 2-3 sentence overall summary of dental health",
  "plaqueLevel": "none" | "mild" | "moderate" | "heavy",
  "gumHealth": "healthy" | "mild_inflammation" | "moderate_inflammation" | "severe_inflammation",
  "teethArrangement": {
    "alignment": "well_aligned" | "mild_crowding" | "moderate_crowding" | "severe_crowding",
    "bite": "normal" | "overbite" | "underbite" | "crossbite" | "open_bite",
    "spacing": "normal" | "gaps_present" | "overcrowded",
    "description": "2-3 sentence description of teeth arrangement, alignment pattern, and any positional issues",
    "orthodonticNeed": "none" | "minor" | "moderate" | "significant"
  },
  "defects": [
    {
      "type": "cavity" | "crack" | "chip" | "erosion" | "discoloration" | "missing_tooth" | "broken_filling" | "tartar" | "abscess" | "other",
      "location": "specific tooth or area description",
      "severity": "mild" | "moderate" | "severe",
      "description": "brief description of the defect",
      "urgency": "routine" | "soon" | "urgent"
    }
  ]
}
Be thorough and clinical. Examine:
1. TEETH ARRANGEMENT: crowding, spacing, rotation, tilting, overlapping, protrusion
2. BITE ASSESSMENT: overbite, underbite, crossbite, open bite
3. DEFECTS: cavities (dark spots, holes), cracks, chips, erosion, discoloration, missing teeth, broken fillings, tartar/calculus buildup, abscesses
4. PLAQUE & GUM: plaque accumulation areas, gum color, swelling, recession, bleeding signs

If the image is not a dental photo, say so in the summary and set overallHealth to "healthy" with empty findings, defects, and default teethArrangement.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            parts: [
              {
                text: "Analyze this dental photo comprehensively. Identify teeth arrangement and alignment, any defects (cavities, cracks, chips, erosion, discoloration, missing teeth), plaque buildup, and gum health. Provide a full clinical-grade assessment.",
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse the JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, overallHealth: "healthy", findings: [], confidence: 0, defects: [], teethArrangement: null };
    } catch {
      analysis = { summary: content, overallHealth: "healthy", findings: [], confidence: 0, defects: [], teethArrangement: null };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-dental error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
