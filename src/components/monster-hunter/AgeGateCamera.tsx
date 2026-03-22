import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scan, Shield, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AgeGateCameraProps {
  onResult: (isChild: boolean, greeting: string) => void;
  onSkip: () => void;
}

const AgeGateCamera = ({ onResult, onSkip }: AgeGateCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState<"intro" | "camera" | "analyzing" | "result">("intro");
  const [result, setResult] = useState<{ isChild: boolean; greeting: string; estimatedAge: string } | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  // Animate scan progress during analyzing phase
  useEffect(() => {
    if (phase !== "analyzing") { setScanProgress(0); return; }
    const interval = setInterval(() => {
      setScanProgress(p => Math.min(p + Math.random() * 8 + 2, 95));
    }, 300);
    return () => clearInterval(interval);
  }, [phase]);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 360 } },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = s;
      setStream(s);
      setPhase("camera");
    } catch {
      toast({ title: "Camera not available", description: "Skipping face scan...", variant: "destructive" });
      onSkip();
    }
  }, [onSkip]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setScanning(true);
    setPhase("analyzing");

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

    try {
      const { data, error } = await supabase.functions.invoke("detect-age", {
        body: { imageBase64 },
      });
      if (error) throw error;

      const res = {
        isChild: data.isChild ?? true,
        greeting: data.greeting ?? "Welcome!",
        estimatedAge: data.estimatedAge ?? "unknown",
      };
      setScanProgress(100);
      setResult(res);
      setTimeout(() => setPhase("result"), 500);
      stopCamera();
      setTimeout(() => onResult(res.isChild, res.greeting), 3000);
    } catch (e) {
      console.error("Age detection error:", e);
      toast({ title: "Detection failed", description: "Defaulting to Hunter mode" });
      stopCamera();
      onResult(true, "Welcome, Hunter!");
    } finally {
      setScanning(false);
    }
  }, [stopCamera, onResult]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(210 40% 10%), hsl(220 40% 5%) 70%)" }}
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Ambient scanner grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--neon-blue)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-blue)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 max-w-sm relative z-10"
          >
            {/* Pulsing shield emblem */}
            <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid hsl(var(--neon-blue) / 0.3)" }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-3 rounded-full"
                style={{ border: "1px solid hsl(var(--neon-blue) / 0.2)" }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
              <motion.span
                className="text-6xl"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🛡️
              </motion.span>
            </div>

            <div>
              <h1
                className="font-extrabold text-2xl tracking-wider neon-text-blue"
                style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-blue))" }}
              >
                DENTAL DEFENSE
              </h1>
              <p className="text-xs mt-2" style={{ color: "hsl(var(--neon-blue) / 0.5)" }}>
                Identity Scanner v2.0 — Stand before the lens
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={startCamera}
                className="w-full py-6 text-base font-bold gap-2 neon-glow-blue haptic-button"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: "linear-gradient(135deg, hsl(var(--neon-blue)), hsl(var(--crystal-cyan)))",
                  color: "white",
                }}
              >
                <Scan className="w-5 h-5" />
                ACTIVATE SCANNER
              </Button>
              <button
                onClick={onSkip}
                className="text-xs transition-colors"
                style={{ color: "hsl(var(--neon-blue) / 0.25)" }}
              >
                Skip identification →
              </button>
            </div>
          </motion.div>
        )}

        {phase === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4 w-full max-w-sm relative z-10"
          >
            <div className="relative rounded-2xl overflow-hidden neon-glow-blue">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-[4/3] object-cover scale-x-[-1]"
              />
              {/* Scanning laser line */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="absolute inset-x-0 h-[2px]"
                  style={{
                    background: "linear-gradient(90deg, transparent 5%, hsl(var(--neon-blue)) 30%, hsl(var(--crystal-cyan)) 50%, hsl(var(--neon-blue)) 70%, transparent 95%)",
                    boxShadow: "0 0 15px hsl(var(--neon-blue) / 0.6), 0 0 30px hsl(var(--neon-blue) / 0.3)",
                  }}
                  animate={{ top: ["5%", "95%", "5%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Corner brackets */}
              <div className="absolute inset-0 pointer-events-none" style={{ border: "2px solid hsl(var(--neon-blue) / 0.4)" }}>
                {["top-0 left-0", "top-0 right-0", "bottom-0 right-0", "bottom-0 left-0"].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-10 h-10`}>
                    <div className={`absolute ${i < 2 ? "top-0" : "bottom-0"} ${i % 2 === 0 ? "left-0" : "right-0"} w-full h-[2px]`} style={{ backgroundColor: "hsl(var(--neon-blue))" }} />
                    <div className={`absolute ${i < 2 ? "top-0" : "bottom-0"} ${i % 2 === 0 ? "left-0" : "right-0"} w-[2px] h-full`} style={{ backgroundColor: "hsl(var(--neon-blue))" }} />
                  </div>
                ))}
              </div>

              {/* Face target reticle */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-28 rounded-full pointer-events-none"
                style={{ border: "1px dashed hsl(var(--neon-blue) / 0.4)" }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <div className="absolute bottom-3 inset-x-0 text-center">
                <span
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm uppercase tracking-wider"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    color: "hsl(var(--neon-blue) / 0.9)",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    border: "1px solid hsl(var(--neon-blue) / 0.3)",
                  }}
                >
                  <Scan className="w-3 h-3 inline mr-1.5" />
                  FACE SCANNER ACTIVE
                </span>
              </div>
            </div>

            <Button
              onClick={captureAndAnalyze}
              disabled={scanning}
              className="w-full py-5 text-sm font-bold gap-2 neon-glow-green haptic-button"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: "linear-gradient(135deg, hsl(var(--neon-green)), hsl(var(--crystal-cyan)))",
                color: "white",
              }}
            >
              <Camera className="w-5 h-5" />
              {scanning ? "SCANNING..." : "IDENTIFY ME"}
            </Button>
          </motion.div>
        )}

        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6 max-w-xs relative z-10"
          >
            {/* Spinner */}
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "3px solid hsl(var(--neon-blue) / 0.15)" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "3px solid transparent", borderTopColor: "hsl(var(--neon-blue))", borderRightColor: "hsl(var(--crystal-cyan))" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-blue))" }}>
                  {Math.round(scanProgress)}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--neon-blue) / 0.1)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--neon-blue)), hsl(var(--crystal-cyan)))" }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>

            <div>
              <p className="text-sm font-bold neon-text-blue" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-blue))" }}>
                ANALYZING BIOMETRICS
              </p>
              <motion.p
                className="text-[11px] mt-1"
                style={{ color: "hsl(var(--neon-blue) / 0.4)" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Scanning facial structure · Estimating age · Classifying role
              </motion.p>
            </div>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-5 relative z-10"
          >
            {/* Result emblem */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative mx-auto w-24 h-24 flex items-center justify-center"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: result.isChild
                    ? "radial-gradient(circle, hsl(var(--neon-green) / 0.2), transparent)"
                    : "radial-gradient(circle, hsl(var(--neon-purple) / 0.2), transparent)",
                  boxShadow: result.isChild
                    ? "0 0 40px hsl(var(--neon-green) / 0.3)"
                    : "0 0 40px hsl(var(--neon-purple) / 0.3)",
                }}
              />
              <span className="text-5xl">{result.isChild ? "⚔️" : "🛡️"}</span>
            </motion.div>

            <div>
              <h2
                className="font-extrabold text-xl tracking-wider"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: result.isChild ? "hsl(var(--neon-gold))" : "hsl(var(--neon-purple))",
                  textShadow: result.isChild
                    ? "0 0 10px hsl(var(--neon-gold) / 0.5)"
                    : "0 0 10px hsl(var(--neon-purple) / 0.5)",
                }}
              >
                {result.isChild ? "HUNTER DETECTED" : "GUILD MASTER DETECTED"}
              </h2>
              <p className="text-sm mt-2" style={{ color: "hsl(var(--neon-blue) / 0.7)" }}>
                {result.greeting}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs" style={{ color: "hsl(var(--neon-blue) / 0.4)" }}>
              <Shield className="w-3.5 h-3.5" />
              <span>Age: {result.estimatedAge}</span>
              <span>•</span>
              <span>{result.isChild ? "Combat Role" : "Command Role"}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center justify-center gap-2"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: result.isChild ? "hsl(var(--neon-green))" : "hsl(var(--neon-purple))" }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs" style={{
                fontFamily: "'Orbitron', sans-serif",
                color: result.isChild ? "hsl(var(--neon-green) / 0.6)" : "hsl(var(--neon-purple) / 0.6)"
              }}>
                Loading {result.isChild ? "Battle Station" : "Command Center"}...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgeGateCamera;
