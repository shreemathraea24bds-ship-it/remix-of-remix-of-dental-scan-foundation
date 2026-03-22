import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Gift, Calendar, BarChart3, ScrollText, BookOpen, Bell, Shield, Volume2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyRecord, ParentReward, IntegrityReport } from "./types";
import QuestContract from "./QuestContract";
import HuntersHandbook from "./HuntersHandbook";
import MilestoneAlert from "./MilestoneAlert";
import IntegrityReportCard from "./IntegrityReport";
import VoiceMemoRecorder from "./VoiceMemoRecorder";
import DailyBriefingRecorder from "./DailyBriefingRecorder";
import FamilySyncPanel from "./FamilySyncPanel";

interface ParentPortalProps {
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
}

const ParentPortal = ({ records, rewards, currentStreak, totalBattles, hunterName, lastIntegrityReport, onAddReward, onRemoveReward, onClaimReward, onDoubleDown }: ParentPortalProps) => {
  const [newReward, setNewReward] = useState("");
  const [newStreak, setNewStreak] = useState(7);

  const handleAdd = () => {
    if (!newReward.trim()) return;
    onAddReward(newReward.trim(), newStreak);
    setNewReward("");
    setNewStreak(7);
  };

  const completedDays = records.filter((r) => r.completed).length;
  const avgDuration = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.durationSeconds, 0) / records.length)
    : 0;

  return (
    <Tabs defaultValue="alerts" className="space-y-4">
      <TabsList className="w-full grid grid-cols-7">
        <TabsTrigger value="alerts" className="flex-1 gap-0.5 text-[9px]">
          <Bell className="w-3 h-3" />
          Alerts
        </TabsTrigger>
        <TabsTrigger value="sync" className="flex-1 gap-0.5 text-[9px]">
          <Link2 className="w-3 h-3" />
          Sync
        </TabsTrigger>
        <TabsTrigger value="voice" className="flex-1 gap-0.5 text-[9px]">
          <Volume2 className="w-3 h-3" />
          Voice
        </TabsTrigger>
        <TabsTrigger value="integrity" className="flex-1 gap-0.5 text-[9px]">
          <Shield className="w-3 h-3" />
          Report
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex-1 gap-0.5 text-[9px]">
          <BarChart3 className="w-3 h-3" />
          Stats
        </TabsTrigger>
        <TabsTrigger value="contract" className="flex-1 gap-0.5 text-[9px]">
          <ScrollText className="w-3 h-3" />
          Contract
        </TabsTrigger>
        <TabsTrigger value="handbook" className="flex-1 gap-0.5 text-[9px]">
          <BookOpen className="w-3 h-3" />
          Guide
        </TabsTrigger>
      </TabsList>

      <TabsContent value="alerts">
        <MilestoneAlert
          currentStreak={currentStreak}
          rewards={rewards}
          hunterName={hunterName}
          onGrantReward={onClaimReward}
          onDoubleDown={onDoubleDown}
        />
      </TabsContent>

      <TabsContent value="sync">
        <FamilySyncPanel />
      </TabsContent>

      <TabsContent value="voice" className="space-y-6">
        <DailyBriefingRecorder />
        <div className="border-t border-border pt-4">
          <VoiceMemoRecorder />
        </div>
      </TabsContent>

      <TabsContent value="integrity">
        <IntegrityReportCard report={lastIntegrityReport} />
      </TabsContent>

      <TabsContent value="stats" className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Current Streak", value: `${currentStreak}d`, icon: <Calendar className="w-4 h-4 text-plaque-gold" /> },
            { label: "Total Battles", value: totalBattles, icon: <BarChart3 className="w-4 h-4 text-primary" /> },
            { label: "Completed Days", value: completedDays, icon: <Gift className="w-4 h-4 text-scan-green" /> },
            { label: "Avg Duration", value: `${avgDuration}s`, icon: <Calendar className="w-4 h-4 text-monitor-amber" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card border border-border p-3 text-center space-y-1"
            >
              <div className="flex justify-center">{stat.icon}</div>
              <p className="text-lg font-heading font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Custom Rewards */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
            <Gift className="w-4 h-4 text-plaque-gold" />
            Custom Rewards
          </h4>
          <p className="text-xs text-muted-foreground">Set rewards your child earns at streak milestones.</p>

          <div className="flex gap-2">
            <Input
              placeholder="e.g. Extra 15 min screen time"
              value={newReward}
              onChange={(e) => setNewReward(e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              min={1}
              max={365}
              value={newStreak}
              onChange={(e) => setNewStreak(Number(e.target.value))}
              className="w-20 text-sm"
              placeholder="Days"
            />
            <Button size="icon" onClick={handleAdd} className="flex-shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {rewards.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-4">No custom rewards yet</p>
          )}

          <div className="space-y-2">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between rounded-lg bg-muted/40 border border-border p-3">
                <div>
                  <p className="text-xs font-medium text-foreground">{reward.description}</p>
                  <p className="text-[10px] text-muted-foreground">At {reward.streakRequired}-day streak</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentStreak >= reward.streakRequired && (
                    <span className="text-[10px] font-bold text-scan-green">EARNED!</span>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveReward(reward.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent history */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-sm text-foreground">Brushing History</h4>
          {records.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">No sessions yet</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {[...records].reverse().slice(0, 14).map((r) => (
                <div key={r.date} className="flex items-center justify-between text-xs bg-muted/20 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>
                  <span className={r.completed ? "text-scan-green font-bold" : "text-urgency-red"}>
                    {r.completed ? `✓ ${r.monstersDefeated}/${r.totalMonsters}` : `✗ ${r.monstersDefeated}/${r.totalMonsters}`}
                  </span>
                  <span className="text-muted-foreground font-mono">{r.durationSeconds}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="contract">
        <QuestContract />
      </TabsContent>

      <TabsContent value="handbook">
        <HuntersHandbook />
      </TabsContent>
    </Tabs>
  );
};

export default ParentPortal;
