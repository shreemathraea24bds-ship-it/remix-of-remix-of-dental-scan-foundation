import type { DentalAnalysis } from "@/components/AnalysisResults";

interface ReportHeaderProps {
  analysis: DentalAnalysis;
}

const urgencyConfig = {
  emergency: { text: "EMERGENCY", color: "text-urgency-red", bg: "bg-urgency-red/10" },
  monitor: { text: "URGENT", color: "text-urgency-amber", bg: "bg-urgency-amber/10" },
  healthy: { text: "ROUTINE", color: "text-scan-green", bg: "bg-scan-green/10" },
};

const ReportHeader = ({ analysis }: ReportHeaderProps) => {
  const urgency = urgencyConfig[analysis.overallHealth];
  const severityScore = analysis.overallHealth === "emergency" ? 9 : analysis.overallHealth === "monitor" ? 5 : 1;

  return (
    <>
      {/* Letterhead */}
      <div className="bg-gradient-to-r from-clinical-blue/8 to-transparent p-5 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-heading font-bold text-base text-foreground">DentaScan AI</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">AI-Assisted Dental Triage Report</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-right space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${urgency.color} ${urgency.bg}`}>
              {urgency.text}
            </span>
            <p className="text-[9px] text-muted-foreground">
              Severity: <span className="font-mono font-bold">{severityScore}/10</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary Box */}
      <div className="p-4 border-b border-border bg-muted/20">
        <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Clinical Summary</h5>
        <p className="text-xs text-foreground leading-relaxed">{analysis.summary}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-[10px] text-muted-foreground">
            Confidence: <span className="font-semibold text-foreground">{analysis.confidence}%</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            Findings: <span className="font-semibold text-foreground">{analysis.findings.length}</span>
          </span>
        </div>
      </div>
    </>
  );
};

export default ReportHeader;
