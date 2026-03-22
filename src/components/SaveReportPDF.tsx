import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DentalAnalysis } from "./AnalysisResults";

interface SaveReportPDFProps {
  analysis: DentalAnalysis;
  imageUrl: string;
}

function generateReportHTML(analysis: DentalAnalysis, imageUrl: string): string {
  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const severityColor: Record<string, string> = {
    healthy: "#22c55e",
    monitor: "#f59e0b",
    emergency: "#ef4444",
  };

  const defectsHTML = analysis.defects?.map(d => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;text-transform:capitalize">${d.type.replace(/_/g, " ")}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${d.location}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-transform:capitalize;color:${d.severity === "severe" ? "#ef4444" : d.severity === "moderate" ? "#f59e0b" : "#3b82f6"}">${d.severity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${d.description}</td>
    </tr>
  `).join("") || "";

  const findingsHTML = analysis.findings?.map(f => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${f.area}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${f.condition}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${severityColor[f.severity] || "#333"};text-transform:capitalize">${f.severity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-style:italic">${f.recommendation}</td>
    </tr>
  `).join("") || "";

  // Generate food recommendations
  const foods = [
    { name: "Cheese & Yogurt", benefit: "Remineralizes enamel, neutralizes acids" },
    { name: "Crunchy Apples & Carrots", benefit: "Natural plaque scrubber, stimulates saliva" },
    { name: "Leafy Greens", benefit: "Calcium & folic acid for enamel strength" },
    { name: "Green Tea", benefit: "Catechins reduce bacteria & inflammation" },
  ];

  const remedies = [
    { name: "Salt Water Rinse", detail: "½ tsp salt in warm water, swish 30 sec" },
    { name: "Oil Pulling", detail: "1 tbsp coconut oil, swish 15-20 min on empty stomach" },
    { name: "Neem Twig Brushing", detail: "Natural antibacterial, fights cavities" },
  ];

  if (analysis.gumHealth?.includes("inflammation")) {
    remedies.push({ name: "Turmeric Paste", detail: "½ tsp turmeric + mustard oil, massage gums 2 min" });
  }
  if (analysis.defects?.some(d => ["crack", "chip", "erosion"].includes(d.type))) {
    remedies.push({ name: "Clove Oil", detail: "Dab on sensitive area for natural pain relief" });
  }

  const foodsHTML = foods.map(f => `<li style="margin-bottom:6px"><strong>${f.name}</strong> — ${f.benefit}</li>`).join("");
  const remediesHTML = remedies.map(r => `<li style="margin-bottom:6px"><strong>${r.name}</strong> — ${r.detail}</li>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dental Report - PearlyView AI</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px; color: #1a1a1a; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid ${severityColor[analysis.overallHealth] || "#333"}; padding-bottom: 16px; margin-bottom: 24px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f5f5f5; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ddd; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 8px; }
  .scan-img { max-width: 200px; border-radius: 12px; border: 2px solid #eee; }
  .stats { display: flex; gap: 16px; }
  .stat-box { flex: 1; background: #f9f9f9; border-radius: 8px; padding: 12px; text-align: center; }
  .stat-label { font-size: 10px; text-transform: uppercase; color: #888; }
  .stat-value { font-size: 18px; font-weight: 700; margin-top: 4px; }
  ul { padding-left: 20px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; }
</style></head><body>
<div class="header">
  <div>
    <h1 style="margin:0;font-size:22px">🦷 PearlyView AI — Dental Report</h1>
    <p style="margin:4px 0 0;font-size:12px;color:#888">${date} at ${time}</p>
  </div>
  <span class="badge" style="background:${severityColor[analysis.overallHealth] || "#333"}">${analysis.overallHealth.toUpperCase()}</span>
</div>

<div class="section">
  <div style="display:flex;gap:16px;align-items:flex-start">
    <img src="${imageUrl}" class="scan-img" alt="Dental scan" />
    <div style="flex:1">
      <p style="font-size:14px;line-height:1.6">${analysis.summary}</p>
      <p style="font-size:11px;color:#888;margin-top:4px">Confidence: ${analysis.confidence}%</p>
    </div>
  </div>
</div>

<div class="section">
  <div class="stats">
    <div class="stat-box">
      <div class="stat-label">Plaque Level</div>
      <div class="stat-value" style="text-transform:capitalize">${analysis.plaqueLevel || "N/A"}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Gum Health</div>
      <div class="stat-value" style="text-transform:capitalize">${(analysis.gumHealth || "N/A").replace(/_/g, " ")}</div>
    </div>
  </div>
</div>

${analysis.defects && analysis.defects.length > 0 ? `
<div class="section">
  <div class="section-title">⚠️ Defects Detected (${analysis.defects.length})</div>
  <table><tr><th>Type</th><th>Location</th><th>Severity</th><th>Description</th></tr>${defectsHTML}</table>
</div>` : ""}

${analysis.findings && analysis.findings.length > 0 ? `
<div class="section">
  <div class="section-title">🔍 Clinical Findings</div>
  <table><tr><th>Area</th><th>Condition</th><th>Status</th><th>Recommendation</th></tr>${findingsHTML}</table>
</div>` : ""}

<div class="section">
  <div class="section-title">🍎 Recommended Foods</div>
  <ul>${foodsHTML}</ul>
</div>

<div class="section">
  <div class="section-title">🏠 Home Remedies</div>
  <ul>${remediesHTML}</ul>
</div>

<div class="section">
  <div class="section-title">📋 Health Tips</div>
  <ul>
    <li style="margin-bottom:6px">Brush with fluoride toothpaste for 2 minutes, twice daily</li>
    <li style="margin-bottom:6px">Wait 30 minutes after acidic foods before brushing</li>
    <li style="margin-bottom:6px">Floss daily — cleans 40% of surfaces brushing misses</li>
    <li style="margin-bottom:6px">Replace your toothbrush every 3 months</li>
    <li style="margin-bottom:6px">Drink water after every meal to rinse acids</li>
  </ul>
</div>

<div class="footer">
  ⚕️ AI analysis is for informational purposes only. Consult a dentist for professional diagnosis.<br/>
  Generated by PearlyView AI • ${date}
</div>
</body></html>`;
}

const SaveReportPDF = ({ analysis, imageUrl }: SaveReportPDFProps) => {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    try {
      const html = generateReportHTML(analysis, imageUrl);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to save the report.");
        setSaving(false);
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      // Give the image time to load before printing
      setTimeout(() => {
        printWindow.print();
        setSaving(false);
        toast.success("Report ready! Use 'Save as PDF' in the print dialog.");
      }, 800);
    } catch {
      setSaving(false);
      toast.error("Failed to generate report.");
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2 text-[12px]"
      onClick={handleSave}
      disabled={saving}
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {saving ? "Generating Report…" : "Save Report as PDF"}
    </Button>
  );
};

export default SaveReportPDF;
