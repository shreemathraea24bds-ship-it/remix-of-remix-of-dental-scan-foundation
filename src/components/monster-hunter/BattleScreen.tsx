import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Timer, Zap, ArrowLeft, Trophy, BookOpen, Radar, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import MonsterSprite from "./MonsterSprite";
import CalibrationOverlay from "./CalibrationOverlay";
import ClearCrystalVictory from "./ClearCrystalVictory";
import type { Monster, Season, AntiCheatState } from "./types";
import { BESTIARY, getSeasonalBestiary, SEASONAL_SKINS, getCurrentSeason } from "./types";

interface BattleScreenProps {
  monsters: Monster[];
  isPlaying: boolean;
  elapsedSeconds: number;
  calibrated: boolean;
  lootDrops: string[];
  season?: Season;
  hasLightningEffect: boolean;
  hasGoldenBrush: boolean;
  antiCheat?: AntiCheatState;
  monsterTaunt?: string | null;
  rank?: { name: string; emoji: string };
  crystalShards?: number;
  onAttack: (id: string, damage: number) => void;
  onStart: () => void;
  onEnd: () => void;
  onCalibrate: () => void;
  onBack: () => void;
  onClaimBounty?: () => Promise<boolean> | boolean;
}

const BattleScreen = ({
  monsters, isPlaying, elapsedSeconds, calibrated, lootDrops, season,
  hasLightningEffect, hasGoldenBrush, antiCheat, monsterTaunt,
  rank, crystalShards,
  onAttack, onStart, onEnd, onCalibrate, onBack, onClaimBounty,
}: BattleScreenProps) => {
  const activeSeason = season ?? getCurrentSeason();
  const skin = SEASONAL_SKINS[activeSeason];
  const activeBestiary = getSeasonalBestiary(activeSeason);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showCrystal, setShowCrystal] = useState(false);

  const defeated = monsters.filter((m) => m.defeated).length;
  const total = monsters.length;
  const allDefeated = total > 0 && defeated === total;
  const hpPercent = total > 0 ? ((total - defeated) / total) * 100 : 100;

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  const openCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = s;
      setStream(s);
    } catch {}
  }, []);

  useEffect(() => {
    openCamera();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const handleStartFlow = () => {
    if (!calibrated) {
      setShowCalibration(true);
    } else {
      onStart();
    }
  };

  // Trigger crystal victory when all defeated
  useEffect(() => {
    if (allDefeated && isPlaying && !showCrystal) {
      setShowCrystal(true);
    }
  }, [allDefeated, isPlaying]);

  const handleCalibrationComplete = () => {
    setShowCalibration(false);
    onCalibrate();
    onStart();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[hsl(220,20%,5%)] rounded-2xl overflow-hidden border border-neon-blue/20 neon-glow-blue">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
      <div className={`absolute inset-0 bg-gradient-to-b ${activeSeason !== "default" ? skin.bgClass + " opacity-40" : "from-foreground/40 via-transparent to-foreground/60"} pointer-events-none z-10`} />

      {/* Season badge */}
      {activeSeason !== "default" && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <span className="text-[10px] bg-foreground/60 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            {skin.themeEmoji} {skin.label} Event
          </span>
        </div>
      )}

      {/* Calibration */}
      <AnimatePresence>
        {showCalibration && <CalibrationOverlay onComplete={handleCalibrationComplete} />}
      </AnimatePresence>

      {/* Monsters */}
      {isPlaying && monsters.map((m) => (
        <MonsterSprite key={m.id} monster={m} onAttack={onAttack} hasLightningEffect={hasLightningEffect} blockModeActive={antiCheat?.blockModeActive} />
      ))}

      {/* Monster Taunt Overlay */}
      <AnimatePresence>
        {monsterTaunt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-28 left-4 right-4 z-30 pointer-events-none"
          >
            <div className="bg-foreground/80 backdrop-blur-md rounded-2xl border border-urgency-red/30 px-4 py-3 text-center">
              <p className="text-sm font-bold text-urgency-red">{monsterTaunt}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD - Top */}
      <div className="absolute top-0 inset-x-0 z-20 p-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-primary-foreground/80 h-8 w-8" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {/* Rank badge */}
            {rank && (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-sm" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-green))", backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid hsl(var(--neon-green) / 0.3)" }}>
                {rank.emoji} {rank.name}
              </span>
            )}
            {/* Siege Timer */}
            <div className="flex items-center gap-1.5 backdrop-blur-sm rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid hsl(var(--neon-gold) / 0.3)" }}>
              <Timer className="w-3.5 h-3.5" style={{ color: "hsl(var(--neon-gold))" }} />
              <span className="text-xs font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-gold))" }}>
                {mins}:{secs.toString().padStart(2, "0")}
              </span>
            </div>
            {hasGoldenBrush && <span className="text-sm" title="Golden Brush active!">✨</span>}
          </div>
          <div className="flex items-center gap-2">
            {/* Crystal Shards */}
            {crystalShards !== undefined && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--crystal-cyan))", backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid hsl(var(--crystal-cyan) / 0.3)" }}>
                <Gem className="w-3 h-3" /> {crystalShards}
              </span>
            )}
            {/* Kill count */}
            <div className="flex items-center gap-1 backdrop-blur-sm rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid hsl(var(--neon-green) / 0.3)" }}>
              <Zap className="w-3.5 h-3.5" style={{ color: "hsl(var(--neon-green))" }} />
              <span className="text-xs font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-green))" }}>{defeated}/{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plaque HP Bar + Anti-cheat + Loot */}
      <div className="absolute top-14 inset-x-0 z-20 px-3">
        {isPlaying && (
          <div className="mt-1 px-2">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-urgency-red" />
              <span className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-wider">Plaque HP</span>
            </div>
            <div className="h-3 rounded-full bg-foreground/30 overflow-hidden border border-primary-foreground/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-urgency-red via-monitor-amb to-scan-green"
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {isPlaying && antiCheat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 px-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Radar className="w-3 h-3 text-primary-foreground/50" />
              <span className="text-[8px] font-bold text-primary-foreground/50 uppercase tracking-wider">Zone Coverage</span>
              {antiCheat.blockModeActive && (
                <span className="text-[8px] bg-urgency-red/30 text-urgency-red px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  🛡️ BLOCK MODE
                </span>
              )}
            </div>
            <div className="flex gap-0.5">
              {[0,1,2,3,4,5,6,7].map((sector) => {
                const hits = antiCheat.sectorHits[sector] || 0;
                return (
                  <div
                    key={sector}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      hits > 0 ? "bg-scan-green" : "bg-urgency-red/40 animate-pulse"
                    }`}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {lootDrops.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 justify-center mt-2">
            <span className="text-[9px] text-primary-foreground/50 uppercase tracking-wider">Loot:</span>
            {lootDrops.map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: i * 0.1 }}
                className="text-lg"
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Clear Crystal Victory */}
      <ClearCrystalVictory
        active={showCrystal}
        defeatedCount={defeated}
        totalMonsters={total}
        elapsedSeconds={elapsedSeconds}
        lootDrops={lootDrops}
        onComplete={() => { setShowCrystal(false); onEnd(); }}
        onClaimBounty={onClaimBounty}
      />

      {/* Bestiary overlay */}
      <AnimatePresence>
        {showBestiary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-foreground/90 backdrop-blur-sm overflow-y-auto p-4"
          >
            <div className="max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-primary-foreground">
                  📖 {activeSeason !== "default" ? `${skin.themeEmoji} ${skin.label}` : ""} Field Guide
                </h3>
                <Button variant="ghost" size="sm" className="text-primary-foreground/60" onClick={() => setShowBestiary(false)}>
                  Close
                </Button>
              </div>
              {activeBestiary.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-foreground/50 rounded-xl p-3 space-y-1.5 border border-primary-foreground/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{b.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-primary-foreground">{b.name}</p>
                      <p className="text-[10px] text-primary-foreground/50">📍 {b.habitatDetail}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[10px]">
                    <span className="text-primary-foreground/70">⚔️ <strong>{b.weakness}</strong>: {b.weaknessTechnique}</span>
                  </div>
                  <div className="text-[10px] text-primary-foreground/50">
                    🎁 Loot: {b.lootEmoji} {b.loot}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-4">
        {!isPlaying && !showCalibration && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center space-y-3">
            <h3 className="font-heading font-bold text-xl text-primary-foreground">
              {allDefeated ? "Great Job! 🦷" : "Ready to Fight Plaque?"}
            </h3>
            <p className="text-xs text-primary-foreground/60">
              {allDefeated ? "Come back tomorrow for another battle!" : "Tap and hold on monsters while you brush!"}
            </p>
            <div className="flex items-center justify-center gap-3">
              {!allDefeated && (
                <Button
                  onClick={handleStartFlow}
                  className="bg-gradient-to-r from-neon-gold to-neon-green text-black font-bold text-lg px-10 py-6 rounded-xl gap-2 neon-glow-gold"
                >
                  <Zap className="w-5 h-5" />
                  Start Battle!
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground/50 hover:text-primary-foreground h-12 w-12"
                onClick={() => setShowBestiary(true)}
                title="Bestiary"
              >
                <BookOpen className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
        {isPlaying && !allDefeated && (
          <div className="text-center">
            <p className="text-[10px] text-primary-foreground/50 mb-2">Tap & hold monsters to defeat them! Look for their weakness ⚔️</p>
            <Button variant="outline" size="sm" className="text-primary-foreground border-primary-foreground/20 bg-transparent" onClick={onEnd}>
              End Early
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleScreen;
