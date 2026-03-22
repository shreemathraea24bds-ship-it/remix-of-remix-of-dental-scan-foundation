import { useState } from "react";
import { CheckCircle2, XCircle, Edit3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AIFinding {
  condition: string;
  probability: number;
}

interface AIOverruleProps {
  findings: AIFinding[];
  onOverride?: (condition: string, newLabel: string) => void;
}

const OVERRIDE_OPTIONS = [
  "Stain (Non-pathological)",
  "Calculus (Tartar)",
  "Artifact / Shadow",
  "Enamel Hypoplasia",
  "Fluorosis",
  "Normal Variant",
  "Other",
];

const AIOverrule = ({ findings, onOverride }: AIOverruleProps) => {
  const [overrides, setOverrides] = useState<Record<string, { status: "validated" | "corrected"; label?: string }>>({});
  const [editing, setEditing] = useState<string | null>(null);

  const handleValidate = (condition: string) => {
    setOverrides((prev) => ({ ...prev, [condition]: { status: "validated" } }));
    toast.success(`"${condition}" validated — saved as primary clinical record.`);
  };

  const handleCorrect = (condition: string, newLabel: string) => {
    setOverrides((prev) => ({ ...prev, [condition]: { status: "corrected", label: newLabel } }));
    setEditing(null);
    onOverride?.(condition, newLabel);
    toast.info(`AI corrected: "${condition}" → "${newLabel}". Heatmap updated.`);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-urgency-amber" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">AI Overrule — Human Verification</h4>
      </div>

      <div className="p-3 space-y-2">
        {findings.map((f) => {
          const override = overrides[f.condition];
          const isEditing = editing === f.condition;

          return (
            <motion.div
              key={f.condition}
              layout
              className={`rounded-lg border p-3 space-y-2 transition-colors ${
                override?.status === "validated"
                  ? "border-scan-green/30 bg-scan-green/5"
                  : override?.status === "corrected"
                  ? "border-urgency-amber/30 bg-urgency-amber/5"
                  : "border-border bg-muted/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {override?.status === "validated" ? (
                    <CheckCircle2 className="w-4 h-4 text-scan-green" />
                  ) : override?.status === "corrected" ? (
                    <AlertTriangle className="w-4 h-4 text-urgency-amber" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <div>
                    <span className="text-xs font-medium text-foreground">
                      {override?.status === "corrected" ? (
                        <>
                          <span className="line-through text-muted-foreground">{f.condition}</span>
                          <span className="ml-2 text-urgency-amber font-bold">→ {override.label}</span>
                        </>
                      ) : (
                        f.condition
                      )}
                    </span>
                    <span className={`ml-2 text-[10px] font-bold ${f.probability >= 0.7 ? "text-urgency-red" : f.probability >= 0.3 ? "text-urgency-amber" : "text-scan-green"}`}>
                      {Math.round(f.probability * 100)}%
                    </span>
                  </div>
                </div>

                {!override && !isEditing && (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-scan-green hover:bg-scan-green/10" onClick={() => handleValidate(f.condition)}>
                      <CheckCircle2 className="w-3 h-3" /> Validate
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-urgency-amber hover:bg-urgency-amber/10" onClick={() => setEditing(f.condition)}>
                      <XCircle className="w-3 h-3" /> Correct
                    </Button>
                  </div>
                )}

                {override && (
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    override.status === "validated" ? "bg-scan-green/10 text-scan-green" : "bg-urgency-amber/10 text-urgency-amber"
                  }`}>
                    {override.status === "validated" ? "DR. VERIFIED" : "DR. CORRECTED"}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <Select onValueChange={(val) => handleCorrect(f.condition, val)}>
                      <SelectTrigger className="h-8 text-[10px] flex-1">
                        <SelectValue placeholder="Re-tag as..." />
                      </SelectTrigger>
                      <SelectContent>
                        {OVERRIDE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" className="h-8 text-[10px]" onClick={() => setEditing(null)}>Cancel</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        <p className="text-[8px] text-muted-foreground text-center pt-1">
          Doctor corrections override AI — saved as primary clinical record
        </p>
      </div>
    </div>
  );
};

export default AIOverrule;
