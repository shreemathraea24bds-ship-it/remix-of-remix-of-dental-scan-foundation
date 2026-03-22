import { useState, useEffect } from "react";
import { CheckCircle2, Camera, Send, Loader2, Video, Shield, Clock, CalendarPlus, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type PatientScan } from "./mockData";
import { toast } from "sonner";

interface ActionCenterProps {
  scan: PatientScan | null;
}

const ActionCenter = ({ scan }: ActionCenterProps) => {
  const [approving, setApproving] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);

  // Wait timer
  useEffect(() => {
    if (!scan) return;
    const base = Math.floor((Date.now() - scan.submittedAt.getTime()) / 1000);
    setWaitSeconds(base);
    const interval = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [scan]);

  const formatWait = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  if (!scan) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center">Select a patient to view actions</p>
      </div>
    );
  }

  const handleApprove = () => {
    if (!disclaimerChecked) {
      toast.error("Please accept the clinical disclaimer first.");
      return;
    }
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      toast.success(`Triage approved for ${scan.patientName}. Auto-call scheduled.`);
    }, 1500);
  };

  const handleJitsiCall = () => {
    const roomName = `dentascan-${scan.id}-${Date.now()}`;
    window.open(`https://meet.jit.si/${roomName}`, "_blank");
    toast.success("Secure consultation room opened.");
  };

  const handleSchedule = () => {
    const title = encodeURIComponent(`DentaScan Follow-Up: ${scan.maskedName}`);
    const details = encodeURIComponent(`Scan Type: ${scan.scanType}\nUrgency: ${scan.urgency}\nTop Finding: ${scan.aiAnalysis.probabilities.sort((a, b) => b.probability - a.probability)[0]?.condition}`);
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`, "_blank");
    toast.success("Calendar invite opened with pre-filled scan data.");
  };

  const urgencyScore = scan.urgency === "red" ? 9 : scan.urgency === "amber" ? 5 : 2;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-heading font-bold text-sm text-foreground">Action Center</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">{scan.maskedName}</p>
      </div>

      {/* Wait Timer + Urgency Score */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px]">
          <Clock className={`w-3 h-3 ${waitSeconds > 3600 ? "text-urgency-red" : "text-urgency-amber"}`} />
          <span className="font-mono font-bold text-foreground">{formatWait(waitSeconds)}</span>
          <span className="text-muted-foreground">waiting</span>
        </div>
        <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${scan.urgency === "red" ? "bg-urgency-red/10 text-urgency-red" : scan.urgency === "amber" ? "bg-urgency-amber/10 text-urgency-amber" : "bg-scan-green/10 text-scan-green"}`}>
          URGENCY: {urgencyScore}/10
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 p-4 overflow-y-auto">
        {/* Approve Triage */}
        <Button variant="default" className="w-full justify-start gap-2 haptic-button h-auto py-3" onClick={handleApprove} disabled={approving || !disclaimerChecked}>
          {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <div className="text-left">
            <p className="text-xs font-semibold">Approve Triage</p>
            <p className="text-[9px] opacity-70">Confirm AI status & schedule patient call</p>
          </div>
        </Button>

        {/* Secure Consultation */}
        <Button variant="outline" className="w-full justify-start gap-2 haptic-button h-auto py-3 border-clinical-blue/30 text-clinical-blue hover:bg-clinical-blue/5" onClick={handleJitsiCall}>
          <Video className="w-4 h-4" />
          <div className="text-left">
            <p className="text-xs font-semibold">Start Secure Consultation</p>
            <p className="text-[9px] opacity-70">Launch Jitsi Meet video call</p>
          </div>
        </Button>

        {/* Generate Referral PDF */}
        <Button variant="outline" className="w-full justify-start gap-2 haptic-button h-auto py-3 border-urgency-amber/30 text-urgency-amber hover:bg-urgency-amber/5" onClick={() => toast.success("Referral package generated. HIPAA-compliant PDF ready.")}>
          <FileText className="w-4 h-4" />
          <div className="text-left">
            <p className="text-xs font-semibold">Generate Referral PDF</p>
            <p className="text-[9px] opacity-70">Package 14-day history as HIPAA PDF</p>
          </div>
        </Button>

        {/* Schedule In-Office Visit */}
        <Button variant="outline" className="w-full justify-start gap-2 haptic-button h-auto py-3" onClick={handleSchedule}>
          <CalendarPlus className="w-4 h-4" />
          <div className="text-left">
            <p className="text-xs font-semibold">Schedule In-Office Visit</p>
            <p className="text-[9px] text-muted-foreground">Auto-fill scan data into calendar invite</p>
          </div>
        </Button>

        {/* Message Parent */}
        <Button variant="outline" className="w-full justify-start gap-2 haptic-button h-auto py-3" onClick={() => toast.info("Secure message sent to parent/guardian.")}>
          <MessageSquare className="w-4 h-4" />
          <div className="text-left">
            <p className="text-xs font-semibold">Message Parent</p>
            <p className="text-[9px] text-muted-foreground">Send encrypted notification</p>
          </div>
        </Button>

        {/* Request Better Photo */}
        <Button variant="outline" className="w-full justify-start gap-2 haptic-button h-auto py-3" onClick={() => toast.info("Photo request sent with lighting/angle guide.")}>
          <Camera className="w-4 h-4" />
          <div className="text-left">
            <p className="text-xs font-semibold">Request Better Photo</p>
            <p className="text-[9px] text-muted-foreground">Send lighting & angle guide</p>
          </div>
        </Button>

        {/* Urgency summary */}
        <div className={`rounded-xl border p-3 space-y-1 ${scan.urgency === "red" ? "border-urgency-red/30 bg-urgency-red/5" : scan.urgency === "amber" ? "border-urgency-amber/30 bg-urgency-amber/5" : "border-scan-green/30 bg-scan-green/5"}`}>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">AI Urgency Assessment</p>
          <p className={`text-sm font-heading font-bold ${scan.urgency === "red" ? "text-urgency-red" : scan.urgency === "amber" ? "text-urgency-amber" : "text-scan-green"}`}>
            {scan.urgency === "red" ? "Immediate Attention" : scan.urgency === "amber" ? "Monitor Closely" : "Routine"}
          </p>
          <p className="text-[9px] text-muted-foreground">
            Top: {scan.aiAnalysis.probabilities.sort((a, b) => b.probability - a.probability)[0]?.condition} ({Math.round(scan.aiAnalysis.probabilities.sort((a, b) => b.probability - a.probability)[0]?.probability * 100)}%)
          </p>
        </div>

        {/* Clinical Disclaimer */}
        <div className="mt-auto rounded-xl border border-border bg-muted/20 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Checkbox id="disclaimer" checked={disclaimerChecked} onCheckedChange={(checked) => setDisclaimerChecked(!!checked)} className="mt-0.5" />
            <label htmlFor="disclaimer" className="text-[9px] text-muted-foreground leading-relaxed cursor-pointer">
              I understand this AI is a triage assistant and I will confirm findings with clinical instruments before making any diagnosis.
            </label>
          </div>
          <div className="flex items-center gap-1 text-[8px] text-scan-green">
            <Shield className="w-2.5 h-2.5" />
            <span className="font-semibold">HIPAA · GDPR · AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCenter;
