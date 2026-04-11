import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Shield, ArrowLeft, Lock, Crown, Swords, Gem, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BattleScreen from "@/components/monster-hunter/BattleScreen";
import MouthDetectionBattle from "@/components/monster-hunter/MouthDetectionBattle";
import TrophyRoom from "@/components/monster-hunter/TrophyRoom";
import ParentCommandCenter from "@/components/monster-hunter/ParentCommandCenter";
import GuildBriefing from "@/components/monster-hunter/GuildBriefing";
import DailyMissions from "@/components/monster-hunter/DailyMissions";
import HunterFTUE from "@/components/monster-hunter/HunterFTUE";
import AgeGateCamera from "@/components/monster-hunter/AgeGateCamera";
import FirstSiegeChecklist, { FIRST_SIEGE_KEY } from "@/components/monster-hunter/FirstSiegeChecklist";
import { useMonsterHunter } from "@/hooks/useMonsterHunter";
import { useFamilySync } from "@/hooks/useFamilySync";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { SEASONAL_SKINS } from "@/components/monster-hunter/types";

const FREE_DAILY_BATTLE_LIMIT = 3;
const BATTLE_COUNT_KEY = "dentascan-daily-battles";
const PARENT_PIN = "1234";
const FTUE_KEY = "dentascan-hunter-ftue-done";
const AGE_GATE_KEY = "dentascan-age-gate-done";
const CRYSTAL_SHARDS_KEY = "dentascan-crystal-shards";
const WEEKLY_DIAMONDS_KEY = "dentascan-weekly-diamonds";
const DOUBLE_XP_KEY = "dentascan-double-xp";

// Rank system
const RANKS = [
  { name: "Bronze Scout", min: 0, emoji: "🥉" },
  { name: "Silver Hunter", min: 5, emoji: "🥈" },
  { name: "Gold Warrior", min: 15, emoji: "🥇" },
  { name: "Platinum Knight", min: 30, emoji: "⚔️" },
  { name: "Diamond Champion", min: 60, emoji: "💎" },
  { name: "Legendary Hero", min: 100, emoji: "🌟" },
];

function getRank(totalBattles: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalBattles >= r.min) rank = r;
  }
  return rank;
}

function getCrystalShards(): number {
  try { return parseInt(localStorage.getItem(CRYSTAL_SHARDS_KEY) || "0", 10); } catch { return 0; }
}

function addCrystalShards(amount: number) {
  const isDoubleXP = (() => { try { const d = JSON.parse(localStorage.getItem(DOUBLE_XP_KEY) || "{}"); return d.date === new Date().toISOString().slice(0,10) && d.active; } catch { return false; } })();
  const finalAmount = isDoubleXP ? amount * 2 : amount;
  const current = getCrystalShards();
  try { localStorage.setItem(CRYSTAL_SHARDS_KEY, String(current + finalAmount)); } catch {}
}

function getWeeklyDiamonds(): number {
  try { return parseInt(localStorage.getItem(WEEKLY_DIAMONDS_KEY) || "0", 10); } catch { return 0; }
}

function addWeeklyDiamond() {
  const current = getWeeklyDiamonds();
  try { localStorage.setItem(WEEKLY_DIAMONDS_KEY, String(current + 1)); } catch {}
}

const MonsterHunter = () => {
  const navigate = useNavigate();
  const { isPro } = useAuth();
  const { t } = useI18n();
  const game = useMonsterHunter();
  const familySync = useFamilySync();
  const [view, setView] = useState<"home" | "battle" | "mouth-battle">("home");
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [crystalShards, setCrystalShards] = useState(getCrystalShards);
  const [weeklyDiamonds, setWeeklyDiamonds] = useState(getWeeklyDiamonds);
  const [ftueComplete, setFtueComplete] = useState(() => {
    try { return localStorage.getItem(FTUE_KEY) === "true"; } catch { return false; }
  });

  const [ageGateComplete, setAgeGateComplete] = useState(() => {
    try { return localStorage.getItem(AGE_GATE_KEY) === "true"; } catch { return false; }
  });
  const [detectedIsChild, setDetectedIsChild] = useState<boolean | null>(() => {
    try {
      const stored = localStorage.getItem("dentascan-detected-child");
      return stored !== null ? stored === "true" : null;
    } catch { return null; }
  });
  const [forceParentMode, setForceParentMode] = useState(false);
  const [firstSiegeDone, setFirstSiegeDone] = useState(() => {
    try { return localStorage.getItem(FIRST_SIEGE_KEY) === "true"; } catch { return false; }
  });

  const rank = getRank(game.totalBattles);

  const getDailyBattles = (): number => {
    try {
      const stored = JSON.parse(localStorage.getItem(BATTLE_COUNT_KEY) || "{}");
      const today = new Date().toISOString().slice(0, 10);
      return stored.date === today ? stored.count : 0;
    } catch { return 0; }
  };

  const incrementBattleCount = () => {
    const today = new Date().toISOString().slice(0, 10);
    const current = getDailyBattles();
    localStorage.setItem(BATTLE_COUNT_KEY, JSON.stringify({ date: today, count: current + 1 }));
  };

  const canStartBattle = isPro || getDailyBattles() < FREE_DAILY_BATTLE_LIMIT;
  const battlesRemaining = FREE_DAILY_BATTLE_LIMIT - getDailyBattles();

  const handleFTUEComplete = (hunterName: string) => {
    try {
      localStorage.setItem(FTUE_KEY, "true");
      localStorage.setItem("dentascan-hunter-name", hunterName);
    } catch {}
    setFtueComplete(true);
  };

  const handleAgeResult = (isChild: boolean, greeting: string) => {
    try {
      localStorage.setItem(AGE_GATE_KEY, "true");
      localStorage.setItem("dentascan-detected-child", String(isChild));
    } catch {}
    setAgeGateComplete(true);
    setDetectedIsChild(isChild);
    if (!isChild) {
      setForceParentMode(true);
      setParentUnlocked(true);
    }
  };

  const handleAgeSkip = () => {
    try { localStorage.setItem(AGE_GATE_KEY, "true"); localStorage.setItem("dentascan-detected-child", "true"); } catch {}
    setAgeGateComplete(true);
    setDetectedIsChild(true);
  };

  const startBattle = () => {
    if (!canStartBattle) return;
    incrementBattleCount();
    setView("battle");
  };

  const handleBattleEnd = () => {
    const defeated = game.monsters.filter(m => m.defeated).length;
    const total = game.monsters.length;
    const allWon = defeated === total;
    game.endBattle();

    // Award crystal shards (per zone cleared + mission bonus)
    const shards = allWon ? 10 + defeated * 2 : defeated * 2;
    addCrystalShards(shards);
    setCrystalShards(getCrystalShards());

    // Award diamond for 7-day streak
    if (allWon && game.currentStreak >= 6) {
      addWeeklyDiamond();
      setWeeklyDiamonds(getWeeklyDiamonds());
    }

    const hunterName = (() => { try { return localStorage.getItem("dentascan-hunter-name") || "Hunter"; } catch { return "Hunter"; } })();
    const loot = game.monsters.filter(m => m.defeated && m.loot).map(m => m.loot);
    familySync.postBattleEvent({
      event_type: allWon ? "battle_complete" : "battle_partial",
      hunter_name: hunterName,
      monsters_defeated: defeated,
      total_monsters: total,
      duration_seconds: game.elapsedSeconds,
      streak: game.currentStreak,
      loot_collected: loot,
      metadata: { season: game.season },
    });
  };

  // Age gate removed — go straight to the game
  // if (!ageGateComplete) {
  //   return <AgeGateCamera onResult={handleAgeResult} onSkip={handleAgeSkip} />;
  // }

  // Phase 2A/B split by detection
  const isChildMode = detectedIsChild !== false;

  // FTUE disabled — go straight to home
  // if (!ftueComplete && isChildMode) {
  //   return <HunterFTUE onComplete={handleFTUEComplete} />;
  // }

  // Mouth Detection Battle view
  if (view === "mouth-battle") {
    return (
      <MouthDetectionBattle
        onBack={() => setView("home")}
        onBattleComplete={(defeated, total, duration) => {
          // Award crystal shards
          const shards = defeated * 3;
          addCrystalShards(shards);
          setCrystalShards(getCrystalShards());

          const hunterName = (() => { try { return localStorage.getItem("dentascan-hunter-name") || "Hunter"; } catch { return "Hunter"; } })();
          familySync.postBattleEvent({
            event_type: "mouth_battle_complete",
            hunter_name: hunterName,
            monsters_defeated: defeated,
            total_monsters: total,
            duration_seconds: duration,
            streak: game.currentStreak,
            loot_collected: [],
            metadata: { mode: "mouth-detection" },
          });

          setView("home");
        }}
      />
    );
  }

  // Battle view
  if (view === "battle") {
    return (
      <div className="min-h-screen p-2 sm:p-4" style={{ backgroundColor: "hsl(220, 40%, 5%)" }}>
        <div className="max-w-lg mx-auto h-[calc(100vh-2rem)]">
          <BattleScreen
            monsters={game.monsters}
            isPlaying={game.isPlaying}
            elapsedSeconds={game.elapsedSeconds}
            calibrated={game.calibrated}
            lootDrops={game.lootDrops}
            season={game.season}
            hasLightningEffect={game.hasLightningEffect}
            hasGoldenBrush={game.hasGoldenBrush}
            antiCheat={game.antiCheat}
            monsterTaunt={game.monsterTaunt}
            rank={rank}
            crystalShards={crystalShards}
            onAttack={game.attackMonster}
            onStart={game.startBattle}
            onEnd={handleBattleEnd}
            onCalibrate={() => game.setCalibrated(true)}
            onBack={() => { if (game.isPlaying) game.endBattle(); setView("home"); }}
            onClaimBounty={async () => {
              try {
                await familySync.postBattleEvent({
                  event_type: "bounty_claim",
                  hunter_name: localStorage.getItem("dentascan-hunter-name") || "Hunter",
                  monsters_defeated: game.monsters.filter(m => m.defeated).length,
                  total_monsters: game.monsters.length,
                  duration_seconds: game.elapsedSeconds,
                  streak: game.currentStreak,
                  loot_collected: game.lootDrops,
                  metadata: { crystalShards, rank },
                });
                return true;
              } catch {
                return false;
              }
            }}
          />
        </div>
      </div>
    );
  }

  const handleParentAccess = () => {
    if (pinInput === PARENT_PIN) {
      setParentUnlocked(true);
      setShowPinEntry(false);
      setPinInput("");
    }
  };

  // ── CHILD UI (The Hunter) ──
  if (isChildMode) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, hsl(220 40% 5%), hsl(210 30% 8%), hsl(220 40% 5%))" }}>
        {/* Neon Header */}
        <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "hsl(220, 40%, 5%, 0.85)", borderBottom: "1px solid hsl(var(--neon-blue) / 0.2)" }}>
          <div className="container max-w-2xl flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: "hsl(var(--neon-blue) / 0.7)" }} onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="font-bold text-sm neon-text-blue" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-blue))" }}>
                {t("mh.dentalDefense")}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{
                fontFamily: "'Orbitron', sans-serif",
                color: "hsl(var(--neon-green))",
                border: "1px solid hsl(var(--neon-green) / 0.3)",
                backgroundColor: "hsl(var(--neon-green) / 0.08)",
              }}>
                {rank.emoji} {rank.name}
              </span>
              {/* Crystal Shards */}
              <span className="flex items-center gap-1 text-[10px] font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--crystal-cyan))" }}>
                <Gem className="w-3.5 h-3.5" />
                {crystalShards}
              </span>
            </div>
          </div>
        </header>

        <main className="container max-w-2xl px-4 py-6 space-y-6">
          {/* Battle limit */}
          {!isPro && (
            <div className="flex items-center justify-between rounded-lg px-4 py-2" style={{ backgroundColor: "hsl(var(--neon-gold) / 0.08)", border: "1px solid hsl(var(--neon-gold) / 0.15)" }}>
              <span className="text-xs" style={{ color: "hsl(var(--neon-gold))" }}>
                {battlesRemaining > 0
                  ? `${battlesRemaining} ${t("mh.battlesRemaining")}`
                  : t("mh.limitReached")}
              </span>
              <Button size="sm" variant="ghost" className="gap-1 text-xs" style={{ color: "hsl(var(--neon-gold))" }} asChild>
                <Link to="/pricing"><Crown className="w-3 h-3" /> {t("mh.goPro")}</Link>
              </Button>
            </div>
          )}

          {/* Mouth Monster Hunt - NEW */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-4 space-y-3"
            style={{
              background: "linear-gradient(135deg, hsl(280 60% 15%), hsl(190 50% 12%))",
              border: "1px solid hsl(280 60% 30% / 0.3)",
              boxShadow: "0 0 20px rgba(147, 51, 234, 0.1)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">👄</span>
              <div>
                <h3 className="font-bold text-sm" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(280, 80%, 70%)" }}>
                  Mouth Monster Hunt
                </h3>
                <p className="text-[10px]" style={{ color: "hsl(280, 40%, 60%)" }}>
                  Open wide → See the monsters → Brush them away!
                </p>
              </div>
            </div>
            <Button
              onClick={() => setView("mouth-battle")}
              className="w-full py-5 text-sm font-bold rounded-xl gap-2"
              style={{
                background: "linear-gradient(135deg, hsl(280, 80%, 50%), hsl(190, 100%, 50%))",
                color: "white",
                boxShadow: "0 0 15px rgba(147, 51, 234, 0.3)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Start Mouth Hunt!
            </Button>
          </motion.div>

          {/* Daily Mission */}
          <DailyMissions currentStreak={game.currentStreak} crystalShards={crystalShards} weeklyDiamonds={weeklyDiamonds} onStartMission={startBattle} />

          {/* Guild Briefing */}
          <GuildBriefing hunterName="" currentStreak={game.currentStreak} onStartBattle={startBattle} />

          {/* Trophy Room */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ fontFamily: "'Orbitron', sans-serif", color: "hsl(var(--neon-blue) / 0.7)" }}>
              <Trophy className="w-4 h-4" />
              {t("mh.trophyRoom")}
            </h3>
            <TrophyRoom trophies={game.trophies} currentStreak={game.currentStreak} collectedLoot={game.collectedLoot} />
          </div>

          {/* Re-scan */}
          <div className="text-center">
            <button onClick={() => {
              try { localStorage.removeItem(AGE_GATE_KEY); localStorage.removeItem("dentascan-detected-child"); } catch {}
              setAgeGateComplete(false);
              setDetectedIsChild(null);
              setForceParentMode(false);
            }} className="text-[10px] transition-colors" style={{ color: "hsl(var(--neon-blue) / 0.15)" }}>
              {t("mh.rescanIdentity")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── PARENT/ELDER UI (Command Center) ──
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--commander-navy))" }}>
      {/* Professional Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "hsl(var(--commander-navy) / 0.9)", borderBottom: "1px solid hsl(var(--commander-slate) / 0.3)" }}>
        <div className="container max-w-2xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: "hsl(var(--commander-accent))" }} onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: "hsl(var(--commander-accent))" }} />
              <h1 className="font-heading font-bold text-base" style={{ color: "hsl(var(--commander-text))" }}>
                {t("mh.guildMasterPortal")}
              </h1>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{
            color: "hsl(var(--neon-purple))",
            border: "1px solid hsl(var(--neon-purple) / 0.3)",
            backgroundColor: "hsl(var(--neon-purple) / 0.08)",
          }}>
            🛡️ {t("mh.commander")}
          </span>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-6">
        {!parentUnlocked ? (
          <div className="text-center py-16 space-y-4">
            <Lock className="w-10 h-10 mx-auto" style={{ color: "hsl(var(--commander-muted))" }} />
            <h2 className="font-heading font-bold text-lg" style={{ color: "hsl(var(--commander-text))" }}>{t("mh.enterPin")}</h2>
            <p className="text-xs" style={{ color: "hsl(var(--commander-muted))" }}>Default: 1234</p>
            <div className="max-w-xs mx-auto space-y-3">
              <Input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                style={{ backgroundColor: "hsl(var(--commander-surface))", borderColor: "hsl(var(--commander-slate) / 0.3)", color: "hsl(var(--commander-text))" }}
                onKeyDown={(e) => e.key === "Enter" && handleParentAccess()}
              />
              <Button className="w-full font-bold" style={{ backgroundColor: "hsl(var(--commander-accent))", color: "white" }} onClick={handleParentAccess}>
                {t("mh.unlockCommand")}
              </Button>
            </div>
          </div>
        ) : !firstSiegeDone ? (
          <FirstSiegeChecklist
            hasRewards={game.rewards.length > 0}
            onComplete={() => setFirstSiegeDone(true)}
            onSkip={() => {
              try { localStorage.setItem(FIRST_SIEGE_KEY, "true"); } catch {}
              setFirstSiegeDone(true);
            }}
          />
        ) : (
          <ParentCommandCenter
            records={game.records}
            rewards={game.rewards}
            currentStreak={game.currentStreak}
            totalBattles={game.totalBattles}
            hunterName={(() => { try { return localStorage.getItem("dentascan-hunter-name") || "Hunter"; } catch { return "Hunter"; } })()}
            lastIntegrityReport={game.lastIntegrityReport}
            onAddReward={game.addReward}
            onRemoveReward={game.removeReward}
            onClaimReward={game.claimReward}
            onDoubleDown={game.doubleDown}
            onDoubleXP={() => {
              try { localStorage.setItem(DOUBLE_XP_KEY, JSON.stringify({ date: new Date().toISOString().slice(0,10), active: true })); } catch {}
            }}
            onEmergencyAlert={(tooth) => {
              familySync.postBattleEvent({
                event_type: "emergency_alert",
                hunter_name: "Guild Master",
                monsters_defeated: 0,
                total_monsters: 0,
                duration_seconds: 0,
                streak: game.currentStreak,
                loot_collected: [],
                metadata: { target_tooth: tooth, type: "gold_monster_spawn" },
              });
            }}
            onSendPraise={(message) => {
              familySync.postBattleEvent({
                event_type: "guild_praise",
                hunter_name: "Guild Master",
                monsters_defeated: 0,
                total_monsters: 0,
                duration_seconds: 0,
                streak: game.currentStreak,
                loot_collected: [],
                metadata: { praise_message: message },
              });
            }}
            onResetChecklist={() => {
              try { localStorage.removeItem(FIRST_SIEGE_KEY); } catch {}
              setFirstSiegeDone(false);
            }}
          />
        )}

        {/* Re-scan */}
        <div className="text-center mt-8">
          <button onClick={() => {
            try { localStorage.removeItem(AGE_GATE_KEY); localStorage.removeItem("dentascan-detected-child"); } catch {}
            setAgeGateComplete(false);
            setDetectedIsChild(null);
            setForceParentMode(false);
            setParentUnlocked(false);
          }} className="text-[10px] transition-colors" style={{ color: "hsl(var(--commander-muted) / 0.5)" }}>
            {t("mh.rescanIdentity")}
          </button>
        </div>
      </main>
    </div>
  );
};

export default MonsterHunter;
