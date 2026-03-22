import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Trophy } from "./types";

interface TrophyRoomProps {
  trophies: Trophy[];
  currentStreak: number;
  collectedLoot: string[];
}

const TrophyRoom = ({ trophies, currentStreak, collectedLoot }: TrophyRoomProps) => {
  const streakTrophies = trophies.filter((t) => t.category === "streak");
  const lootTrophies = trophies.filter((t) => t.category === "loot");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-heading font-bold text-lg text-foreground">Trophy Room 🏆</h3>
        <p className="text-xs text-muted-foreground">
          Current streak: <span className="font-bold text-plaque-gold">{currentStreak} days</span>
        </p>
      </div>

      {/* Streak Rewards */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">🔥 Streak Rewards</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {streakTrophies.map((trophy, i) => (
            <TrophyCard key={trophy.id} trophy={trophy} index={i} />
          ))}
        </div>
      </div>

      {/* Loot Collection */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">🎁 Monster Loot</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {lootTrophies.map((trophy, i) => (
            <TrophyCard key={trophy.id} trophy={trophy} index={i} />
          ))}
        </div>
      </div>

      {/* Collected loot summary */}
      {collectedLoot.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">All collected loot</p>
          <div className="flex flex-wrap justify-center gap-1">
            {collectedLoot.map((loot, i) => (
              <span key={i} className="text-xs bg-plaque-gold/10 text-foreground px-2 py-1 rounded-full border border-plaque-gold/20">
                {loot}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TrophyCard = ({ trophy, index }: { trophy: Trophy; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className={`relative rounded-xl p-4 text-center space-y-2 border transition-all ${
      trophy.unlocked
        ? "bg-plaque-gold/10 border-plaque-gold/30 shadow-card"
        : "bg-muted/30 border-border opacity-60"
    }`}
  >
    {!trophy.unlocked && (
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted/50 backdrop-blur-[1px]">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
    )}
    <span className="text-3xl block">{trophy.emoji}</span>
    <p className="text-xs font-bold text-foreground">{trophy.name}</p>
    <p className="text-[10px] text-muted-foreground">{trophy.description}</p>
    {trophy.unlocked && trophy.unlockedDate && (
      <p className="text-[9px] text-scan-green font-medium">
        ✓ Unlocked {new Date(trophy.unlockedDate).toLocaleDateString()}
      </p>
    )}
  </motion.div>
);

export default TrophyRoom;
