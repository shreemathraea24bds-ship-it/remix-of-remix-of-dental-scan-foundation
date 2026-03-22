import { motion } from "framer-motion";
import { Shield, Target, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import type { IntegrityReport as IReport } from "./types";

interface IntegrityReportProps {
  report: IReport | null;
}

const ZONE_LABELS: Record<string, string> = {
  topLeft: "Upper Left",
  topCenter: "Upper Center",
  topRight: "Upper Right",
  left: "Left Side",
  right: "Right Side",
  bottomLeft: "Lower Left",
  bottomCenter: "Lower Center",
  bottomRight: "Lower Right",
};

const getGrade = (score: number) => {
  if (score >= 90) return { label: "S", color: "text-plaque-gold", bg: "bg-plaque-gold/10" };
  if (score >= 75) return { label: "A", color: "text-scan-green", bg: "bg-scan-green/10" };
  if (score >= 60) return { label: "B", color: "text-primary", bg: "bg-primary/10" };
  if (score >= 40) return { label: "C", color: "text-monitor-amber", bg: "bg-monitor-amber/10" };
  return { label: "D", color: "text-urgency-red", bg: "bg-urgency-red/10" };
};

const IntegrityReportCard = ({ report }: IntegrityReportProps) => {
  if (!report) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-6 text-center space-y-2">
        <Shield className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="text-xs text-muted-foreground">No battle data yet.</p>
        <p className="text-[10px] text-muted-foreground">Complete a battle to see the Hunter's Integrity Report.</p>
      </div>
    );
  }

  const overall = getGrade(report.integrityScore);
  const accuracy = getGrade(report.accuracy);
  const vigor = getGrade(report.vigor);

  return (
    <div className="space-y-4">
      {/* Overall Grade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-plaque-gold/20 bg-gradient-to-br from-plaque-gold/5 via-card to-card p-5 text-center space-y-2"
      >
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hunter's Integrity</p>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${overall.bg} border border-current/10`}>
          <span className={`text-3xl font-heading font-black ${overall.color}`}>{overall.label}</span>
        </div>
        <p className={`text-2xl font-heading font-bold ${overall.color}`}>{report.integrityScore}%</p>
        <p className="text-[10px] text-muted-foreground">
          {report.integrityScore >= 90 ? "Exemplary Hunter — True warrior spirit!" :
           report.integrityScore >= 75 ? "Good effort — keep sharpening those skills!" :
           report.integrityScore >= 50 ? "Needs improvement — the Guild Master is watching!" :
           "Suspicious activity detected — inspection recommended!"}
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Accuracy", value: report.accuracy, grade: accuracy, icon: <Target className="w-3.5 h-3.5" /> },
          { label: "Vigor", value: report.vigor, grade: vigor, icon: <Zap className="w-3.5 h-3.5" /> },
          { label: "Attacks", value: report.totalAttacks, grade: null, icon: <Shield className="w-3.5 h-3.5 text-primary" /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-3 text-center space-y-1"
          >
            <div className={`flex justify-center ${stat.grade?.color || "text-primary"}`}>{stat.icon}</div>
            <p className={`text-lg font-heading font-bold ${stat.grade?.color || "text-foreground"}`}>
              {stat.grade ? `${stat.value}%` : stat.value}
            </p>
            <p className="text-[9px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Zone Coverage Radar */}
      <div className="space-y-2">
        <h5 className="font-heading font-bold text-xs text-foreground flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-primary" />
          Zone Coverage Map
        </h5>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(report.zoneCoverage).map(([zone, hits], i) => {
            const maxHits = Math.max(...Object.values(report.zoneCoverage), 1);
            const pct = Math.round((hits / maxHits) * 100);
            const isLow = pct < 30;
            return (
              <motion.div
                key={zone}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] ${
                  isLow ? "bg-urgency-red/5 border border-urgency-red/20" : "bg-muted/30 border border-border"
                }`}
              >
                <div className="flex-1">
                  <span className={isLow ? "text-urgency-red font-bold" : "text-foreground"}>
                    {ZONE_LABELS[zone] || zone}
                  </span>
                </div>
                <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow ? "bg-urgency-red" : pct > 70 ? "bg-scan-green" : "bg-monitor-amber"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`font-mono w-6 text-right ${isLow ? "text-urgency-red" : "text-muted-foreground"}`}>
                  {hits}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Penalties & Warnings */}
      {(report.mimicPenalties > 0 || report.blockModeTriggered > 0 || report.dryBrushWarnings > 0) && (
        <div className="space-y-2">
          <h5 className="font-heading font-bold text-xs text-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-monitor-amber" />
            Infractions
          </h5>
          <div className="space-y-1">
            {report.mimicPenalties > 0 && (
              <div className="flex items-center gap-2 text-[10px] bg-urgency-red/5 border border-urgency-red/20 rounded-lg px-3 py-2">
                <span>🎭</span>
                <span className="text-urgency-red font-bold">Mimic Penalty ×{report.mimicPenalties}</span>
                <span className="text-muted-foreground ml-auto">Closed-mouth detected</span>
              </div>
            )}
            {report.blockModeTriggered > 0 && (
              <div className="flex items-center gap-2 text-[10px] bg-monitor-amber/5 border border-monitor-amber/20 rounded-lg px-3 py-2">
                <span>🛡️</span>
                <span className="text-monitor-amber font-bold">Block Mode ×{report.blockModeTriggered}</span>
                <span className="text-muted-foreground ml-auto">Bad rhythm detected</span>
              </div>
            )}
            {report.dryBrushWarnings > 0 && (
              <div className="flex items-center gap-2 text-[10px] bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                <span>💧</span>
                <span className="text-primary font-bold">Dry Brush ×{report.dryBrushWarnings}</span>
                <span className="text-muted-foreground ml-auto">Insufficient technique</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All clear */}
      {report.mimicPenalties === 0 && report.blockModeTriggered === 0 && report.dryBrushWarnings === 0 && (
        <div className="flex items-center gap-2 text-[10px] bg-scan-green/5 border border-scan-green/20 rounded-lg px-3 py-2.5">
          <CheckCircle className="w-4 h-4 text-scan-green" />
          <span className="text-scan-green font-bold">Clean session — no infractions detected!</span>
        </div>
      )}
    </div>
  );
};

export default IntegrityReportCard;
