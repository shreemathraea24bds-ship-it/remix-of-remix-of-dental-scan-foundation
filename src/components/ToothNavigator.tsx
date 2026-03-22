import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type ToothStatus = "scanned" | "pending";

interface ToothData {
  id: number;
  status: ToothStatus;
}

const generateTeeth = (): ToothData[] => {
  return Array.from({ length: 32 }, (_, i) => ({
    id: i + 1,
    status: (Math.random() > 0.5 ? "scanned" : "pending") as ToothStatus,
  }));
};

const teeth = generateTeeth();

const ToothIcon = ({ id, status }: ToothData) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: id * 0.02 }}
    className="relative flex flex-col items-center justify-center w-full aspect-square rounded-lg bg-card border border-border shadow-card cursor-pointer haptic-button hover:shadow-elevated transition-shadow"
  >
    <svg viewBox="0 0 24 32" className="w-5 h-6 mb-0.5">
      <path
        d="M8 6 C8 2, 16 2, 16 6 L17 16 C17 19, 14 24, 13 26 C12.5 27, 11.5 27, 11 26 C10 24, 7 19, 7 16 Z"
        fill="hsl(var(--tooth-white))"
        stroke="hsl(var(--border))"
        strokeWidth="0.8"
      />
    </svg>
    <span className="text-[8px] font-mono text-muted-foreground">{id}</span>
    {/* Status dot */}
    <div
      className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
        status === "scanned" ? "bg-clinical-blue" : "bg-muted-foreground/30"
      }`}
    />
  </motion.div>
);

interface ToothNavigatorProps {
  isScanning?: boolean;
}

const ToothNavigator = ({ isScanning = false }: ToothNavigatorProps) => {
  const upperTeeth = teeth.slice(0, 16);
  const lowerTeeth = teeth.slice(16);
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    if (isScanning) setScanKey((k) => k + 1);
  }, [isScanning]);

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">
        Tooth-by-Tooth Navigator
      </h3>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-clinical-blue" />
          <span className="text-[10px] text-muted-foreground">Scanned</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="text-[10px] text-muted-foreground">Pending</span>
        </div>
      </div>

      <div className="relative">
        {/* Scan line overlay */}
        {isScanning && (
          <motion.div
            key={scanKey}
            initial={{ top: "-2px" }}
            animate={{ top: "100%" }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            className="absolute left-0 right-0 z-10 pointer-events-none"
          >
            <div className="h-0.5 bg-gradient-to-r from-transparent via-clinical-blue to-transparent opacity-90" />
            <div className="h-4 bg-gradient-to-b from-clinical-blue/20 to-transparent" />
          </motion.div>
        )}

        {/* Upper arch */}
        <div className="grid grid-cols-8 gap-1.5 mb-2">
          {upperTeeth.map((tooth) => (
            <ToothIcon key={tooth.id} {...tooth} />
          ))}
        </div>
        {/* Divider */}
        <div className="h-px bg-border mb-2" />
        {/* Lower arch */}
        <div className="grid grid-cols-8 gap-1.5">
          {lowerTeeth.map((tooth) => (
            <ToothIcon key={tooth.id} {...tooth} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToothNavigator;
