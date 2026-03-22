import { motion } from "framer-motion";
import { Camera, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { type LesionDay, statusConfig } from "./types";

interface LesionGalleryCardProps {
  entry: LesionDay;
  direction: number;
}

const trendIcons = {
  shrinking: <ArrowDown className="w-4 h-4 text-scan-green" aria-label="Shrinking" />,
  unchanged: <Minus className="w-4 h-4 text-urgency-amber" aria-label="No change" />,
  growing: <ArrowUp className="w-4 h-4 text-urgency-red" aria-label="Growing" />,
};

const LesionGalleryCard = ({ entry, direction }: LesionGalleryCardProps) => {
  const config = statusConfig[entry.status];

  return (
    <motion.div
      key={entry.day}
      initial={{ opacity: 0, x: direction * 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -80 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="w-full flex flex-col items-center gap-4"
    >
      {/* Photo area with ghost overlay hint */}
      <div className="relative w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden border border-border bg-muted/50">
        {/* Simulated photo placeholder */}
        <div className="absolute inset-0 shimmer flex items-center justify-center">
          <Camera className="w-10 h-10 text-muted-foreground/20" />
        </div>

        {/* Ghost image overlay (Day 1 reference) */}
        {entry.day > 1 && (
          <div className="absolute inset-0 border-2 border-dashed border-clinical-blue/20 rounded-2xl pointer-events-none">
            <div className="absolute top-2 right-2 bg-clinical-blue/10 backdrop-blur-sm text-clinical-blue text-[8px] font-semibold px-1.5 py-0.5 rounded-full">
              Day 1 Ref
            </div>
          </div>
        )}

        {/* Day stamp */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-3 pt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted/80 font-medium">DAY</p>
              <p className="text-xl font-heading font-bold text-card">{entry.day}</p>
            </div>
            <p className="text-sm font-mono font-bold text-card">{entry.sizeMm}mm</p>
          </div>
        </div>
      </div>

      {/* Analysis card */}
      <div className={`w-full max-w-[260px] rounded-xl border ${config.border} ${config.bg} p-3 space-y-2`}>
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">AI Analysis</span>
          <div className={`flex items-center gap-1 ${config.text}`}>
            {trendIcons[entry.status]}
            <span className="text-xs font-semibold">{config.label}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Size</p>
            <p className="text-sm font-heading font-bold text-foreground">{entry.sizeMm}mm</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Delta</p>
            <p className={`text-sm font-mono font-bold ${config.text}`}>{entry.sizeDelta}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Redness</p>
            <p className="text-sm font-heading font-bold text-foreground">{Math.round(entry.colorScore)}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LesionGalleryCard;
