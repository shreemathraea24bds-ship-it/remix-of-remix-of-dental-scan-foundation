import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearCrystalVictoryProps {
  active: boolean;
  defeatedCount: number;
  totalMonsters: number;
  elapsedSeconds: number;
  lootDrops: string[];
  onComplete: () => void;
  onClaimBounty?: () => Promise<boolean> | boolean;
}

const SPARKLE_COUNT = 24;
const ORB_COUNT = 16;

function generateSparkles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    size: 4 + Math.random() * 8,
    duration: 1.5 + Math.random() * 2,
  }));
}

function generateOrbs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i,
    radius: 60 + Math.random() * 40,
    delay: i * 0.15,
    size: 6 + Math.random() * 10,
  }));
}

const ClearCrystalVictory = ({
  active, defeatedCount, totalMonsters, elapsedSeconds, lootDrops, onComplete, onClaimBounty,
}: ClearCrystalVictoryProps) => {
  const [phase, setPhase] = useState<"idle" | "charge" | "crystal" | "sparkle" | "done">("idle");
  const [bountyClaimed, setBountyClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const sparkles = generateSparkles(SPARKLE_COUNT);
  const orbs = generateOrbs(ORB_COUNT);

  const playTone = useCallback((freq: number, dur: number, type: OscillatorType = "sine") => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }, []);

  const playVictoryChime = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.6, "sine"), i * 200);
    });
  }, [playTone]);

  const playMagicShimmer = useCallback(() => {
    [1200, 1400, 1600, 1800, 2000].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.3, "triangle"), i * 100);
    });
  }, [playTone]);

  const playBountySound = useCallback(() => {
    [880, 1100, 1320, 1760].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.4, "sine"), i * 120);
    });
  }, [playTone]);

  const handleClaimBounty = async () => {
    if (claiming || bountyClaimed) return;
    setClaiming(true);
    try {
      const result = onClaimBounty ? await onClaimBounty() : true;
      if (result) {
        setBountyClaimed(true);
        playBountySound();
        try { navigator.vibrate?.([100, 80, 200]); } catch {}
      }
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    if (!active) { setPhase("idle"); setBountyClaimed(false); return; }
    setPhase("charge");
    try { navigator.vibrate?.([100, 50, 100, 50, 200]); } catch {}
    playVictoryChime();

    const t1 = setTimeout(() => { setPhase("crystal"); playMagicShimmer(); }, 1200);
    const t2 = setTimeout(() => { setPhase("sparkle"); try { navigator.vibrate?.([50, 30, 50, 30, 50, 30, 150]); } catch {} }, 3000);
    const t3 = setTimeout(() => setPhase("done"), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active, playVictoryChime, playMagicShimmer]);

  if (!active && phase === "idle") return null;

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          onClick={phase === "done" || phase === "sparkle" ? onComplete : undefined}
        >
          {/* Dark overlay with neon gradient */}
          <motion.div
            className="absolute inset-0"
            initial={{ background: "rgba(0,0,0,0.6)" }}
            animate={{
              background: phase === "crystal" || phase === "sparkle" || phase === "done"
                ? "radial-gradient(circle at 50% 45%, hsl(185 100% 60% / 0.15), hsl(210 100% 60% / 0.08), rgba(0,0,0,0.85))"
                : "rgba(0,0,0,0.8)",
            }}
            transition={{ duration: 1.5 }}
          />

          {/* Orbiting energy orbs */}
          {(phase === "crystal" || phase === "sparkle" || phase === "done") && orbs.map((orb) => (
            <motion.div
              key={orb.id}
              className="absolute rounded-full"
              style={{
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, hsl(185 100% 80%), hsl(210 100% 60%))`,
                boxShadow: `0 0 ${orb.size * 2}px hsl(185 100% 60% / 0.6)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0.4, 0.8],
                scale: [0, 1, 0.8, 1],
                x: [0, Math.cos((orb.angle * Math.PI) / 180) * orb.radius],
                y: [0, Math.sin((orb.angle * Math.PI) / 180) * orb.radius],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                delay: orb.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Sparkle field */}
          {(phase === "sparkle" || phase === "done") && sparkles.map((s) => (
            <motion.div
              key={s.id}
              className="absolute pointer-events-none"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
              }}
            >
              <span style={{ fontSize: s.size }}>✦</span>
            </motion.div>
          ))}

          {/* Charge phase - energy gathering */}
          {phase === "charge" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 1.5], opacity: [0, 0.8, 0.4] }}
              transition={{ duration: 1.2 }}
              className="absolute w-32 h-32 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(185 100% 60% / 0.4), transparent)",
                boxShadow: "0 0 60px hsl(185 100% 60% / 0.5), 0 0 120px hsl(210 100% 60% / 0.3)",
              }}
            />
          )}

          {/* THE CLEAR CRYSTAL */}
          {(phase === "crystal" || phase === "sparkle" || phase === "done") && (
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{
                scale: phase === "sparkle" || phase === "done" ? [1, 1.08, 1] : 1,
                rotate: 0,
                opacity: 1,
              }}
              transition={
                phase === "sparkle" || phase === "done"
                  ? { scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 0.8 } }
                  : { duration: 0.8, type: "spring" }
              }
              className="relative z-10 flex flex-col items-center"
            >
              {/* Crystal glow backdrop */}
              <div
                className="absolute -inset-16 rounded-full crystal-shimmer"
                style={{
                  background: "radial-gradient(circle, hsl(185 100% 60% / 0.3), hsl(210 100% 60% / 0.1), transparent)",
                }}
              />

              {/* Crystal emoji with neon glow */}
              <motion.div
                className="text-8xl sm:text-9xl relative"
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px hsl(185 100% 60% / 0.8))",
                    "drop-shadow(0 0 40px hsl(185 100% 60% / 1)) drop-shadow(0 0 80px hsl(210 100% 60% / 0.5))",
                    "drop-shadow(0 0 20px hsl(185 100% 60% / 0.8))",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                💎
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-heading font-extrabold text-3xl sm:text-4xl mt-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-crystal-cyan to-neon-green neon-text-blue"
              >
                CLEAR CRYSTAL
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-crystal-cyan/80 font-medium mt-2"
              >
                ✨ Teeth Purified • All Monsters Banished ✨
              </motion.p>
            </motion.div>
          )}

          {/* Stats panel + Claim Bounty */}
          {(phase === "sparkle" || phase === "done") && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 mt-8 space-y-4 text-center max-w-xs mx-auto"
            >
              {/* Stats row */}
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neon-gold neon-text-gold">{defeatedCount}/{totalMonsters}</p>
                  <p className="text-[10px] text-neon-gold/60 uppercase tracking-wider">Monsters</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neon-green">{mins}:{secs.toString().padStart(2, "0")}</p>
                  <p className="text-[10px] text-neon-green/60 uppercase tracking-wider">Time</p>
                </div>
              </div>

              {/* Loot collected */}
              {lootDrops.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-crystal-cyan/50 uppercase tracking-widest">Loot Collected</p>
                  <div className="flex justify-center gap-2 text-2xl">
                    {lootDrops.map((e, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                      >
                        {e}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Claim Bounty Button */}
              {onClaimBounty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    onClick={handleClaimBounty}
                    disabled={claiming || bountyClaimed}
                    className={`w-full py-6 text-lg font-bold rounded-xl gap-3 transition-all ${
                      bountyClaimed
                        ? "bg-neon-green/20 text-neon-green border border-neon-green/40"
                        : "bg-gradient-to-r from-neon-gold via-neon-gold to-neon-green text-black neon-glow-gold hover:scale-105"
                    }`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {bountyClaimed ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Bounty Claimed!
                      </>
                    ) : claiming ? (
                      <>
                        <Send className="w-5 h-5 animate-pulse" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Gift className="w-6 h-6" />
                        Claim Bounty
                      </>
                    )}
                  </Button>
                  {bountyClaimed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-neon-green/60 mt-2"
                    >
                      📨 Notification sent to Guild Master!
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Tap to continue */}
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-crystal-cyan/50 pt-2"
              >
                Tap anywhere to continue
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClearCrystalVictory;
