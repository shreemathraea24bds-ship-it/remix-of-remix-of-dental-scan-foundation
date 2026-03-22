import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, SwitchCamera, X, Loader2, ImagePlus,
  Mic, MicOff, Sun, AlertTriangle, CheckCircle2,
  Focus, Zap, Volume2, ShieldCheck, Eye, EyeOff, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  isAnalyzing?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Image-quality analysis (runs on canvas)                            */
/* ------------------------------------------------------------------ */

interface QualityReport {
  sharpness: number;   // 0-100
  brightness: number;  // 0-100
  resolution: "low" | "ok" | "good";
  pass: boolean;
  issues: string[];
}

function analyzeImageQuality(canvas: HTMLCanvasElement): QualityReport {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { sharpness: 0, brightness: 0, resolution: "low", pass: false, issues: ["No canvas context"] };

  const w = canvas.width;
  const h = canvas.height;
  const { data } = ctx.getImageData(0, 0, w, h);

  // --- Brightness (average luma) ---
  let lumaSum = 0;
  const pixelCount = w * h;
  for (let i = 0; i < data.length; i += 4) {
    lumaSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const avgLuma = lumaSum / pixelCount;          // 0-255
  const brightness = Math.min(100, (avgLuma / 180) * 100);

  // --- Sharpness (Laplacian variance on down-sampled grayscale) ---
  const sw = Math.min(w, 320);
  const sh = Math.round((sw / w) * h);
  const offscreen = document.createElement("canvas");
  offscreen.width = sw;
  offscreen.height = sh;
  const octx = offscreen.getContext("2d")!;
  octx.drawImage(canvas, 0, 0, sw, sh);
  const small = octx.getImageData(0, 0, sw, sh).data;

  const gray = new Float32Array(sw * sh);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * small[i * 4] + 0.587 * small[i * 4 + 1] + 0.114 * small[i * 4 + 2];
  }

  let lapSum = 0;
  let lapCount = 0;
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const idx = y * sw + x;
      const lap = gray[idx - sw] + gray[idx + sw] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx];
      lapSum += lap * lap;
      lapCount++;
    }
  }
  const lapVar = lapSum / lapCount;
  // Normalize — values > 800 are very sharp
  const sharpness = Math.min(100, (lapVar / 600) * 100);

  // --- Resolution ---
  const resolution = w >= 1280 ? "good" : w >= 640 ? "ok" : "low";

  // --- Issues ---
  const issues: string[] = [];
  if (sharpness < 35) issues.push("Image is blurry — hold steady");
  if (brightness < 30) issues.push("Too dark — improve lighting");
  if (brightness > 90) issues.push("Overexposed — reduce brightness");
  if (resolution === "low") issues.push("Low resolution — move closer");

  return { sharpness, brightness, resolution, pass: issues.length === 0, issues };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CameraCapture = ({ onCapture, isAnalyzing }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityReport | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Live focus score from video feed
  const [liveFocus, setLiveFocus] = useState(0);
  const [liveBrightness, setLiveBrightness] = useState(50);
  const liveAnalysisRef = useRef<number | null>(null);

  /* ---- Live video analysis (runs every 500ms while camera is open) ---- */
  useEffect(() => {
    if (!isCameraOpen || capturedImage) {
      if (liveAnalysisRef.current) cancelAnimationFrame(liveAnalysisRef.current);
      return;
    }
    const tmpCanvas = document.createElement("canvas");
    let running = true;
    let lastTime = 0;

    const tick = (time: number) => {
      if (!running) return;
      if (time - lastTime > 500 && videoRef.current && videoRef.current.readyState >= 2) {
        lastTime = time;
        const v = videoRef.current;
        tmpCanvas.width = 160;
        tmpCanvas.height = Math.round((160 / v.videoWidth) * v.videoHeight) || 120;
        const ctx = tmpCanvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, 0, 0, tmpCanvas.width, tmpCanvas.height);
          const d = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height).data;
          // Quick luma
          let lSum = 0;
          for (let i = 0; i < d.length; i += 16) lSum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const br = Math.min(100, (lSum / (d.length / 16) / 180) * 100);
          setLiveBrightness(br);

          // Quick Laplacian on center strip
          const gray = new Float32Array(tmpCanvas.width * tmpCanvas.height);
          for (let i = 0; i < gray.length; i++) gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
          let lap = 0, cnt = 0;
          const w = tmpCanvas.width, h = tmpCanvas.height;
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const idx = y * w + x;
              const v2 = gray[idx - w] + gray[idx + w] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx];
              lap += v2 * v2;
              cnt++;
            }
          }
          setLiveFocus(Math.min(100, ((lap / cnt) / 600) * 100));
        }
      }
      liveAnalysisRef.current = requestAnimationFrame(tick);
    };
    liveAnalysisRef.current = requestAnimationFrame(tick);
    return () => { running = false; if (liveAnalysisRef.current) cancelAnimationFrame(liveAnalysisRef.current); };
  }, [isCameraOpen, capturedImage]);

  /* ---- Voice trigger ---- */
  useEffect(() => {
    if (!voiceEnabled || !isCameraOpen || capturedImage) {
      recognitionRef.current?.stop();
      setVoiceListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice capture not supported in this browser"); return; }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript.toLowerCase().trim();
      setLastTranscript(transcript.slice(-20));
      if (last.isFinal && (transcript.includes("scan") || transcript.includes("capture") || transcript.includes("cheese"))) {
        takePhoto();
        toast.success("🎤 Voice capture!");
      }
    };
    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => {
      setVoiceListening(false);
      if (voiceEnabled && isCameraOpen && !capturedImage) {
        try { recognition.start(); } catch {}
      }
    };
    recognition.onerror = () => {};

    try { recognition.start(); } catch {}
    return () => { try { recognition.stop(); } catch {} };
  }, [voiceEnabled, isCameraOpen, capturedImage]);

  /* ---- Camera helpers ---- */
  const startCamera = useCallback(async (facing: "user" | "environment" = facingMode) => {
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = newStream;
      setStream(newStream);
      setIsCameraOpen(true);
      setCapturedImage(null);
      setQuality(null);
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  }, [stream, facingMode]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraOpen(false);
    setCapturedImage(null);
    setQuality(null);
  }, [stream]);

  const switchCamera = useCallback(() => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    // Run quality analysis
    const report = analyzeImageQuality(canvas);
    setQuality(report);
    setCapturedImage(dataUrl);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    if (navigator.vibrate) navigator.vibrate(report.pass ? [50] : [30, 50, 30]);
  }, [stream]);

  const analyzePhoto = useCallback(() => {
    if (capturedImage) onCapture(capturedImage);
  }, [capturedImage, onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setQuality(null);
    startCamera();
  }, [startCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Analyze uploaded image quality
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const report = analyzeImageQuality(c);
        setQuality(report);
        setCapturedImage(result);
        setIsCameraOpen(true);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleCameraRequest = useCallback(() => {
    const alreadyGranted = localStorage.getItem("dentascan-camera-consent");
    if (alreadyGranted) {
      startCamera();
    } else {
      setShowPermissionModal(true);
    }
  }, [startCamera]);

  const handlePermissionAccept = useCallback(() => {
    localStorage.setItem("dentascan-camera-consent", "true");
    setShowPermissionModal(false);
    startCamera();
  }, [startCamera]);

  /* ---- Idle state (no camera) ---- */
  if (!isCameraOpen) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 py-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Camera className="w-9 h-9 text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">Capture a dental photo</p>
            <p className="text-xs text-muted-foreground">Use your camera or upload an existing image</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <Button variant="clinical" size="lg" className="gap-2 w-full haptic-button" onClick={handleCameraRequest}>
              <Camera className="w-5 h-5" />
              Open Camera
            </Button>
            <Button variant="outline" size="lg" className="gap-2 w-full" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="w-5 h-5" />
              Upload Photo
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </motion.div>

        {/* Camera Permission Modal */}
        <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader className="items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <DialogTitle className="font-heading text-lg">Camera Access Required</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                DentaScan AI needs your camera to analyze dental health — not to identify you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                <Eye className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">What we see</p>
                  <p className="text-[11px] text-muted-foreground">Teeth, gums, and oral surfaces — to detect plaque, cavities, and lesions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                <EyeOff className="w-4 h-4 text-scan-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">What we don't see</p>
                  <p className="text-[11px] text-muted-foreground">Your face, identity, or surroundings. We never use facial recognition.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                <Trash2 className="w-4 h-4 text-urgency-amber mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Your data, your control</p>
                  <p className="text-[11px] text-muted-foreground">Photos are encrypted and never shared. You can delete them anytime.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button variant="clinical" className="w-full haptic-button gap-2" onClick={handlePermissionAccept}>
                <Camera className="w-4 h-4" />
                Allow Camera Access
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => setShowPermissionModal(false)}>
                Not now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  /* ---- Live quality indicators ---- */
  const focusLevel = liveFocus > 60 ? "good" : liveFocus > 30 ? "fair" : "poor";
  const brightnessLevel = liveBrightness > 65 ? "good" : liveBrightness > 30 ? "fair" : "poor";
  const isReady = focusLevel === "good" && brightnessLevel !== "poor";

  const indicatorColor = (level: string) =>
    level === "good" ? "bg-scan-green" : level === "fair" ? "bg-monitor-amber" : "bg-urgency-red";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden bg-foreground/95 shadow-elevated"
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Video / Preview */}
      <AnimatePresence mode="wait">
        {capturedImage ? (
          <motion.img key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={capturedImage} alt="Captured dental photo" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <motion.video key="video" ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        )}
      </AnimatePresence>

      {/* Viewfinder overlay */}
      {!capturedImage && (
        <svg viewBox="0 0 300 400" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <mask id="cam-mask">
              <rect width="300" height="400" fill="white" />
              <ellipse cx="150" cy="190" rx="95" ry="115" fill="black" />
            </mask>
          </defs>
          <rect width="300" height="400" fill="hsl(var(--foreground) / 0.5)" mask="url(#cam-mask)" />
          <motion.ellipse
            cx="150" cy="190" rx="95" ry="115" fill="none" strokeWidth="2"
            strokeDasharray={isReady ? "0" : "8 5"}
            stroke={isReady ? "hsl(var(--scan-green))" : "hsl(var(--urgency-red) / 0.7)"}
            animate={{ strokeOpacity: isReady ? [0.8, 1, 0.8] : [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Corner brackets */}
          {["M70 90 L55 90 L55 105", "M230 90 L245 90 L245 105", "M70 295 L55 295 L55 280", "M230 295 L245 295 L245 280"].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={isReady ? "hsl(var(--scan-green))" : "hsl(var(--urgency-red) / 0.5)"} strokeWidth="2" strokeLinecap="round" />
          ))}
        </svg>
      )}

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-foreground/60 to-transparent pt-3 pb-8 px-4">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-heading font-semibold text-primary-foreground/80 uppercase tracking-widest">
            {capturedImage ? "Preview" : "Capture"}
          </span>
          <div className="flex items-center gap-2">
            {/* Voice indicator */}
            {voiceEnabled && !capturedImage && (
              <motion.div
                animate={{ scale: voiceListening ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1 bg-foreground/40 backdrop-blur-sm rounded-full px-2 py-1"
              >
                <Volume2 className="w-3 h-3 text-scan-green" />
                <span className="text-[9px] text-primary-foreground/70 font-mono max-w-[60px] truncate">
                  {lastTranscript || "listening…"}
                </span>
              </motion.div>
            )}
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground h-8 w-8" onClick={stopCamera}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live quality meters (during capture) */}
      {!capturedImage && (
        <div className="absolute top-14 left-3 z-20 space-y-2">
          <div className="flex items-center gap-2 bg-foreground/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
            <Focus className="w-3.5 h-3.5 text-primary-foreground/70" />
            <div className="w-14 h-1.5 rounded-full bg-primary-foreground/10 overflow-hidden">
              <motion.div className={`h-full rounded-full ${indicatorColor(focusLevel)}`} animate={{ width: `${liveFocus}%` }} transition={{ duration: 0.3 }} />
            </div>
            <span className="text-[9px] text-primary-foreground/50 font-mono w-7">{Math.round(liveFocus)}%</span>
          </div>
          <div className="flex items-center gap-2 bg-foreground/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
            <Sun className="w-3.5 h-3.5 text-primary-foreground/70" />
            <div className="w-14 h-1.5 rounded-full bg-primary-foreground/10 overflow-hidden">
              <motion.div className={`h-full rounded-full ${indicatorColor(brightnessLevel)}`} animate={{ width: `${liveBrightness}%` }} transition={{ duration: 0.3 }} />
            </div>
            <span className="text-[9px] text-primary-foreground/50 font-mono w-7">{Math.round(liveBrightness)}%</span>
          </div>
        </div>
      )}

      {/* Quality report overlay (after capture) */}
      {capturedImage && quality && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-14 inset-x-3 z-20"
        >
          <div className={`rounded-xl backdrop-blur-md p-3 space-y-2 ${quality.pass ? "bg-scan-green/20 border border-scan-green/30" : "bg-urgency-red/20 border border-urgency-red/30"}`}>
            <div className="flex items-center gap-2">
              {quality.pass ? (
                <CheckCircle2 className="w-4 h-4 text-scan-green" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-urgency-red" />
              )}
              <span className="text-xs font-semibold text-primary-foreground">
                {quality.pass ? "Image Quality: Excellent" : "Quality Issues Detected"}
              </span>
            </div>
            {!quality.pass && (
              <ul className="space-y-1">
                {quality.issues.map((issue, i) => (
                  <li key={i} className="text-[10px] text-primary-foreground/70 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-urgency-amber" />
                    {issue}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-3">
              <div className="text-center">
                <span className="text-[9px] text-primary-foreground/50 uppercase tracking-wider">Sharp</span>
                <p className="text-xs font-mono text-primary-foreground">{Math.round(quality.sharpness)}%</p>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-primary-foreground/50 uppercase tracking-wider">Light</span>
                <p className="text-xs font-mono text-primary-foreground">{Math.round(quality.brightness)}%</p>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-primary-foreground/50 uppercase tracking-wider">Res</span>
                <p className="text-xs font-mono text-primary-foreground uppercase">{quality.resolution}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Guidance tooltip */}
      {!capturedImage && (
        <div className="absolute bottom-24 inset-x-0 flex justify-center z-20">
          <motion.span
            key={isReady ? "ready" : "wait"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-md ${isReady ? "bg-scan-green/30 text-scan-green" : "bg-foreground/50 text-primary-foreground/70"}`}
          >
            {isReady ? "✓ Ready — tap to capture" : "Align teeth within the guide"}
          </motion.span>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-foreground/70 to-transparent pt-8 pb-4 px-4">
        <div className="flex justify-center items-center gap-4">
          {capturedImage ? (
            <>
              <Button
                variant="outline"
                className="rounded-full border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                onClick={retake}
              >
                Retake
              </Button>
              <Button
                variant="clinical"
                size="lg"
                className="rounded-full gap-2 haptic-button"
                onClick={analyzePhoto}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="text-primary-foreground/60 hover:text-primary-foreground h-10 w-10" onClick={switchCamera}>
                <SwitchCamera className="w-5 h-5" />
              </Button>
              <button
                onClick={takePhoto}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all haptic-button ${isReady ? "ring-[3px] ring-scan-green ring-offset-2 ring-offset-foreground" : ""}`}
              >
                <div className="absolute inset-0 rounded-full bg-primary-foreground/20 backdrop-blur-sm" />
                <div className="relative w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center">
                  <Camera className="w-6 h-6 text-foreground" />
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 ${voiceEnabled ? "text-scan-green" : "text-primary-foreground/60 hover:text-primary-foreground"}`}
                onClick={() => {
                  setVoiceEnabled((v) => !v);
                  toast.info(voiceEnabled ? "Voice trigger off" : '🎤 Say "Scan", "Capture", or "Cheese"');
                }}
              >
                {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CameraCapture;
