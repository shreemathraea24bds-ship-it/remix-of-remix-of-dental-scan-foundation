import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, MapPin, Clock, ChevronRight, Star, Gem, Trophy, Crown } from "lucide-react";

interface DailyMissionsProps {
  currentStreak: number;
  crystalShards: number;
  weeklyDiamonds: number;
  onStartMission: () => void;
}

interface Mission {
  id: string;
  day: string;
  title: string;
  subtitle: string;
  bossMonster: string;
  bossEmoji: string;
  targetZone: string;
  description: string;
  bonusObjective: string;
  shardReward: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Boss" | "Legendary";
  difficultyColor: string;
}

const WEEKLY_CAMPAIGN: Mission[] = [
  {
    id: "mon", day: "Monday", title: "The Molar Mines", subtitle: "Back Teeth (Chewing Surface)",
    bossMonster: "The Grinder King", bossEmoji: "👑🦷",
    targetZone: "Back Molars",
    description: "The Grinder King has fortified the molar mines! Focus your scrubbing on the chewing surfaces of your back teeth to shatter his stone walls.",
    bonusObjective: "Defeat the Grinder King in under 90 seconds",
    shardReward: 3, difficulty: "Easy", difficultyColor: "hsl(var(--neon-green))",
  },
  {
    id: "tue", day: "Tuesday", title: "The Trench War", subtitle: "Bottom Gum-line",
    bossMonster: "Gravel-Gulp", bossEmoji: "🪨👹",
    targetZone: "Gum Line",
    description: "Gravel-Gulp is digging trenches along your bottom gum-line! Use 45° angle attacks to sweep the trenches and expose this burrowing beast.",
    bonusObjective: "Cover all 8 zones with zero block-mode triggers",
    shardReward: 4, difficulty: "Medium", difficultyColor: "hsl(var(--neon-gold))",
  },
  {
    id: "wed", day: "Wednesday", title: "The Frontline Defense", subtitle: "Front Teeth (Smile Zone)",
    bossMonster: "The Yellow Wraith", bossEmoji: "👻💛",
    targetZone: "Front Teeth",
    description: "The Yellow Wraith is staining your smile zone! Vertical flick attacks will break through its ghostly armor on your front teeth.",
    bonusObjective: "No mimic spawns during the entire battle",
    shardReward: 4, difficulty: "Medium", difficultyColor: "hsl(var(--neon-gold))",
  },
  {
    id: "thu", day: "Thursday", title: "The Tongue Territory", subtitle: "The Tongue",
    bossMonster: "The Breath-Stealer", bossEmoji: "👅💨",
    targetZone: "Tongue Surface",
    description: "The Breath-Stealer has claimed the tongue surface as its domain! Long sweeping attacks from back to front are your only weapon against this foul beast.",
    bonusObjective: "Maintain perfect rhythm for 60 continuous seconds",
    shardReward: 5, difficulty: "Hard", difficultyColor: "hsl(var(--urgency-red))",
  },
  {
    id: "fri", day: "Friday", title: "The Hidden Gaps", subtitle: "Spaces Between Teeth",
    bossMonster: "The Crevice Crawler", bossEmoji: "🕷️🦷",
    targetZone: "Between Teeth",
    description: "The Crevice Crawler lurks in the spaces between your teeth! Precision vertical motions will flush this sneaky parasite from its hiding spots.",
    bonusObjective: "100% zone coverage + all monsters defeated",
    shardReward: 5, difficulty: "Hard", difficultyColor: "hsl(var(--urgency-red))",
  },
  {
    id: "sat", day: "Saturday", title: "Double Trouble", subtitle: "Full Mouth Sweep",
    bossMonster: "The Twin Terrors", bossEmoji: "👹👹",
    targetZone: "Full Mouth",
    description: "The Twin Terrors have rallied every zone for a coordinated attack! You must cover every sector in a full mouth sweep to survive their dual onslaught.",
    bonusObjective: "Earn the Clear Crystal with 90%+ integrity score",
    shardReward: 8, difficulty: "Boss", difficultyColor: "hsl(var(--neon-purple))",
  },
  {
    id: "sun", day: "Sunday", title: "The Citadel Siege", subtitle: "Final 3-Minute Deep Clean",
    bossMonster: "LORD CAVITY", bossEmoji: "💀👑",
    targetZone: "Complete Clean",
    description: "LORD CAVITY commands the Citadel of Decay! Only a 3-minute deep clean will breach his fortress walls. This is the ultimate test of your dental mastery!",
    bonusObjective: "Defeat LORD CAVITY for a Diamond Crystal upgrade",
    shardReward: 12, difficulty: "Legendary", difficultyColor: "hsl(var(--crystal-cyan))",
  },
];

const DailyMissions = ({ currentStreak, crystalShards, weeklyDiamonds, onStartMission }: DailyMissionsProps) => {
  const [expanded, setExpanded] = useState(false);
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Remap to Mon=0

  const todayMission = WEEKLY_CAMPAIGN[dayIndex];
  const upcomingMissions = useMemo(() => {
    const upcoming: Mission[] = [];
    for (let i = 1; i <= 3; i++) {
      upcoming.push(WEEKLY_CAMPAIGN[(dayIndex + i) % 7]);
    }
    return upcoming;
  }, [dayIndex]);

  const weekProgress = Math.min(dayIndex + 1, 7);
  const hasDiamondStreak = currentStreak >= 7;

  return (
    <div className="space-y-3">
      {/* Crystal Shard Economy Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-xl px-4 py-2.5"
        style={{
          background: "linear-gradient(135deg, hsl(185 80% 10% / 0.8), hsl(210 60% 12% / 0.8))",
          border: "1px solid hsl(var(--crystal-cyan) / 0.2)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Gem className="w-4 h-4" style={{ color: "hsl(var(--crystal-cyan))" }} />
            <span className="text-sm font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--crystal-cyan))" }}>
              {crystalShards}
            </span>
            <span className="text-[8px] uppercase tracking-wider" style={{ color: "hsl(var(--crystal-cyan) / 0.5)" }}>
              Shards
            </span>
          </div>
          {weeklyDiamonds > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-base">💎</span>
              <span className="text-[10px] font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-gold))" }}>
                ×{weeklyDiamonds}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] uppercase tracking-wider" style={{ color: "hsl(var(--neon-green) / 0.5)" }}>
            Today +{todayMission.shardReward}
          </span>
          <Gem className="w-3 h-3" style={{ color: "hsl(var(--neon-green) / 0.5)" }} />
        </div>
      </motion.div>

      {/* Diamond Streak Indicator */}
      {hasDiamondStreak && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-2 rounded-lg"
          style={{
            background: "linear-gradient(90deg, hsl(var(--neon-gold) / 0.1), hsl(var(--crystal-cyan) / 0.15), hsl(var(--neon-gold) / 0.1))",
            border: "1px solid hsl(var(--neon-gold) / 0.3)",
          }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg"
          >
            💎
          </motion.span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-gold))" }}>
            DIAMOND CRYSTAL UNLOCKED — Legendary Weapon Skin Active!
          </span>
          <Crown className="w-4 h-4" style={{ color: "hsl(var(--neon-gold))" }} />
        </motion.div>
      )}

      {/* Weekly Progress */}
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-blue) / 0.4)" }}>
          The Great Enamel War
        </span>
        <div className="flex-1 flex gap-0.5">
          {WEEKLY_CAMPAIGN.map((m, i) => (
            <div
              key={m.id}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                backgroundColor: i < dayIndex ? "hsl(var(--neon-green))" : i === dayIndex ? "hsl(var(--neon-gold))" : "hsl(var(--neon-blue) / 0.15)",
                boxShadow: i === dayIndex ? "0 0 6px hsl(var(--neon-gold) / 0.5)" : "none",
              }}
            />
          ))}
        </div>
        <span className="text-[8px] font-bold" style={{ color: "hsl(var(--neon-blue) / 0.4)" }}>
          {weekProgress}/7
        </span>
      </div>

      {/* Today's Mission - Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(220 40% 8%), hsl(210 30% 12%), hsl(220 40% 8%))",
          border: `1px solid ${todayMission.difficultyColor}40`,
        }}
      >
        {/* Mission Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4" style={{ color: "hsl(var(--neon-blue))" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(var(--neon-blue) / 0.7)" }}>
                {todayMission.day}'s Mission
              </span>
            </div>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                color: todayMission.difficultyColor,
                backgroundColor: `${todayMission.difficultyColor}20`,
                border: `1px solid ${todayMission.difficultyColor}40`,
              }}
            >
              {todayMission.difficulty}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {todayMission.bossEmoji}
            </motion.span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-gold))" }}>
                {todayMission.title}
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--neon-blue) / 0.6)" }}>
                {todayMission.subtitle}
              </p>
            </div>
          </div>

          {/* Boss Monster */}
          <div className="mt-3 flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: "hsl(var(--urgency-red) / 0.06)", border: "1px solid hsl(var(--urgency-red) / 0.12)" }}>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--urgency-red))" }}>
              ⚔️ Boss:
            </span>
            <span className="text-xs font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--urgency-red) / 0.9)" }}>
              {todayMission.bossMonster}
            </span>
            <span className="text-[9px] ml-auto" style={{ color: "hsl(var(--urgency-red) / 0.5)" }}>
              📍 {todayMission.targetZone}
            </span>
          </div>

          <p className="text-xs mt-3 leading-relaxed" style={{ color: "hsl(var(--commander-text) / 0.7)" }}>
            {todayMission.description}
          </p>

          {/* Bonus Objective */}
          <div className="mt-3 flex items-start gap-2 rounded-lg p-2" style={{ backgroundColor: "hsl(var(--neon-gold) / 0.08)", border: "1px solid hsl(var(--neon-gold) / 0.15)" }}>
            <Star className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--neon-gold))" }} />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--neon-gold))" }}>
                Bonus Objective
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--neon-gold) / 0.7)" }}>
                {todayMission.bonusObjective}
              </p>
            </div>
          </div>

          {/* Shard reward */}
          <div className="mt-2 flex items-center justify-end gap-1">
            <span className="text-[9px]" style={{ color: "hsl(var(--crystal-cyan) / 0.6)" }}>Reward:</span>
            <Gem className="w-3 h-3" style={{ color: "hsl(var(--crystal-cyan))" }} />
            <span className="text-xs font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--crystal-cyan))" }}>
              +{todayMission.shardReward}
            </span>
          </div>
        </div>

        {/* Start Mission Button */}
        <button
          onClick={onStartMission}
          className="w-full py-3.5 font-bold text-sm uppercase tracking-wider haptic-button flex items-center justify-center gap-2"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            background: `linear-gradient(90deg, ${todayMission.difficultyColor}, hsl(var(--neon-green)))`,
            color: "hsl(220, 20%, 8%)",
          }}
        >
          <Swords className="w-4 h-4" />
          Accept Mission
        </button>
      </motion.div>

      {/* Upcoming Missions */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs w-full transition-colors"
        style={{ color: "hsl(var(--neon-blue) / 0.4)" }}
      >
        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
        <span className="font-bold uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Campaign Intel — Upcoming
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            {upcomingMissions.map((mission, i) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  backgroundColor: "hsl(220 40% 8% / 0.8)",
                  border: `1px solid ${mission.difficultyColor}15`,
                }}
              >
                <span className="text-xl">{mission.bossEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold" style={{ color: "hsl(var(--neon-blue) / 0.5)" }}>
                      {mission.day}
                    </span>
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{
                        color: mission.difficultyColor,
                        backgroundColor: `${mission.difficultyColor}15`,
                      }}
                    >
                      {mission.difficulty}
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--commander-text) / 0.8)" }}>
                    {mission.title}
                  </p>
                  <p className="text-[9px] truncate" style={{ color: "hsl(var(--urgency-red) / 0.6)" }}>
                    Boss: {mission.bossMonster}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Gem className="w-3 h-3" style={{ color: "hsl(var(--crystal-cyan) / 0.4)" }} />
                  <span className="text-[9px] font-bold" style={{ color: "hsl(var(--crystal-cyan) / 0.4)" }}>
                    +{mission.shardReward}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyMissions;
