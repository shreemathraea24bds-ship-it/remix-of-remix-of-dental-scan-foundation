import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerInterfaceProps {
  onScanChange?: (scanning: boolean) => void;
}

type GuidanceTip = "position" | "dark" | "close" | "steady" | "ready";

const tipMessages: Record<GuidanceTip, string> = {
  position: "Align teeth within the guide",
  dark: "💡 Too dark — improve lighting",
  close: "📏 Move closer to subject",
  steady: "Hold steady…",
  ready: "✓ Perfect — tap to capture",
};

const ScannerInterface = ({ onScanChange }: ScannerInterfaceProps) => {
  const [stability, setStability] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [tip, setTip] = useState<GuidanceTip>("position");

  const handleToggleScan = () => {
    const next = !isScanning;
    setIsScanning(next);
    onScanChange?.(next);
    if (next && navigator.vibrate) navigator.vibrate(30);
  };

  useEffect(() => {
    if (!isScanning) { setTip("position"); return; }
    const interval = setInterval(() => {
      setStability((prev) => {
        const next = prev + Math.random() * 15 - 3;
        const clamped = Math.max(0, Math.min(100, next));
        // Update guidance based on stability
        if (clamped > 85) setTip("ready");
        else if (clamped > 60) setTip("steady");
        else if (clamped > 30) setTip("close");
        else setTip("dark");
        return clamped;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isScanning]);

  const isReady = tip === "ready" || tip === "steady";
  const borderStroke = tip === "ready" ? "hsl(var(--scan-green))" : tip === "steady" ? "hsl(var(--clinical-blue))" : "hsl(var(--urgency-red))";
  const stabilityColor = stability > 75 ? "bg-scan-green" : stability > 40 ? "bg-urgency-amber" : "bg-urgency-red";

  return (
    <div className="relative w-full aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden bg-foreground/95">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 to-foreground/95" />

      {/* Smart viewfinder overlay */}
      <svg viewBox="0 0 300 400" className="absolute inset-0 w-full h-full" fill="none">
        <defs>
          <mask id="mouth-mask">
            <rect width="300" height="400" fill="white" />
            <ellipse cx="150" cy="200" rx="90" ry="110" fill="black" />
          </mask>
        </defs>
        <rect width="300" height="400" fill="hsl(var(--foreground) / 0.5)" mask="url(#mouth-mask)" />
        {/* Animated bounding ellipse */}
        <motion.ellipse
          cx="150" cy="200" rx="90" ry="110"
          stroke={borderStroke}
          strokeWidth="2.5"
          strokeDasharray={isReady ? "0" : "6 4"}
          fill="none"
          animate={{ strokeOpacity: isReady ? [0.8, 1, 0.8] : [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Corner brackets */}
        {[
          "M75 105 L60 105 L60 120",
          "M225 105 L240 105 L240 120",
          "M75 300 L60 300 L60 285",
          "M225 300 L240 300 L240 285",
        ].map((d, i) => (
          <path key={i} d={d} stroke={borderStroke} strokeWidth="2" strokeLinecap="round" fill="none" />
        ))}
      </svg>

      {/* Scan line animation */}
      {isScanning && (
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none z-10">
          <div className="scan-line w-full h-0.5 bg-gradient-to-r from-transparent via-clinical-blue to-transparent opacity-80" />
        </div>
      )}

      {/* Real-time guidance tooltip */}
      {isScanning && (
        <motion.div
          key={tip}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 inset-x-0 flex justify-center z-20"
        >
          <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-md bg-foreground/60 ${
            tip === "ready" ? "text-scan-green" : tip === "steady" ? "text-clinical-blue" : "text-urgency-amber"
          }`}>
            {tipMessages[tip]}
          </span>
        </motion.div>
      )}

      {/* Stability meter */}
      <div className="absolute bottom-20 left-6 right-6 z-20">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-card/70 uppercase tracking-wider">Stability</span>
          <span className="text-[11px] font-mono text-card/50">{Math.round(stability)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-card/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${stabilityColor}`}
            style={{ width: `${stability}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>

      {/* Capture button */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
        <Button
          variant="clinical"
          size="lg"
          className={`rounded-full w-14 h-14 p-0 transition-all ${tip === "ready" ? "ring-2 ring-scan-green ring-offset-2 ring-offset-foreground" : ""}`}
          onClick={handleToggleScan}
        >
          {isScanning ? <Scan className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
        </Button>
      </div>

      {/* Top bar */}
      <div className="absolute top-4 inset-x-4 flex justify-between items-center z-20">
        <span className="text-[11px] font-heading font-semibold text-card/80 uppercase tracking-widest">DentaScan</span>
        {isScanning && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-medium text-scan-green bg-scan-green/15 px-2 py-0.5 rounded-full"
          >
            LIVE
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default ScannerInterface;
