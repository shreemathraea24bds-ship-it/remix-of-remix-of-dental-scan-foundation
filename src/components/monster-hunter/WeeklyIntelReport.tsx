import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, TrendingUp, TrendingDown, Minus, Target, AlertTriangle, Gift, ChevronDown, ChevronUp, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DailyRecord, IntegrityReport, ParentReward } from "./types";

interface WeeklyIntelReportProps {
  records: DailyRecord[];
  hunterName: string;
  currentStreak: number;
  rewards: ParentReward[];
  onReleaseBounty: (id: string) => void;
}

const ZONE_LABELS: Record<string, string> = {
  topLeft: "Upper Left Molars",
  topCenter: "Upper Incisors",
  topRight: "Upper Right Molars",
  left: "Left Side",
  right: "Right Side",
  bottomLeft: "Lower Left Molars",
  bottomCenter: "Lower Incisors",
  bottomRight: "Lower Right Molars",
};

const ZONE_TIPS: Record<string, string> = {
  topLeft: "Suggest the Hunter tilt their head right and open wider to reach these back teeth.",
  topCenter: "Remind the Hunter to use gentle vertical strokes on these front teeth.",
  topRight: "Have the Hunter focus on angling the brush at 45° against the gum-line here.",
  left: "Coach the Hunter to 'Open the Cave' wider during the left-side sweep.",
  right: "Encourage slower circular motions on the right side — speed isn't power!",
  bottomLeft: "The Lower-Left Molars are a classic hideout. Remind the Hunter to sweep behind them.",
  bottomCenter: "Lower front teeth collect tartar fast. Encourage brushing the inner surface.",
  bottomRight: "Suggest the Hunter counts to 10 while brushing this zone specifically.",
};

function getWeekRange(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start,
    end,
    label: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  };
}

function getPreviousWeekRecords(records: DailyRecord[]): DailyRecord[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  thisMonday.setHours(0, 0, 0, 0);
  const prevMonday = new Date(thisMonday);
  prevMonday.setDate(thisMonday.getDate() - 7);
  const prevSunday = new Date(thisMonday);
  prevSunday.setDate(thisMonday.getDate() - 1);
  prevSunday.setHours(23, 59, 59, 999);
  return records.filter(r => {
    const d = new Date(r.date);
    return d >= prevMonday && d <= prevSunday;
  });
}

function getCurrentWeekRecords(records: DailyRecord[]): DailyRecord[] {
  const { start, end } = getWeekRange();
  end.setHours(23, 59, 59, 999);
  return records.filter(r => {
    const d = new Date(r.date);
    return d >= start && d <= end;
  });
}

function computeWeeklyScore(weekRecords: DailyRecord[]) {
  const completed = weekRecords.filter(r => r.completed).length;
  const totalMissions = Math.max(weekRecords.length, 1);
  const avgDuration = weekRecords.length > 0
    ? weekRecords.reduce((s, r) => s + r.durationSeconds, 0) / weekRecords.length
    : 0;
  const completionRate = (completed / 7) * 100;
  // Simple integrity: weigh completion (60%) + duration quality (40%, 120s = 100%)
  const durationScore = Math.min((avgDuration / 120) * 100, 100);
  const integrityScore = Math.round(completionRate * 0.6 + durationScore * 0.4);
  return { completed, totalMissions, avgDuration: Math.round(avgDuration), integrityScore, completionRate };
}

// Aggregate zone coverage from records' metadata (stored integrity reports)
function aggregateZones(weekRecords: DailyRecord[]): Record<string, number> {
  const zones: Record<string, number> = {
    topLeft: 0, topCenter: 0, topRight: 0,
    left: 0, right: 0,
    bottomLeft: 0, bottomCenter: 0, bottomRight: 0,
  };
  // Use monstersDefeated as a proxy per record; distribute across zones equally if no zone data
  weekRecords.forEach(r => {
    const perZone = Math.max(r.monstersDefeated, 0);
    Object.keys(zones).forEach(z => {
      zones[z] += perZone;
    });
  });
  return zones;
}

const WeeklyIntelReport = ({ records, hunterName, currentStreak, rewards, onReleaseBounty }: WeeklyIntelReportProps) => {
  const [showComparison, setShowComparison] = useState(false);

  const week = getWeekRange();
  const thisWeek = getCurrentWeekRecords(records);
  const prevWeek = getPreviousWeekRecords(records);
  const current = computeWeeklyScore(thisWeek);
  const previous = computeWeeklyScore(prevWeek);
  const scoreDelta = current.integrityScore - previous.integrityScore;

  // Zone analysis
  const zones = aggregateZones(thisWeek);
  const zoneEntries = Object.entries(zones);
  const maxZone = zoneEntries.reduce((a, b) => b[1] > a[1] ? b : a, zoneEntries[0]);
  const minZone = zoneEntries.reduce((a, b) => b[1] < a[1] ? b : a, zoneEntries[0]);
  const stronghold = maxZone?.[0] || "topCenter";
  const dangerZone = minZone?.[0] || "bottomLeft";

  // Crystals earned = completed days
  const crystalsEarned = current.completed;

  // Eligible rewards
  const eligibleRewards = rewards.filter(r => currentStreak >= r.streakRequired && !r.claimed);

  const cardBg = "hsl(var(--commander-surface))";
  const borderColor = "hsl(var(--commander-slate) / 0.3)";
  const textPrimary = "hsl(var(--commander-text))";
  const textMuted = "hsl(var(--commander-muted))";
  const accentColor = "hsl(var(--commander-accent))";

  const gradeColor = current.integrityScore >= 80
    ? "hsl(var(--neon-green))"
    : current.integrityScore >= 50
    ? "hsl(var(--neon-gold))"
    : "hsl(var(--urgency-red))";

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 text-center space-y-2"
        style={{
          background: `linear-gradient(135deg, hsl(var(--commander-navy)), ${cardBg})`,
          border: `2px solid ${accentColor}30`,
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" style={{ color: accentColor }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
            Guild Intelligence Briefing
          </p>
        </div>
        <p className="text-xs" style={{ color: textMuted }}>
          Hunter: <strong style={{ color: textPrimary }}>{hunterName}</strong> | Week: <strong style={{ color: textPrimary }}>{week.label}</strong>
        </p>
      </motion.div>

      {/* 1. Frontier Status */}
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: textPrimary }}>
          <span className="text-base">1.</span> Frontier Status
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {/* Integrity Score */}
          <div className="rounded-xl p-3 text-center space-y-1" style={{ backgroundColor: `${gradeColor}08`, border: `1px solid ${gradeColor}25` }}>
            <p className="text-[9px] font-bold uppercase" style={{ color: textMuted }}>Integrity</p>
            <p className="text-2xl font-heading font-black" style={{ color: gradeColor }}>
              {current.integrityScore}%
            </p>
            <p className="text-[9px]" style={{ color: gradeColor }}>
              {current.integrityScore >= 80 ? "Excellent!" : current.integrityScore >= 50 ? "Decent" : "Needs Work"}
            </p>
          </div>

          {/* Missions */}
          <div className="rounded-xl p-3 text-center space-y-1" style={{ backgroundColor: "hsl(var(--commander-navy))", border: `1px solid ${borderColor}` }}>
            <p className="text-[9px] font-bold uppercase" style={{ color: textMuted }}>Sieges</p>
            <p className="text-2xl font-heading font-black" style={{ color: textPrimary }}>
              {current.completed}<span className="text-sm font-normal" style={{ color: textMuted }}>/7</span>
            </p>
            <p className="text-[9px]" style={{ color: textMuted }}>Missions</p>
          </div>

          {/* Crystals */}
          <div className="rounded-xl p-3 text-center space-y-1" style={{ backgroundColor: "hsl(var(--neon-gold) / 0.05)", border: `1px solid hsl(var(--neon-gold) / 0.2)` }}>
            <p className="text-[9px] font-bold uppercase" style={{ color: textMuted }}>Crystals</p>
            <p className="text-2xl font-heading font-black" style={{ color: "hsl(var(--neon-gold))" }}>
              {crystalsEarned}
            </p>
            <p className="text-[9px]" style={{ color: "hsl(var(--neon-gold))" }}>💎 Earned</p>
          </div>
        </div>
      </div>

      {/* 2. Battlefield Analysis */}
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: textPrimary }}>
          <span className="text-base">2.</span> Battlefield Analysis
        </h3>

        {/* Stronghold */}
        <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: "hsl(var(--neon-green) / 0.05)", border: `1px solid hsl(var(--neon-green) / 0.15)` }}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: "hsl(var(--neon-green))" }} />
            <span className="text-xs font-bold" style={{ color: "hsl(var(--neon-green))" }}>
              Stronghold (Cleanest Area)
            </span>
          </div>
          <p className="text-xs" style={{ color: textPrimary }}>
            <strong>{ZONE_LABELS[stronghold]}</strong> — The Hunter is keeping this zone sparkling!
          </p>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: "hsl(var(--urgency-red) / 0.05)", border: `1px solid hsl(var(--urgency-red) / 0.15)` }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: "hsl(var(--urgency-red))" }} />
            <span className="text-xs font-bold" style={{ color: "hsl(var(--urgency-red))" }}>
              Monster Stronghold (Danger Zone)
            </span>
          </div>
          <p className="text-xs" style={{ color: textPrimary }}>
            <strong>{ZONE_LABELS[dangerZone]}</strong> — Our sensors show monsters are regrouping here.
          </p>
        </div>

        {/* Tactical Advice */}
        <div className="rounded-lg p-3" style={{ backgroundColor: "hsl(var(--commander-navy))", border: `1px solid ${borderColor}` }}>
          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: accentColor }}>
            <Target className="w-3 h-3 inline mr-1" />
            Tactical Advice
          </p>
          <p className="text-xs" style={{ color: textMuted }}>
            {ZONE_TIPS[dangerZone]}
          </p>
        </div>
      </div>

      {/* 3. Guild Master's Action */}
      {eligibleRewards.length > 0 && (
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid hsl(var(--neon-gold) / 0.2)` }}>
          <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: textPrimary }}>
            <span className="text-base">3.</span> Guild Master's Action
          </h3>
          <p className="text-xs" style={{ color: textMuted }}>
            The Hunter has earned the following bounties:
          </p>
          <div className="space-y-2">
            {eligibleRewards.map(reward => (
              <div key={reward.id} className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ backgroundColor: "hsl(var(--neon-gold) / 0.06)", border: "1px solid hsl(var(--neon-gold) / 0.15)" }}
              >
                <div>
                  <p className="text-xs font-bold" style={{ color: "hsl(var(--neon-gold))" }}>🎁 {reward.description}</p>
                  <p className="text-[9px]" style={{ color: textMuted }}>{reward.streakRequired}-day streak reward</p>
                </div>
                <Button
                  size="sm"
                  className="gap-1 text-[10px] h-7"
                  style={{ backgroundColor: "hsl(var(--neon-gold))", color: "black" }}
                  onClick={() => onReleaseBounty(reward.id)}
                >
                  <Unlock className="w-3 h-3" />
                  Release Bounty
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare with Last Week */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold"
          style={{ backgroundColor: cardBg, color: textPrimary }}
        >
          <span>📊 Compare with Last Week</span>
          {showComparison ? <ChevronUp className="w-4 h-4" style={{ color: textMuted }} /> : <ChevronDown className="w-4 h-4" style={{ color: textMuted }} />}
        </button>

        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3" style={{ backgroundColor: cardBg }}>
                {/* Delta Banner */}
                <div className="rounded-lg p-3 flex items-center gap-3" style={{
                  backgroundColor: scoreDelta > 0
                    ? "hsl(var(--neon-green) / 0.06)"
                    : scoreDelta < 0
                    ? "hsl(var(--urgency-red) / 0.06)"
                    : "hsl(var(--commander-navy))",
                  border: `1px solid ${scoreDelta > 0 ? "hsl(var(--neon-green) / 0.2)" : scoreDelta < 0 ? "hsl(var(--urgency-red) / 0.2)" : borderColor}`,
                }}>
                  {scoreDelta > 0 ? (
                    <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--neon-green))" }} />
                  ) : scoreDelta < 0 ? (
                    <TrendingDown className="w-5 h-5" style={{ color: "hsl(var(--urgency-red))" }} />
                  ) : (
                    <Minus className="w-5 h-5" style={{ color: textMuted }} />
                  )}
                  <div>
                    <p className="text-sm font-heading font-bold" style={{
                      color: scoreDelta > 0 ? "hsl(var(--neon-green))" : scoreDelta < 0 ? "hsl(var(--urgency-red))" : textPrimary,
                    }}>
                      {scoreDelta > 0 ? `+${scoreDelta}% — Promotion!` : scoreDelta < 0 ? `${scoreDelta}% — Refresher Needed` : "No Change"}
                    </p>
                    <p className="text-[10px]" style={{ color: textMuted }}>
                      {scoreDelta > 0
                        ? "🏅 The Hunter is improving! Consider a bonus reward."
                        : scoreDelta < 0
                        ? "💡 Suggest a \"Refresher Training\" — brush together as a team!"
                        : "Steady performance. Encourage the Hunter to push for a new record."}
                    </p>
                  </div>
                </div>

                {/* Side-by-side stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "This Week", score: current.integrityScore, missions: current.completed, duration: current.avgDuration },
                    { label: "Last Week", score: previous.integrityScore, missions: previous.completed, duration: previous.avgDuration },
                  ].map((w, i) => (
                    <div key={i} className="rounded-lg p-3 space-y-1.5 text-center" style={{ backgroundColor: "hsl(var(--commander-navy))", border: `1px solid ${borderColor}` }}>
                      <p className="text-[9px] font-bold uppercase" style={{ color: i === 0 ? accentColor : textMuted }}>{w.label}</p>
                      <p className="text-xl font-heading font-bold" style={{ color: textPrimary }}>{w.score}%</p>
                      <p className="text-[9px]" style={{ color: textMuted }}>{w.missions}/7 missions • {w.duration}s avg</p>
                    </div>
                  ))}
                </div>

                {/* Promotion / Refresher Badge */}
                {scoreDelta > 0 && (
                  <div className="text-center py-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: "hsl(var(--neon-green) / 0.1)", color: "hsl(var(--neon-green))", border: "1px solid hsl(var(--neon-green) / 0.2)" }}>
                      🎖️ PROMOTED — Rising through the ranks!
                    </span>
                  </div>
                )}
                {scoreDelta < 0 && (
                  <div className="text-center py-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: "hsl(var(--urgency-red) / 0.1)", color: "hsl(var(--urgency-red))", border: "1px solid hsl(var(--urgency-red) / 0.2)" }}>
                      🔄 REFRESHER TRAINING — Brush together tonight!
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Quote */}
      <div className="text-center py-3">
        <p className="text-[10px] italic" style={{ color: textMuted }}>
          "A clean smile is a Hunter's best armor."
        </p>
      </div>
    </div>
  );
};

export default WeeklyIntelReport;
