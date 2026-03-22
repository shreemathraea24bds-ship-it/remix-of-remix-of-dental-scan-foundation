import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, symptoms, dietaryLog } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const messages: any[] = [
      {
        role: "system",
        content: `You are an oral health and tongue diagnostics AI specialist. Analyze tongue photos, symptoms, and dietary data to:
1. Estimate oral pH levels
2. Detect tongue diseases and defects from the photo
3. Provide detailed recovery plans for detected conditions

Key pH indicators:
- Tongue coating: White/thick = acidic; pink/thin = neutral/alkaline
- Saliva: Thick/foamy = dehydrated/acidic; clear/watery = healthy
- pH < 5.5 = critical demineralization threshold
- pH 5.5-6.5 = moderately acidic
- pH 6.5-7.5 = healthy neutral
- pH > 7.5 = alkaline

Tongue conditions to detect from photo:
- Geographic tongue (erythema migrans): Irregular smooth red patches with white borders
- Oral thrush (candidiasis): White patches that can be scraped off
- Glossitis: Swollen, smooth, reddened tongue
- Black hairy tongue: Dark elongated papillae
- Oral leukoplakia: White patches that cannot be scraped
- Oral lichen planus: White lacy patches or red inflamed areas
- Tongue ulcers/canker sores: Painful open sores
- Fissured tongue: Deep grooves/cracks
- Vitamin deficiency signs: Pale, smooth, swollen tongue
- Dehydration: Dry, cracked tongue
- Anemia signs: Very pale tongue
- Iron deficiency: Smooth, sore tongue
- B12 deficiency: Beefy red swollen tongue
- Scarlet fever tongue: Strawberry-like red bumpy appearance

Respond with valid JSON:
{
  "estimatedPH": number (4.0-9.0),
  "phRange": "critical" | "acidic" | "neutral" | "alkaline",
  "confidence": 0-100,
  "tongueAnalysis": {
    "coatingLevel": "none" | "thin" | "moderate" | "heavy",
    "coatingColor": "string describing the color",
    "hydrationLevel": "dehydrated" | "low" | "adequate" | "well_hydrated",
    "papillaeCondition": "string describing papillae state",
    "overallColor": "string describing tongue color",
    "abnormalities": ["string"]
  },
  "tongueDefects": [
    {
      "name": "string (condition name e.g. Geographic Tongue, Oral Thrush)",
      "severity": "mild" | "moderate" | "severe",
      "description": "what was observed in the image",
      "possibleCauses": ["string"],
      "affectedArea": "which part of tongue is affected"
    }
  ],
  "diseases": [
    {
      "name": "string (disease/condition name)",
      "likelihood": "possible" | "probable" | "likely",
      "description": "how this was identified",
      "relatedSymptoms": ["string"]
    }
  ],
  "recovery": [
    {
      "condition": "which defect/disease this addresses",
      "type": "immediate" | "short_term" | "long_term",
      "homeRemedy": "natural/home treatment",
      "medication": "OTC or prescription suggestion",
      "dietaryChange": "food-based recovery advice",
      "lifestyle": "habit changes to help recovery",
      "whenToSeeDoctor": "when professional help is needed"
    }
  ],
  "vitaminDeficiencies": [
    {
      "vitamin": "string (e.g. B12, Iron, Folate)",
      "confidence": "low" | "medium" | "high",
      "signs": "what signs suggest this",
      "foods": ["foods rich in this vitamin"]
    }
  ],
  "riskFactors": [
    {
      "factor": "string",
      "impact": "high" | "moderate" | "low",
      "description": "string"
    }
  ],
  "demineralizationRisk": "low" | "moderate" | "high" | "critical",
  "recommendations": ["string"],
  "dietarySuggestions": ["string"],
  "summary": "2-3 sentence clinical summary including tongue findings",
  "nextCheckDays": number
}`
      },
    ];

    const userContent: any[] = [];

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    }

    let textPrompt = "Analyze the following oral health data to estimate pH levels and detect tongue conditions:\n";
    if (imageBase64) textPrompt += "- A tongue/oral photo is attached. Carefully examine it for any diseases, defects, discoloration, coating abnormalities, lesions, or other conditions. Provide detailed findings.\n";
    if (symptoms?.length) textPrompt += `- Reported symptoms: ${symptoms.join(", ")}\n`;
    if (dietaryLog?.length) textPrompt += `- Recent dietary intake: ${dietaryLog.join(", ")}\n`;
    if (!imageBase64 && !symptoms?.length && !dietaryLog?.length) {
      textPrompt = "No data provided. Return a general oral pH health guide with common tongue conditions to watch for.";
    }

    userContent.push({ type: "text", text: textPrompt });
    messages.push({ role: "user", content: userContent });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
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
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { estimatedPH: 7.0, summary: content };
    } catch {
      analysis = { estimatedPH: 7.0, summary: content };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-ph error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
