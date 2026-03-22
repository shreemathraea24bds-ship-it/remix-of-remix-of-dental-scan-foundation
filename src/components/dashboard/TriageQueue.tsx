import { type PatientScan } from "./mockData";
import { Clock, Eye, IndianRupee, CheckCircle2 } from "lucide-react";

interface TriageQueueProps {
  scans: PatientScan[];
  selectedId: string | null;
  onSelect: (scan: PatientScan) => void;
}

const urgencyConfig = {
  red: { bg: "bg-urgency-red/10", border: "border-urgency-red/40", dot: "bg-urgency-red", label: "EMERGENCY" },
  amber: { bg: "bg-urgency-amber/10", border: "border-urgency-amber/40", dot: "bg-urgency-amber", label: "MONITOR" },
  green: { bg: "bg-scan-green/10", border: "border-scan-green/40", dot: "bg-scan-green", label: "ROUTINE" },
};

const formatTimeSince = (date: Date) => {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const TriageQueue = ({ scans, selectedId, onSelect }: TriageQueueProps) => {
  const sorted = [...scans].sort((a, b) => {
    const order = { red: 0, amber: 1, green: 2 };
    return order[a.urgency] - order[b.urgency] || a.submittedAt.getTime() - b.submittedAt.getTime();
  });

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-heading font-bold text-sm text-foreground">Triage Queue</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {scans.filter(s => s.status === "pending").length} pending review
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sorted.map((scan) => {
          const uc = urgencyConfig[scan.urgency];
          const isSelected = scan.id === selectedId;
          return (
            <button
              key={scan.id}
              onClick={() => onSelect(scan)}
              className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted/50
                ${isSelected ? "bg-clinical-blue/5 border-l-2 border-l-clinical-blue" : "border-l-2 border-l-transparent"}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${uc.dot}`} />
                    <span className="text-sm font-semibold text-foreground truncate">{scan.maskedName}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate pl-4">{scan.scanType}</p>
                  {/* Payment indicators */}
                  <div className="flex items-center gap-2 pl-4 mt-1">
                    {scan.consultationPaid && (
                      <span className="flex items-center gap-0.5 text-[8px] text-scan-green">
                        <CheckCircle2 className="w-2.5 h-2.5" />₹100
                      </span>
                    )}
                    {scan.doctorAccessPaid && (
                      <span className="flex items-center gap-0.5 text-[8px] text-clinical-blue">
                        <CheckCircle2 className="w-2.5 h-2.5" />₹75
                      </span>
                    )}
                    {!scan.consultationPaid && (
                      <span className="flex items-center gap-0.5 text-[8px] text-urgency-amber">
                        <IndianRupee className="w-2.5 h-2.5" />Unpaid
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${uc.bg} ${scan.urgency === "red" ? "text-urgency-red" : scan.urgency === "amber" ? "text-urgency-amber" : "text-scan-green"}`}>
                    {uc.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimeSince(scan.submittedAt)}
                  </span>
                </div>
              </div>
              {scan.status !== "pending" && (
                <div className="flex items-center gap-1 mt-1 pl-4">
                  <Eye className="w-2.5 h-2.5 text-scan-green" />
                  <span className="text-[9px] text-scan-green font-medium capitalize">{scan.status}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TriageQueue;
