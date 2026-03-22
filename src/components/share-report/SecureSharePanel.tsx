import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LockOpen, Copy, Check, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const SecureSharePanel = () => {
  const [encrypted, setEncrypted] = useState(false);
  const [accessCode] = useState(generateAccessCode);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCodeCopied(true);
    toast.success("Access code copied!");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {encrypted ? <Lock className="w-4 h-4 text-scan-green" /> : <LockOpen className="w-4 h-4 text-muted-foreground" />}
          <Label htmlFor="hipaa-toggle" className="text-xs font-semibold text-foreground cursor-pointer">
            Secure Clinical Link
          </Label>
        </div>
        <Switch id="hipaa-toggle" checked={encrypted} onCheckedChange={setEncrypted} />
      </div>

      <AnimatePresence>
        {encrypted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-scan-green/5 border border-scan-green/20 rounded-lg p-3 space-y-3"
          >
            {/* Expiry notice */}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              Link expires in 48 hours
            </div>

            {/* Access code */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5">Safety Key — share with your dentist:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-center">
                  <span className="text-lg font-mono font-bold text-foreground tracking-[0.3em]">{accessCode}</span>
                </div>
                <Button variant="outline" size="icon" className="haptic-button" onClick={handleCopyCode}>
                  {codeCopied ? <Check className="w-4 h-4 text-scan-green" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-1.5 text-[9px] text-scan-green font-semibold">
              <ShieldCheck className="w-3 h-3" />
              256-bit encrypted · PIN-protected · 48h expiry
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecureSharePanel;
