import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Gift, Calendar, BookOpen, Shield, Volume2, Link2, Lock, Unlock, Zap, Map, Settings2, ChevronDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import type { DailyRecord, ParentReward, IntegrityReport } from "./types";
import QuestContract from "./QuestContract";
import HuntersHandbook from "./HuntersHandbook";
import MilestoneAlert from "./MilestoneAlert";
import IntegrityReportCard from "./IntegrityReport";
import VoiceMemoRecorder from "./VoiceMemoRecorder";
import DailyBriefingRecorder from "./DailyBriefingRecorder";
import FamilySyncPanel from "./FamilySyncPanel";
import CommandCards from "./CommandCards";
import BrushingHeatMap from "./BrushingHeatMap";
import BattleCalibration, { type BattleSettings, DEFAULT_BATTLE_SETTINGS } from "./BattleCalibration";
import WeeklyIntelReport from "./WeeklyIntelReport";

// Reward tiers
const REWARD_TIERS = [
  { id: "scout", label: "🥉 Scout", streakRequired: 3, color: "hsl(var(--neon-green))" },
  { id: "knight", label: "⚔️ Knight", streakRequired: 7, color: "hsl(var(--neon-gold))" },
  { id: "master", label: "👑 Master", streakRequired: 30, color: "hsl(var(--neon-purple))" },
] as const;

function loadBattleSettings(): BattleSettings {
  try {
    const raw = localStorage.getItem("dentascan-battle-settings");
    return raw ? JSON.parse(raw) : DEFAULT_BATTLE_SETTINGS;
  } catch { return DEFAULT_BATTLE_SETTINGS; }
}

function saveBattleSettings(settings: BattleSettings) {
  try { localStorage.setItem("dentascan-battle-settings", JSON.stringify(settings)); } catch {}
}

interface ParentCommandCenterProps {
  records: DailyRecord[];
  rewards: ParentReward[];
  currentStreak: number;
  totalBattles: number;
  hunterName: string;
  lastIntegrityReport: IntegrityReport | null;
  onAddReward: (description: string, streakRequired: number) => void;
  onRemoveReward: (id: string) => void;
  onClaimReward: (id: string) => void;
  onDoubleDown: (id: string) => void;
  onDoubleXP: () => void;
  onEmergencyAlert: (tooth: string) => void;
  onSendPraise: (message: string) => void;
  onResetChecklist?: () => void;
}

const ParentCommandCenter = ({
  records, rewards, currentStreak, totalBattles, hunterName,
  lastIntegrityReport, onAddReward, onRemoveReward, onClaimReward, onDoubleDown,
  onDoubleXP, onEmergencyAlert, onSendPraise, onResetChecklist,
}: ParentCommandCenterProps) => {
  const [newReward, setNewReward] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("scout");
  const [battleSettings, setBattleSettings] = useState<BattleSettings>(loadBattleSettings);

  const handleAdd = () => {
    if (!newReward.trim()) return;
    const tier = REWARD_TIERS.find(t => t.id === selectedTier) || REWARD_TIERS[0];
    onAddReward(newReward.trim(), tier.streakRequired);
    setNewReward("");
  };

  const handleSettingsUpdate = (settings: BattleSettings) => {
    setBattleSettings(settings);
    saveBattleSettings(settings);
  };

  const completedDays = records.filter((r) => r.completed).length;
  const avgDuration = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.durationSeconds, 0) / records.length)
    : 0;
  const integrityScore = lastIntegrityReport?.integrityScore ?? 0;

  const cardBg = "hsl(var(--commander-surface))";
  const borderColor = "hsl(var(--commander-slate) / 0.3)";
  const textPrimary = "hsl(var(--commander-text))";
  const textMuted = "hsl(var(--commander-muted))";
  const accentColor = "hsl(var(--commander-accent))";

  // Group rewards by tier
  const rewardsByTier = REWARD_TIERS.map(tier => ({
    ...tier,
    rewards: rewards.filter(r => r.streakRequired === tier.streakRequired),
    progress: Math.min((currentStreak / tier.streakRequired) * 100, 100),
    earned: currentStreak >= tier.streakRequired,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" style={{ color: accentColor }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: textPrimary }}>
            Command Center
          </h2>
        </div>
        <p className="text-xs" style={{ color: textMuted }}>
          Managing Hunter: <strong style={{ color: accentColor }}>{hunterName}</strong>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Streak", value: `${currentStreak}d`, icon: "🔥", color: "hsl(var(--neon-gold))" },
          { label: "Battles", value: totalBattles, icon: "⚔️", color: accentColor },
          { label: "Integrity", value: `${integrityScore}%`, icon: "🛡️", color: integrityScore >= 70 ? "hsl(var(--neon-green))" : "hsl(var(--urgency-red))" },
          { label: "Avg Duration", value: `${avgDuration}s`, icon: "⏱️", color: textMuted },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-3 text-center space-y-1"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <span className="text-lg">{stat.icon}</span>
            <p className="text-xl font-bold font-heading" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: textMuted }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Clean Map Calendar */}
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: textPrimary }}>
          <Calendar className="w-4 h-4" style={{ color: accentColor }} />
          Clean Map — Last 14 Days
        </h3>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            const dateStr = d.toISOString().slice(0, 10);
            const record = records.find(r => r.date === dateStr);
            const isToday = i === 13;
            return (
              <div
                key={i}
                className="aspect-square rounded-md flex flex-col items-center justify-center text-[8px] font-bold relative"
                style={{
                  backgroundColor: record?.completed
                    ? "hsl(var(--neon-green) / 0.15)"
                    : record
                    ? "hsl(var(--urgency-red) / 0.1)"
                    : "hsl(var(--commander-slate) / 0.1)",
                  border: isToday ? `2px solid ${accentColor}` : `1px solid ${borderColor}`,
                  color: record?.completed ? "hsl(var(--neon-green))" : textMuted,
                }}
              >
                <span>{d.getDate()}</span>
                {record?.completed && <span className="text-[10px]">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="commands" className="space-y-4">
        <TabsList className="w-full grid grid-cols-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          {[
            { value: "commands", icon: <Zap className="w-3 h-3" />, label: "Cards" },
            { value: "heatmap", icon: <Map className="w-3 h-3" />, label: "Heat Map" },
            { value: "bounty", icon: <Gift className="w-3 h-3" />, label: "Bounty" },
            { value: "settings", icon: <Settings2 className="w-3 h-3" />, label: "Settings" },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 gap-0.5 text-[9px]">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Second row of tabs */}
        <TabsList className="w-full grid grid-cols-5" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          {[
            { value: "intel", icon: <Shield className="w-3 h-3" />, label: "Intel" },
            { value: "report", icon: <Target className="w-3 h-3" />, label: "Report" },
            { value: "sync", icon: <Link2 className="w-3 h-3" />, label: "Sync" },
            { value: "voice", icon: <Volume2 className="w-3 h-3" />, label: "Voice" },
            { value: "guide", icon: <BookOpen className="w-3 h-3" />, label: "Guide" },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 gap-0.5 text-[9px]">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Command Cards */}
        <TabsContent value="commands">
          <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <CommandCards
              onDoubleXP={onDoubleXP}
              onEmergencyAlert={onEmergencyAlert}
              onSendPraise={onSendPraise}
            />
          </div>
        </TabsContent>

        {/* Heat Map */}
        <TabsContent value="heatmap">
          <BrushingHeatMap report={lastIntegrityReport} />
        </TabsContent>

        {/* Bounty Workshop — Tiered */}
        <TabsContent value="bounty" className="space-y-4">
          <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4" style={{ color: "hsl(var(--neon-gold))" }} />
              <h3 className="font-heading font-bold text-sm" style={{ color: textPrimary }}>Bounty Workshop</h3>
            </div>
            <p className="text-[11px]" style={{ color: textMuted }}>
              Set rewards across three tiers. Press "Grant" when your Hunter has earned them.
            </p>

            {/* Add reward form */}
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Pizza Night, 10 mins gaming"
                value={newReward}
                onChange={(e) => setNewReward(e.target.value)}
                className="text-sm flex-1"
                maxLength={100}
                style={{ backgroundColor: "hsl(var(--commander-navy))", borderColor, color: textPrimary }}
              />
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-32 text-xs" style={{ backgroundColor: "hsl(var(--commander-navy))", borderColor, color: textPrimary }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TIERS.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label} ({t.streakRequired}d)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="icon" onClick={handleAdd} className="flex-shrink-0" style={{ backgroundColor: accentColor }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tiered Rewards */}
          {rewardsByTier.map((tier) => (
            <div key={tier.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tier.color}25` }}>
              {/* Tier Header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: `${tier.color}08` }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{
                    color: tier.color,
                    backgroundColor: `${tier.color}15`,
                  }}>
                    {tier.streakRequired}-day streak
                  </span>
                </div>
                {tier.earned && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                    backgroundColor: "hsl(var(--neon-green) / 0.15)",
                    color: "hsl(var(--neon-green))",
                  }}>
                    ✓ UNLOCKED
                  </span>
                )}
              </div>

              {/* Streak Progress */}
              <div className="px-4 py-2" style={{ backgroundColor: cardBg }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px]" style={{ color: textMuted }}>Progress</span>
                  <span className="text-[9px] font-bold ml-auto" style={{ color: tier.color }}>
                    {Math.min(currentStreak, tier.streakRequired)}/{tier.streakRequired}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${tier.color}15` }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: tier.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${tier.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Rewards list */}
              <div className="px-4 pb-3 space-y-1.5" style={{ backgroundColor: cardBg }}>
                {tier.rewards.length === 0 ? (
                  <p className="text-[10px] italic py-2 text-center" style={{ color: textMuted }}>
                    No bounties set for this tier yet.
                  </p>
                ) : (
                  tier.rewards.map((reward) => {
                    const earned = currentStreak >= reward.streakRequired;
                    return (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{
                          backgroundColor: earned ? "hsl(var(--neon-green) / 0.06)" : "hsl(var(--commander-navy))",
                          border: earned ? "1px solid hsl(var(--neon-green) / 0.15)" : `1px solid ${borderColor}`,
                        }}
                      >
                        <div>
                          <p className="text-xs font-medium" style={{ color: textPrimary }}>{reward.description}</p>
                          {earned && !reward.claimed && (
                            <span className="text-[9px] font-bold" style={{ color: "hsl(var(--neon-green))" }}>EARNED!</span>
                          )}
                          {reward.claimed && (
                            <span className="text-[9px]" style={{ color: textMuted }}>Claimed</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {earned && !reward.claimed && (
                            <Button
                              size="sm"
                              className="gap-1 text-[10px] h-7"
                              style={{ backgroundColor: "hsl(var(--neon-green))", color: "black" }}
                              onClick={() => onClaimReward(reward.id)}
                            >
                              <Unlock className="w-3 h-3" />
                              Grant
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveReward(reward.id)}>
                            <Trash2 className="w-3 h-3" style={{ color: textMuted }} />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}

          {/* Session History */}
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <h4 className="font-heading font-bold text-sm" style={{ color: textPrimary }}>Session History</h4>
            {records.length === 0 ? (
              <p className="text-xs italic text-center py-4" style={{ color: textMuted }}>No sessions yet</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {[...records].reverse().slice(0, 14).map((r) => (
                  <div
                    key={r.date}
                    className="flex items-center justify-between text-xs rounded-lg px-3 py-2"
                    style={{ backgroundColor: "hsl(var(--commander-navy))", border: `1px solid ${borderColor}` }}
                  >
                    <span style={{ color: textMuted }}>{new Date(r.date).toLocaleDateString()}</span>
                    <span style={{ color: r.completed ? "hsl(var(--neon-green))" : "hsl(var(--urgency-red))" }}>
                      {r.completed ? `✓ ${r.monstersDefeated}/${r.totalMonsters}` : `✗ ${r.monstersDefeated}/${r.totalMonsters}`}
                    </span>
                    <span className="font-mono" style={{ color: textMuted }}>{r.durationSeconds}s</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Settings — Battle Calibration */}
        <TabsContent value="settings">
          <BattleCalibration settings={battleSettings} onUpdate={handleSettingsUpdate} onResetChecklist={onResetChecklist} />
        </TabsContent>

        {/* Weekly Intel */}
        <TabsContent value="intel">
          <WeeklyIntelReport
            records={records}
            hunterName={hunterName}
            currentStreak={currentStreak}
            rewards={rewards}
            onReleaseBounty={onClaimReward}
          />
        </TabsContent>

        {/* Report */}
        <TabsContent value="report">
          <MilestoneAlert currentStreak={currentStreak} rewards={rewards} hunterName={hunterName} onGrantReward={onClaimReward} onDoubleDown={onDoubleDown} />
          <div className="mt-4">
            <IntegrityReportCard report={lastIntegrityReport} />
          </div>
        </TabsContent>

        {/* Sync */}
        <TabsContent value="sync">
          <FamilySyncPanel />
        </TabsContent>

        {/* Voice */}
        <TabsContent value="voice" className="space-y-6">
          <DailyBriefingRecorder />
          <div className="border-t pt-4" style={{ borderColor }}>
            <VoiceMemoRecorder />
          </div>
        </TabsContent>

        {/* Guide */}
        <TabsContent value="guide" className="space-y-4">
          <QuestContract />
          <HuntersHandbook />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentCommandCenter;
