import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Send, Phone, Calendar, Shield, Activity, Clock, ChevronDown, ChevronUp, MapPin,
} from "lucide-react";

type Priority = "emergency" | "monitor" | "healthy";

interface TriagePriorityCardProps {
  priority: Priority;
  title: string;
  summary: string;
  toothId?: string;
  onCall?: () => void;
  onSendReport?: () => void;
  onFindEmergencyDentist?: () => void;
  onBook?: () => void;
}

const priorityConfig = {
  emergency: {
    border: "border-t-urgency-red",
    label: "Emergency",
    labelClass: "text-urgency-red bg-urgency-red/10",
    cardClass: "urgency-pulse",
    icon: Activity,
    gradient: "from-urgency-red/5 to-transparent",
  },
  monitor: {
    border: "border-t-urgency-amber",
    label: "Urgent · Monitor",
    labelClass: "text-urgency-amber bg-urgency-amber/10",
    cardClass: "",
    icon: Clock,
    gradient: "from-urgency-amber/5 to-transparent",
  },
  healthy: {
    border: "border-t-scan-green",
    label: "Healthy",
    labelClass: "text-scan-green bg-scan-green/10",
    cardClass: "",
    icon: Shield,
    gradient: "from-scan-green/5 to-transparent",
  },
};

// Mock sensitivity log for monitor priority
const sensitivityLog = [
  { date: "Mar 5", trigger: "Cold drink", level: 6 },
  { date: "Mar 3", trigger: "Sweet food", level: 4 },
  { date: "Feb 28", trigger: "Cold air", level: 3 },
];

const TriagePriorityCard = ({
  priority,
  title,
  summary,
  toothId,
  onCall,
  onSendReport,
  onFindEmergencyDentist,
}: TriagePriorityCardProps) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  const [expanded, setExpanded] = useState(false);

  // Calculate next cleaning countdown for healthy
  const nextCleaning = 47; // days

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-sm bg-card rounded-xl border border-border border-t-4 ${config.border} shadow-card overflow-hidden ${config.cardClass}`}
    >
      <div className={`bg-gradient-to-b ${config.gradient} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Icon className={`w-3.5 h-3.5 ${config.labelClass.split(" ")[0]}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.labelClass}`}>
              {config.label}
            </span>
          </div>
          {toothId && (
            <span className="text-[10px] font-mono text-muted-foreground">#{toothId}</span>
          )}
        </div>

        <h3 className="font-heading font-semibold text-base text-card-foreground mb-2">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {summary}
        </p>

        {/* Priority-specific content */}
        {priority === "emergency" && (
          <div className="space-y-3">
            {/* Pre-filled report preview */}
            <div className="rounded-lg bg-urgency-red/5 border border-urgency-red/20 p-3">
              <span className="text-[9px] uppercase tracking-wider text-urgency-red font-semibold">Pre-Filled Report</span>
              <p className="text-[11px] text-foreground/70 mt-1">
                Dx: Acute Pulpitis · Tooth #{toothId} · Severity: 9/10 · Recommend: Emergency root canal or extraction within 24hrs.
              </p>
            </div>
            <Button variant="urgency" className="w-full haptic-button gap-2" onClick={onCall}>
              <Phone className="w-4 h-4" />
              Call Dentist Now
            </Button>
            <Button variant="outline" className="w-full haptic-button gap-2 text-xs" onClick={onSendReport}>
              <Send className="w-3.5 h-3.5" />
              Send Emergency Report
            </Button>
            {onFindEmergencyDentist && (
              <Button variant="outline" className="w-full haptic-button gap-2 text-xs border-urgency-red/30 text-urgency-red hover:bg-urgency-red/5" onClick={onFindEmergencyDentist}>
                <MapPin className="w-3.5 h-3.5" />
                Find Emergency Dentist Nearby
              </Button>
            )}
          </div>
        )}

        {priority === "monitor" && (
          <div className="space-y-3">
            {/* Expandable sensitivity log */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between rounded-lg bg-urgency-amber/5 border border-urgency-amber/20 p-3 haptic-button"
            >
              <span className="text-[10px] uppercase tracking-wider text-urgency-amber font-semibold">
                Sensitivity Log ({sensitivityLog.length})
              </span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-urgency-amber" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-urgency-amber" />
              )}
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1.5"
              >
                {sensitivityLog.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-md bg-muted/50">
                    <span className="text-muted-foreground">{entry.date}</span>
                    <span className="text-foreground">{entry.trigger}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-urgency-amber"
                          style={{ width: `${entry.level * 10}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono">{entry.level}/10</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            <Button variant="clinical" className="w-full haptic-button gap-2" onClick={onBook}>
              <Calendar className="w-4 h-4" />
              Book Appointment
            </Button>
          </div>
        )}

        {priority === "healthy" && (
          <div className="space-y-3">
            {/* Good job badge */}
            <div className="flex items-center justify-center py-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-scan-green/10 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-scan-green" />
                </div>
                <span className="text-xs font-heading font-bold text-scan-green">Great Job!</span>
              </motion.div>
            </div>

            {/* Cleaning countdown */}
            <div className="rounded-lg bg-scan-green/5 border border-scan-green/20 p-3 text-center">
              <span className="text-[9px] uppercase tracking-wider text-scan-green font-semibold">Next Routine Cleaning</span>
              <p className="text-2xl font-heading font-bold text-foreground mt-1">{nextCleaning}</p>
              <p className="text-[10px] text-muted-foreground">days remaining</p>
            </div>

            <Button variant="outline" className="w-full haptic-button gap-2 text-xs" onClick={onBook}>
              <Calendar className="w-3.5 h-3.5" />
              Schedule Cleaning
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TriagePriorityCard;
