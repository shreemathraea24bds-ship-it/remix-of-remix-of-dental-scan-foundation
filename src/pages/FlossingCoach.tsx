import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, CheckCircle, Star, Camera, Upload, X, AlertTriangle, Sparkles, ShieldAlert, Loader2, ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ToothZone {
  id: string;
  label: string;
  x: number;
  y: number;
  instruction: string;
  technique: string;
}

interface ProblemArea {
  location: string;
  issue: string;
  severity: "mild" | "moderate" | "severe";
  flossingTip: string;
}

interface FlossingAnalysis {
  overallCleanliness: "clean" | "moderate" | "needs_attention" | "urgent";
  plaqueScore: number;
  gumHealth: string;
  problemAreas: ProblemArea[];
  flossingPriority: string[];
  recommendations: string[];
  estimatedDaysSinceFlossing: string;
  summary: string;
}

const upperTeeth: ToothZone[] = [
  { id: "u-m3r", label: "18", x: 40, y: 55, instruction: "Right upper wisdom area", technique: "Curve floss into C-shape around tooth" },
  { id: "u-m2r", label: "17", x: 65, y: 38, instruction: "Right upper 2nd molar", technique: "Slide gently below gumline" },
  { id: "u-m1r", label: "16", x: 88, y: 28, instruction: "Right upper 1st molar", technique: "Hug each side of the tooth" },
  { id: "u-p2r", label: "15", x: 108, y: 22, instruction: "Right upper 2nd premolar", technique: "Up-and-down motion against tooth surface" },
  { id: "u-p1r", label: "14", x: 125, y: 18, instruction: "Right upper 1st premolar", technique: "Don't snap floss — ease it in" },
  { id: "u-cr", label: "13", x: 140, y: 15, instruction: "Right upper canine", technique: "C-shape wrap on both sides" },
  { id: "u-i2r", label: "12", x: 153, y: 13, instruction: "Right upper lateral incisor", technique: "Gentle sawing motion to pass contact" },
  { id: "u-i1r", label: "11", x: 168, y: 12, instruction: "Right upper central incisor", technique: "Slide to gingival sulcus gently" },
  { id: "u-i1l", label: "21", x: 183, y: 12, instruction: "Left upper central incisor", technique: "Mirror the motion from the other side" },
  { id: "u-i2l", label: "22", x: 198, y: 13, instruction: "Left upper lateral incisor", technique: "Gentle back-and-forth past contact" },
  { id: "u-cl", label: "23", x: 213, y: 15, instruction: "Left upper canine", technique: "Wrap around curved surface" },
  { id: "u-p1l", label: "24", x: 228, y: 18, instruction: "Left upper 1st premolar", technique: "Clean both mesial and distal" },
  { id: "u-p2l", label: "25", x: 245, y: 22, instruction: "Left upper 2nd premolar", technique: "Ensure floss reaches sulcus" },
  { id: "u-m1l", label: "26", x: 265, y: 28, instruction: "Left upper 1st molar", technique: "Use fresh section of floss" },
  { id: "u-m2l", label: "27", x: 288, y: 38, instruction: "Left upper 2nd molar", technique: "Angle for posterior access" },
  { id: "u-m3l", label: "28", x: 312, y: 55, instruction: "Left upper wisdom area", technique: "Reach carefully behind last tooth" },
];

const lowerTeeth: ToothZone[] = [
  { id: "l-m3r", label: "48", x: 40, y: 155, instruction: "Right lower wisdom area", technique: "Use gentle rocking motion" },
  { id: "l-m2r", label: "47", x: 65, y: 168, instruction: "Right lower 2nd molar", technique: "Clean below gumline on both sides" },
  { id: "l-m1r", label: "46", x: 88, y: 178, instruction: "Right lower 1st molar", technique: "Wrap floss into C-shape" },
  { id: "l-p2r", label: "45", x: 108, y: 183, instruction: "Right lower 2nd premolar", technique: "Slide up and down 3-4 times" },
  { id: "l-p1r", label: "44", x: 125, y: 186, instruction: "Right lower 1st premolar", technique: "Don't forget the gum pocket" },
  { id: "l-cr", label: "43", x: 140, y: 188, instruction: "Right lower canine", technique: "Curve around the pointed surface" },
  { id: "l-i2r", label: "42", x: 153, y: 190, instruction: "Right lower lateral incisor", technique: "Careful — crowded area" },
  { id: "l-i1r", label: "41", x: 168, y: 191, instruction: "Right lower central incisor", technique: "Use waxed floss if tight" },
  { id: "l-i1l", label: "31", x: 183, y: 191, instruction: "Left lower central incisor", technique: "Mirror technique from right side" },
  { id: "l-i2l", label: "32", x: 198, y: 190, instruction: "Left lower lateral incisor", technique: "Navigate crowding carefully" },
  { id: "l-cl", label: "33", x: 213, y: 188, instruction: "Left lower canine", technique: "Wrap around pointed tip" },
  { id: "l-p1l", label: "34", x: 228, y: 186, instruction: "Left lower 1st premolar", technique: "Clean interproximal space" },
  { id: "l-p2l", label: "35", x: 245, y: 183, instruction: "Left lower 2nd premolar", technique: "Use fresh floss section" },
  { id: "l-m1l", label: "36", x: 265, y: 178, instruction: "Left lower 1st molar", technique: "3-4 vertical strokes each side" },
  { id: "l-m2l", label: "37", x: 288, y: 168, instruction: "Left lower 2nd molar", technique: "Angle floss for best access" },
  { id: "l-m3l", label: "38", x: 312, y: 155, instruction: "Left lower wisdom area", technique: "Reach behind last tooth" },
];

const allZones = [...upperTeeth, ...lowerTeeth];

const cleanlinessConfig: Record<string, { label: string; color: string; bg: string }> = {
  clean: { label: "Clean", color: "text-scan-green", bg: "bg-scan-green/10" },
  moderate: { label: "Moderate Buildup", color: "text-urgency-amber", bg: "bg-urgency-amber/10" },
  needs_attention: { label: "Needs Attention", color: "text-urgency-red", bg: "bg-urgency-red/10" },
  urgent: { label: "Urgent Care Needed", color: "text-urgency-red", bg: "bg-urgency-red/10" },
};

const severityColors: Record<string, string> = {
  mild: "text-scan-green border-scan-green/20 bg-scan-green/5",
  moderate: "text-urgency-amber border-urgency-amber/20 bg-urgency-amber/5",
  severe: "text-urgency-red border-urgency-red/20 bg-urgency-red/5",
};

const FlossingCoach = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedZones, setCompletedZones] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  // Camera & Analysis state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FlossingAnalysis | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Post-flossing comparison state
  const [preAnalysis, setPreAnalysis] = useState<FlossingAnalysis | null>(null);
  const [preImage, setPreImage] = useState<string | null>(null);
  const [postAnalysis, setPostAnalysis] = useState<FlossingAnalysis | null>(null);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPostScanning, setIsPostScanning] = useState(false);
  const [showPostCamera, setShowPostCamera] = useState(false);
  const [isPostAnalyzing, setIsPostAnalyzing] = useState(false);
  const postVideoRef = useRef<HTMLVideoElement>(null);
  const postCanvasRef = useRef<HTMLCanvasElement>(null);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  const currentZone = allZones[currentIndex];
  const progress = (completedZones.size / allZones.length) * 100;

  const markComplete = useCallback(() => {
    setCompletedZones(prev => new Set([...prev, currentZone.id]));
    if (currentIndex < allZones.length - 1) {
      setCurrentIndex(i => i + 1);
      if (navigator.vibrate) navigator.vibrate(15);
    } else {
      setIsPlaying(false);
      setSessionDone(true);
      toast.success("🎉 Flossing session complete!");
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }
  }, [currentIndex, currentZone]);

  useEffect(() => {
    if (!isPlaying || sessionDone) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t >= 5) { markComplete(); return 0; }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, sessionDone, markComplete]);

  const skip = () => {
    if (currentIndex < allZones.length - 1) {
      setCurrentIndex(i => i + 1);
      setTimer(0);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setCompletedZones(new Set());
    setTimer(0);
    setIsPlaying(false);
    setSessionDone(false);
    setPreAnalysis(null);
    setPreImage(null);
    setPostAnalysis(null);
    setPostImage(null);
    setIsPostScanning(false);
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    analyzeTeeth(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      analyzeTeeth(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeTeeth = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-flossing", {
        body: { imageBase64 },
      });
      if (error) throw error;
      const result = data as FlossingAnalysis;
      setAnalysis(result);
      // Save as pre-flossing baseline
      setPreAnalysis(result);
      setPreImage(imageBase64);
      toast.success("Teeth analysis complete!");
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dismissAnalysis = () => {
    setAnalysis(null);
    setCapturedImage(null);
  };

  // Post-flossing camera functions
  const startPostCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setShowPostCamera(true);
      setTimeout(() => {
        if (postVideoRef.current) {
          postVideoRef.current.srcObject = stream;
          postVideoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error("Camera access denied.");
    }
  };

  const stopPostCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setShowPostCamera(false);
  };

  const capturePostPhoto = () => {
    if (!postVideoRef.current || !postCanvasRef.current) return;
    const video = postVideoRef.current;
    const canvas = postCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPostImage(dataUrl);
    stopPostCamera();
    analyzePostFlossing(dataUrl);
  };

  const handlePostFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPostImage(dataUrl);
      analyzePostFlossing(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzePostFlossing = async (imageBase64: string) => {
    setIsPostAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-flossing", {
        body: { imageBase64 },
      });
      if (error) throw error;
      setPostAnalysis(data as FlossingAnalysis);
      toast.success("Post-flossing analysis complete!");
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setIsPostAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl flex items-center gap-3 h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <h1 className="font-heading font-bold text-lg text-foreground">
            Flossing<span className="text-clinical-blue ml-1">Coach</span>
          </h1>
          <Badge variant="outline" className="ml-auto text-[10px]">{completedZones.size}/{allZones.length}</Badge>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8 space-y-6">
        {/* Camera Check Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-clinical-blue/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-clinical-blue" />
              </div>
              <div>
                <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                  AI Teeth Check
                </h4>
                <p className="text-[10px] text-muted-foreground">Scan your teeth before flossing for personalized guidance</p>
              </div>
            </div>

            {/* Camera/Upload buttons */}
            {!showCamera && !capturedImage && !isAnalyzing && (
              <div className="flex gap-2">
                <Button onClick={startCamera} className="flex-1 gap-2 text-[12px]">
                  <Camera className="w-4 h-4" /> Open Camera
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-[12px]" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Upload Photo
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            )}

            {/* Live Camera */}
            {showCamera && (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                  <Button size="sm" onClick={capturePhoto} className="rounded-full gap-2">
                    <Camera className="w-4 h-4" /> Capture
                  </Button>
                  <Button size="sm" variant="outline" onClick={stopCamera} className="rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 right-2">
                  <p className="text-[10px] text-card bg-foreground/60 backdrop-blur-sm px-2 py-1 rounded-full text-center">
                    Open wide & show your teeth clearly
                  </p>
                </div>
              </div>
            )}

            {/* Analyzing state */}
            {isAnalyzing && (
              <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-clinical-blue animate-spin" />
                <p className="text-[12px] text-muted-foreground">Analyzing your teeth for plaque, gum health & flossing needs…</p>
              </div>
            )}

            {/* Captured image preview (while analyzing) */}
            {capturedImage && isAnalyzing && (
              <img src={capturedImage} alt="Captured teeth" className="w-full aspect-[4/3] object-cover rounded-xl border border-border" />
            )}
          </div>

          {/* Analysis Results */}
          <AnimatePresence>
            {analysis && !isAnalyzing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4">
                  {/* Captured image */}
                  {capturedImage && (
                    <img src={capturedImage} alt="Your teeth" className="w-full aspect-[4/3] object-cover rounded-xl border border-border" />
                  )}

                  {/* Overall score */}
                  <div className={`rounded-xl border p-4 ${cleanlinessConfig[analysis.overallCleanliness]?.bg || "bg-muted/50"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-heading font-bold ${cleanlinessConfig[analysis.overallCleanliness]?.color || "text-foreground"}`}>
                        {cleanlinessConfig[analysis.overallCleanliness]?.label || analysis.overallCleanliness}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        Plaque: {analysis.plaqueScore}%
                      </Badge>
                    </div>
                    <Progress value={100 - analysis.plaqueScore} className="h-2 mb-2" />
                    <p className="text-[11px] text-muted-foreground">{analysis.summary}</p>
                  </div>

                  {/* Gum health & days since */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase mb-1">Gum Health</p>
                      <p className="text-[12px] font-semibold text-foreground capitalize">{analysis.gumHealth?.replace(/_/g, " ")}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase mb-1">Last Flossed</p>
                      <p className="text-[12px] font-semibold text-foreground">{analysis.estimatedDaysSinceFlossing}</p>
                    </div>
                  </div>

                  {/* Problem Areas */}
                  {analysis.problemAreas && analysis.problemAreas.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-urgency-amber" />
                        <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Problem Areas</p>
                      </div>
                      <div className="space-y-2">
                        {analysis.problemAreas.map((area, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`rounded-xl border p-3 ${severityColors[area.severity] || "border-border"}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-semibold">{area.location}</span>
                              <Badge variant="outline" className="text-[8px] capitalize">{area.severity}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-1">{area.issue}</p>
                            <p className="text-[10px] font-medium">💡 {area.flossingTip}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priority areas */}
                  {analysis.flossingPriority && analysis.flossingPriority.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">🎯 Flossing Priority</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.flossingPriority.map((area, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] bg-clinical-blue/5 text-clinical-blue border-clinical-blue/20">
                            {i + 1}. {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
                      <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Recommendations</p>
                      {analysis.recommendations.map((rec, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full text-[11px]" onClick={dismissAnalysis}>
                    Dismiss & Start Flossing
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Dental Map */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
          <svg viewBox="0 0 350 210" className="w-full">
            <path d="M40 55 Q175 -15 312 55" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M40 155 Q175 225 312 155" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />

            {allZones.map((z) => {
              const isCurrent = z.id === currentZone.id;
              const isDone = completedZones.has(z.id);
              return (
                <g key={z.id} onClick={() => { setCurrentIndex(allZones.indexOf(z)); setTimer(0); }} className="cursor-pointer">
                  {isCurrent && (
                    <motion.circle
                      cx={z.x} cy={z.y} r="14"
                      fill="none" stroke="hsl(var(--clinical-blue))" strokeWidth="2"
                      animate={{ r: [14, 18, 14], opacity: [0.8, 0.3, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <circle
                    cx={z.x} cy={z.y} r="10"
                    fill={isDone ? "hsl(var(--scan-green))" : isCurrent ? "hsl(var(--clinical-blue))" : "hsl(var(--muted))"}
                    stroke={isCurrent ? "hsl(var(--clinical-blue))" : "hsl(var(--border))"}
                    strokeWidth="1.5"
                  />
                  {isDone ? (
                    <text x={z.x} y={z.y + 1} textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--card))" fontSize="8" fontWeight="bold">✓</text>
                  ) : (
                    <text x={z.x} y={z.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fill={isCurrent ? "hsl(var(--card))" : "hsl(var(--muted-foreground))"} fontSize="7" fontWeight="600">
                      {z.label}
                    </text>
                  )}
                </g>
              );
            })}

            {isPlaying && !sessionDone && (
              <motion.line
                x1={currentZone.x - 12} y1={currentZone.y}
                x2={currentZone.x + 12} y2={currentZone.y}
                stroke="hsl(var(--clinical-blue))"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                animate={{ y1: [currentZone.y - 4, currentZone.y + 4, currentZone.y - 4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </svg>
        </div>

        {/* Current instruction */}
        <AnimatePresence mode="wait">
          {!sessionDone ? (
            <motion.div key={currentZone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tooth #{currentZone.label}</p>
                  <h3 className="font-heading font-bold text-foreground">{currentZone.instruction}</h3>
                </div>
                {isPlaying && (
                  <div className="w-10 h-10 rounded-full bg-clinical-blue/10 flex items-center justify-center">
                    <span className="font-heading font-bold text-clinical-blue">{5 - timer}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{currentZone.technique}</p>

              {isPlaying && (
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-clinical-blue rounded-full"
                    style={{ width: `${(timer / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="space-y-4">
              <div className="bg-scan-green/10 rounded-2xl border border-scan-green/20 p-8 text-center space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-scan-green" />
                <h3 className="font-heading font-bold text-xl text-foreground">Session Complete!</h3>
                <p className="text-sm text-muted-foreground">You flossed all {allZones.length} zones. Great job!</p>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 text-plaque fill-plaque" />
                  ))}
                </div>
              </div>

              {/* Post-Flossing Comparison Scan */}
              {preAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-clinical-blue/10 flex items-center justify-center">
                        <ArrowLeftRight className="w-4 h-4 text-clinical-blue" />
                      </div>
                      <div>
                        <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                          Post-Flossing Scan
                        </h4>
                        <p className="text-[10px] text-muted-foreground">Take another photo to see your improvement</p>
                      </div>
                    </div>

                    {/* Post camera/upload */}
                    {!showPostCamera && !postImage && !isPostAnalyzing && !postAnalysis && (
                      <div className="flex gap-2">
                        <Button onClick={startPostCamera} className="flex-1 gap-2 text-[12px]">
                          <Camera className="w-4 h-4" /> Scan After
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 text-[12px]" onClick={() => postFileInputRef.current?.click()}>
                          <Upload className="w-4 h-4" /> Upload
                        </Button>
                        <input ref={postFileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePostFileUpload} />
                      </div>
                    )}

                    {/* Post live camera */}
                    {showPostCamera && (
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <video ref={postVideoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" />
                        <canvas ref={postCanvasRef} className="hidden" />
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                          <Button size="sm" onClick={capturePostPhoto} className="rounded-full gap-2">
                            <Camera className="w-4 h-4" /> Capture
                          </Button>
                          <Button size="sm" variant="outline" onClick={stopPostCamera} className="rounded-full">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2 right-2">
                          <p className="text-[10px] text-card bg-foreground/60 backdrop-blur-sm px-2 py-1 rounded-full text-center">
                            Show your teeth after flossing
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Post analyzing */}
                    {isPostAnalyzing && (
                      <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-clinical-blue animate-spin" />
                        <p className="text-[12px] text-muted-foreground">Analyzing post-flossing results…</p>
                      </div>
                    )}
                  </div>

                  {/* Before & After Comparison */}
                  {postAnalysis && preAnalysis && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 pb-4 space-y-4"
                    >
                      {/* Side by side images */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase text-center">Before</p>
                          {preImage && (
                            <img src={preImage} alt="Before" className="w-full aspect-square object-cover rounded-xl border border-border" />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase text-center">After</p>
                          {postImage && (
                            <img src={postImage} alt="After" className="w-full aspect-square object-cover rounded-xl border border-border" />
                          )}
                        </div>
                      </div>

                      {/* Improvement metrics */}
                      {(() => {
                        const plaqueDiff = preAnalysis.plaqueScore - postAnalysis.plaqueScore;
                        const preProblems = preAnalysis.problemAreas?.length || 0;
                        const postProblems = postAnalysis.problemAreas?.length || 0;
                        const problemsDiff = preProblems - postProblems;

                        return (
                          <div className="space-y-3">
                            {/* Plaque comparison */}
                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                              <p className="text-[10px] text-muted-foreground uppercase mb-2 text-center">Plaque Score Change</p>
                              <div className="flex items-center justify-center gap-4">
                                <div className="text-center">
                                  <p className="text-lg font-heading font-bold text-urgency-amber">{preAnalysis.plaqueScore}%</p>
                                  <p className="text-[9px] text-muted-foreground">Before</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {plaqueDiff > 0 ? (
                                    <TrendingDown className="w-5 h-5 text-scan-green" />
                                  ) : plaqueDiff < 0 ? (
                                    <TrendingUp className="w-5 h-5 text-urgency-red" />
                                  ) : (
                                    <Minus className="w-5 h-5 text-muted-foreground" />
                                  )}
                                  <span className={`text-lg font-heading font-bold ${plaqueDiff > 0 ? "text-scan-green" : plaqueDiff < 0 ? "text-urgency-red" : "text-muted-foreground"}`}>
                                    {plaqueDiff > 0 ? `-${plaqueDiff}%` : plaqueDiff < 0 ? `+${Math.abs(plaqueDiff)}%` : "0%"}
                                  </span>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-heading font-bold text-scan-green">{postAnalysis.plaqueScore}%</p>
                                  <p className="text-[9px] text-muted-foreground">After</p>
                                </div>
                              </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                                <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Gum Health</p>
                                <p className="text-[11px] font-semibold text-foreground capitalize">{postAnalysis.gumHealth?.replace(/_/g, " ")}</p>
                              </div>
                              <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                                <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Issues</p>
                                <p className="text-[11px] font-semibold text-foreground">
                                  {preProblems} → {postProblems}
                                </p>
                              </div>
                              <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                                <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Status</p>
                                <p className={`text-[11px] font-semibold capitalize ${cleanlinessConfig[postAnalysis.overallCleanliness]?.color || "text-foreground"}`}>
                                  {cleanlinessConfig[postAnalysis.overallCleanliness]?.label || postAnalysis.overallCleanliness}
                                </p>
                              </div>
                            </div>

                            {/* Verdict */}
                            <div className={`rounded-xl border p-4 text-center ${plaqueDiff > 5 ? "bg-scan-green/10 border-scan-green/20" : plaqueDiff > 0 ? "bg-clinical-blue/10 border-clinical-blue/20" : "bg-urgency-amber/10 border-urgency-amber/20"}`}>
                              <p className={`text-sm font-heading font-bold ${plaqueDiff > 5 ? "text-scan-green" : plaqueDiff > 0 ? "text-clinical-blue" : "text-urgency-amber"}`}>
                                {plaqueDiff > 15 ? "🌟 Excellent improvement!" : plaqueDiff > 5 ? "✅ Good improvement!" : plaqueDiff > 0 ? "👍 Slight improvement" : "Keep flossing more thoroughly"}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">{postAnalysis.summary}</p>
                            </div>

                            {/* Remaining problem areas */}
                            {postAnalysis.problemAreas && postAnalysis.problemAreas.length > 0 && (
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Still needs attention</p>
                                {postAnalysis.problemAreas.map((area, i) => (
                                  <div key={i} className={`rounded-lg border p-2 ${severityColors[area.severity] || "border-border"}`}>
                                    <p className="text-[10px] font-semibold">{area.location}: {area.issue}</p>
                                    <p className="text-[9px] text-muted-foreground">💡 {area.flossingTip}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!sessionDone ? (
            <>
              <Button variant="outline" size="icon" className="rounded-full" onClick={reset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button size="lg" className="rounded-full px-8 gap-2" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> {completedZones.size > 0 ? "Resume" : "Start"}</>}
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={skip} disabled={!isPlaying}>
                <SkipForward className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button onClick={reset} className="rounded-full px-8 gap-2">
              <RotateCcw className="w-4 h-4" /> Start New Session
            </Button>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          🦷 Spend 5 seconds per interproximal space for optimal plaque removal. Use ~18 inches of floss per session.
        </p>
      </main>
    </div>
  );
};

export default FlossingCoach;
