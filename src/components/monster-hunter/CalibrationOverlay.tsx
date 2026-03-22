import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smile, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalibrationOverlayProps {
  onComplete: () => void;
}

const CalibrationOverlay = ({ onComplete }: CalibrationOverlayProps) => {
  const [phase, setPhase] = useState<"intro" | "cheese" | "done">("intro");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (phase === "cheese") {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
      }
      setPhase("done");
      setTimeout(onComplete, 800);
    }
  }, [phase, countdown, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-foreground/80 backdrop-blur-sm"
    >
      {phase === "intro" && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-4 px-6">
          <div className="text-6xl">🦷</div>
          <h2 className="font-heading font-bold text-2xl text-primary-foreground">Say Cheese!</h2>
          <p className="text-sm text-primary-foreground/70 max-w-xs">
            Open your mouth wide so we can map where the monsters are hiding!
          </p>
          <Button
            onClick={() => setPhase("cheese")}
            className="bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold text-lg px-8 py-6 rounded-xl gap-2"
          >
            <Smile className="w-6 h-6" />
            Ready!
          </Button>
        </motion.div>
      )}

      {phase === "cheese" && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-7xl"
          >
            📸
          </motion.div>
          <p className="text-primary-foreground font-heading font-bold text-3xl">
            {countdown > 0 ? countdown : "Perfect!"}
          </p>
          <p className="text-primary-foreground/60 text-sm">Keep your mouth open wide…</p>
        </motion.div>
      )}

      {phase === "done" && (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-2">
          <Sparkles className="w-12 h-12 text-plaque-gold mx-auto" />
          <p className="text-primary-foreground font-heading font-bold text-2xl">Calibrated!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CalibrationOverlay;
