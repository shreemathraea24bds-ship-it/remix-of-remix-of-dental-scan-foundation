import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PlaqueHeatmapToggle = () => {
  const [active, setActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (active && !isScanning) {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xs mx-auto">
      {/* Dual-layer canvas */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-foreground/95 select-none">
        {/* Base tooth SVG — "clean" view */}
        <svg viewBox="0 0 240 320" className="absolute inset-0 w-full h-full">
          {/* Gum background */}
          <rect width="240" height="320" fill="hsl(var(--foreground) / 0.95)" />
          <ellipse cx="120" cy="280" rx="110" ry="60" fill="hsl(var(--gingiva-pink) / 0.15)" />

          {/* Upper teeth row */}
          {[30, 60, 90, 120, 150, 180, 210].map((x, i) => (
            <g key={`u${i}`}>
              <path
                d={`M${x - 12} 80 C${x - 12} 60, ${x + 12} 60, ${x + 12} 80 L${x + 14} 140 C${x + 14} 150, ${x + 6} 165, ${x + 3} 170 C${x + 1} 173, ${x - 1} 173, ${x - 3} 170 C${x - 6} 165, ${x - 14} 150, ${x - 14} 140 Z`}
                fill="hsl(var(--tooth-white))"
                stroke="hsl(var(--border))"
                strokeWidth="0.6"
              />
              {/* Surface texture lines */}
              <line x1={x - 3} y1={85} x2={x - 4} y2={100} stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3" />
              <line x1={x + 3} y1={85} x2={x + 4} y2={100} stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3" />
            </g>
          ))}

          {/* Lower teeth row */}
          {[40, 70, 100, 140, 170, 200].map((x, i) => (
            <g key={`l${i}`}>
              <path
                d={`M${x - 11} 200 C${x - 11} 185, ${x + 11} 185, ${x + 11} 200 L${x + 12} 250 C${x + 12} 258, ${x + 5} 268, ${x + 2} 272 C${x} 274, ${x - 2} 274, ${x - 4} 270 C${x - 7} 265, ${x - 12} 255, ${x - 12} 248 Z`}
                fill="hsl(var(--tooth-white))"
                stroke="hsl(var(--border))"
                strokeWidth="0.6"
              />
            </g>
          ))}

          {/* Gum line */}
          <path
            d="M10 80 Q30 65, 60 70 Q90 60, 120 65 Q150 60, 180 70 Q210 65, 230 80"
            fill="none"
            stroke="hsl(var(--gingiva-pink) / 0.3)"
            strokeWidth="1.5"
          />
          <path
            d="M10 200 Q40 190, 70 195 Q100 188, 140 192 Q170 188, 200 195 Q220 192, 230 200"
            fill="none"
            stroke="hsl(var(--gingiva-pink) / 0.3)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Scanning shimmer — runs before heatmap reveal */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 z-20 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--clinical-blue) / 0.15), hsl(var(--clinical-blue) / 0.3), hsl(var(--clinical-blue) / 0.15), transparent)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Heatmap overlay — wipe reveal from left to right */}
        <AnimatePresence>
          {active && !isScanning && (
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              exit={{ clipPath: "inset(0 100% 0 0)" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ mixBlendMode: "multiply" }}
            >
              <svg viewBox="0 0 240 320" className="w-full h-full">
                <defs>
                  <filter id="plaqueBlur">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                  {/* Heavy plaque — bright orange */}
                  <radialGradient id="plaque-heavy-1" cx="35%" cy="28%" r="14%">
                    <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.75" />
                    <stop offset="60%" stopColor="#FFE600" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="plaque-heavy-2" cx="72%" cy="25%" r="12%">
                    <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.65" />
                    <stop offset="70%" stopColor="#FFE600" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  {/* Moderate plaque — yellow */}
                  <radialGradient id="plaque-mod-1" cx="50%" cy="32%" r="18%">
                    <stop offset="0%" stopColor="#FFE600" stopOpacity="0.55" />
                    <stop offset="80%" stopColor="#FFE600" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  {/* Cervical margin plaque */}
                  <radialGradient id="plaque-cervical" cx="50%" cy="58%" r="30%">
                    <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#FFE600" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  {/* Interproximal plaque */}
                  <radialGradient id="plaque-inter-1" cx="38%" cy="40%" r="8%">
                    <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FFE600" stopOpacity="0.15" />
                  </radialGradient>
                  <radialGradient id="plaque-inter-2" cx="62%" cy="42%" r="7%">
                    <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFE600" stopOpacity="0.1" />
                  </radialGradient>
                  {/* Lower teeth plaque */}
                  <radialGradient id="plaque-lower" cx="45%" cy="72%" r="16%">
                    <stop offset="0%" stopColor="#FFE600" stopOpacity="0.5" />
                    <stop offset="70%" stopColor="#FFE600" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <g filter="url(#plaqueBlur)">
                  {/* Upper cervical margins — base of teeth */}
                  <rect width="240" height="320" fill="url(#plaque-heavy-1)" className="glow-pulse" />
                  <rect width="240" height="320" fill="url(#plaque-heavy-2)" className="glow-pulse" style={{ animationDelay: "0.4s" }} />
                  <rect width="240" height="320" fill="url(#plaque-mod-1)" className="glow-pulse" style={{ animationDelay: "0.8s" }} />
                  {/* Interproximal — between teeth */}
                  <rect width="240" height="320" fill="url(#plaque-inter-1)" className="glow-pulse" style={{ animationDelay: "0.2s" }} />
                  <rect width="240" height="320" fill="url(#plaque-inter-2)" className="glow-pulse" style={{ animationDelay: "0.6s" }} />
                  {/* Lower teeth */}
                  <rect width="240" height="320" fill="url(#plaque-lower)" className="glow-pulse" style={{ animationDelay: "1s" }} />
                  <rect width="240" height="320" fill="url(#plaque-cervical)" className="glow-pulse" style={{ animationDelay: "1.2s" }} />
                </g>

                {/* Detection ring markers */}
                <motion.circle cx="84" cy="90" r="12" fill="none" stroke="#FF8A00" strokeWidth="1.5" strokeDasharray="3 2"
                  animate={{ r: [12, 14, 12] }} transition={{ duration: 2, repeat: Infinity }} opacity="0.7" />
                <motion.circle cx="172" cy="82" r="10" fill="none" stroke="#FF8A00" strokeWidth="1.5" strokeDasharray="3 2"
                  animate={{ r: [10, 12, 10] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} opacity="0.6" />
                <motion.circle cx="108" cy="230" r="9" fill="none" stroke="#FFE600" strokeWidth="1.5" strokeDasharray="3 2"
                  animate={{ r: [9, 11, 9] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} opacity="0.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode label */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm transition-colors ${
            active && !isScanning
              ? "text-plaque bg-plaque/20"
              : isScanning
                ? "text-clinical-blue bg-clinical-blue/20"
                : "text-clinical-white/70 bg-clinical-white/10"
          }`}>
            {isScanning ? "⟳ Analyzing…" : active ? "AI Heatmap" : "Natural View"}
          </span>
        </div>
      </div>

      {/* Precision Toggle */}
      <div className="flex items-center gap-3">
        <span className={`text-[11px] font-medium transition-colors ${!active ? "text-foreground" : "text-muted-foreground"}`}>
          Natural View
        </span>
        <button
          onClick={() => setActive(!active)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 haptic-button ${
            active ? "bg-plaque" : "bg-muted"
          }`}
        >
          <motion.div
            className="absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-card"
            animate={{ x: active ? 28 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-[11px] font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground"}`}>
          AI Heatmap
        </span>
      </div>

      {/* Missed Spots Legend */}
      <AnimatePresence>
        {active && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="w-full rounded-xl border border-border bg-card p-3 shadow-card space-y-2"
          >
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Missed Spots</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full glow-pulse" style={{ background: "radial-gradient(circle, #FF8A00, #FF8A00aa)" }} />
                <div>
                  <p className="text-[10px] font-semibold text-foreground">24h+ Plaque</p>
                  <p className="text-[9px] text-muted-foreground">Brush immediately</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ background: "radial-gradient(circle, #FFE600, #FFE600aa)" }} />
                <div>
                  <p className="text-[10px] font-semibold text-foreground">Early Biofilm</p>
                  <p className="text-[9px] text-muted-foreground">Developing plaque</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Metrics — slide up */}
      <AnimatePresence>
        {active && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            className="w-full grid grid-cols-2 gap-3"
          >
            <div className="rounded-xl border border-border bg-card p-3 shadow-card text-center">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Plaque Coverage</span>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                className="text-2xl font-heading font-bold text-urgency-amber mt-1"
              >
                22%
              </motion.p>
              <p className="text-[9px] text-muted-foreground">of surface area</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-card text-center">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Brushing Efficiency</span>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
                className="text-2xl font-heading font-bold text-scan-green mt-1"
              >
                78%
              </motion.p>
              <p className="text-[9px] text-muted-foreground">effective coverage</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaqueHeatmapToggle;
