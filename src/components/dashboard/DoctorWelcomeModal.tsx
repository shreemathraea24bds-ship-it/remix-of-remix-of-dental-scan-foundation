import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, IndianRupee, Video, CheckCircle2, ArrowRight, Key, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DoctorWelcomeModalProps {
  doctorName: string;
  open: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
}

const DoctorWelcomeModal = ({ doctorName, open, onClose, onGoToDashboard }: DoctorWelcomeModalProps) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[hsl(var(--clinical-blue))] to-[hsl(215,70%,35%)] p-6 text-center relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">Welcome to the Guild, Doctor!</h2>
            <p className="text-white/70 text-xs mt-1">Your DentaScan Provider Portal is Active</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <p className="text-sm text-foreground">
              Dear <span className="font-semibold">Dr. {doctorName}</span>, welcome to the future of AI-assisted dental triage.
              You've joined the <span className="font-semibold text-clinical-blue">DentaScan Provider Network</span>.
            </p>

            {/* Security */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-urgency-amber" />
                Your Security Credentials
              </h3>
              <div className="space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 mt-0.5 text-clinical-blue flex-shrink-0" />
                  <p><span className="font-semibold text-foreground">Private Master Password</span> — Set during your first login. Decrypts patient identities.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 mt-0.5 text-scan-green flex-shrink-0" />
                  <p><span className="font-semibold text-foreground">Patient Safety Key</span> — A unique 6-digit PIN from each patient for HIPAA compliance.</p>
                </div>
              </div>
              <p className="text-[10px] text-urgency-red font-semibold">
                ⚠️ Never share your Master Password. It's the only way to decrypt private patient identities.
              </p>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground">How the Triage Queue Works</h3>
              {[
                {
                  icon: <CheckCircle2 className="w-4 h-4" />,
                  color: "text-clinical-blue",
                  title: "Review Triage Badge",
                  desc: "Scans arrive labeled Emergency, Monitor, or Routine via AI detection.",
                },
                {
                  icon: <Lock className="w-4 h-4" />,
                  color: "text-urgency-amber",
                  title: "Unlock Identity — ₹75",
                  desc: "Pay to access full name, contact details & Medical Vault.",
                },
                {
                  icon: <IndianRupee className="w-4 h-4" />,
                  color: "text-scan-green",
                  title: "Earn ₹100 Per Consultation",
                  desc: "Patient pays directly for your professional review.",
                },
                {
                  icon: <Video className="w-4 h-4" />,
                  color: "text-clinical-blue",
                  title: "Connect via Secure Video",
                  desc: "One-tap Jitsi Meet to bring patients into your clinic.",
                },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{step.title}</p>
                    <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Card */}
            <div className="rounded-xl border border-scan-green/30 bg-scan-green/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Your Earnings Per Case</p>
                  <p className="text-lg font-heading font-bold text-scan-green">₹100</p>
                  <p className="text-[10px] text-muted-foreground">Direct consultation fee from patient</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">Platform Fee</p>
                  <p className="text-lg font-heading font-bold text-foreground">₹75</p>
                  <p className="text-[10px] text-muted-foreground">AI analysis + secure hosting</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button onClick={onGoToDashboard} className="w-full gap-2" size="lg">
              Go to Provider Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[8px] text-scan-green">
              <Shield className="w-2.5 h-2.5" />
              <span className="font-semibold">HIPAA COMPLIANT · E2E ENCRYPTED · AES-256</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DoctorWelcomeModal;
