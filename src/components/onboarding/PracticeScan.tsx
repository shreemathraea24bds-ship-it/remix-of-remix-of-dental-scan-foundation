import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, AlertTriangle, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScanResult = "idle" | "scanning" | "blurry" | "success";

const PracticeScan = forwardRef<HTMLDivElement>((_, ref) => {
  const [result, setResult] = useState<ScanResult>("idle");

  const handleCapture = () => {
    setResult("scanning");
    // Simulate AI quality analysis
    setTimeout(() => {
      // 40% chance of blurry on first attempt to demonstrate the feedback loop
      const isBlurry = Math.random() < 0.4;
      setResult(isBlurry ? "blurry" : "success");
    }, 2000);
  };

  const handleRetry = () => setResult("idle");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center px-6 space-y-6"
    >
      <div className="text-center space-y-1">
        <h2 className="font-heading font-bold text-lg text-foreground">Practice Scan</h2>
        <p className="text-xs text-muted-foreground">Take a test shot — we'll check the quality, not your health</p>
      </div>

      {/* Viewfinder */}
      <div className="w-full max-w-xs aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-muted/20 relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          {result === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-clinical-blue/10 flex items-center justify-center mx-auto">
                <Camera className="w-7 h-7 text-clinical-blue" />
              </div>
              <p className="text-xs text-muted-foreground">Tap to take a practice photo</p>
            </motion.div>
          )}

          {result === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-16 h-16 rounded-full border-2 border-clinical-blue border-t-transparent mx-auto"
              />
              <p className="text-xs text-muted-foreground">Analyzing image quality…</p>
            </motion.div>
          )}

          {result === "blurry" && (
            <motion.div
              key="blurry"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-3 p-4"
            >
              <div className="w-16 h-16 rounded-full bg-urgency-red/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-urgency-red" />
              </div>
              <div>
                <p className="text-sm font-heading font-bold text-urgency-red">Blur Detected</p>
                <p className="text-[10px] text-muted-foreground mt-1">Hold your phone steadier and ensure good lighting</p>
              </div>
            </motion.div>
          )}

          {result === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-3 p-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-16 h-16 rounded-full bg-scan-green/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-8 h-8 text-scan-green" />
              </motion.div>
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-scan-green" />
                  <p className="text-sm font-heading font-bold text-scan-green">Calibration Successful</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Your camera is ready for clinical scans</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action button */}
      {result === "idle" && (
        <Button variant="clinical" className="w-full max-w-xs haptic-button gap-2" onClick={handleCapture}>
          <Camera className="w-4 h-4" />
          Take Practice Photo
        </Button>
      )}
      {result === "blurry" && (
        <Button variant="outline" className="w-full max-w-xs haptic-button gap-2" onClick={handleRetry}>
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </motion.div>
  );
});

PracticeScan.displayName = "PracticeScan";

export default PracticeScan;
