import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LootDropCeremonyProps {
  active: boolean;
  hunterName: string;
  guildMasterName: string;
  rewardDescription: string;
  milestone: number;
  rankTitle: string;
  lastMonsterEmoji: string;
  lastMonsterName: string;
  onComplete: () => void;
}

type Phase = "idle" | "fanfare" | "banishment" | "decree" | "reveal" | "done";

const PHASE_DURATIONS: Record<Phase, number> = {
  idle: 0,
  fanfare: 2500,
  banishment: 2500,
  decree: 2500,
  reveal: 3000,
  done: 0,
};

// Generate confetti particles
function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 8 + Math.random() * 16,
    rotation: Math.random() * 720 - 360,
    emoji: ["🦷", "✨", "⭐", "💎", "🛡️"][Math.floor(Math.random() * 5)],
  }));
}

// Generate XP orbs
function generateOrbs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: 50 + (Math.random() * 40 - 20),
    startY: 50 + (Math.random() * 30 - 15),
    delay: Math.random() * 0.8,
  }));
}

const LootDropCeremony = ({
  active,
  hunterName,
  guildMasterName,
  rewardDescription,
  milestone,
  rankTitle,
  lastMonsterEmoji,
  lastMonsterName,
  onComplete,
}: LootDropCeremonyProps) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [confetti] = useState(() => generateConfetti(40));
  const [orbs] = useState(() => generateOrbs(25));
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio helper
  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = "square") => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  // Victory fanfare melody
  const playFanfare = useCallback(() => {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.4, "square"), i * 200);
    });
  }, [playTone]);

  // Shatter sound
  const playShatter = useCallback(() => {
    playTone(200, 0.15, "sawtooth");
    setTimeout(() => playTone(150, 0.2, "sawtooth"), 100);
    setTimeout(() => playTone(100, 0.3, "sawtooth"), 200);
  }, [playTone]);

  // Chest open sound
  const playChestOpen = useCallback(() => {
    playTone(400, 0.1, "square");
    setTimeout(() => playTone(600, 0.1, "square"), 100);
    setTimeout(() => playTone(800, 0.15, "square"), 200);
    setTimeout(() => playTone(1200, 0.3, "sine"), 300);
  }, [playTone]);

  // Haptic feedback
  const hapticPulse = useCallback((pattern: number[]) => {
    try { navigator.vibrate?.(pattern); } catch {}
  }, []);

  // Phase sequencer
  useEffect(() => {
    if (!active) {
      setPhase("idle");
      return;
    }

    setPhase("fanfare");
    playFanfare();
    hapticPulse([50, 30, 50]);

    const timers: NodeJS.Timeout[] = [];

    // Phase 2: Banishment
    timers.push(setTimeout(() => {
      setPhase("banishment");
      playShatter();
      hapticPulse([30, 20, 30, 20, 60]);
    }, PHASE_DURATIONS.fanfare));

    // Phase 3: Decree
    timers.push(setTimeout(() => {
      setPhase("decree");
      hapticPulse([40]);
    }, PHASE_DURATIONS.fanfare + PHASE_DURATIONS.banishment));

    // Phase 4: Reveal
    timers.push(setTimeout(() => {
      setPhase("reveal");
      playChestOpen();
      hapticPulse([100, 50, 100, 50, 200]); // heartbeat pattern
    }, PHASE_DURATIONS.fanfare + PHASE_DURATIONS.banishment + PHASE_DURATIONS.decree));

    // Complete
    timers.push(setTimeout(() => {
      setPhase("done");
      onComplete();
    }, PHASE_DURATIONS.fanfare + PHASE_DURATIONS.banishment + PHASE_DURATIONS.decree + PHASE_DURATIONS.reveal));

    return () => timers.forEach(clearTimeout);
  }, [active, playFanfare, playShatter, playChestOpen, hapticPulse, onComplete]);

  if (!active && phase === "idle") return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: phase === "fanfare"
                ? "radial-gradient(circle, hsl(45 90% 15% / 0.95) 0%, hsl(220 30% 8% / 0.98) 100%)"
                : phase === "banishment"
                ? "radial-gradient(circle, hsl(220 60% 15% / 0.95) 0%, hsl(220 30% 5% / 0.98) 100%)"
                : phase === "decree"
                ? "radial-gradient(circle, hsl(30 50% 12% / 0.95) 0%, hsl(220 30% 5% / 0.98) 100%)"
                : "radial-gradient(circle, hsl(45 80% 20% / 0.95) 0%, hsl(220 30% 5% / 0.98) 100%)",
            }}
            transition={{ duration: 0.8 }}
          />

          {/* === PHASE 1: FANFARE === */}
          <AnimatePresence>
            {phase === "fanfare" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
              >
                {/* Golden ripple rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border-2 border-[hsl(45,80%,55%)]"
                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                    animate={{ width: 600, height: 600, opacity: 0 }}
                    transition={{ duration: 2, delay: i * 0.4, ease: "easeOut" }}
                  />
                ))}

                <motion.h1
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: [0, 1.3, 1], rotate: 0 }}
                  transition={{ duration: 0.6, ease: "backOut" }}
                  className="font-heading font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-[hsl(45,90%,65%)] to-[hsl(35,80%,45%)] drop-shadow-lg text-center px-4"
                  style={{ textShadow: "0 0 40px hsl(45 90% 50% / 0.5)" }}
                >
                  ⚔️ SIEGE SUCCESSFUL! ⚔️
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-[hsl(45,50%,70%)] mt-3"
                >
                  {milestone}-Day Frontier Secured
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === PHASE 2: MONSTER BANISHMENT === */}
          <AnimatePresence>
            {phase === "banishment" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
              >
                {/* Monster turning to stone and shattering */}
                <motion.div className="relative">
                  <motion.span
                    className="text-7xl block"
                    initial={{ scale: 1, filter: "grayscale(0)" }}
                    animate={{
                      scale: [1, 1.2, 1.2, 0],
                      filter: ["grayscale(0)", "grayscale(0)", "grayscale(1)", "grayscale(1)"],
                      opacity: [1, 1, 0.7, 0],
                    }}
                    transition={{ duration: 1.5, times: [0, 0.3, 0.6, 1] }}
                  >
                    {lastMonsterEmoji}
                  </motion.span>

                  {/* Shatter fragments */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm bg-[hsl(220,40%,60%)]"
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0.3],
                        rotate: Math.random() * 360,
                      }}
                      transition={{ duration: 1, delay: 0.8 + Math.random() * 0.3 }}
                    />
                  ))}
                </motion.div>

                {/* XP Orbs flying to top */}
                {orbs.map((orb) => (
                  <motion.div
                    key={orb.id}
                    className="absolute w-2.5 h-2.5 rounded-full bg-[hsl(200,80%,60%)] shadow-[0_0_8px_hsl(200,80%,60%)]"
                    style={{ left: `${orb.startX}%`, top: `${orb.startY}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1, 0.8, 0],
                      x: `${50 - orb.startX}vw`,
                      y: "-40vh",
                    }}
                    transition={{ duration: 1.2, delay: 1 + orb.delay, ease: "easeIn" }}
                  />
                ))}

                {/* XP Bar glow at top */}
                <motion.div
                  className="absolute top-0 inset-x-0 h-2"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0, 1, 0.5],
                    boxShadow: [
                      "0 0 0 transparent",
                      "0 0 0 transparent",
                      "0 0 30px hsl(200 80% 60%), 0 0 60px hsl(45 90% 50%)",
                      "0 0 15px hsl(45 90% 50%)",
                    ],
                  }}
                  transition={{ duration: 2, times: [0, 0.5, 0.8, 1] }}
                  style={{ background: "linear-gradient(90deg, hsl(200 80% 60%), hsl(45 90% 50%))" }}
                />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-[hsl(220,40%,70%)] mt-6"
                >
                  {lastMonsterName} has been banished!
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === PHASE 3: GUILD MASTER'S DECREE === */}
          <AnimatePresence>
            {phase === "decree" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6"
              >
                {/* Scroll unfurl */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "backOut" }}
                  className="w-full max-w-xs rounded-2xl border-2 border-[hsl(35,60%,40%)] bg-gradient-to-b from-[hsl(40,30%,90%)] to-[hsl(35,25%,80%)] p-6 space-y-3 shadow-2xl origin-top"
                >
                  {/* Guild Master icon */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(45,70%,50%)] to-[hsl(35,60%,40%)] flex items-center justify-center text-xl shadow-lg"
                    >
                      👑
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center space-y-2"
                  >
                    <p className="text-[10px] text-[hsl(35,30%,40%)] uppercase tracking-[0.15em] font-bold">
                      By Order of the Guild Master
                    </p>
                    <p className="text-sm font-bold text-[hsl(220,30%,20%)]">
                      {guildMasterName || "The Guild Master"}
                    </p>
                    <div className="border-t border-[hsl(35,40%,70%)] my-2" />
                    <p className="text-lg font-heading font-black text-[hsl(45,80%,35%)] uppercase">
                      THE {milestone}-DAY BOUNTY IS YOURS!
                    </p>
                  </motion.div>
                </motion.div>

                {/* Treasure chest drop */}
                <motion.div
                  initial={{ y: -200, opacity: 0 }}
                  animate={{ y: [null, 20, 0], opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5, type: "spring", bounce: 0.5 }}
                  className="text-6xl mt-4"
                >
                  🧰
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === PHASE 4: THE BIG REVEAL === */}
          <AnimatePresence>
            {phase === "reveal" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6"
              >
                {/* White flash */}
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Spinning badge */}
                <motion.div
                  initial={{ rotateY: 0, scale: 0 }}
                  animate={{ rotateY: 360, scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative"
                  style={{ perspective: "500px" }}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(45,90%,55%)] via-[hsl(35,80%,45%)] to-[hsl(45,90%,55%)] flex items-center justify-center shadow-[0_0_40px_hsl(45,80%,50%/0.5),0_0_80px_hsl(45,80%,50%/0.3)] border-4 border-[hsl(45,70%,65%)]">
                    <span className="text-5xl">🏆</span>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="font-heading font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-[hsl(45,90%,65%)] to-[hsl(35,70%,50%)] mt-4 uppercase tracking-wider text-center"
                >
                  {rankTitle}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-4 rounded-xl bg-[hsl(220,30%,12%)] border border-[hsl(45,60%,40%)] px-5 py-3 text-center space-y-1"
                >
                  <p className="text-[9px] text-[hsl(45,50%,60%)] uppercase tracking-[0.2em] font-bold">
                    Loot Acquired
                  </p>
                  <p className="text-sm font-bold text-[hsl(45,80%,70%)]">
                    {rewardDescription}
                  </p>
                </motion.div>

                {/* Confetti */}
                {confetti.map((c) => (
                  <motion.span
                    key={c.id}
                    className="absolute pointer-events-none"
                    style={{ left: `${c.x}%`, top: -20, fontSize: c.size }}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{
                      y: "110vh",
                      opacity: [0, 1, 1, 0.5],
                      rotate: c.rotation,
                      x: (Math.random() - 0.5) * 80,
                    }}
                    transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }}
                  >
                    {c.emoji}
                  </motion.span>
                ))}

                {/* Tap to close */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0, 0.5] }}
                  transition={{ duration: 2, delay: 1.5 }}
                  className="absolute bottom-8 text-[10px] text-[hsl(220,20%,50%)]"
                >
                  Tap anywhere to close
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tap to skip (after reveal) */}
          {phase === "reveal" && (
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={() => { setPhase("done"); onComplete(); }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LootDropCeremony;
