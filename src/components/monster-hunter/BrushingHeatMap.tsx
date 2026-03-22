import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IntegrityReport } from "./types";

interface BrushingHeatMapProps {
  report: IntegrityReport | null;
}

const QUADRANTS = [
  { id: "topLeft", label: "Upper Left", short: "UL", x: 22, y: 18, zones: ["topLeft"] },
  { id: "topCenter", label: "Front Teeth", short: "FR", x: 50, y: 12, zones: ["topCenter"] },
  { id: "topRight", label: "Upper Right", short: "UR", x: 78, y: 18, zones: ["topRight"] },
  { id: "left", label: "Left Side", short: "LS", x: 16, y: 50, zones: ["left"] },
  { id: "tongue", label: "Tongue", short: "TG", x: 50, y: 52, zones: ["bottomCenter"] },
  { id: "right", label: "Right Side", short: "RS", x: 84, y: 50, zones: ["right"] },
  { id: "bottomLeft", label: "Lower Left", short: "LL", x: 22, y: 82, zones: ["bottomLeft"] },
  { id: "bottomCenter", label: "Lower Front", short: "LF", x: 50, y: 88, zones: ["bottomCenter"] },
  { id: "bottomRight", label: "Lower Right", short: "LR", x: 78, y: 82, zones: ["bottomRight"] },
];

const TIPS: Record<string, string> = {
  topLeft: "The Hunter is neglecting the upper left molars — suggest a wider jaw opening and angled back strokes.",
  topCenter: "Front teeth need more attention — use vertical up-and-down motions for the smile zone.",
  topRight: "Upper right molars are being missed — remind the Hunter to reach all the way to the back.",
  left: "Left side gum-line needs work — try tilting the brush at 45° along the gum line.",
  tongue: "The tongue surface needs sweeping — long strokes from back to front clear the Breath-Stealer.",
  right: "Right side coverage is low — hold the brush at an angle and sweep along the gum line.",
  bottomLeft: "Lower left molars are under-brushed — focus on circular motions on the chewing surface.",
  bottomCenter: "Lower front teeth are being skipped — use the tip of the brush in small vertical strokes.",
  bottomRight: "Lower right area needs more time — ensure the brush reaches the very last tooth.",
};

function getZoneScore(report: IntegrityReport | null, zoneKey: string): number {
  if (!report) return 0;
  const coverage = report.zoneCoverage as Record<string, number>;
  const hits = coverage[zoneKey] || 0;
  const maxHits = Math.max(...Object.values(coverage), 1);
  return Math.round((hits / maxHits) * 100);
}

function getColor(pct: number): string {
  if (pct >= 80) return "hsl(var(--neon-green))";
  if (pct >= 50) return "hsl(var(--neon-gold))";
  return "hsl(var(--urgency-red))";
}

function getBgColor(pct: number): string {
  if (pct >= 80) return "hsl(var(--neon-green) / 0.15)";
  if (pct >= 50) return "hsl(var(--neon-gold) / 0.12)";
  return "hsl(var(--urgency-red) / 0.12)";
}

const BrushingHeatMap = ({ report }: BrushingHeatMapProps) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const cardBg = "hsl(var(--commander-surface))";
  const borderColor = "hsl(var(--commander-slate) / 0.3)";
  const textPrimary = "hsl(var(--commander-text))";
  const textMuted = "hsl(var(--commander-muted))";

  if (!report) {
    return (
      <div className="rounded-xl p-6 text-center space-y-2" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <span className="text-3xl">🗺️</span>
        <p className="text-xs" style={{ color: textMuted }}>No brushing data yet. Complete a battle to see the Heat Map.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h3 className="font-heading font-bold text-sm" style={{ color: textPrimary }}>Brushing Heat Map</h3>
        </div>
        <p className="text-[11px]" style={{ color: textMuted }}>
          Tap any zone to see coaching tips. Green = well cleaned, Red = needs attention.
        </p>

        {/* Dental Map */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden" style={{ backgroundColor: "hsl(var(--commander-navy))" }}>
          {/* Mouth outline */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
            <ellipse cx="50" cy="50" rx="42" ry="44" fill="none" stroke="hsl(var(--commander-text))" strokeWidth="0.5" />
            <line x1="50" y1="6" x2="50" y2="94" stroke="hsl(var(--commander-text))" strokeWidth="0.3" strokeDasharray="2,2" />
            <line x1="8" y1="50" x2="92" y2="50" stroke="hsl(var(--commander-text))" strokeWidth="0.3" strokeDasharray="2,2" />
          </svg>

          {/* Zone nodes */}
          {QUADRANTS.map((q) => {
            const score = getZoneScore(report, q.zones[0]);
            const color = getColor(score);
            const bgColor = getBgColor(score);
            const isSelected = selectedZone === q.id;
            const size = isSelected ? 44 : 36;

            return (
              <motion.button
                key={q.id}
                className="absolute rounded-xl flex flex-col items-center justify-center transition-all"
                style={{
                  left: `${q.x}%`,
                  top: `${q.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: size,
                  height: size,
                  backgroundColor: bgColor,
                  border: `2px solid ${color}`,
                  boxShadow: isSelected ? `0 0 12px ${color}` : "none",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedZone(isSelected ? null : q.id)}
              >
                <span className="text-[8px] font-bold" style={{ color }}>{q.short}</span>
                <span className="text-[10px] font-bold font-mono" style={{ color }}>{score}%</span>
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[9px]" style={{ color: textMuted }}>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--neon-green))" }} /> 80%+
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--neon-gold))" }} /> 50–79%
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--urgency-red))" }} /> &lt;50%
          </span>
        </div>
      </div>

      {/* Tip Panel */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="rounded-xl p-4 space-y-2 overflow-hidden"
            style={{
              backgroundColor: getBgColor(getZoneScore(report, selectedZone)),
              border: `1px solid ${getColor(getZoneScore(report, selectedZone))}40`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">💡</span>
              <h4 className="font-heading font-bold text-xs" style={{ color: textPrimary }}>
                {QUADRANTS.find(q => q.id === selectedZone)?.label} — {getZoneScore(report, selectedZone)}% Coverage
              </h4>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: textMuted }}>
              {TIPS[selectedZone] || "Keep brushing this area thoroughly!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrushingHeatMap;
