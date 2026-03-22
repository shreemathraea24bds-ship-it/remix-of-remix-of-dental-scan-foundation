import { MessageSquare, AudioLines } from "lucide-react";
import { toast } from "sonner";

interface ChiefComplaintProps {
  complaint?: string;
}

const ChiefComplaint = ({ complaint }: ChiefComplaintProps) => {
  if (!complaint) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-clinical-blue" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Chief Complaint</h4>
        </div>
        <span className="text-[8px] text-muted-foreground uppercase">Patient-Reported</span>
      </div>
      <div className="p-4 space-y-3">
        <blockquote className="text-sm text-foreground italic border-l-2 border-clinical-blue/40 pl-3">
          "{complaint}"
        </blockquote>
        <button
          onClick={() => toast.info("Audio playback is available for live patient submissions.")}
          className="flex items-center gap-2 text-[10px] text-clinical-blue hover:text-clinical-blue/80 transition-colors"
        >
          <AudioLines className="w-3.5 h-3.5" />
          Play original audio memo
        </button>
      </div>
    </div>
  );
};

export default ChiefComplaint;
