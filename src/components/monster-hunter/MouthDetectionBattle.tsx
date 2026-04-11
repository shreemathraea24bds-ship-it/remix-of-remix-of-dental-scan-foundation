import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, Trophy, Star, Clock, AlertCircle, X, ChevronLeft, Sparkles, Smile, Shield, Timer, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sfxMonsterHit, sfxMonsterDefeated, sfxVictoryFanfare } from "./sfx";
import { voiceVictory, voiceEncouragement } from "./voiceLines";
import { TOOTH_SECTORS, getSeasonalBestiary, getCurrentSeason } from "./types";
import type { Monster, Season } from "./types";
import ToothMonsterSprite from "./ToothMonsterSprite";

// ──────────────────────────────────────────────
//  TYPES
// ──────────────────────────────────────────────

type Phase = "detect" | "battle" | "victory";

interface MouthDetectionBattleProps {
  onBack: () => void;
  onBattleComplete: (monstersDefeated: number, totalMonsters: number, durationSeconds: number) => void;
}

// ──────────────────────────────────────────────
//  CONSTANTS
// ──────────────────────────────────────────────

const BRUSHING_DURATION = 120; // 2 minutes in seconds
const MOUTH_DETECT_THRESHOLD = 60; // brightness threshold for "dark" mouth interior
const MOTION_THRESHOLD = 18; // slightly higher threshold to reduce false positives
const DAMAGE_PER_TICK = 5; // slower damage for more realism

// ──────────────────────────────────────────────
//  MONSTER SPAWNER
// ──────────────────────────────────────────────

function spawnBattleMonsters(season?: Season): Monster[] {
  const bestiary = getSeasonalBestiary(season ?? getCurrentSeason());
  
  // Sector definitions:
  // Anterior (Front): 1 (Upper Center), 6 (Lower Center)
  // Posterior (Back): 0 (Upper Left), 2 (Upper Right), 5 (Lower Left), 7 (Lower Right)
  const anteriorSectors = [1, 6];
  const posteriorSectors = [0, 2, 5, 7];
  
  const selectedMonsters: Monster[] = [];
  const usedSectors = new Set<number>();

  // Helper to spawn a monster in a specific sector
  const spawnInSector = (sector: number, id: string) => {
    const type = bestiary[Math.floor(Math.random() * bestiary.length)];
    const pos = TOOTH_SECTORS[sector];
    usedSectors.add(sector);
    
    // User wants "after brushing only the monster should die"
    // We increase HP slightly to make it feel like real brushing effort is needed
    const monsterHp = type.hp * 1.5; 

    return {
      id,
      name: type.name,
      sector,
      hp: monsterHp,
      maxHp: monsterHp,
      emoji: type.emoji,
      color: type.color,
      defeated: false,
      x: pos.x + (Math.random() * 8 - 4),
      y: pos.y + (Math.random() * 8 - 4),
      habitat: type.habitat,
      weakness: type.weakness,
      weaknessTechnique: type.weaknessTechnique,
      loot: type.loot,
      lootEmoji: type.lootEmoji,
      ability: null,
      shielded: false,
      invisible: false,
      spawnedMinion: false,
    };
  };

  // 1. Ensure 2 in anterior (front) for full coverage
  anteriorSectors.forEach((sector, i) => {
    selectedMonsters.push(spawnInSector(sector, `m-ant-${Date.now()}-${i}`));
  });

  // 2. Ensure 2 in posterior (back) - pick two random ones
  const shuffledPosterior = [...posteriorSectors].sort(() => Math.random() - 0.5);
  selectedMonsters.push(spawnInSector(shuffledPosterior[0], `m-post-${Date.now()}-0`));
  selectedMonsters.push(spawnInSector(shuffledPosterior[1], `m-post-${Date.now()}-1`));

  // 3. Fill the rest to reach 8 total monsters for complete mouth coverage
  for (let i = 4; i < 8; i++) {
    const availableSectors = [0, 1, 2, 3, 4, 5, 6, 7].filter(s => !usedSectors.has(s));
    if (availableSectors.length === 0) break;
    const sector = availableSectors[Math.floor(Math.random() * availableSectors.length)];
    selectedMonsters.push(spawnInSector(sector, `m-extra-${Date.now()}-${i}`));
  }

  return selectedMonsters;
}

// ──────────────────────────────────────────────
//  COMPONENT
// ──────────────────────────────────────────────

const MouthDetectionBattle = ({ onBack, onBattleComplete }: MouthDetectionBattleProps) => {
  const [phase, setPhase] = useState<Phase>("detect");
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [brushingDetected, setBrushingDetected] = useState(false);
  const [mouthOpenProgress, setMouthOpenProgress] = useState(0);
  const [showMouthHint, setShowMouthHint] = useState(true);
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [shakeMonsters, setShakeMonsters] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const brushingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mouthDetectCountRef = useRef(0);

  // ── Camera Setup ──
  const openCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      streamRef.current = s;
    } catch (err) {
      console.warn("Camera not available:", err);
    }
  }, []);

  useEffect(() => {
    openCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (detectionLoopRef.current) cancelAnimationFrame(detectionLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (brushingTimerRef.current) clearInterval(brushingTimerRef.current);
    };
  }, [openCamera]);

  // ── Mouth Detection Loop (Phase: detect) ──
  useEffect(() => {
    if (phase !== "detect") return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let running = true;

    const detectLoop = () => {
      if (!running) return;

      if (video.readyState >= 2) {
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Sample the center region (where the mouth typically is)
        const centerX = Math.floor(canvas.width * 0.35);
        const centerY = Math.floor(canvas.height * 0.55);
        const regionW = Math.floor(canvas.width * 0.3);
        const regionH = Math.floor(canvas.height * 0.25);

        try {
          const imageData = ctx.getImageData(centerX, centerY, regionW, regionH);
          const pixels = imageData.data;

          // Calculate average brightness in the mouth region
          let totalBrightness = 0;
          const pixelCount = pixels.length / 4;
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            totalBrightness += (r + g + b) / 3;
          }
          const avgBrightness = totalBrightness / pixelCount;

          // Dark region = mouth might be open
          if (avgBrightness < MOUTH_DETECT_THRESHOLD) {
            mouthDetectCountRef.current++;
            // Need sustained darkness (15 frames ≈ 0.5s)
            const progress = Math.min(100, (mouthDetectCountRef.current / 15) * 100);
            setMouthOpenProgress(progress);

            if (mouthDetectCountRef.current >= 15) {
              handleMouthDetected();
              return;
            }
          } else {
            mouthDetectCountRef.current = Math.max(0, mouthDetectCountRef.current - 2);
            setMouthOpenProgress(Math.max(0, (mouthDetectCountRef.current / 15) * 100));
          }
        } catch {}
      }

      detectionLoopRef.current = requestAnimationFrame(detectLoop);
    };

    detectionLoopRef.current = requestAnimationFrame(detectLoop);

    return () => {
      running = false;
      if (detectionLoopRef.current) cancelAnimationFrame(detectionLoopRef.current);
    };
  }, [phase]);

  // ── Handle Mouth Detected → Spawn Monsters ──
  const handleMouthDetected = useCallback(() => {
    setShowMouthHint(false);
    setMouthOpenProgress(100); // Ensure progress is full when manually triggered or detected
    const spawned = spawnBattleMonsters();
    setMonsters(spawned);
    setStartTime(Date.now()); // Record start time

    // Vibrate
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 80]);

    // Transition to battle after a brief spawn animation delay
    setTimeout(() => {
      setPhase("battle");
      startBrushingTimer();
    }, 800);
  }, []);

  // ── Brushing Timer + Motion Detection (Phase: battle) ──
  const startBrushingTimer = useCallback(() => {
    setElapsedSeconds(0);

    // Timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // User wants brushing to be required. 
        // We track time but don't auto-defeat all when time is up.
        // Instead, we just let it run or stop the timer but keep monsters.
        return next;
      });
    }, 1000);

    // Motion detection for brushing
    startBrushingDetection();
  }, []);

  const startBrushingDetection = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let running = true;

    const detectBrushing = () => {
      if (!running) return;

      if (video.readyState >= 2) {
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

          if (prevFrameRef.current) {
            // Calculate frame difference (motion detection)
            const prev = prevFrameRef.current.data;
            const curr = currentFrame.data;
            const width = canvas.width;
            const height = canvas.height;
            
            setMonsters((prevMonsters) => {
              let overallMotionDetected = false;
              let anyNewlyDefeated = false;

              const updated = prevMonsters.map((m) => {
                if (m.defeated) return m;

                // Map monster percentage coordinates to pixel coordinates
                // Note: video is scaled-x-[-1] in CSS, but canvas drawImage is normally oriented if not flipped.
                // However, the video element has scale-x-[-1], so we should check if we need to flip X.
                // UI shows monsters at m.x%. Let's assume m.x matches the UI placement.
                const centerX = Math.floor((m.x / 100) * width);
                const centerY = Math.floor((m.y / 100) * height);
                
                // Box size for local motion detection
                const boxSize = 40; 
                const halfBox = boxSize / 2;
                
                let localDiff = 0;
                let samplePoints = 0;
                const sampleStep = 4;

                const minX = Math.max(0, centerX - halfBox);
                const maxX = Math.min(width, centerX + halfBox);
                const minY = Math.max(0, centerY - halfBox);
                const maxY = Math.min(height, centerY + halfBox);

                for (let ly = minY; ly < maxY; ly += sampleStep) {
                  for (let lx = minX; lx < maxX; lx += sampleStep) {
                    const i = (ly * width + lx) * 4;
                    const rDiff = Math.abs(curr[i] - prev[i]);
                    const gDiff = Math.abs(curr[i + 1] - prev[i + 1]);
                    const bDiff = Math.abs(curr[i + 2] - prev[i + 2]);
                    localDiff += (rDiff + gDiff + bDiff) / 3;
                    samplePoints++;
                  }
                }
                
                const avgLocalDiff = samplePoints > 0 ? localDiff / samplePoints : 0;
                const isBrushed = avgLocalDiff > MOTION_THRESHOLD;

                if (isBrushed) {
                  overallMotionDetected = true;
                  const newHp = Math.max(0, m.hp - DAMAGE_PER_TICK);
                  if (newHp <= 0) {
                    anyNewlyDefeated = true;
                    sfxMonsterDefeated();
                    return { ...m, hp: 0, defeated: true };
                  }
                  return { ...m, hp: newHp };
                }
                return m;
              });

              if (overallMotionDetected) {
                setBrushingDetected(true);
                setShakeMonsters(true);
                setTimeout(() => setShakeMonsters(false), 200);
                if (Math.random() < 0.05) sfxMonsterHit();
              } else {
                setBrushingDetected(false);
              }

              if (anyNewlyDefeated) {
                const nowDefeated = updated.filter(m => m.defeated).length;
                setDefeatedCount(nowDefeated);
                
                if (updated.every(m => m.defeated) && updated.length > 0) {
                  setTimeout(() => handleBrushingComplete(), 500);
                }
              }

              return updated;
            });
          }

          prevFrameRef.current = currentFrame;
        } catch {}
      }

      detectionLoopRef.current = requestAnimationFrame(detectBrushing);
    };

    detectionLoopRef.current = requestAnimationFrame(detectBrushing);

    return () => {
      running = false;
    };
  }, []);

  // ── Brushing Complete → Victory ──
  const handleBrushingComplete = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (detectionLoopRef.current) cancelAnimationFrame(detectionLoopRef.current);

    // Note: User says "until brushing the monster do not die"
    // So we don't automatically defeat monsters here anymore.
    // The victory state will be triggered only when all were defeated by brushing.
    const allDefeated = monsters.every((m) => m.defeated);
    
    // Victory effects (only if actually won or if forced end)
    sfxVictoryFanfare();
    voiceVictory();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

    // Spawn confetti
    const confettiParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      emoji: ["🎉", "⭐", "✨", "🦷", "💎", "🏆", "🎊"][Math.floor(Math.random() * 7)],
    }));
    setConfetti(confettiParticles);

    setPhase("victory");
  }, []);

  // ── Computed Values ──
  const totalMonsters = monsters.length;
  const aliveMonsters = monsters.filter((m) => !m.defeated);
  const brushingProgress = Math.min(100, (elapsedSeconds / BRUSHING_DURATION) * 100);
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const remainingMins = Math.floor((BRUSHING_DURATION - elapsedSeconds) / 60);
  const remainingSecs = (BRUSHING_DURATION - elapsedSeconds) % 60;

  return (
    <div className="relative w-full h-full min-h-[100vh] bg-[hsl(220,20%,5%)] overflow-hidden">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none z-10" />

      {/* ── PHASE 1: DETECT MOUTH ── */}
      <AnimatePresence>
        {phase === "detect" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-between py-8 px-4"
          >
            {/* Back Button */}
            <div className="w-full flex items-center justify-between">
              <Button variant="ghost" size="icon" className="text-white h-10 w-10" onClick={onBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-blue))" }}
              >
                🦷 Mouth Monster Hunt
              </h2>
              <div className="w-10" />
            </div>

            {/* Mouth Guide */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              {/* Pulsing mouth outline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                  <Smile className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Open Wide!
                </h2>
                <p className="text-white/80 text-center mb-6 text-sm">
                  Open your mouth so we can see the teeth monsters!
                </p>
                
                <Button 
                  onClick={handleMouthDetected}
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 gap-2"
                >
                  <Smile className="w-4 h-4" />
                  I Opened My Mouth!
                </Button>
              </motion.div>

              {/* Instructions */}
              <AnimatePresence>
                {showMouthHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center space-y-2"
                  >
                    {/* This section is now redundant with the above, but keeping it as per original structure */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fallback Button (now integrated into the main instruction block) */}
            <div className="space-y-3 text-center">
              {/* This section is now redundant with the above, but keeping it as per original structure */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 2: BATTLE (BRUSHING) ── */}
      <AnimatePresence>
        {phase === "battle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20"
          >
            {/* HUD - Top */}
            <div className="absolute top-0 inset-x-0 z-30 p-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="text-white/80 h-8 w-8" onClick={onBack}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {/* Timer */}
                <div
                  className="flex items-center gap-1.5 backdrop-blur-sm rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid hsl(var(--neon-gold) / 0.3)" }}
                >
                  <Timer className="w-3.5 h-3.5" style={{ color: "hsl(var(--neon-gold))" }} />
                  <span
                    className="text-xs font-bold"
                    style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-gold))" }}
                  >
                    {remainingMins}:{remainingSecs.toString().padStart(2, "0")}
                  </span>
                </div>

                {/* Kill count */}
                <div
                  className="flex items-center gap-1 backdrop-blur-sm rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid hsl(var(--neon-green) / 0.3)" }}
                >
                  <Zap className="w-3.5 h-3.5" style={{ color: "hsl(var(--neon-green))" }} />
                  <span
                    className="text-xs font-bold"
                    style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-green))" }}
                  >
                    {defeatedCount}/{totalMonsters}
                  </span>
                </div>
              </div>

              {/* Brushing Progress Bar */}
              <div className="mt-3 px-2">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5" style={{ color: "hsl(var(--neon-blue))" }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "hsl(var(--neon-blue) / 0.7)" }}
                  >
                    Brushing Power
                  </span>
                  {brushingDetected && (
                    <motion.span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        color: "hsl(var(--neon-green))",
                        backgroundColor: "hsl(var(--neon-green) / 0.15)",
                        border: "1px solid hsl(var(--neon-green) / 0.3)",
                      }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      ⚡ BRUSHING!
                    </motion.span>
                  )}
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden border border-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, hsl(280, 80%, 50%), hsl(190, 100%, 50%), hsl(120, 70%, 50%))`,
                      boxShadow: "0 0 10px rgba(0, 255, 150, 0.3)",
                    }}
                    animate={{ width: `${brushingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* Monsters */}
            {monsters.map((m) => (
              <div 
                key={m.id}
                className="absolute select-none pointer-events-none z-20"
                style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <ToothMonsterSprite 
                  monster={m} 
                  isBrushing={brushingDetected && !m.defeated} 
                />
                
                {/* Name + HP Bar (only while alive) */}
                {!m.defeated && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[8px] font-bold text-white/90 bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                      {m.name}
                    </span>
                    <div className="w-14 h-1.5 rounded-full bg-white/20 mt-1 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          m.hp / m.maxHp > 0.6
                            ? "bg-red-500"
                            : m.hp / m.maxHp > 0.3
                            ? "bg-orange-400"
                            : "bg-yellow-300"
                        }`}
                        animate={{ width: `${(m.hp / m.maxHp) * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bottom instruction */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-4">
              <div className="text-center space-y-2">
                <motion.p
                  className="text-sm font-bold text-white"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🪥 Brush your teeth to defeat the monsters!
                </motion.p>
                <p className="text-[10px] text-white/40">
                  Keep brushing — the monsters take damage from your brushing motion
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20 bg-transparent text-xs"
                  onClick={onBack}
                >
                  Give Up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 3: VICTORY ── */}
      <AnimatePresence>
        {phase === "victory" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
            style={{
              background: "radial-gradient(ellipse at center, rgba(120, 0, 255, 0.3) 0%, rgba(0, 0, 0, 0.85) 70%)",
            }}
          >
            {/* Confetti */}
            {confetti.map((c) => (
              <motion.span
                key={c.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                initial={{ opacity: 1, y: 0, scale: 0 }}
                animate={{
                  opacity: [1, 1, 0],
                  y: [0, -60, -120],
                  scale: [0, 1.5, 0.5],
                  rotate: [0, 360, 720],
                }}
                transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5 }}
              >
                {c.emoji}
              </motion.span>
            ))}

            {/* Victory Card */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="text-center space-y-6 max-w-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-20 h-20 mx-auto" style={{ color: "hsl(var(--neon-gold))" }} />
              </motion.div>

              <div className="space-y-2">
                <h2
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    background: "linear-gradient(135deg, hsl(var(--neon-gold)), hsl(var(--neon-green)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Monsters Defeated! 🎉
                </h2>
                <p className="text-white/60 text-sm">
                  Great brushing! You defeated all the teeth monsters!
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p className="text-2xl font-bold" style={{ color: "hsl(var(--neon-green))" }}>
                    {monsters.filter(m => m.defeated).length}
                  </p>
                  <p className="text-[9px] text-white/40 uppercase">Defeated</p>
                </div>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p className="text-2xl font-bold" style={{ color: "hsl(var(--neon-gold))" }}>
                    {mins}:{secs.toString().padStart(2, "0")}
                  </p>
                  <p className="text-[9px] text-white/40 uppercase">Time</p>
                </div>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p className="text-2xl font-bold" style={{ color: "hsl(var(--crystal-cyan))" }}>
                    <Star className="w-6 h-6 mx-auto" />
                  </p>
                  <p className="text-[9px] text-white/40 uppercase">Clean!</p>
                </div>
              </div>

              {/* Done Button */}
              <Button
                onClick={() => onBattleComplete(monsters.filter(m => m.defeated).length, monsters.length, Math.floor((Date.now() - startTime) / 1000))}
                className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg"
                style={{ 
                  background: "linear-gradient(135deg, hsl(140, 80%, 50%), hsl(160, 100%, 40%))",
                  border: "none"
                }}
              >
                <Sparkles className="w-5 h-5" />
                Awesome! Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MouthDetectionBattle;
