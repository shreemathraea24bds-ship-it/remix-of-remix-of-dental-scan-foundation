import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, TrendingUp, TrendingDown, Minus, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, subDays } from "date-fns";

interface WeeklySummary {
  totalScans: number;
  avgPh: number;
  phTrend: "improving" | "declining" | "stable" | "insufficient";
  latestPh: number;
  daysSinceLastScan: number;
  defectsResolved: number;
  newDefects: number;
}

const REMINDER_KEY = "tongue-reminder-enabled";
const LAST_REMINDER_KEY = "tongue-last-reminder";

const TongueReminder = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(REMINDER_KEY) === "true");
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeeklySummary();
    if (enabled) checkAndNotify();
  }, []);

  const fetchWeeklySummary = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const weekAgo = subDays(new Date(), 7).toISOString();
    const { data: recentScans } = await supabase
      .from("tongue_analyses")
      .select("estimated_ph, tongue_defects, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: true });

    const { data: allScans } = await supabase
      .from("tongue_analyses")
      .select("estimated_ph, tongue_defects, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!allScans || allScans.length === 0) {
      setSummary({
        totalScans: 0, avgPh: 7.0, phTrend: "insufficient",
        latestPh: 7.0, daysSinceLastScan: 999, defectsResolved: 0, newDefects: 0,
      });
      setLoading(false);
      return;
    }

    const latest = allScans[0];
    const daysSince = differenceInDays(new Date(), new Date(latest.created_at));
    const weekScans = recentScans || [];
    const avgPh = weekScans.length > 0
      ? weekScans.reduce((s, r) => s + r.estimated_ph, 0) / weekScans.length
      : latest.estimated_ph;

    let phTrend: WeeklySummary["phTrend"] = "insufficient";
    if (allScans.length >= 2) {
      const diff = allScans[0].estimated_ph - allScans[1].estimated_ph;
      phTrend = Math.abs(diff) < 0.2 ? "stable" : diff > 0 ? "improving" : "declining";
    }

    const latestDefects = (latest.tongue_defects as any[])?.length || 0;
    const prevDefects = allScans.length >= 2 ? ((allScans[1].tongue_defects as any[])?.length || 0) : 0;

    setSummary({
      totalScans: weekScans.length,
      avgPh,
      phTrend,
      latestPh: latest.estimated_ph,
      daysSinceLastScan: daysSince,
      defectsResolved: Math.max(0, prevDefects - latestDefects),
      newDefects: Math.max(0, latestDefects - prevDefects),
    });
    setLoading(false);
  };

  const checkAndNotify = () => {
    const lastReminder = localStorage.getItem(LAST_REMINDER_KEY);
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (!lastReminder || now - parseInt(lastReminder) > sevenDays) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🔬 Tongue Health Reminder", {
          body: "Time for your weekly tongue scan! Track your oral health trends.",
          icon: "/pwa-icon-192.png",
        });
        localStorage.setItem(LAST_REMINDER_KEY, now.toString());
      }
    }
  };

  const toggleReminder = async (value: boolean) => {
    setEnabled(value);
    localStorage.setItem(REMINDER_KEY, value.toString());

    if (value && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Please allow notifications in your browser settings");
        setEnabled(false);
        localStorage.setItem(REMINDER_KEY, "false");
        return;
      }
      toast.success("Weekly reminders enabled! You'll be notified every 7 days.");
    } else if (!value) {
      toast.info("Reminders disabled");
    }
  };

  const trendConfig = {
    improving: { icon: <TrendingUp className="w-4 h-4" />, label: "Improving", color: "text-scan-green" },
    declining: { icon: <TrendingDown className="w-4 h-4" />, label: "Declining", color: "text-urgency-red" },
    stable: { icon: <Minus className="w-4 h-4" />, label: "Stable", color: "text-muted-foreground" },
    insufficient: { icon: <Minus className="w-4 h-4" />, label: "Need more data", color: "text-muted-foreground" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
              Weekly Reminder
            </h4>
            <p className="text-[10px] text-muted-foreground">Get notified to scan your tongue</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={toggleReminder} />
      </div>

      {/* Weekly Summary Banner */}
      {summary && summary.totalScans > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="w-full rounded-xl bg-muted/50 border border-border p-3 text-left transition-colors hover:bg-muted/80"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">This Week's Summary</span>
              <Badge variant="outline" className={`text-[9px] gap-1 ${trendConfig[summary.phTrend].color}`}>
                {trendConfig[summary.phTrend].icon}
                {trendConfig[summary.phTrend].label}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-heading font-bold text-foreground">{summary.totalScans}</p>
                <p className="text-[9px] text-muted-foreground">Scans</p>
              </div>
              <div>
                <p className="text-lg font-heading font-bold text-primary">{summary.avgPh.toFixed(1)}</p>
                <p className="text-[9px] text-muted-foreground">Avg pH</p>
              </div>
              <div>
                <p className="text-lg font-heading font-bold text-foreground">{summary.daysSinceLastScan}d</p>
                <p className="text-[9px] text-muted-foreground">Since Last</p>
              </div>
            </div>

            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                    {summary.defectsResolved > 0 && (
                      <p className="text-[10px] text-scan-green">✅ {summary.defectsResolved} defect{summary.defectsResolved > 1 ? "s" : ""} resolved</p>
                    )}
                    {summary.newDefects > 0 && (
                      <p className="text-[10px] text-urgency-amber">⚠️ {summary.newDefects} new defect{summary.newDefects > 1 ? "s" : ""} detected</p>
                    )}
                    {summary.daysSinceLastScan > 7 && (
                      <p className="text-[10px] text-urgency-red">🔴 Overdue — scan your tongue today!</p>
                    )}
                    {summary.daysSinceLastScan <= 3 && (
                      <p className="text-[10px] text-scan-green">🟢 On track — great scanning habit!</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Latest pH: {summary.latestPh.toFixed(1)} · Trend: {trendConfig[summary.phTrend].label}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}

      {/* No scans yet */}
      {summary && summary.totalScans === 0 && summary.daysSinceLastScan === 999 && (
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-muted/50 border border-border p-3 text-center">
            <p className="text-[11px] text-muted-foreground">No scans yet this week. Start your first tongue scan to build your health timeline!</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TongueReminder;
