import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Eye, ShieldAlert, AlignVerticalSpaceAround, CircleAlert, Crosshair } from "lucide-react";
import ToothMapVisualization from "./ToothMapVisualization";
import DentalRemedies from "./DentalRemedies";
import DailyRoutineGenerator from "./DailyRoutineGenerator";
import SaveReportPDF from "./SaveReportPDF";

interface Finding {
  area: string;
  condition: string;
  severity: "healthy" | "monitor" | "emergency";
  recommendation: string;
}

interface TeethArrangement {
  alignment: "well_aligned" | "mild_crowding" | "moderate_crowding" | "severe_crowding";
  bite: "normal" | "overbite" | "underbite" | "crossbite" | "open_bite";
  spacing: "normal" | "gaps_present" | "overcrowded";
  description: string;
  orthodonticNeed: "none" | "minor" | "moderate" | "significant";
}

interface Defect {
  type: string;
  location: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  urgency: "routine" | "soon" | "urgent";
}

export interface DentalAnalysis {
  overallHealth: "healthy" | "monitor" | "emergency";
  confidence: number;
  findings: Finding[];
  summary: string;
  plaqueLevel: string;
  gumHealth: string;
  teethArrangement?: TeethArrangement;
  defects?: Defect[];
}

interface AnalysisResultsProps {
  analysis: DentalAnalysis;
  imageUrl: string;
}

const severityConfig = {
  healthy: { color: "bg-scan-green", textColor: "text-scan-green", icon: CheckCircle, label: "Healthy" },
  monitor: { color: "bg-urgency-amber", textColor: "text-urgency-amber", icon: Eye, label: "Monitor" },
  emergency: { color: "bg-urgency-red", textColor: "text-urgency-red", icon: ShieldAlert, label: "Emergency" },
};

const alignmentLabels: Record<string, string> = {
  well_aligned: "Well Aligned",
  mild_crowding: "Mild Crowding",
  moderate_crowding: "Moderate Crowding",
  severe_crowding: "Severe Crowding",
};

const biteLabels: Record<string, string> = {
  normal: "Normal",
  overbite: "Overbite",
  underbite: "Underbite",
  crossbite: "Crossbite",
  open_bite: "Open Bite",
};

const spacingLabels: Record<string, string> = {
  normal: "Normal",
  gaps_present: "Gaps Present",
  overcrowded: "Overcrowded",
};

const orthodonticColors: Record<string, string> = {
  none: "text-scan-green",
  minor: "text-clinical-blue",
  moderate: "text-urgency-amber",
  significant: "text-urgency-red",
};

const defectUrgencyConfig: Record<string, { color: string; label: string }> = {
  routine: { color: "text-scan-green bg-scan-green/10", label: "Routine" },
  soon: { color: "text-urgency-amber bg-urgency-amber/10", label: "Soon" },
  urgent: { color: "text-urgency-red bg-urgency-red/10", label: "Urgent" },
};

const defectSeverityConfig: Record<string, string> = {
  mild: "text-clinical-blue",
  moderate: "text-urgency-amber",
  severe: "text-urgency-red",
};

const AnalysisResults = ({ analysis, imageUrl }: AnalysisResultsProps) => {
  const overall = severityConfig[analysis.overallHealth] || severityConfig.healthy;
  const OverallIcon = overall.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-4"
    >
      {/* Header card */}
      <div className={`rounded-2xl border-t-4 ${overall.color} border-border bg-card p-5 shadow-card`}>
        <div className="flex items-start gap-3">
          <img src={imageUrl} alt="Analyzed photo" className="w-16 h-16 rounded-lg object-cover border border-border" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <OverallIcon className={`w-5 h-5 ${overall.textColor}`} />
              <span className={`text-sm font-heading font-bold ${overall.textColor}`}>{overall.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{analysis.confidence}% confidence</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card border border-border p-3 shadow-card">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Plaque Level</span>
          <p className="text-sm font-heading font-semibold text-foreground capitalize mt-0.5">{analysis.plaqueLevel || "N/A"}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 shadow-card">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Gum Health</span>
          <p className="text-sm font-heading font-semibold text-foreground capitalize mt-0.5">{(analysis.gumHealth || "N/A").replace(/_/g, " ")}</p>
        </div>
      </div>

      {/* Tooth Map Visualization */}
      {((analysis.defects && analysis.defects.length > 0) || (analysis.findings && analysis.findings.length > 0)) && (
        <ToothMapVisualization defects={analysis.defects} findings={analysis.findings} />
      )}

      {/* Teeth Arrangement Section */}
      {analysis.teethArrangement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-3"
        >
          <div className="flex items-center gap-2">
            <AlignVerticalSpaceAround className="w-4 h-4 text-clinical-blue" />
            <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Teeth Arrangement</h4>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.teethArrangement.description}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Alignment</span>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {alignmentLabels[analysis.teethArrangement.alignment] || analysis.teethArrangement.alignment}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Bite</span>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {biteLabels[analysis.teethArrangement.bite] || analysis.teethArrangement.bite}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Spacing</span>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {spacingLabels[analysis.teethArrangement.spacing] || analysis.teethArrangement.spacing}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Ortho Need</span>
              <p className={`text-xs font-semibold mt-0.5 capitalize ${orthodonticColors[analysis.teethArrangement.orthodonticNeed] || "text-foreground"}`}>
                {analysis.teethArrangement.orthodonticNeed || "N/A"}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Defects Section */}
      {analysis.defects && analysis.defects.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-urgency-red" />
            <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
              Defects Detected ({analysis.defects.length})
            </h4>
          </div>
          {analysis.defects.map((defect, i) => {
            const urgency = defectUrgencyConfig[defect.urgency] || defectUrgencyConfig.routine;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl bg-card border border-border p-3 shadow-card"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CircleAlert className={`w-4 h-4 ${defectSeverityConfig[defect.severity] || "text-foreground"}`} />
                  <span className="text-xs font-semibold text-foreground capitalize">{defect.type.replace(/_/g, " ")}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ml-auto ${urgency.color}`}>
                    {urgency.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">{defect.location}</span> — {defect.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* General Findings */}
      {analysis.findings?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Clinical Findings</h4>
          {analysis.findings.map((f, i) => {
            const config = severityConfig[f.severity] || severityConfig.healthy;
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card border border-border p-3 shadow-card"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                  <span className="text-xs font-semibold text-foreground">{f.area}</span>
                  <span className={`text-[9px] font-medium ${config.textColor} ${config.color}/15 px-1.5 py-0.5 rounded-full ml-auto`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{f.condition}</p>
                <p className="text-[11px] text-foreground/70 italic">→ {f.recommendation}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Daily Routine Generator */}
      <DailyRoutineGenerator
        overallHealth={analysis.overallHealth}
        plaqueLevel={analysis.plaqueLevel}
        gumHealth={analysis.gumHealth}
        defects={analysis.defects}
      />

      {/* Food, Tips & Home Remedies */}
      <DentalRemedies
        overallHealth={analysis.overallHealth}
        plaqueLevel={analysis.plaqueLevel}
        gumHealth={analysis.gumHealth}
        defects={analysis.defects}
      />

      {/* Save as PDF */}
      <SaveReportPDF analysis={analysis} imageUrl={imageUrl} />

      <p className="text-[10px] text-muted-foreground text-center pt-2">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        AI analysis is for informational purposes only. Consult a dentist for diagnosis.
      </p>
    </motion.div>
  );
};

export default AnalysisResults;
