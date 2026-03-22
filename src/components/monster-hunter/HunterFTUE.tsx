import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Swords, Shield, Zap, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Phase = "recruitment" | "calibration" | "weapon" | "sighting" | "knighting";

interface HunterFTUEProps {
  onComplete: (hunterName: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Phase 1: The Recruitment                                           */
/* ------------------------------------------------------------------ */

const RecruitmentScene = ({ onNext }: { onNext: () => void }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const lines = [
    "Initiating secure transmission...",
    "Identity confirmed.",
    "You are the one the Guild Master spoke of.",
    "The Oral Frontier is under attack by the Plaque Legion.",
    "Our sensors show your sector is... crawling with them.",
    "We need a Hunter. Are you ready?",
  ];

  useEffect(() => {
    if (textIndex < lines.length - 1) {
      const timer = setTimeout(() => setTextIndex((i) => i + 1), 2200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowButton(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [textIndex, lines.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center px-6 space-y-8 min-h-[60vh]"
    >
      {/* Radar animation */}
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-plaque-gold/20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-plaque-gold/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Scan className="w-10 h-10 text-plaque-gold" />
          </motion.div>
        </div>
        {/* Sweep line */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-plaque-gold/60 to-transparent origin-left"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Typewriter text */}
      <div className="space-y-3 max-w-xs min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-primary-foreground/90 font-mono leading-relaxed"
            style={{ textShadow: "0 0 20px hsl(var(--plaque-gold) / 0.3)" }}
          >
            {lines[textIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Accept button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={onNext}
              className="bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold text-lg px-10 py-6 rounded-xl gap-2 haptic-button"
            >
              <Swords className="w-5 h-5" />
              I Accept the Quest
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Phase 2: The "Say Cheese" Calibration                              */
/* ------------------------------------------------------------------ */

const CalibrationScene = ({ onNext }: { onNext: () => void }) => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);

  const steps = [
    { emoji: "😁", label: "Show your Front Sabers!", instruction: "Give me your biggest Monster-Hunting Grin!", zone: "Incisors locked" },
    { emoji: "😮", label: "Open the Cave!", instruction: "Open wide so we can map the Molar Strongholds!", zone: "Molars mapped" },
    { emoji: "🔄", label: "Left Flank! Right Flank!", instruction: "Turn your head slightly each way!", zone: "Flanks scanned" },
  ];

  const handleStep = () => {
    // Simulate scanning
    const newCompleted = [...completed];
    newCompleted[step] = true;
    setCompleted(newCompleted);

    if (step < steps.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 1200);
    } else {
      setTimeout(() => onNext(), 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center px-6 space-y-6 min-h-[60vh]"
    >
      <div className="space-y-1">
        <h2 className="font-heading font-bold text-lg text-primary-foreground">⚡ Mapping Your Battleground</h2>
        <p className="text-xs text-primary-foreground/50">Hold steady, Hunter. We need to calibrate your Scouter.</p>
      </div>

      {/* Scanning grid visualization */}
      <div className="relative w-48 h-48 rounded-full border-2 border-plaque-gold/20 flex items-center justify-center">
        {/* Scan lines */}
        <motion.div
          className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-scan-green to-transparent"
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.span
          key={step}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          className="text-7xl"
        >
          {steps[step].emoji}
        </motion.span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-2 max-w-xs"
        >
          <p className="text-sm font-bold text-plaque-gold">{steps[step].label}</p>
          <p className="text-xs text-primary-foreground/70">{steps[step].instruction}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-3">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
              completed[i] ? "bg-scan-green/20 border-2 border-scan-green" :
              i === step ? "bg-plaque-gold/20 border-2 border-plaque-gold animate-pulse" :
              "bg-muted/20 border border-primary-foreground/10"
            }`}>
              {completed[i] ? "✓" : s.emoji}
            </div>
            {completed[i] && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[8px] text-scan-green font-bold"
              >
                {s.zone}
              </motion.span>
            )}
          </div>
        ))}
      </div>

      {!completed[step] && (
        <Button
          onClick={handleStep}
          className="bg-plaque-gold/20 border border-plaque-gold/30 text-plaque-gold hover:bg-plaque-gold/30 font-bold gap-2 haptic-button"
        >
          <Scan className="w-4 h-4" />
          Scan {steps[step].label.replace("!", "")}
        </Button>
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Phase 3: The Weapon Sync                                           */
/* ------------------------------------------------------------------ */

const WeaponSyncScene = ({ onNext }: { onNext: () => void }) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => onNext(), 2000);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center px-6 space-y-6 min-h-[60vh]"
    >
      <p className="text-xs text-primary-foreground/50 font-mono">// WEAPON IDENTIFICATION PROTOCOL</p>

      <div className="relative">
        {/* Toothbrush icon */}
        <motion.div
          className="text-7xl"
          animate={syncing ? { rotate: [0, -10, 10, -10, 0] } : synced ? {} : { y: [0, -5, 0] }}
          transition={syncing ? { duration: 0.3, repeat: Infinity } : { duration: 2, repeat: Infinity }}
        >
          🪥
        </motion.div>

        {/* Energy aura */}
        {(syncing || synced) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: synced ? [0.8, 0.4, 0.8] : [0, 0.6, 0],
              scale: synced ? 1.2 : [0.8, 1.3, 0.8],
            }}
            transition={{ duration: synced ? 2 : 1, repeat: Infinity }}
            className={`absolute -inset-6 rounded-full ${
              synced ? "bg-scan-green/10 border-2 border-scan-green/30" : "bg-primary/10 border-2 border-primary/20"
            }`}
          />
        )}
      </div>

      <div className="space-y-2 max-w-xs">
        <p className="text-sm text-primary-foreground/80">
          {synced
            ? '"Weapon identified. Class: Legendary."'
            : '"Identify your weapon. Hold your Saber in the scanning zone."'}
        </p>
        {synced && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <p className="text-lg font-heading font-bold text-scan-green">WEAPON SYNCED</p>
            <p className="text-xs text-plaque-gold font-bold">🗡️ ENAMEL SLAYER +1</p>
          </motion.div>
        )}
      </div>

      {!syncing && !synced && (
        <Button
          onClick={handleSync}
          className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 font-bold gap-2 haptic-button"
        >
          <Zap className="w-4 h-4" />
          Sync Weapon
        </Button>
      )}

      {syncing && (
        <div className="flex items-center gap-2 text-primary-foreground/50 text-xs">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
          />
          Scanning weapon signature...
        </div>
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Phase 4: First Sighting                                            */
/* ------------------------------------------------------------------ */

const FirstSightingScene = ({ onNext }: { onNext: () => void }) => {
  const [revealed, setRevealed] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 1500);
    const t2 = setTimeout(() => setShowButton(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const monsters = [
    { emoji: "🦷", name: "Molar Mauler", x: 25, y: 30 },
    { emoji: "👹", name: "Grime-lin", x: 70, y: 25 },
    { emoji: "🍬", name: "Sugar-Saur", x: 50, y: 65 },
    { emoji: "👅", name: "Tongue-Troll", x: 30, y: 70 },
    { emoji: "🗿", name: "Gap-Gargoyle", x: 75, y: 60 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center px-6 space-y-6 min-h-[60vh]"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-urgency-red font-bold uppercase tracking-widest"
      >
        ⚠️ ALERT: HOSTILES DETECTED
      </motion.p>

      {/* Monster reveal area */}
      <div className="relative w-64 h-48 rounded-2xl bg-foreground/40 border border-urgency-red/20 overflow-hidden">
        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 h-0.5 bg-urgency-red/50"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <AnimatePresence>
          {revealed && monsters.map((m, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              className="absolute"
              style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <motion.span
                className="text-3xl"
                animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              >
                {m.emoji}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-2 max-w-xs">
        <p className="text-sm text-primary-foreground/80 font-mono">
          {revealed
            ? '"By the Guild! They\'re already nesting! Hunter, grab your Saber, apply the Arctic Foam, and prepare for your first skirmish!"'
            : '"Scanning sector for hostile signatures..."'
          }
        </p>
      </div>

      <AnimatePresence>
        {showButton && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              onClick={onNext}
              className="bg-urgency-red hover:bg-urgency-red/90 text-primary-foreground font-bold gap-2 px-8 py-5 haptic-button"
            >
              <Swords className="w-5 h-5" />
              I'm Ready to Fight!
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Phase 5: The Knighting Ceremony (Name + Guild Master setup)        */
/* ------------------------------------------------------------------ */

const KnightingScene = ({ onComplete }: { onComplete: (name: string) => void }) => {
  const [hunterName, setHunterName] = useState("");
  const [knighted, setKnighted] = useState(false);

  const handleKnight = () => {
    if (!hunterName.trim()) return;
    setKnighted(true);
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
    setTimeout(() => onComplete(hunterName.trim()), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center px-6 space-y-6 min-h-[60vh]"
    >
      {!knighted ? (
        <>
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl"
          >
            ⚔️
          </motion.div>

          <div className="space-y-2 max-w-xs">
            <h2 className="font-heading font-bold text-lg text-primary-foreground">The Knighting Ceremony</h2>
            <p className="text-xs text-primary-foreground/60">
              Every legendary Hunter needs a name. What shall the Guild Books record?
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <Input
              value={hunterName}
              onChange={(e) => setHunterName(e.target.value)}
              placeholder="Enter your Hunter name..."
              className="text-center text-lg font-heading bg-foreground/30 border-plaque-gold/20 text-primary-foreground placeholder:text-primary-foreground/30"
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && handleKnight()}
            />
            <Button
              onClick={handleKnight}
              disabled={!hunterName.trim()}
              className="w-full bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold gap-2 py-5 haptic-button disabled:opacity-30"
            >
              <Shield className="w-5 h-5" />
              Join the Guild
            </Button>
          </div>

          <p className="text-[10px] text-primary-foreground/30">
            Bring the device to the Guild Master (parent) to officially complete your induction.
          </p>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl"
          >
            👑
          </motion.div>
          <div className="space-y-2">
            <p className="text-[10px] text-plaque-gold uppercase tracking-[0.2em] font-bold">BY ORDER OF THE GUILD</p>
            <h2 className="font-heading font-bold text-2xl text-primary-foreground">
              {hunterName}
            </h2>
            <p className="text-sm text-plaque-gold font-bold">RANK: INITIATE HUNTER</p>
            <p className="text-xs text-primary-foreground/50 italic">
              "May your Saber stay sharp and your teeth stay clean."
            </p>
          </div>

          {/* Confetti particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{
                opacity: [1, 0],
                x: (Math.random() - 0.5) * 200,
                y: -Math.random() * 150 - 50,
              }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
              className="absolute text-lg pointer-events-none"
              style={{ left: "50%", top: "40%" }}
            >
              {["⚔️", "🛡️", "✨", "🦷", "👑", "⭐"][i % 6]}
            </motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main FTUE Controller                                               */
/* ------------------------------------------------------------------ */

const HunterFTUE = ({ onComplete }: HunterFTUEProps) => {
  const [phase, setPhase] = useState<Phase>("recruitment");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Low cinematic hum for recruitment
  useEffect(() => {
    if (phase !== "recruitment") return;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(55, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 8);
      osc.start();
      osc.stop(ctx.currentTime + 8);
      return () => { try { ctx.close(); } catch {} };
    } catch {}
  }, [phase]);

  const phases: Phase[] = ["recruitment", "calibration", "weapon", "sighting", "knighting"];
  const currentIdx = phases.indexOf(phase);

  return (
    <div className="min-h-screen bg-foreground relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground/95 to-foreground pointer-events-none">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(hsl(var(--plaque-gold) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--plaque-gold) / 0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
      </div>

      {/* Phase indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {phases.map((p, i) => (
          <div
            key={p}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentIdx ? "w-6 bg-plaque-gold" :
              i < currentIdx ? "w-2 bg-plaque-gold/40" : "w-2 bg-primary-foreground/10"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {phase === "recruitment" && (
            <RecruitmentScene key="recruit" onNext={() => setPhase("calibration")} />
          )}
          {phase === "calibration" && (
            <CalibrationScene key="calibrate" onNext={() => setPhase("weapon")} />
          )}
          {phase === "weapon" && (
            <WeaponSyncScene key="weapon" onNext={() => setPhase("sighting")} />
          )}
          {phase === "sighting" && (
            <FirstSightingScene key="sighting" onNext={() => setPhase("knighting")} />
          )}
          {phase === "knighting" && (
            <KnightingScene key="knight" onComplete={onComplete} />
          )}
        </AnimatePresence>
      </div>

      {/* Skip */}
      <button
        onClick={() => onComplete("Hunter")}
        className="absolute bottom-4 right-4 z-20 text-[10px] text-primary-foreground/20 hover:text-primary-foreground/40 transition-colors"
      >
        Skip →
      </button>
    </div>
  );
};

export default HunterFTUE;
