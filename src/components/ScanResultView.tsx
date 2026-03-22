import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanResultViewProps {
  imageUrl: string;
}

const ScanResultView = ({ imageUrl }: ScanResultViewProps) => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showHeatmap) {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showHeatmap]);

  const handleZoomIn = () => setScale((s) => Math.min(3, s + 0.5));
  const handleZoomOut = () => setScale((s) => Math.max(1, s - 0.5));
  const handleReset = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handlePointerUp = () => setIsDragging(false);

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm text-foreground">Scan Result</h3>
        <div className="flex items-center gap-1.5">
          {scale > 1 && (
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleZoomOut} disabled={scale <= 1}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleZoomIn} disabled={scale >= 3}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Dual-layer canvas */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-foreground/95 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute inset-0 transition-transform duration-150"
          style={{ transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)` }}
        >
          {/* Base layer — original photo */}
          <img
            src={imageUrl}
            alt="Dental scan"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Scanning shimmer */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/3 z-20 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--clinical-blue) / 0.2), hsl(var(--clinical-blue) / 0.35), hsl(var(--clinical-blue) / 0.2), transparent)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Heatmap overlay — wipe reveal with blend mode */}
          <AnimatePresence>
            {showHeatmap && !isScanning && (
              <motion.div
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                exit={{ clipPath: "inset(0 100% 0 0)" }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 z-10 pointer-events-none"
                style={{ mixBlendMode: "multiply" }}
              >
                <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
                  <defs>
                    <filter id="scanHeatBlur">
                      <feGaussianBlur stdDeviation="10" />
                    </filter>
                    <radialGradient id="scanHeat1" cx="30%" cy="45%" r="22%">
                      <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.8" />
                      <stop offset="40%" stopColor="#FFE600" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="scanHeat2" cx="70%" cy="50%" r="18%">
                      <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.65" />
                      <stop offset="50%" stopColor="#FFE600" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="scanHeat3" cx="50%" cy="35%" r="25%">
                      <stop offset="0%" stopColor="#FFE600" stopOpacity="0.5" />
                      <stop offset="70%" stopColor="#FFE600" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="scanHeatInter1" cx="42%" cy="48%" r="10%">
                      <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#FFE600" stopOpacity="0.15" />
                    </radialGradient>
                    <radialGradient id="scanHeatInter2" cx="58%" cy="52%" r="9%">
                      <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#FFE600" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>
                  <g filter="url(#scanHeatBlur)">
                    <rect width="400" height="300" fill="url(#scanHeat1)" className="glow-pulse" />
                    <rect width="400" height="300" fill="url(#scanHeat2)" className="glow-pulse" style={{ animationDelay: "0.5s" }} />
                    <rect width="400" height="300" fill="url(#scanHeat3)" className="glow-pulse" style={{ animationDelay: "1s" }} />
                    <rect width="400" height="300" fill="url(#scanHeatInter1)" className="glow-pulse" style={{ animationDelay: "0.3s" }} />
                    <rect width="400" height="300" fill="url(#scanHeatInter2)" className="glow-pulse" style={{ animationDelay: "0.7s" }} />
                  </g>

                  {/* Detection markers */}
                  <motion.circle cx="120" cy="135" r="18" fill="none" stroke="#FF8A00" strokeWidth="1.5" strokeDasharray="4 3"
                    animate={{ r: [18, 21, 18] }} transition={{ duration: 2, repeat: Infinity }} opacity="0.7" />
                  <motion.circle cx="280" cy="150" r="14" fill="none" stroke="#FF8A00" strokeWidth="1.5" strokeDasharray="4 3"
                    animate={{ r: [14, 17, 14] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} opacity="0.6" />
                  <motion.circle cx="168" cy="144" r="8" fill="none" stroke="#FFE600" strokeWidth="1.5" strokeDasharray="3 2"
                    animate={{ r: [8, 10, 8] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} opacity="0.5" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mode label */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm transition-colors ${
            isScanning
              ? "text-clinical-blue bg-clinical-blue/20"
              : showHeatmap
                ? "text-plaque bg-plaque/20"
                : "text-clinical-white bg-clinical-white/20"
          }`}>
            <Layers className="w-3 h-3 inline mr-1" />
            {isScanning ? "Analyzing…" : showHeatmap ? "AI Heatmap" : "Original"}
          </span>
        </div>

        {/* Zoom indicator */}
        {scale > 1 && (
          <div className="absolute bottom-3 right-3 z-20">
            <span className="text-[10px] font-mono text-clinical-white/70 bg-clinical-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {scale.toFixed(1)}×
            </span>
          </div>
        )}
      </div>

      {/* Precision Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-[11px] font-medium transition-colors ${!showHeatmap ? "text-foreground" : "text-muted-foreground"}`}>
          Natural View
        </span>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 haptic-button ${
            showHeatmap ? "bg-plaque" : "bg-muted"
          }`}
        >
          <motion.div
            className="absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-card"
            animate={{ x: showHeatmap ? 28 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-[11px] font-medium transition-colors ${showHeatmap ? "text-foreground" : "text-muted-foreground"}`}>
          AI Heatmap
        </span>
      </div>

      {/* Missed Spots Legend */}
      <AnimatePresence>
        {showHeatmap && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border border-border bg-card p-3 shadow-card"
          >
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Missed Spots</span>
            <div className="flex gap-4 mt-2">
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

      {/* Analysis Metrics */}
      <AnimatePresence>
        {showHeatmap && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="rounded-xl border border-border bg-card p-3 shadow-card text-center">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Plaque Coverage</span>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.25 }}
                className="text-2xl font-heading font-bold text-urgency-amber mt-1"
              >22%</motion.p>
              <p className="text-[9px] text-muted-foreground">of surface area</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-card text-center">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Brushing Efficiency</span>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.35 }}
                className="text-2xl font-heading font-bold text-scan-green mt-1"
              >78%</motion.p>
              <p className="text-[9px] text-muted-foreground">effective coverage</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanResultView;
