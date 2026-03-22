import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Sparkles, Eye, ArrowRight, Trophy, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParentReward } from "./types";
import LootDropCeremony from "./LootDropCeremony";

type AlertStyle = "epic" | "tactical" | "bestiary";

interface MilestoneAlertProps {
  currentStreak: number;
  rewards: ParentReward[];
  hunterName: string;
  onGrantReward: (rewardId: string) => void;
  onDoubleDown: (rewardId: string) => void;
}

const STORAGE_KEY = "dentascan-alert-style";
const DISMISSED_KEY = "dentascan-dismissed-milestones";

const MILESTONES = [3, 7, 14, 30];
const RANK_MAP: Record<number, string> = {
  3: "Scout of the Enamel",
  7: "Knight of the Enamel",
  14: "Champion of the Oral Frontier",
  30: "Legendary Master Hunter",
};

function getAlertStyle(): AlertStyle {
  try { return (localStorage.getItem(STORAGE_KEY) as AlertStyle) || "epic"; } catch { return "epic"; }
}

function getDismissedMilestones(): number[] {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"); } catch { return []; }
}

function dismissMilestone(streak: number) {
  try {
    const current = getDismissedMilestones();
    if (!current.includes(streak)) {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, streak]));
    }
  } catch {}
}

const MilestoneAlert = ({ currentStreak, rewards, hunterName, onGrantReward, onDoubleDown }: MilestoneAlertProps) => {
  const [style, setStyle] = useState<AlertStyle>(getAlertStyle);
  const [dismissed, setDismissed] = useState<number[]>(getDismissedMilestones);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [inspectionMode, setInspectionMode] = useState(false);

  const name = hunterName || "Hunter";

  // Find active milestone
  const activeMilestone = MILESTONES.find(
    (m) => currentStreak >= m && !dismissed.includes(m)
  );

  // Find matching reward
  const matchingReward = rewards.find(
    (r) => activeMilestone && r.streakRequired <= currentStreak && !r.claimed
  );

  const handleStyleChange = (s: AlertStyle) => {
    setStyle(s);
    try { localStorage.setItem(STORAGE_KEY, s); } catch {}
  };

  const handleDismiss = () => {
    if (activeMilestone) {
      dismissMilestone(activeMilestone);
      setDismissed((prev) => [...prev, activeMilestone]);
    }
  };

  const handleGrant = () => {
    setCelebrationActive(true);
    if (matchingReward) onGrantReward(matchingReward.id);
  };

  const handleCeremonyComplete = () => {
    setCelebrationActive(false);
    handleDismiss();
  };

  const handleDoubleDown = () => {
    if (matchingReward) onDoubleDown(matchingReward.id);
    handleDismiss();
  };

  const rank = activeMilestone ? RANK_MAP[activeMilestone] || "Elite Hunter" : "";
  const rewardName = matchingReward?.description || "the earned reward";

  if (!activeMilestone) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-plaque-gold" />
            Milestone Alerts
          </h4>
          <StyleSelector style={style} onChange={handleStyleChange} />
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-6 text-center space-y-2">
          <Trophy className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">No pending milestones.</p>
          <p className="text-[10px] text-muted-foreground">
            Next milestone at <span className="font-bold text-foreground">
              {MILESTONES.find((m) => m > currentStreak) || 30}-day streak
            </span> (currently {currentStreak} days)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-plaque-gold" />
          Milestone Alerts
        </h4>
        <StyleSelector style={style} onChange={handleStyleChange} />
      </div>

      {/* Loot Drop Ceremony */}
      <LootDropCeremony
        active={celebrationActive}
        hunterName={name}
        guildMasterName={(() => { try { return localStorage.getItem("dentascan-quest-contract") ? JSON.parse(localStorage.getItem("dentascan-quest-contract")!).guildMasterName || "Guild Master" : "Guild Master"; } catch { return "Guild Master"; } })()}
        rewardDescription={rewardName}
        milestone={activeMilestone || 7}
        rankTitle={rank}
        lastMonsterEmoji="🦷"
        lastMonsterName="Molar Mauler"
        onComplete={handleCeremonyComplete}
      />

      {/* Alert card */}
      <AnimatePresence mode="wait">
        {style === "epic" && (
          <EpicAlert
            key="epic"
            name={name}
            milestone={activeMilestone}
            rewardName={rewardName}
            rank={rank}
            inspectionMode={inspectionMode}
            onGrant={handleGrant}
            onInspect={() => setInspectionMode(!inspectionMode)}
            onDoubleDown={handleDoubleDown}
            onDismiss={handleDismiss}
          />
        )}
        {style === "tactical" && (
          <TacticalAlert
            key="tactical"
            name={name}
            milestone={activeMilestone}
            rewardName={rewardName}
            rank={rank}
            inspectionMode={inspectionMode}
            onGrant={handleGrant}
            onInspect={() => setInspectionMode(!inspectionMode)}
            onDoubleDown={handleDoubleDown}
            onDismiss={handleDismiss}
          />
        )}
        {style === "bestiary" && (
          <BestiaryAlert
            key="bestiary"
            name={name}
            milestone={activeMilestone}
            rewardName={rewardName}
            inspectionMode={inspectionMode}
            onGrant={handleGrant}
            onInspect={() => setInspectionMode(!inspectionMode)}
            onDoubleDown={handleDoubleDown}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>

      {/* Inspection mode */}
      <AnimatePresence>
        {inspectionMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border-2 border-dashed border-monitor-amber/40 bg-monitor-amber/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-monitor-amb" />
                <p className="text-[11px] font-bold text-foreground">🔍 Inspection Mode Active</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Ask the Hunter to open their mouth for a visual check. Once satisfied, tap "Grant Reward" to confirm the streak and deliver the loot.
              </p>
              <Button
                size="sm"
                onClick={handleGrant}
                className="bg-scan-green hover:bg-scan-green/90 text-foreground font-bold gap-1.5 text-xs haptic-button"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Inspection Passed — Grant Reward
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Style selector                                                     */
/* ------------------------------------------------------------------ */

const StyleSelector = ({ style, onChange }: { style: AlertStyle; onChange: (s: AlertStyle) => void }) => (
  <div className="flex gap-1">
    {([
      { id: "epic" as const, label: "⚔️" },
      { id: "tactical" as const, label: "🛡️" },
      { id: "bestiary" as const, label: "👾" },
    ]).map((s) => (
      <button
        key={s.id}
        onClick={() => onChange(s.id)}
        className={`text-sm px-2 py-1 rounded-lg transition-all ${
          style === s.id
            ? "bg-plaque-gold/20 border border-plaque-gold/30"
            : "bg-muted/30 border border-transparent hover:border-border"
        }`}
        title={s.id}
      >
        {s.label}
      </button>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Alert action buttons                                               */
/* ------------------------------------------------------------------ */

interface AlertActionsProps {
  inspectionMode: boolean;
  onGrant: () => void;
  onInspect: () => void;
  onDoubleDown: () => void;
  onDismiss: () => void;
}

const AlertActions = ({ inspectionMode, onGrant, onInspect, onDoubleDown, onDismiss }: AlertActionsProps) => (
  <div className="space-y-2 pt-1">
    <div className="grid grid-cols-2 gap-2">
      <Button
        size="sm"
        onClick={onGrant}
        className="bg-scan-green hover:bg-scan-green/90 text-foreground font-bold gap-1.5 text-[11px] haptic-button"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Grant Reward
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onInspect}
        className={`gap-1.5 text-[11px] haptic-button ${inspectionMode ? "border-monitor-amber text-monitor-amber" : ""}`}
      >
        <Eye className="w-3.5 h-3.5" />
        {inspectionMode ? "Cancel Inspect" : "Hold for Inspect"}
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onDoubleDown}
        className="gap-1.5 text-[11px] haptic-button border-plaque-gold/30 text-plaque-gold"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        Double or Nothing
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onDismiss}
        className="text-[11px] text-muted-foreground"
      >
        Dismiss
      </Button>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Option 1: Epic "Grand Proclamation"                                */
/* ------------------------------------------------------------------ */

interface AlertVariantProps {
  name: string;
  milestone: number;
  rewardName: string;
  rank?: string;
  inspectionMode: boolean;
  onGrant: () => void;
  onInspect: () => void;
  onDoubleDown: () => void;
  onDismiss: () => void;
}

const EpicAlert = ({ name, milestone, rewardName, inspectionMode, onGrant, onInspect, onDoubleDown, onDismiss }: AlertVariantProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="rounded-2xl border-2 border-plaque-gold/30 bg-gradient-to-br from-plaque-gold/10 via-card to-urgency-red/5 p-5 space-y-3"
  >
    <div className="flex items-start gap-3">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-3xl mt-0.5"
      >
        ⚔️
      </motion.div>
      <div className="flex-1 space-y-2">
        <p className="text-[10px] font-bold text-plaque-gold uppercase tracking-[0.15em]">
          GUILD ALERT: THE FRONTIER IS SECURE!
        </p>
        <p className="text-[12px] text-foreground leading-relaxed">
          The Hunter <span className="font-bold text-plaque-gold">{name}</span> has completed a{" "}
          <span className="font-bold">{milestone}-Day Siege!</span> The Molar Maulers have been driven
          back and the "Oral Frontier" is sparkling.
        </p>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="bg-scan-green/10 text-scan-green font-bold px-2 py-0.5 rounded-full">
            Loot Status: UNLOCKED
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          Guild Master, it is time to award <span className="text-foreground font-medium">{rewardName}</span>.
          Proceed to the Trophy Room for the official ceremony!
        </p>
      </div>
    </div>
    <AlertActions
      inspectionMode={inspectionMode}
      onGrant={onGrant}
      onInspect={onInspect}
      onDoubleDown={onDoubleDown}
      onDismiss={onDismiss}
    />
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Option 2: Tactical "Short & Punchy"                                */
/* ------------------------------------------------------------------ */

const TacticalAlert = ({ name, milestone, rewardName, rank, inspectionMode, onGrant, onInspect, onDoubleDown, onDismiss }: AlertVariantProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-3"
  >
    <div className="flex items-center gap-2">
      <Shield className="w-5 h-5 text-primary" />
      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
        MISSION ACCOMPLISHED: Level Up!
      </p>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
      <span className="text-muted-foreground">Status:</span>
      <span className="text-foreground font-bold">{milestone}/{milestone} Clean Maps ✓</span>
      <span className="text-muted-foreground">Hunter:</span>
      <span className="text-foreground font-bold">{name}</span>
      <span className="text-muted-foreground">Rank:</span>
      <span className="text-plaque-gold font-bold">{rank}</span>
      <span className="text-muted-foreground">Bounty:</span>
      <span className="text-foreground font-medium">{rewardName}</span>
    </div>
    <p className="text-[10px] text-muted-foreground italic">
      Guild Master, please confirm the "{milestone}-Day Bounty." The Hunter is waiting for their reward!
    </p>
    <AlertActions
      inspectionMode={inspectionMode}
      onGrant={onGrant}
      onInspect={onInspect}
      onDoubleDown={onDoubleDown}
      onDismiss={onDismiss}
    />
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Option 3: Bestiary "Fun & Character-based"                        */
/* ------------------------------------------------------------------ */

const BestiaryAlert = ({ name, milestone, rewardName, inspectionMode, onGrant, onInspect, onDoubleDown, onDismiss }: AlertVariantProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="rounded-2xl border border-scan-green/20 bg-gradient-to-br from-scan-green/5 via-card to-plaque-gold/5 p-5 space-y-3"
  >
    <div className="flex items-start gap-3">
      <motion.span
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-3xl"
      >
        👾
      </motion.span>
      <div className="flex-1 space-y-2">
        <p className="text-[10px] font-bold text-scan-green uppercase tracking-[0.15em]">
          MONSTER EXTINCT: The Sugar-Saur is Gone!
        </p>
        <p className="text-[12px] text-foreground leading-relaxed">
          Congratulations, Guild Master! Thanks to <span className="font-bold text-plaque-gold">{name}</span>,
          the plaque monsters have been completely eradicated for{" "}
          <span className="font-bold">{milestone} consecutive days</span>.
        </p>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="bg-plaque-gold/10 text-plaque-gold font-bold px-2 py-0.5 rounded-full">
            🎁 Reward Earned: {rewardName}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          Bonus: A new Monster Profile has been unlocked in the Hunter's Handbook!
        </p>
      </div>
    </div>
    <AlertActions
      inspectionMode={inspectionMode}
      onGrant={onGrant}
      onInspect={onInspect}
      onDoubleDown={onDoubleDown}
      onDismiss={onDismiss}
    />
  </motion.div>
);

export default MilestoneAlert;
