import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, SunDim, Moon, Lightbulb, Hand, Droplets, Timer } from "lucide-react";

const proTips = [
  { icon: <Hand className="w-4 h-4" />, text: "Pull your cheek back with a finger for a wider view" },
  { icon: <Droplets className="w-4 h-4" />, text: "Dry your teeth with a tissue for better plaque visibility" },
  { icon: <Timer className="w-4 h-4" />, text: "Hold steady for 2 seconds before capturing" },
  { icon: <Lightbulb className="w-4 h-4" />, text: "Face a bright window or turn on your bathroom light" },
];

type LightLevel = "dark" | "dim" | "good";

const lightConfig: Record<LightLevel, { label: string; color: string; bg: string; icon: React.ReactNode; tip: string }> = {
  dark: { label: "Too Dark", color: "text-urgency-red", bg: "bg-urgency-red/10", icon: <Moon className="w-5 h-5" />, tip: "Find a bright window or turn on your bathroom light" },
  dim: { label: "Acceptable", color: "text-urgency-amber", bg: "bg-urgency-amber/10", icon: <SunDim className="w-5 h-5" />, tip: "A brighter environment will improve scan accuracy" },
  good: { label: "Perfect Lighting", color: "text-scan-green", bg: "bg-scan-green/10", icon: <Sun className="w-5 h-5" />, tip: "Great! This lighting is ideal for a clinical scan" },
};

const CalibrationScreen = forwardRef<HTMLDivElement>((_, ref) => {
  const [lightLevel, setLightLevel] = useState<LightLevel>("dim");
  const [tipIndex, setTipIndex] = useState(0);

  // Simulate lighting detection cycling
  useEffect(() => {
    const sequence: LightLevel[] = ["dark", "dim", "dim", "good", "good", "good"];
    let idx = 0;
    const interval = setInterval(() => {
      setLightLevel(sequence[idx % sequence.length]);
      idx++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Rotate pro-tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((p) => (p + 1) % proTips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const light = lightConfig[lightLevel];
  const currentTip = proTips[tipIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center px-6 space-y-6"
    >
      <div className="text-center space-y-1">
        <h2 className="font-heading font-bold text-lg text-foreground">Let's Calibrate Your Camera</h2>
        <p className="text-xs text-muted-foreground">Follow these steps for clinical-grade scans</p>
      </div>

      {/* Environment Meter */}
      <div className={`w-full max-w-xs rounded-xl border p-4 space-y-3 ${light.bg} border-border`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Environment Check</span>
          <div className={`flex items-center gap-1.5 ${light.color}`}>
            {light.icon}
            <span className="text-xs font-semibold">{light.label}</span>
          </div>
        </div>
        {/* Light bar */}
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              lightLevel === "good" ? "bg-scan-green" : lightLevel === "dim" ? "bg-urgency-amber" : "bg-urgency-red"
            }`}
            animate={{ width: lightLevel === "good" ? "100%" : lightLevel === "dim" ? "55%" : "20%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">{light.tip}</p>
      </div>

      {/* Mouth Silhouette Guide */}
      <div className="w-full max-w-xs">
        <svg viewBox="0 0 240 160" className="w-full">
          <rect x="20" y="10" width="200" height="140" rx="16" fill="hsl(var(--muted))" fillOpacity="0.2" stroke="hsl(var(--border))" strokeWidth="1" />
          {/* Upper arch */}
          <path
            d="M60 65 Q120 30 180 65"
            fill="none"
            stroke="hsl(var(--clinical-blue))"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.6"
          />
          <text x="120" y="45" textAnchor="middle" fontSize="8" fill="hsl(var(--clinical-blue))" opacity="0.7">Upper Arch</text>
          {/* Lower arch */}
          <path
            d="M60 95 Q120 130 180 95"
            fill="none"
            stroke="hsl(var(--clinical-blue))"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.6"
          />
          <text x="120" y="125" textAnchor="middle" fontSize="8" fill="hsl(var(--clinical-blue))" opacity="0.7">Lower Arch</text>
          {/* Center crosshair */}
          <circle cx="120" cy="80" r="12" fill="none" stroke="hsl(var(--scan-green))" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5">
            <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
          </circle>
          <line x1="120" y1="72" x2="120" y2="88" stroke="hsl(var(--scan-green))" strokeWidth="1" opacity="0.4" />
          <line x1="112" y1="80" x2="128" y2="80" stroke="hsl(var(--scan-green))" strokeWidth="1" opacity="0.4" />
        </svg>
      </div>

      {/* Rotating Pro-Tips */}
      <div className="w-full max-w-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-lg bg-card border border-border p-3"
          >
            <div className="w-8 h-8 rounded-full bg-clinical-blue/10 flex items-center justify-center text-clinical-blue flex-shrink-0">
              {currentTip.icon}
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Pro Tip</span>
              <p className="text-xs text-foreground leading-relaxed">{currentTip.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

CalibrationScreen.displayName = "CalibrationScreen";

export default CalibrationScreen;
