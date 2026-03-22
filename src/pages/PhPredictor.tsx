import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Droplets, Apple, AlertTriangle, ChevronRight, Thermometer, Upload, ShieldAlert, Heart, Home, Stethoscope, Pill, Zap, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TongueComparison from "@/components/TongueComparison";
import TongueReminder from "@/components/TongueReminder";

const symptomOptions = [
  "Dry mouth", "Acid reflux / GERD", "Burning tongue", "Bad breath",
  "Metallic taste", "Tooth sensitivity", "Frequent cavities", "Mouth sores",
];

const dietOptions = [
  "Coffee", "Citrus fruits", "Soda / energy drinks", "Wine / alcohol",
  "Dairy / cheese", "Leafy greens", "Nuts / seeds", "Sugary snacks",
  "Water (plenty)", "Processed foods", "Fermented foods", "Red meat",
];

interface TongueDefect {
  name: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  possibleCauses: string[];
  affectedArea: string;
}

interface Disease {
  name: string;
  likelihood: "possible" | "probable" | "likely";
  description: string;
  relatedSymptoms: string[];
}

interface RecoveryItem {
  condition: string;
  type: "immediate" | "short_term" | "long_term";
  homeRemedy: string;
  medication: string;
  dietaryChange: string;
  lifestyle: string;
  whenToSeeDoctor: string;
}

interface VitaminDeficiency {
  vitamin: string;
  confidence: "low" | "medium" | "high";
  signs: string;
  foods: string[];
}

interface PHAnalysis {
  estimatedPH: number;
  phRange: string;
  confidence: number;
  tongueAnalysis?: {
    coatingLevel: string;
    coatingColor: string;
    hydrationLevel: string;
    papillaeCondition?: string;
    overallColor?: string;
    abnormalities: string[];
  };
  tongueDefects?: TongueDefect[];
  diseases?: Disease[];
  recovery?: RecoveryItem[];
  vitaminDeficiencies?: VitaminDeficiency[];
  riskFactors?: { factor: string; impact: string; description: string }[];
  demineralizationRisk: string;
  recommendations: string[];
  dietarySuggestions: string[];
  summary: string;
  nextCheckDays: number;
}

const phRangeConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical (Demineralization)", color: "text-urgency-red", bg: "bg-urgency-red/10" },
  acidic: { label: "Acidic", color: "text-urgency-amber", bg: "bg-urgency-amber/10" },
  neutral: { label: "Healthy Neutral", color: "text-scan-green", bg: "bg-scan-green/10" },
  alkaline: { label: "Alkaline", color: "text-clinical-blue", bg: "bg-clinical-blue/10" },
};

const severityColors: Record<string, string> = {
  mild: "text-clinical-blue border-clinical-blue/30 bg-clinical-blue/10",
  moderate: "text-urgency-amber border-urgency-amber/30 bg-urgency-amber/10",
  severe: "text-urgency-red border-urgency-red/30 bg-urgency-red/10",
};

const likelihoodColors: Record<string, string> = {
  possible: "text-clinical-blue bg-clinical-blue/10",
  probable: "text-urgency-amber bg-urgency-amber/10",
  likely: "text-urgency-red bg-urgency-red/10",
};

const recoveryTypeConfig: Record<string, { label: string; color: string }> = {
  immediate: { label: "Do Now", color: "text-urgency-red bg-urgency-red/10" },
  short_term: { label: "This Week", color: "text-urgency-amber bg-urgency-amber/10" },
  long_term: { label: "Ongoing", color: "text-clinical-blue bg-clinical-blue/10" },
};

const vitaminConfColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-urgency-amber",
  high: "text-urgency-red",
};

const PhPredictor = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<PHAnalysis | null>(null);
  const [step, setStep] = useState<"capture" | "symptoms" | "diet" | "results">("capture");
  const [refreshKey, setRefreshKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
      setStep("symptoms");
    };
    reader.readAsDataURL(file);
  };

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const analyze = async () => {
    setIsAnalyzing(true);
    setStep("results");
    try {
      const { data, error } = await supabase.functions.invoke("analyze-ph", {
        body: {
          imageBase64: imageBase64 || undefined,
          symptoms: selectedSymptoms.length ? selectedSymptoms : undefined,
          dietaryLog: selectedDiet.length ? selectedDiet : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as PHAnalysis);
      setSaved(false);
      toast.success("Tongue analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
      setStep("capture");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveResult = useCallback(async () => {
    if (!result || saved) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save results");
      return;
    }
    setIsSaving(true);
    try {
      let imageUrl: string | null = null;
      // Upload image if available
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("tongue-photos").upload(path, imageFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("tongue-photos").getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("tongue_analyses").insert({
        user_id: user.id,
        image_url: imageUrl,
        estimated_ph: result.estimatedPH,
        ph_range: result.phRange,
        confidence: result.confidence,
        tongue_defects: result.tongueDefects || [],
        diseases: result.diseases || [],
        vitamin_deficiencies: result.vitaminDeficiencies || [],
        recovery: result.recovery || [],
        tongue_analysis: result.tongueAnalysis || {},
        summary: result.summary,
        symptoms: selectedSymptoms,
        dietary_log: selectedDiet,
      } as any);

      if (error) throw error;
      setSaved(true);
      setRefreshKey(k => k + 1);
      toast.success("Result saved to your history!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [result, saved, imageFile, selectedSymptoms, selectedDiet]);

  const phConf = result ? (phRangeConfig[result.phRange] || phRangeConfig.neutral) : null;
  const phPercent = result ? Math.max(0, Math.min(100, ((result.estimatedPH - 4) / 5) * 100)) : 50;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl flex items-center gap-3 h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <h1 className="font-heading font-bold text-lg text-foreground">
            Tongue<span className="text-clinical-blue ml-1">Analysis</span>
          </h1>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8 space-y-8">
        {/* Step indicators */}
        <div className="flex items-center gap-2 justify-center">
          {["capture", "symptoms", "diet", "results"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === s ? "bg-clinical-blue text-primary-foreground" :
                ["capture", "symptoms", "diet", "results"].indexOf(step) > i ? "bg-scan-green/20 text-scan-green" : "bg-muted text-muted-foreground"
              }`}>{i + 1}</div>
              {i < 3 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Capture */}
          {step === "capture" && (
            <motion.section key="capture" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-6">
              <div className="text-center space-y-2">
                <Droplets className="w-10 h-10 mx-auto text-clinical-blue" />
                <h2 className="font-heading font-bold text-lg text-foreground">Tongue Photo</h2>
                <p className="text-sm text-muted-foreground">Take a clear photo of your tongue for AI analysis of coating, color, diseases, and defects.</p>
              </div>

              {imageBase64 ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imageBase64} alt="Tongue" className="w-full max-h-60 object-cover" />
                  <Button variant="secondary" size="sm" className="absolute bottom-3 right-3" onClick={() => { setImageBase64(null); }}>
                    Retake
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => fileRef.current?.click()} className="gap-2">
                    <Camera className="w-4 h-4" /> Capture Photo
                  </Button>
                  <Button variant="outline" onClick={() => setStep("symptoms")}>
                    Skip Photo
                  </Button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />

              {imageBase64 && (
                <Button onClick={() => setStep("symptoms")} className="w-full">
                  Next: Symptoms <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </motion.section>
          )}

          {/* Step 2: Symptoms */}
          {step === "symptoms" && (
            <motion.section key="symptoms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-6">
              <div className="text-center space-y-2">
                <Thermometer className="w-10 h-10 mx-auto text-urgency-amber" />
                <h2 className="font-heading font-bold text-lg text-foreground">Current Symptoms</h2>
                <p className="text-sm text-muted-foreground">Select any symptoms you're experiencing.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map(s => (
                  <button key={s} onClick={() => toggleItem(selectedSymptoms, setSelectedSymptoms, s)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                      selectedSymptoms.includes(s) ? "bg-clinical-blue/10 border-clinical-blue text-clinical-blue" : "bg-muted border-border text-muted-foreground hover:border-foreground/20"
                    }`}>{s}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("capture")}>Back</Button>
                <Button onClick={() => setStep("diet")} className="flex-1">
                  Next: Diet <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.section>
          )}

          {/* Step 3: Diet */}
          {step === "diet" && (
            <motion.section key="diet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-6">
              <div className="text-center space-y-2">
                <Apple className="w-10 h-10 mx-auto text-scan-green" />
                <h2 className="font-heading font-bold text-lg text-foreground">Recent Dietary Intake</h2>
                <p className="text-sm text-muted-foreground">What have you consumed in the last 24 hours?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {dietOptions.map(d => (
                  <button key={d} onClick={() => toggleItem(selectedDiet, setSelectedDiet, d)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                      selectedDiet.includes(d) ? "bg-scan-green/10 border-scan-green text-scan-green" : "bg-muted border-border text-muted-foreground hover:border-foreground/20"
                    }`}>{d}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("symptoms")}>Back</Button>
                <Button onClick={analyze} className="flex-1 gap-2">
                  <Droplets className="w-4 h-4" /> Analyze Tongue
                </Button>
              </div>
            </motion.section>
          )}

          {/* Step 4: Results */}
          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {isAnalyzing ? (
                <div className="bg-card rounded-2xl border border-border p-8 shadow-card space-y-4 text-center">
                  <Progress value={60} className="h-2" />
                  <p className="text-sm text-muted-foreground animate-pulse">Analyzing tongue photo with AI…</p>
                </div>
              ) : result && phConf ? (
                <>
                  {/* pH Gauge */}
                  <div className={`rounded-2xl border border-border p-6 ${phConf.bg}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`font-heading font-bold text-xl ${phConf.color}`}>{phConf.label}</h2>
                      <Badge variant="outline" className="font-mono">{result.confidence}%</Badge>
                    </div>
                    <div className="text-center mb-4">
                      <p className="font-heading font-bold text-5xl text-foreground">{result.estimatedPH.toFixed(1)}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Estimated oral pH</p>
                    </div>
                    <div className="relative h-4 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, hsl(0 84% 60%), hsl(38 92% 50%), hsl(145 63% 49%), hsl(216 100% 50%))" }}>
                      <div className="absolute top-0 bottom-0 w-3 bg-foreground rounded-full border-2 border-card shadow-lg" style={{ left: `calc(${phPercent}% - 6px)` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground">4.0 (Acidic)</span>
                      <span className="text-[9px] text-urgency-red font-bold">5.5 ← Critical</span>
                      <span className="text-[9px] text-muted-foreground">9.0 (Alkaline)</span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-4">{result.summary}</p>
                  </div>

                  {/* Tongue analysis */}
                  {result.tongueAnalysis && (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-3">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-clinical-blue" />
                        <h3 className="font-heading font-semibold text-foreground">Tongue Visual Analysis</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-xl p-3">
                          <p className="text-[10px] text-muted-foreground uppercase">Coating</p>
                          <p className="text-sm font-medium text-foreground capitalize">{result.tongueAnalysis.coatingLevel}</p>
                          <p className="text-[11px] text-muted-foreground">{result.tongueAnalysis.coatingColor}</p>
                        </div>
                        <div className="bg-muted rounded-xl p-3">
                          <p className="text-[10px] text-muted-foreground uppercase">Hydration</p>
                          <p className="text-sm font-medium text-foreground capitalize">{result.tongueAnalysis.hydrationLevel?.replace(/_/g, " ")}</p>
                        </div>
                        {result.tongueAnalysis.overallColor && (
                          <div className="bg-muted rounded-xl p-3">
                            <p className="text-[10px] text-muted-foreground uppercase">Overall Color</p>
                            <p className="text-sm font-medium text-foreground capitalize">{result.tongueAnalysis.overallColor}</p>
                          </div>
                        )}
                        {result.tongueAnalysis.papillaeCondition && (
                          <div className="bg-muted rounded-xl p-3">
                            <p className="text-[10px] text-muted-foreground uppercase">Papillae</p>
                            <p className="text-sm font-medium text-foreground capitalize">{result.tongueAnalysis.papillaeCondition}</p>
                          </div>
                        )}
                      </div>
                      {result.tongueAnalysis.abnormalities?.length > 0 && (
                        <div className="mt-2 pt-3 border-t border-border">
                          <p className="text-[11px] text-urgency-amber font-medium mb-1">Abnormalities Noted</p>
                          {result.tongueAnalysis.abnormalities.map((a, i) => (
                            <p key={i} className="text-[12px] text-muted-foreground">• {a}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tongue Defects */}
                  {result.tongueDefects && result.tongueDefects.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-urgency-red" />
                        <h3 className="font-heading font-semibold text-foreground">Tongue Defects Detected</h3>
                        <Badge variant="destructive" className="ml-auto text-[10px]">{result.tongueDefects.length} found</Badge>
                      </div>
                      {result.tongueDefects.map((defect, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`rounded-xl border p-4 space-y-2 ${severityColors[defect.severity] || "border-border"}`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground">{defect.name}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{defect.severity}</span>
                          </div>
                          <p className="text-[12px] text-foreground/80">{defect.description}</p>
                          <p className="text-[11px] text-muted-foreground">📍 <strong>Area:</strong> {defect.affectedArea}</p>
                          {defect.possibleCauses?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {defect.possibleCauses.map((cause, j) => (
                                <span key={j} className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cause}</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Diseases */}
                  {result.diseases && result.diseases.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-urgency-amber" />
                        <h3 className="font-heading font-semibold text-foreground">Possible Conditions</h3>
                      </div>
                      {result.diseases.map((disease, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-xl bg-muted/40 border border-border p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-[13px] font-semibold text-foreground">{disease.name}</h4>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${likelihoodColors[disease.likelihood] || ""}`}>
                              {disease.likelihood}
                            </span>
                          </div>
                          <p className="text-[12px] text-foreground/80">{disease.description}</p>
                          {disease.relatedSymptoms?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {disease.relatedSymptoms.map((sym, j) => (
                                <Badge key={j} variant="outline" className="text-[9px]">{sym}</Badge>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Vitamin Deficiencies */}
                  {result.vitaminDeficiencies && result.vitaminDeficiencies.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-3">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-urgency-amber" />
                        <h3 className="font-heading font-semibold text-foreground">Vitamin Deficiency Signs</h3>
                      </div>
                      {result.vitaminDeficiencies.map((vd, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-xl bg-urgency-amber/5 border border-urgency-amber/15 p-4 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-[13px] font-semibold text-foreground">{vd.vitamin} Deficiency</h4>
                            <span className={`text-[10px] font-bold ${vitaminConfColors[vd.confidence]}`}>{vd.confidence} confidence</span>
                          </div>
                          <p className="text-[12px] text-foreground/80">{vd.signs}</p>
                          {vd.foods?.length > 0 && (
                            <div className="pt-1">
                              <p className="text-[10px] text-muted-foreground font-medium mb-1">🍽️ Eat more:</p>
                              <div className="flex flex-wrap gap-1">
                                {vd.foods.map((food, j) => (
                                  <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-scan-green/10 text-scan-green">{food}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Recovery Plan */}
                  {result.recovery && result.recovery.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-scan-green" />
                        <h3 className="font-heading font-semibold text-foreground">Recovery Plan</h3>
                      </div>
                      {result.recovery.map((r, i) => {
                        const typeConf = recoveryTypeConfig[r.type] || recoveryTypeConfig.short_term;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="rounded-xl bg-muted/40 border border-border p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-[13px] font-semibold text-foreground">For: {r.condition}</h4>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeConf.color}`}>
                                {typeConf.label}
                              </span>
                            </div>
                            <div className="grid gap-2">
                              <div className="flex items-start gap-2 text-[11px]">
                                <Home className="w-3 h-3 text-scan-green shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-foreground">Home Remedy: </span>
                                  <span className="text-muted-foreground">{r.homeRemedy}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-[11px]">
                                <Pill className="w-3 h-3 text-clinical-blue shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-foreground">Medication: </span>
                                  <span className="text-muted-foreground">{r.medication}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-[11px]">
                                <Apple className="w-3 h-3 text-scan-green shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-foreground">Dietary: </span>
                                  <span className="text-muted-foreground">{r.dietaryChange}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-[11px]">
                                <Zap className="w-3 h-3 text-urgency-amber shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-foreground">Lifestyle: </span>
                                  <span className="text-muted-foreground">{r.lifestyle}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-[11px]">
                                <Stethoscope className="w-3 h-3 text-urgency-red shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-foreground">See Doctor: </span>
                                  <span className="text-muted-foreground">{r.whenToSeeDoctor}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Risk factors */}
                  {result.riskFactors && result.riskFactors.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                      <h3 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-urgency-amber" /> Risk Factors
                      </h3>
                      {result.riskFactors.map((r, i) => (
                        <div key={i} className="py-2 border-b border-border last:border-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{r.factor}</p>
                            <Badge variant={r.impact === "high" ? "destructive" : "secondary"} className="text-[10px]">{r.impact}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{r.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations & Dietary */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {result.recommendations?.length > 0 && (
                      <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Health Tips</h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((r, i) => (
                            <li key={i} className="text-[12px] text-muted-foreground flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 mt-0.5 text-clinical-blue shrink-0" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.dietarySuggestions?.length > 0 && (
                      <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Dietary Adjustments</h4>
                        <ul className="space-y-2">
                          {result.dietarySuggestions.map((d, i) => (
                            <li key={i} className="text-[12px] text-muted-foreground flex items-start gap-2">
                              <Apple className="w-3 h-3 mt-0.5 text-scan-green shrink-0" /> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Save & New buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant={saved ? "secondary" : "default"}
                      className="flex-1 gap-2 text-[12px]"
                      onClick={saveResult}
                      disabled={isSaving || saved}
                    >
                      <Save className="w-4 h-4" />
                      {saved ? "Saved ✓" : isSaving ? "Saving…" : "Save to History"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setResult(null); setStep("capture"); setImageBase64(null); setImageFile(null); setSelectedSymptoms([]); setSelectedDiet([]); setSaved(false); }}>
                      New Assessment
                    </Button>
                  </div>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly Reminder */}
        <TongueReminder />

        {/* Tongue History & Comparison */}
        <TongueComparison key={refreshKey} />

        <p className="text-[10px] text-muted-foreground text-center">
          ⚕️ AI tongue analysis is approximate. Consult a dental/medical professional for accurate diagnosis.
        </p>
      </main>
    </div>
  );
};

export default PhPredictor;
