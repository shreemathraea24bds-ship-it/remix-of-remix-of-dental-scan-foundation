import { useState, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Calendar, GitCompare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonSliderProps {
  baselineDate?: string;
  currentDate?: string;
}

const ComparisonSlider = ({ baselineDate = "Sep 2025", currentDate = "Mar 2026" }: ComparisonSliderProps) => {
  const [sliderValue, setSliderValue] = useState([50]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderValue([pct]);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-clinical-blue" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Clinical Overlay — Time Travel</h4>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{baselineDate}</span>
          <span>→</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{currentDate}</span>
        </div>
      </div>

      {/* Split-screen viewer */}
      <div
        ref={containerRef}
        className="relative aspect-[16/9] bg-foreground/95 cursor-col-resize select-none overflow-hidden"
        onPointerMove={handlePointerMove}
      >
        {/* Baseline (left) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-muted/10 mx-auto flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <p className="text-[10px] text-muted-foreground/40">Baseline Scan</p>
          </div>
        </div>

        {/* Current (right — clipped) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ clipPath: `inset(0 0 0 ${sliderValue[0]}%)` }}
        >
          <div className="absolute inset-0 bg-foreground/90" />
          <div className="relative text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-clinical-blue/10 mx-auto flex items-center justify-center">
              <svg className="w-10 h-10 text-clinical-blue/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <p className="text-[10px] text-clinical-blue/60">Current Triage</p>
          </div>
        </div>

        {/* Slider divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${sliderValue[0]}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-elevated">
            <GitCompare className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-2 text-[8px] text-muted-foreground/50 font-mono z-10">BASELINE</div>
        <div className="absolute top-2 right-2 text-[8px] text-clinical-blue/50 font-mono z-10">CURRENT</div>

        {/* Delta glow overlay */}
        <motion.div
          className="absolute z-5 pointer-events-none"
          style={{ top: "30%", left: "35%", width: "30%", height: "40%" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-full h-full rounded-full border-2 border-urgency-red/50 shadow-[0_0_20px_hsl(var(--urgency-red)/0.3)]" />
        </motion.div>
      </div>

      {/* Slider control */}
      <div className="px-4 py-3 border-t border-border space-y-2">
        <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} className="w-full" />
        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span>← Baseline ({baselineDate})</span>
          <span className="flex items-center gap-1 text-urgency-red font-semibold">
            <TrendingUp className="w-3 h-3" />
            Delta: +2.1mm growth detected
          </span>
          <span>Current ({currentDate}) →</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
