import { motion } from "framer-motion";
import { AlertTriangle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BiopsyAlertProps {
  streakDays: number;
}

const BiopsyAlert = ({ streakDays }: BiopsyAlertProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 12 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-2xl border-2 border-urgency-red bg-urgency-red/5 p-5 urgency-pulse"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-urgency-red/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-urgency-red" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-heading font-bold text-base text-urgency-red">
            BIOPSY RECOMMENDED
          </h4>
          <p className="text-xs text-foreground/70 leading-relaxed">
            This lesion has persisted for <strong>{streakDays}+ days</strong> without healing.
            Medical guidelines recommend professional evaluation and possible biopsy
            for oral lesions persisting beyond 10 days.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="urgency" size="sm" className="gap-1.5 haptic-button">
              <AlertTriangle className="w-3.5 h-3.5" />
              Contact Specialist Now
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 haptic-button border-urgency-red/30 text-urgency-red hover:bg-urgency-red/5">
              <Share2 className="w-3.5 h-3.5" />
              Share Report with Dentist
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BiopsyAlert;
