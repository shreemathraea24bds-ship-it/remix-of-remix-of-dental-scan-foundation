import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { frequencyData, dominantFrequencies, duration, rmsLevel } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a dental acoustics AI specialist. Analyze audio frequency data captured from a phone microphone during jaw activity. Your goal is to detect signs of bruxism, TMJ disorders, and other bite-related dental defects from sound patterns.

Key acoustic markers:
- Normal mastication: 20-80 Hz, rhythmic, moderate amplitude
- Bruxism grinding: 80-300 Hz sustained, high amplitude, non-rhythmic
- Bruxism clicking: Sharp transients 200-800 Hz, short duration spikes
- TMJ clicking/popping: Single sharp clicks 300-1000 Hz
- Tooth fracture/crack sounds: Very sharp high-frequency transients 1000+ Hz
- Loose tooth sounds: Irregular low-frequency rattling 50-150 Hz
- Malocclusion indicators: Asymmetric bite patterns, uneven frequency distribution
- Dental erosion signs: Dull, muffled bite sounds lacking sharp contact peaks

You must detect specific defects in the bite sound and provide detailed recovery plans.

Respond with valid JSON:
{
  "diagnosis": "normal" | "mild_bruxism" | "moderate_bruxism" | "severe_bruxism" | "tmj_click" | "malocclusion" | "tooth_damage" | "insufficient_data",
  "confidence": 0-100,
  "patterns": [
    {
      "type": "grinding" | "clenching" | "clicking" | "popping" | "cracking" | "normal_chewing" | "asymmetric_bite",
      "frequencyRange": "string (e.g. 80-200 Hz)",
      "intensity": "low" | "moderate" | "high",
      "duration": "string"
    }
  ],
  "defects": [
    {
      "name": "string (e.g. Bruxism Grinding, TMJ Dysfunction, Tooth Crack, Enamel Erosion, Malocclusion)",
      "severity": "mild" | "moderate" | "severe",
      "description": "detailed description of the defect detected from sound",
      "soundIndicator": "what specific sound pattern indicates this defect",
      "affectedArea": "which part of the jaw/teeth is likely affected"
    }
  ],
  "recovery": [
    {
      "title": "string (treatment/remedy name)",
      "type": "immediate" | "short_term" | "long_term",
      "description": "detailed recovery step",
      "homeRemedy": "a natural/home remedy for this issue (e.g. warm compress, jaw exercises)",
      "professionalTreatment": "what a dentist would recommend"
    }
  ],
  "exercises": [
    {
      "name": "string (exercise name)",
      "steps": "step-by-step instructions",
      "frequency": "how often to do it",
      "benefit": "what it helps with"
    }
  ],
  "riskFactors": ["string"],
  "recommendations": ["string"],
  "summary": "2-3 sentence clinical summary including detected defects",
  "nightGuardRecommended": boolean,
  "followUpDays": number,
  "dietaryAdvice": ["foods/drinks to avoid or consume for recovery"]
}`
          },
          {
            role: "user",
            content: `Analyze this acoustic data from a dental recording session:
- Recording duration: ${duration}s
- RMS amplitude level: ${rmsLevel}
- Dominant frequencies detected: ${JSON.stringify(dominantFrequencies)}
- Frequency spectrum snapshot (Hz bins): ${JSON.stringify(frequencyData?.slice(0, 64))}

Please detect all bite sound defects, explain what each sound pattern means, and provide comprehensive recovery plans including home remedies, jaw exercises, and professional treatment options.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { diagnosis: "insufficient_data", summary: content };
    } catch {
      analysis = { diagnosis: "insufficient_data", summary: content };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-bite-force error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
