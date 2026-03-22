import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ScanLine, FileText, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const stages = [
  { icon: ScanLine, label: "Capturing scan data…", duration: 1500 },
  { icon: Brain, label: "Synthesizing clinical data…", duration: 2500 },
  { icon: FileText, label: "Generating findings…", duration: 1500 },
  { icon: ShieldCheck, label: "Preparing triage report…", duration: 1000 },
];

const ProcessingSkeleton = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = stages.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      const pct = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(pct);

      let cumulative = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulative += stages[i].duration;
        if (elapsed < cumulative) {
          setStageIndex(i);
          break;
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const current = stages[stageIndex];
  const Icon = current.icon;

  return (
    <div className="w-full max-w-sm mx-auto space-y-5 py-4">
      {/* Animated icon */}
      <div className="flex justify-center">
        <motion.div
          key={stageIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-2xl bg-clinical-blue/10 border border-clinical-blue/20 flex items-center justify-center"
        >
          <Icon className="w-7 h-7 text-clinical-blue" />
        </motion.div>
      </div>

      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-sm font-heading font-semibold text-foreground text-center"
        >
          {current.label}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5 bg-muted" />

      {/* Stage dots */}
      <div className="flex items-center justify-center gap-2">
        {stages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= stageIndex ? "bg-clinical-blue" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        AI analysis in progress — do not close this screen
      </p>
    </div>
  );
};

export default ProcessingSkeleton;
