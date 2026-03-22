import { useState } from "react";
import { Share2, Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DentalAnalysis } from "@/components/AnalysisResults";
import ReportHeader from "@/components/share-report/ReportHeader";
import ReportVisuals from "@/components/share-report/ReportVisuals";
import ReportFindings from "@/components/share-report/ReportFindings";
import LesionHistoryGrid from "@/components/share-report/LesionHistoryGrid";
import DentistSearch from "@/components/share-report/DentistSearch";
import SecureSharePanel from "@/components/share-report/SecureSharePanel";

interface ShareReportProps {
  analysis: DentalAnalysis;
  imageUrl: string;
}

const ShareReport = ({ analysis, imageUrl }: ShareReportProps) => {
  const [selectedDentist, setSelectedDentist] = useState<{ id: string; name: string; specialty: string; clinic: string } | null>(null);

  const severityScore = analysis.overallHealth === "emergency" ? 9 : analysis.overallHealth === "monitor" ? 5 : 1;

  const handleShare = async () => {
    const reportText = `DentaScan AI Clinical Report
Generated: ${new Date().toLocaleString()}
Severity: ${severityScore}/10

Diagnosis: ${analysis.summary}
Plaque Level: ${analysis.plaqueLevel}
Gum Health: ${(analysis.gumHealth || "").replace(/_/g, " ")}

Areas of Concern:
${analysis.findings.map((f) => `• ${f.area}: ${f.condition} (${f.severity}) → ${f.recommendation}`).join("\n")}
${selectedDentist ? `\nReferred to: ${selectedDentist.name} — ${selectedDentist.clinic}` : ""}

⚠️ AI analysis for informational purposes only.`;

    if (navigator.share) {
      try { await navigator.share({ title: "DentaScan AI Clinical Report", text: reportText }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(reportText);
      toast.success("Report copied to clipboard!");
    }
  };

  const handleDownloadJSON = () => {
    const report = {
      timestamp: new Date().toISOString(),
      triageLevel: analysis.overallHealth,
      severity: severityScore,
      diagnosis: analysis.summary,
      plaqueLevel: analysis.plaqueLevel,
      gumHealth: analysis.gumHealth,
      findings: analysis.findings,
      referredTo: selectedDentist,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dentascan-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm text-foreground">Clinical Report</h3>
        <div className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-clinical-blue" />
          <span className="text-[9px] text-muted-foreground font-medium">REPORT READY</span>
        </div>
      </div>

      {/* Report document */}
      <div className="report-printable rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <ReportHeader analysis={analysis} />
        <ReportVisuals analysis={analysis} imageUrl={imageUrl} />
        <LesionHistoryGrid />
        <ReportFindings analysis={analysis} />
      </div>

      {/* Dentist search */}
      <DentistSearch selectedDentist={selectedDentist} onSelect={setSelectedDentist} />

      {/* Secure sharing */}
      <SecureSharePanel />

      {/* Action buttons — prominent share */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="clinical" className="flex-1 haptic-button gap-2 text-sm font-semibold" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Share Report
        </Button>
        <Button variant="outline" className="haptic-button gap-2" onClick={handleDownloadJSON}>
          <Download className="w-4 h-4" />
          JSON
        </Button>
        <Button variant="outline" className="haptic-button gap-2" onClick={() => { window.print(); toast.success("Print dialog opened."); }}>
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>
    </div>
  );
};

export default ShareReport;
