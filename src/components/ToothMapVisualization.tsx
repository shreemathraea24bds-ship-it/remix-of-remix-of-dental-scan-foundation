import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Defect {
  type: string;
  location: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  urgency: "routine" | "soon" | "urgent";
}

interface Finding {
  area: string;
  condition: string;
  severity: "healthy" | "monitor" | "emergency";
  recommendation: string;
}

interface ToothMapVisualizationProps {
  defects?: Defect[];
  findings?: Finding[];
}

// Universal Numbering System — 32 teeth mapped to SVG positions
// Upper arch: 1-16 (right to left from patient's perspective)
// Lower arch: 17-32 (left to right from patient's perspective)
const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1);
const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => i + 17);

const TOOTH_NAMES: Record<number, string> = {
  1: "Upper Right 3rd Molar", 2: "Upper Right 2nd Molar", 3: "Upper Right 1st Molar",
  4: "Upper Right 2nd Premolar", 5: "Upper Right 1st Premolar", 6: "Upper Right Canine",
  7: "Upper Right Lateral Incisor", 8: "Upper Right Central Incisor",
  9: "Upper Left Central Incisor", 10: "Upper Left Lateral Incisor", 11: "Upper Left Canine",
  12: "Upper Left 1st Premolar", 13: "Upper Left 2nd Premolar", 14: "Upper Left 1st Molar",
  15: "Upper Left 2nd Molar", 16: "Upper Left 3rd Molar",
  17: "Lower Left 3rd Molar", 18: "Lower Left 2nd Molar", 19: "Lower Left 1st Molar",
  20: "Lower Left 2nd Premolar", 21: "Lower Left 1st Premolar", 22: "Lower Left Canine",
  23: "Lower Left Lateral Incisor", 24: "Lower Left Central Incisor",
  25: "Lower Right Central Incisor", 26: "Lower Right Lateral Incisor", 27: "Lower Right Canine",
  28: "Lower Right 1st Premolar", 29: "Lower Right 2nd Premolar", 30: "Lower Right 1st Molar",
  31: "Lower Right 2nd Molar", 32: "Lower Right 3rd Molar",
};

// Keywords to map defect/finding locations to tooth numbers
const LOCATION_KEYWORDS: Record<string, number[]> = {
  // Regions
  "upper front": [7, 8, 9, 10],
  "lower front": [23, 24, 25, 26],
  "upper right": [1, 2, 3, 4, 5, 6, 7, 8],
  "upper left": [9, 10, 11, 12, 13, 14, 15, 16],
  "lower right": [25, 26, 27, 28, 29, 30, 31, 32],
  "lower left": [17, 18, 19, 20, 21, 22, 23, 24],
  "front teeth": [7, 8, 9, 10, 23, 24, 25, 26],
  "back teeth": [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32],
  "all teeth": UPPER_TEETH.concat(LOWER_TEETH),
  // Types
  "molar": [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32],
  "premolar": [4, 5, 12, 13, 20, 21, 28, 29],
  "canine": [6, 11, 22, 27],
  "incisor": [7, 8, 9, 10, 23, 24, 25, 26],
  "wisdom": [1, 16, 17, 32],
  // General
  "upper": UPPER_TEETH,
  "lower": LOWER_TEETH,
  "right": [1, 2, 3, 4, 5, 6, 7, 8, 25, 26, 27, 28, 29, 30, 31, 32],
  "left": [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  "gum": [],
  "gums": [],
};

function mapLocationToTeeth(location: string): number[] {
  const lower = location.toLowerCase();
  const matched = new Set<number>();

  // Check for tooth numbers mentioned directly (e.g., "tooth #14", "tooth 8")
  const numMatch = lower.match(/(?:tooth|#)\s*(\d{1,2})/g);
  if (numMatch) {
    numMatch.forEach((m) => {
      const num = parseInt(m.replace(/\D/g, ""));
      if (num >= 1 && num <= 32) matched.add(num);
    });
  }

  // Check keyword mappings (longer phrases first)
  const sortedKeys = Object.keys(LOCATION_KEYWORDS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      LOCATION_KEYWORDS[key].forEach((t) => matched.add(t));
    }
  }

  return Array.from(matched);
}

const severityColors = {
  mild: { fill: "hsl(var(--clinical-blue))", stroke: "hsl(var(--clinical-blue))" },
  moderate: { fill: "hsl(var(--urgency-amber))", stroke: "hsl(var(--urgency-amber))" },
  severe: { fill: "hsl(var(--urgency-red))", stroke: "hsl(var(--urgency-red))" },
};

const findingSeverityMap: Record<string, "mild" | "moderate" | "severe"> = {
  healthy: "mild",
  monitor: "moderate",
  emergency: "severe",
};

interface ToothIssue {
  severity: "mild" | "moderate" | "severe";
  label: string;
  description: string;
}

const ToothMapVisualization = ({ defects = [], findings = [] }: ToothMapVisualizationProps) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // Build a map of tooth number -> issues
  const toothIssues = new Map<number, ToothIssue[]>();

  defects.forEach((d) => {
    const teeth = mapLocationToTeeth(d.location);
    teeth.forEach((t) => {
      if (!toothIssues.has(t)) toothIssues.set(t, []);
      toothIssues.get(t)!.push({
        severity: d.severity,
        label: d.type.replace(/_/g, " "),
        description: d.description,
      });
    });
  });

  findings.forEach((f) => {
    if (f.severity === "healthy") return;
    const teeth = mapLocationToTeeth(f.area);
    teeth.forEach((t) => {
      if (!toothIssues.has(t)) toothIssues.set(t, []);
      toothIssues.get(t)!.push({
        severity: findingSeverityMap[f.severity] || "moderate",
        label: f.condition,
        description: f.recommendation,
      });
    });
  });

  const getToothColor = (num: number) => {
    const issues = toothIssues.get(num);
    if (!issues || issues.length === 0) return { fill: "hsl(var(--muted))", stroke: "hsl(var(--border))" };
    // Use worst severity
    const worst = issues.some((i) => i.severity === "severe")
      ? "severe"
      : issues.some((i) => i.severity === "moderate")
        ? "moderate"
        : "mild";
    return severityColors[worst];
  };

  const hasIssues = toothIssues.size > 0;
  const selectedIssues = selectedTooth ? toothIssues.get(selectedTooth) : null;

  // Tooth shape dimensions
  const toothW = 16;
  const toothH = 22;
  const gap = 2;
  const archWidth = 16 * (toothW + gap);
  const svgW = archWidth + 40;
  const svgH = 120;

  const renderTooth = (num: number, x: number, y: number, isUpper: boolean) => {
    const colors = getToothColor(num);
    const issues = toothIssues.get(num);
    const hasDefect = issues && issues.length > 0;
    const isSelected = selectedTooth === num;

    // Molar/premolar/canine/incisor sizing
    let w = toothW;
    let h = toothH;
    const isMolar = [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(num);
    const isPremolar = [4, 5, 12, 13, 20, 21, 28, 29].includes(num);
    if (isMolar) { w = 17; h = 24; }
    else if (isPremolar) { w = 15; h = 21; }
    else { w = 14; h = 20; }

    const rx = isMolar ? 4 : isPremolar ? 3.5 : 3;

    return (
      <g key={num} onClick={() => setSelectedTooth(isSelected ? null : num)} className="cursor-pointer">
        {/* Pulse ring for affected teeth */}
        {hasDefect && (
          <motion.rect
            x={x - w / 2 - 3}
            y={y - h / 2 - 3}
            width={w + 6}
            height={h + 6}
            rx={rx + 2}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={1}
            animate={{
              strokeOpacity: [0.6, 0.15, 0.6],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: num * 0.05 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        )}
        {/* Second outer pulse for severe */}
        {hasDefect && issues!.some(i => i.severity === "severe") && (
          <motion.rect
            x={x - w / 2 - 6}
            y={y - h / 2 - 6}
            width={w + 12}
            height={h + 12}
            rx={rx + 4}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={0.8}
            animate={{
              strokeOpacity: [0.4, 0, 0.4],
              scale: [1, 1.12, 1],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: num * 0.05 + 0.3 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        )}
        <motion.rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={rx}
          fill={colors.fill}
          stroke={isSelected ? "hsl(var(--foreground))" : colors.stroke}
          strokeWidth={isSelected ? 2 : hasDefect ? 1.5 : 0.8}
          fillOpacity={hasDefect ? 0.35 : 0.15}
          animate={hasDefect ? {
            fillOpacity: [0.25, 0.45, 0.25],
          } : {}}
          transition={hasDefect ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
          whileHover={{ fillOpacity: 0.55, scale: 1.1 }}
        />
        {hasDefect && (
          <motion.circle
            cx={x}
            cy={isUpper ? y - h / 2 - 3 : y + h / 2 + 3}
            r={2.5}
            fill={colors.fill}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ delay: num * 0.02, duration: 1.5, repeat: Infinity }}
          />
        )}
        <text
          x={x}
          y={y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="6"
          fontFamily="monospace"
          fill="hsl(var(--foreground))"
          fillOpacity={0.5}
          className="pointer-events-none select-none"
        >
          {num}
        </text>
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-clinical-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8 2 6 5 6 8c0 2 1 4 1 6s-1 4-1 6c0 1 1 2 2 2s2-1 3-3c.5-1 .5-1 1-1s.5 0 1 1c1 2 2 3 3 3s2-1 2-2c0-2-1-4-1-6s1-4 1-6c0-3-2-6-6-6z" />
          </svg>
          Dental Map
        </h4>
        {hasIssues && (
          <span className="text-[9px] text-muted-foreground">Tap a tooth for details</span>
        )}
      </div>

      {/* Defect count summary */}
      {hasIssues && (() => {
        let mild = 0, moderate = 0, severe = 0;
        toothIssues.forEach((issues) => {
          issues.forEach((issue) => {
            if (issue.severity === "severe") severe++;
            else if (issue.severity === "moderate") moderate++;
            else mild++;
          });
        });
        return (
          <div className="flex items-center gap-3 flex-wrap">
            {severe > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-urgency-red bg-urgency-red/10 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-urgency-red animate-pulse" /> {severe} severe
              </span>
            )}
            {moderate > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-urgency-amber bg-urgency-amber/10 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-urgency-amber" /> {moderate} moderate
              </span>
            )}
            {mild > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-clinical-blue bg-clinical-blue/10 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-clinical-blue" /> {mild} mild
              </span>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto">{toothIssues.size} teeth affected</span>
          </div>
        );
      })()}

      {/* SVG Tooth Map */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[360px] mx-auto" style={{ minWidth: 280 }}>
          {/* Labels */}
          <text x={svgW / 2} y={8} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="600" className="select-none">
            UPPER
          </text>
          <text x={svgW / 2} y={svgH - 2} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="600" className="select-none">
            LOWER
          </text>

          {/* Midline */}
          <line x1={svgW / 2} y1={14} x2={svgW / 2} y2={svgH - 10} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3 2" />

          {/* Right/Left labels */}
          <text x={4} y={svgH / 2 + 1} textAnchor="start" fontSize="5.5" fill="hsl(var(--muted-foreground))" fillOpacity={0.5} className="select-none">R</text>
          <text x={svgW - 4} y={svgH / 2 + 1} textAnchor="end" fontSize="5.5" fill="hsl(var(--muted-foreground))" fillOpacity={0.5} className="select-none">L</text>

          {/* Upper arch */}
          {UPPER_TEETH.map((num, i) => {
            const x = 20 + i * (toothW + gap) + toothW / 2;
            const y = 30;
            return renderTooth(num, x, y, true);
          })}

          {/* Lower arch */}
          {LOWER_TEETH.map((num, i) => {
            // Lower teeth go 17-32, but visually mirror: 32..17 reversed to 17..32
            // Actually: lower left (17-24) on the right side, lower right (25-32) on the left
            // For visual: position 0=32, 1=31, ... 15=17
            const visualIndex = 15 - i; // reverse order
            const actualNum = 32 - i; // 32, 31, 30, ... 17
            const x = 20 + visualIndex * (toothW + gap) + toothW / 2;
            const y = svgH - 30;
            return renderTooth(actualNum, x, y, false);
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-clinical-blue/30 border border-clinical-blue/50" /> Mild
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-urgency-amber/30 border border-urgency-amber/50" /> Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-urgency-red/30 border border-urgency-red/50" /> Severe
        </span>
      </div>

      {/* Selected tooth detail */}
      <AnimatePresence>
        {selectedTooth && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-muted/50 border border-border p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  #{selectedTooth} — {TOOTH_NAMES[selectedTooth]}
                </span>
                <button
                  onClick={() => setSelectedTooth(null)}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              {selectedIssues && selectedIssues.length > 0 ? (
                selectedIssues.map((issue, i) => (
                  <div key={i} className="text-[11px] text-muted-foreground">
                    <span className={`font-medium capitalize ${
                      issue.severity === "severe" ? "text-urgency-red" :
                      issue.severity === "moderate" ? "text-urgency-amber" : "text-clinical-blue"
                    }`}>
                      {issue.label}
                    </span>
                    {" — "}{issue.description}
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-scan-green">No issues detected</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ToothMapVisualization;
