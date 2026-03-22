import type { DentalAnalysis } from "@/components/AnalysisResults";

interface ReportFindingsProps {
  analysis: DentalAnalysis;
}

const ReportFindings = ({ analysis }: ReportFindingsProps) => (
  <div className="p-5 space-y-3">
    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Section C — AI Diagnostic Notes
    </h5>
    {analysis.findings.length > 0 ? (
      <ul className="space-y-2">
        {analysis.findings.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
              f.severity === "emergency" ? "bg-urgency-red" : f.severity === "monitor" ? "bg-urgency-amber" : "bg-scan-green"
            }`} />
            <div>
              <span className="font-semibold text-foreground">{f.area}:</span>{" "}
              <span className="text-muted-foreground">{f.condition}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">→ {f.recommendation}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-muted-foreground italic">No significant findings detected.</p>
    )}
    <p className="text-[9px] text-muted-foreground text-center italic pt-2 border-t border-border">
      AI analysis for informational purposes only. This does not constitute a medical diagnosis.
    </p>
  </div>
);

export default ReportFindings;
