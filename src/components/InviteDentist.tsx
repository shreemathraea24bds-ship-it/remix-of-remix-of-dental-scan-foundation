import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share2, Copy, CheckCircle2, Stethoscope, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InviteDentist = () => {
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const inviteLink = `${window.location.origin}/doctor-signup`;
  const inviteMessage = `Hi Doctor! I'm using DentaScan AI for dental health tracking. Join as a verified provider to receive patient consultations, AI-analyzed scans & earn per case. Sign up here: ${inviteLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join DentaScan as a Provider", text: inviteMessage, url: inviteLink });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full gap-2 border-clinical-blue/30 text-clinical-blue hover:bg-clinical-blue/5"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Share2 className="w-4 h-4" />
        Share App with Your Dentist
      </Button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clinical-blue/10 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-clinical-blue" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Invite Your Dentist</p>
                  <p className="text-[10px] text-muted-foreground">They'll join as a verified provider</p>
                </div>
              </div>

              {/* Link preview */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                <code className="text-[10px] text-muted-foreground flex-1 truncate">{inviteLink}</code>
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-[10px]" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="w-3 h-3 text-scan-green" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-[10px] h-8" onClick={handleWhatsApp}>
                  <MessageSquare className="w-3 h-3 text-scan-green" />
                  WhatsApp
                </Button>
                <Button variant="clinical" size="sm" className="gap-1.5 text-[10px] h-8" onClick={handleShare}>
                  <Share2 className="w-3 h-3" />
                  Share
                </Button>
              </div>

              <p className="text-[8px] text-muted-foreground text-center">
                Your dentist will create a Provider account & appear in your consultation list
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InviteDentist;
