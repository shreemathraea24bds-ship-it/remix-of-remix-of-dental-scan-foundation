import type { DentalAnalysis } from "@/components/AnalysisResults";

interface ReportVisualsProps {
  analysis: DentalAnalysis;
  imageUrl: string;
}

const ReportVisuals = ({ analysis, imageUrl }: ReportVisualsProps) => (
  <>
    {/* Section A: Visual Comparison */}
    <div className="p-5 border-b border-border space-y-3">
      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Section A — Plaque Map Comparison
      </h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl overflow-hidden border border-border">
          <img src={imageUrl} alt="Raw scan" className="w-full aspect-square object-cover" />
          <p className="text-[9px] text-center text-muted-foreground py-1 bg-muted/30">Natural View</p>
        </div>
        <div className="rounded-xl overflow-hidden border border-border relative">
          <img src={imageUrl} alt="Heatmap overlay" className="w-full aspect-square object-cover" style={{ filter: "hue-rotate(30deg) saturate(1.4)" }} />
          <div className="absolute inset-0 bg-gradient-to-br from-plaque/20 via-transparent to-urgency-red/15 mix-blend-multiply" />
          <p className="text-[9px] text-center text-muted-foreground py-1 bg-muted/30">AI Heatmap</p>
        </div>
      </div>
    </div>

    {/* Section B: Metrics */}
    <div className="p-5 border-b border-border space-y-3">
      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Section B — Clinical Metrics
      </h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Plaque Level</span>
          <p className="text-sm font-heading font-bold text-foreground capitalize mt-1">{analysis.plaqueLevel || "N/A"}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Gum Health</span>
          <p className="text-sm font-heading font-bold text-foreground capitalize mt-1">{(analysis.gumHealth || "N/A").replace(/_/g, " ")}</p>
        </div>
      </div>
    </div>
  </>
);

export default ReportVisuals;
