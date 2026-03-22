import { useState } from "react";
import { type PatientScan } from "./mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SecureVault from "./SecureVault";
import ChiefComplaint from "./ChiefComplaint";
import PaymentGate from "./PaymentGate";
import ComparisonSlider from "./ComparisonSlider";
import AuditTrail from "./AuditTrail";
import AIOverrule from "./AIOverrule";
import RevenueLedger from "./RevenueLedger";
import { Lock, Ruler } from "lucide-react";

interface ClinicalViewProps {
  scan: PatientScan;
  onBruteForceDetected?: () => void;
}

const ClinicalView = ({ scan, onBruteForceDetected }: ClinicalViewProps) => {
  const [vaultUnlocked, setVaultUnlocked] = useState(scan.doctorAccessPaid);
  const [reportUnlocked, setReportUnlocked] = useState(scan.doctorAccessPaid);
  const [measureMode, setMeasureMode] = useState(false);

  const { aiAnalysis } = scan;
  const trendData = aiAnalysis.lesionTrend.map((size, i) => ({ day: i + 1, size }));
  const topProb = [...aiAnalysis.probabilities].sort((a, b) => b.probability - a.probability);

  const isFullyAccessible = reportUnlocked;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      {/* Patient Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-foreground">
            {vaultUnlocked ? scan.patientName : scan.maskedName}
          </h2>
          <p className="text-xs text-muted-foreground">{scan.scanType} · Submitted {scan.submittedAt.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          {scan.consultationPaid && (
            <span className="text-[8px] font-bold uppercase px-2 py-1 rounded-full bg-scan-green/10 text-scan-green">₹100 PAID</span>
          )}
          <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${scan.urgency === "red" ? "bg-urgency-red/10 text-urgency-red" : scan.urgency === "amber" ? "bg-urgency-amber/10 text-urgency-amber" : "bg-scan-green/10 text-scan-green"}`}>
            {scan.urgency === "red" ? "Emergency" : scan.urgency === "amber" ? "Monitor" : "Routine"}
          </span>
        </div>
      </div>

      {/* Secure Vault */}
      <SecureVault scan={scan} isUnlocked={vaultUnlocked} onUnlock={() => setVaultUnlocked(true)} onBruteForceDetected={onBruteForceDetected} />

      {/* Audit Trail — Chain of Custody */}
      <AuditTrail
        doctorName={vaultUnlocked ? "Provider" : ""}
        isVaultUnlocked={vaultUnlocked}
      />

      {/* Chief Complaint */}
      <ChiefComplaint complaint={scan.chiefComplaint} />

      {/* Payment Gate */}
      {!reportUnlocked && (
        <PaymentGate scan={scan} onDoctorPaid={() => setReportUnlocked(true)} />
      )}

      {/* Clinical Data */}
      <div className={`relative ${!isFullyAccessible ? "select-none" : ""}`}>
        {!isFullyAccessible && (
          <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/40 rounded-xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">Pay ₹75 to Unlock Report</p>
              <p className="text-[10px] text-muted-foreground">AI analysis, heatmaps & hi-res photos</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Time-Travel Comparison Slider */}
          <ComparisonSlider />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Visual Evidence */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Evidence</h3>
                <button
                  onClick={() => setMeasureMode(!measureMode)}
                  className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-full transition-colors ${measureMode ? "bg-clinical-blue/10 text-clinical-blue" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  <Ruler className="w-3 h-3" />
                  {measureMode ? "Measuring" : "Measure"}
                </button>
              </div>
              <div className="aspect-[4/3] rounded-xl bg-foreground/95 border border-border flex items-center justify-center relative overflow-hidden">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-muted/10 mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50">Patient scan image</p>
                </div>
                <div className="absolute inset-0 border border-clinical-blue/20 rounded-xl pointer-events-none" />
                <div className="absolute top-2 left-2 text-[8px] text-clinical-blue/50 font-mono">DENTASCAN VIEWER</div>
                <div className="absolute bottom-2 right-2 text-[8px] text-clinical-blue/50 font-mono">
                  {measureMode ? "MODE: MEASURE (mm²)" : "ZOOM: 1×"}
                </div>
                {measureMode && (
                  <div className="absolute inset-0 cursor-crosshair" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 19px, hsl(var(--clinical-blue) / 0.1) 19px, hsl(var(--clinical-blue) / 0.1) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, hsl(var(--clinical-blue) / 0.1) 19px, hsl(var(--clinical-blue) / 0.1) 20px)" }} />
                )}
              </div>

              {trendData.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4 shadow-card">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Lesion Size Trend (14-Day)</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" unit="mm" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                      <Line type="monotone" dataKey="size" stroke="hsl(var(--urgency-red))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--urgency-red))" }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Right: AI Insights + Overrule */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Insights</h3>

              <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Probability Scores</h4>
                {topProb.map((p) => (
                  <div key={p.condition} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{p.condition}</span>
                      <span className={`text-sm font-heading font-bold ${p.probability >= 0.7 ? "text-urgency-red" : p.probability >= 0.3 ? "text-urgency-amber" : "text-scan-green"}`}>
                        {Math.round(p.probability * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${p.probability >= 0.7 ? "bg-urgency-red" : p.probability >= 0.3 ? "bg-urgency-amber" : "bg-scan-green"}`} style={{ width: `${p.probability * 100}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-muted-foreground italic mt-2">AI Co-Pilot suggestion — clinical judgment required</p>
              </div>

              {/* AI Overrule Tool */}
              <AIOverrule findings={aiAnalysis.probabilities} />

              <div className="grid grid-cols-2 gap-3">
                {aiAnalysis.lesionSizeMm > 0 && (
                  <div className="bg-card rounded-xl border border-border p-3 shadow-card text-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Lesion Size</span>
                    <p className="text-xl font-heading font-bold text-foreground mt-1">{aiAnalysis.lesionSizeMm}mm</p>
                  </div>
                )}
                {aiAnalysis.colorDelta !== "N/A" && (
                  <div className="bg-card rounded-xl border border-border p-3 shadow-card text-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Color Delta</span>
                    <p className="text-xs font-mono font-bold text-foreground mt-2">{aiAnalysis.colorDelta}</p>
                  </div>
                )}
                <div className="bg-card rounded-xl border border-border p-3 shadow-card text-center">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Plaque Coverage</span>
                  <p className="text-xl font-heading font-bold text-urgency-amber mt-1">{aiAnalysis.plaqueCoverage}%</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-3 shadow-card text-center">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Brush Efficiency</span>
                  <p className="text-xl font-heading font-bold text-scan-green mt-1">{aiAnalysis.brushingEfficiency}%</p>
                </div>
              </div>

              {scan.notes && (
                <div className="bg-card rounded-xl border border-border p-4 shadow-card">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
                  <p className="text-xs text-foreground">{scan.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Ledger */}
          <RevenueLedger />
        </div>
      </div>
    </div>
  );
};

export default ClinicalView;
