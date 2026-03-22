import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ABILITY_INFO } from "./types";
import type { Monster } from "./types";

interface MonsterSpriteProps {
  monster: Monster;
  onAttack: (id: string, damage: number) => void;
  hasLightningEffect?: boolean;
  blockModeActive?: boolean;
}

const MonsterSprite = ({ monster, onAttack, hasLightningEffect, blockModeActive }: MonsterSpriteProps) => {
  const [pressing, setPressing] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [showTechnique, setShowTechnique] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const techniqueTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show weakness technique hint on first press
  useEffect(() => {
    if (pressing && !showTechnique && !monster.defeated) {
      setShowTechnique(true);
      techniqueTimerRef.current = setTimeout(() => setShowTechnique(false), 2500);
    }
    return () => { if (techniqueTimerRef.current) clearTimeout(techniqueTimerRef.current); };
  }, [pressing]);

  // Hold-to-attack
  useEffect(() => {
    if (pressing && !monster.defeated) {
      intervalRef.current = setInterval(() => {
        onAttack(monster.id, 12);
        const particleEmoji = hasLightningEffect ? "⚡" : "✨";
        setParticles((p) => [...p, {
          id: Date.now() + Math.random(),
          x: Math.random() * 50 - 25,
          y: Math.random() * -40 - 10,
          emoji: particleEmoji,
        }]);
      }, 300);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [pressing, monster.defeated, monster.id, onAttack, hasLightningEffect]);

  // Clean up particles
  useEffect(() => {
    if (particles.length > 0) {
      const t = setTimeout(() => setParticles((p) => p.slice(1)), 400);
      return () => clearTimeout(t);
    }
  }, [particles]);

  const hpPercent = (monster.hp / monster.maxHp) * 100;
  const hpColor = hpPercent > 60 ? "bg-scan-green" : hpPercent > 30 ? "bg-monitor-amber" : "bg-urgency-red";
  const abilityInfo = monster.ability ? ABILITY_INFO[monster.ability] : null;

  return (
    <AnimatePresence>
      {!monster.defeated ? (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: pressing ? 0.85 : [1, 1.08, 1],
            opacity: monster.invisible ? 0.15 : 1,
          }}
          exit={{ scale: 2.5, opacity: 0, rotate: 360 }}
          transition={pressing ? { duration: 0.1 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute flex flex-col items-center select-none touch-none cursor-pointer z-20"
          style={{ left: `${monster.x}%`, top: `${monster.y}%`, transform: "translate(-50%, -50%)" }}
          onPointerDown={() => setPressing(true)}
          onPointerUp={() => setPressing(false)}
          onPointerLeave={() => setPressing(false)}
          onPointerCancel={() => setPressing(false)}
        >
          {/* Ability badge */}
          {abilityInfo && (
            <motion.span
              className="text-[10px] bg-foreground/50 backdrop-blur-sm text-primary-foreground px-1.5 py-0.5 rounded-full mb-0.5 whitespace-nowrap"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {abilityInfo.emoji} {abilityInfo.name}
            </motion.span>
          )}

          {/* HP bar */}
          <div className="w-14 h-1.5 rounded-full bg-foreground/30 mb-1 overflow-hidden">
            <motion.div className={`h-full rounded-full ${hpColor}`} animate={{ width: `${hpPercent}%` }} transition={{ duration: 0.2 }} />
          </div>

          {/* Bubble Shield visual */}
          {monster.shielded && (
            <motion.div
              className="absolute -inset-3 rounded-full border-2 border-primary/40 bg-primary/5"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Block Mode shield (anti-cheat) */}
          {blockModeActive && !monster.defeated && (
            <motion.div
              className="absolute -inset-4 rounded-full border-2 border-urgency-red/50 bg-urgency-red/10"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-urgency-red bg-foreground/70 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                🛡️ BLOCKED!
              </span>
            </motion.div>
          )}

          {/* Monster emoji */}
          <motion.span
            className="text-4xl sm:text-5xl drop-shadow-lg"
            animate={pressing ? { rotate: [0, -15, 15, -15, 0] } : {}}
            transition={{ duration: 0.25, repeat: pressing ? Infinity : 0 }}
          >
            {monster.emoji}
          </motion.span>

          {/* Name + habitat */}
          <span className="text-[8px] font-bold text-primary-foreground/90 mt-0.5 bg-foreground/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
            {monster.name}
          </span>
          <span className="text-[7px] text-primary-foreground/50 whitespace-nowrap">
            📍 {monster.habitat}
          </span>

          {/* Technique hint */}
          <AnimatePresence>
            {showTechnique && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute -bottom-10 bg-foreground/70 backdrop-blur-md text-primary-foreground px-2 py-1 rounded-lg whitespace-nowrap z-30"
              >
                <p className="text-[9px] font-bold">⚔️ Use: {monster.weakness}</p>
                <p className="text-[8px] text-primary-foreground/60">{monster.weaknessTechnique}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particles */}
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.5 }}
              transition={{ duration: 0.4 }}
              className="absolute text-lg pointer-events-none"
            >
              {p.emoji}
            </motion.span>
          ))}
        </motion.div>
      ) : (
        /* Defeat animation + loot drop */
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1.5, 2], opacity: [1, 0], rotate: [0, 180] }}
          transition={{ duration: 0.6 }}
          className="absolute flex flex-col items-center pointer-events-none z-20"
          style={{ left: `${monster.x}%`, top: `${monster.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <span className="text-5xl">💥</span>
          {monster.lootEmoji && (
            <motion.span
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: -40 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute text-2xl"
            >
              {monster.lootEmoji}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonsterSprite;
