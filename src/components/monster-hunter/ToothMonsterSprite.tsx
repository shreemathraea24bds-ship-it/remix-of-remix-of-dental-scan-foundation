import { motion, AnimatePresence } from "framer-motion";
import molarMonster from "@/assets/monsters/molar_monster.png";
import incisorMonster from "@/assets/monsters/incisor_monster.png";
import type { Monster } from "./types";

interface ToothMonsterSpriteProps {
  monster: Monster;
  isBrushing: boolean;
  onDefeatedAnimationComplete?: () => void;
}

const ToothMonsterSprite = ({ monster, isBrushing, onDefeatedAnimationComplete }: ToothMonsterSpriteProps) => {
  // Determine asset based on sector
  // Anterior (Front): 1 (Upper Center), 6 (Lower Center)
  const isAnterior = monster.sector === 1 || monster.sector === 6;
  const asset = isAnterior ? incisorMonster : molarMonster;

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {!monster.defeated ? (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{
              scale: isBrushing ? [1, 0.92, 1.05, 1] : [1, 1.05, 1],
              opacity: 1,
              rotate: isBrushing ? [0, -5, 5, -5, 0] : 0,
            }}
            exit={{ scale: 2, opacity: 0, filter: "brightness(2) blur(10px)" }}
            transition={{
              duration: isBrushing ? 0.2 : 3,
              repeat: isBrushing ? Infinity : 0,
              ease: "easeInOut",
            }}
            className="relative w-24 h-24 sm:w-32 sm:h-32"
          >
            {/* The Monster Cave Asset */}
            <img
              src={asset}
              alt={monster.name}
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
            
            {/* Active Brushing Visual (Soap Bubbles / Glow) */}
            {isBrushing && (
              <motion.div
                className="absolute inset-x-0 bottom-4 flex justify-center gap-1 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex gap-1 animate-bounce">
                  <span className="text-xl">🫧</span>
                  <span className="text-lg opacity-70">🫧</span>
                  <span className="text-xl">🫧</span>
                </div>
              </motion.div>
            )}

            {/* Bubble Shield (If applicable from types) */}
            {monster.shielded && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-cyan-400/30 bg-cyan-400/10"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        ) : (
          /* Victory / Clean state */
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.5, 1], opacity: 1 }}
            onAnimationComplete={onDefeatedAnimationComplete}
            className="flex flex-col items-center"
          >
            <span className="text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">🦷✨</span>
            <motion.span
              animate={{ y: [-10, -30], opacity: [1, 0] }}
              className="text-white font-bold text-xs mt-2"
            >
              CLEAN!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToothMonsterSprite;
