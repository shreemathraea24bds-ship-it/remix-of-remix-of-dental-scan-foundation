import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Shield, ShieldOff, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KillSwitchProps {
  doctorId: string;
  onLockdown: () => void;
}

const KillSwitch = ({ doctorId, onLockdown }: KillSwitchProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [activating, setActivating] = useState(false);
  const [lockdownActive, setLockdownActive] = useState(false);

  const getDeviceId = () => {
    let id = sessionStorage.getItem("dentascan-device-id");
    if (!id) {
      id = `DEV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
      sessionStorage.setItem("dentascan-device-id", id);
    }
    return id;
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      // Insert lockdown record
      const { error } = await supabase.from("guardian_lockdowns").insert({
        doctor_id: doctorId,
        device_id: getDeviceId(),
        trigger_type: "manual",
        is_active: true,
      } as any);

      if (error) throw error;

      // Clear all local sensitive data
      clearLocalData();

      setLockdownActive(true);
      setShowFinalConfirm(false);

      // Force sign out after animation
      setTimeout(async () => {
        onLockdown();
        await supabase.auth.signOut();
        toast.error("Guardian Protocol activated. All vaults locked.");
      }, 2500);
    } catch (err) {
      toast.error("Failed to activate lockdown. Try again.");
      setActivating(false);
    }
  };

  const clearLocalData = () => {
    // Clear all DentaScan-related localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dentascan")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Clear session storage
    sessionStorage.clear();
  };

  // Listen for remote wipe via realtime
  useEffect(() => {
    const channel = supabase
      .channel("guardian-lockdown")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guardian_lockdowns",
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload: any) => {
          if (payload.new?.is_active && payload.new?.device_id === "all") {
            clearLocalData();
            setLockdownActive(true);
            toast.error("Remote lockdown triggered. All vaults wiped.");
            setTimeout(() => {
              onLockdown();
              supabase.auth.signOut();
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId, onLockdown]);

  // Lockdown animation overlay
  if (lockdownActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-foreground flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <ShieldOff className="w-20 h-20 text-urgency-red mx-auto" />
          </motion.div>
          <h2 className="font-heading font-bold text-2xl text-urgency-red">GUARDIAN PROTOCOL ACTIVE</h2>
          <p className="text-sm text-muted-foreground">All decryption keys destroyed. Vaults locked.</p>
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 2.5, ease: "linear" }}
            className="h-1 bg-urgency-red rounded-full mx-auto max-w-xs"
          />
          <p className="text-[10px] text-muted-foreground/50">Redirecting to login...</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Kill Switch Button */}
      <div className="rounded-xl border-2 border-urgency-red/30 bg-urgency-red/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-urgency-red" />
          <div>
            <h4 className="text-xs font-bold text-urgency-red uppercase tracking-wider">Emergency Account Lockdown</h4>
            <p className="text-[9px] text-muted-foreground">Lost or stolen device? Instantly lock all patient vaults.</p>
          </div>
        </div>
        <Button
          variant="destructive"
          className="w-full gap-2 haptic-button font-bold"
          onClick={() => setShowConfirm(true)}
        >
          <ShieldOff className="w-4 h-4" />
          Activate Kill Switch
        </Button>
      </div>

      {/* First confirmation */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-urgency-red">
              <AlertTriangle className="w-5 h-5" />
              Emergency Lockdown
            </DialogTitle>
            <DialogDescription className="text-xs">
              This will instantly de-authorize this device and lock all Patient Vaults. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-urgency-red/20 bg-urgency-red/5 p-3 text-[10px] text-foreground space-y-1">
            <p>• All AES-256 decryption keys will be destroyed</p>
            <p>• All revealed patient names revert to masked state</p>
            <p>• Session tokens wiped from device cache</p>
            <p>• All connected devices will be force-logged out</p>
            <p className="font-bold text-urgency-red pt-1">⚠ You will need your 12-Word Recovery Phrase to regain access.</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">Cancel</Button>
            <Button
              variant="destructive"
              className="flex-1 gap-1.5"
              onClick={() => { setShowConfirm(false); setShowFinalConfirm(true); }}
            >
              <Lock className="w-3.5 h-3.5" />
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final confirmation */}
      <Dialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-urgency-red text-center">
              FINAL CONFIRMATION
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Type <span className="font-mono font-bold text-foreground">LOCKDOWN</span> to confirm
            </DialogDescription>
          </DialogHeader>
          <LockdownConfirmInput onConfirm={handleActivate} activating={activating} />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Separate component for the confirmation input
const LockdownConfirmInput = ({ onConfirm, activating }: { onConfirm: () => void; activating: boolean }) => {
  const [text, setText] = useState("");
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value.toUpperCase())}
        placeholder="Type LOCKDOWN"
        className="w-full h-10 rounded-lg border-2 border-urgency-red/30 bg-urgency-red/5 px-3 text-sm font-mono text-center text-urgency-red placeholder:text-urgency-red/30 focus:outline-none focus:border-urgency-red"
      />
      <Button
        variant="destructive"
        className="w-full gap-2"
        disabled={text !== "LOCKDOWN" || activating}
        onClick={onConfirm}
      >
        {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
        {activating ? "Activating Guardian Protocol..." : "🚨 ACTIVATE KILL SWITCH"}
      </Button>
    </div>
  );
};

export default KillSwitch;
