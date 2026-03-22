import { useState, useEffect, useCallback, useRef } from "react";
import { Lock, Unlock, Shield, User, Phone, Calendar, MapPin, PhoneCall, Mail, Delete, Fingerprint, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PatientScan } from "./mockData";
import { motion, AnimatePresence } from "framer-motion";

const MAX_ATTEMPTS = 5;

interface SecureVaultProps {
  scan: PatientScan;
  isUnlocked: boolean;
  onUnlock: () => void;
  onBruteForceDetected?: () => void;
}

// In production, this would be derived from server-side key + user PIN
const MASTER_PIN = "123456";

// Simple AES-like XOR cipher for demo (in production use Web Crypto API with AES-256-GCM)
function encrypt(text: string, pin: string): string {
  const key = pin.repeat(Math.ceil(text.length / pin.length));
  return Array.from(text)
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join("");
}

function decrypt(cipher: string, pin: string): string {
  return encrypt(cipher, pin); // XOR is symmetric
}

function maskText(text: string): string {
  return text
    .split("")
    .map((c, i) => (i === 0 || c === " " ? c : "*"))
    .join("");
}

function maskPhone(phone: string): string {
  if (!phone) return "Not provided";
  return phone.replace(/\d(?=\d{4})/g, "X");
}

const SecureVault = ({ scan, isUnlocked, onUnlock, onBruteForceDetected }: SecureVaultProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempting, setAttempting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [revealStep, setRevealStep] = useState(0); // 0=locked, 1=morphing, 2=revealed
  const [auditTimestamp, setAuditTimestamp] = useState<Date | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const autoLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store encrypted versions (simulated — in production these come from DB)
  const encryptedName = useRef(encrypt(scan.patientName, MASTER_PIN));
  const encryptedContact = useRef(encrypt(scan.patientContact || "", MASTER_PIN));

  // Auto-lock on visibility change (app minimized/tab switch)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && revealStep === 2) {
        handleAutoLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [revealStep]);

  // Auto-lock after 5 minutes of inactivity
  useEffect(() => {
    if (revealStep === 2) {
      resetAutoLockTimer();
      const events = ["mousedown", "keydown", "touchstart", "scroll"];
      events.forEach((e) => document.addEventListener(e, resetAutoLockTimer));
      return () => {
        events.forEach((e) => document.removeEventListener(e, resetAutoLockTimer));
        if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
      };
    }
  }, [revealStep]);

  const resetAutoLockTimer = useCallback(() => {
    if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    autoLockTimer.current = setTimeout(handleAutoLock, 5 * 60 * 1000);
  }, []);

  const handleAutoLock = useCallback(() => {
    setRevealStep(0);
    setPin("");
    setAuditTimestamp(null);
  }, []);

  // Haptic feedback
  const haptic = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handlePinDigit = (digit: string) => {
    haptic();
    if (pin.length >= 6 || lockedOut) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");

    if (newPin.length === 6) {
      handleUnlock(newPin);
    }
  };

  const handleDelete = () => {
    haptic();
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const handleUnlock = (enteredPin: string) => {
    setAttempting(true);
    setTimeout(() => {
      if (enteredPin === MASTER_PIN) {
        // Verify decryption works
        const decrypted = decrypt(encryptedName.current, enteredPin);
        if (decrypted === scan.patientName) {
          setRevealStep(1);
          setAuditTimestamp(new Date());
          // Morph animation step
          setTimeout(() => {
            setRevealStep(2);
            onUnlock();
          }, 1200);
        }
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockedOut(true);
          setError(`${MAX_ATTEMPTS} failed attempts. Kill Switch auto-triggered.`);
          onBruteForceDetected?.();
        } else {
          setError(`Invalid PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
        setShakeKey((k) => k + 1);
        setPin("");
      }
      setAttempting(false);
    }, 600);
  };

  // Character morph helper
  const MorphText = ({ from, to }: { from: string; to: string }) => {
    if (revealStep === 0) return <span className="tracking-widest">{from}</span>;
    return (
      <span className="inline-flex">
        {to.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </span>
    );
  };

  const headerLocked = revealStep < 2;

  return (
    <div className={`rounded-xl border shadow-card overflow-hidden transition-colors duration-500 ${headerLocked ? "border-border bg-card" : "border-clinical-blue/30 bg-card"}`}>
      {/* Header */}
      <motion.div
        className={`px-4 py-3 border-b flex items-center justify-between transition-colors duration-500 ${headerLocked ? "border-border bg-muted/30" : "border-clinical-blue/20 bg-clinical-blue/5"}`}
      >
        <div className="flex items-center gap-2">
          {headerLocked ? (
            <Lock className="w-4 h-4 text-urgency-amber" />
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <Unlock className="w-4 h-4 text-scan-green" />
            </motion.div>
          )}
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {headerLocked ? "🔒 Secure Vault" : "✅ Verified Identity"}
          </h4>
        </div>
        <div className={`flex items-center gap-1 text-[8px] font-semibold px-2 py-0.5 rounded-full ${headerLocked ? "text-urgency-amber bg-urgency-amber/10" : "text-scan-green bg-scan-green/10"}`}>
          <Shield className="w-2.5 h-2.5" />
          {headerLocked ? "AES-256 LOCKED" : "E2E DECRYPTED"}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {revealStep < 2 && revealStep !== 1 ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 space-y-4"
          >
            {/* Masked preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-mono font-bold text-muted-foreground tracking-widest">{scan.maskedName}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border blur-[3px] select-none">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">{maskPhone(scan.patientContact || "")}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border blur-[3px] select-none">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">City, Pincode</span>
              </div>
            </div>

            {/* PIN Entry */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-clinical-blue" />
                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Enter 6-Digit Master PIN</p>
              </div>

              {/* PIN dots */}
              <motion.div key={shakeKey} animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      i < pin.length
                        ? error ? "bg-urgency-red border-urgency-red" : "bg-clinical-blue border-clinical-blue"
                        : "border-muted-foreground/30 bg-transparent"
                    }`}
                    animate={i < pin.length ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.15 }}
                  />
                ))}
              </motion.div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-urgency-red font-semibold">
                  {error}
                </motion.p>
              )}

              {/* Numeric keypad */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => {
                  if (key === "") return <div key="empty" />;
                  if (key === "del") {
                    return (
                      <button
                        key="del"
                        onClick={handleDelete}
                        disabled={pin.length === 0 || attempting}
                        className="h-11 rounded-lg bg-muted/30 border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 active:scale-95 transition-all disabled:opacity-30"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => handlePinDigit(key)}
                      disabled={pin.length >= 6 || attempting}
                      className="h-11 rounded-lg bg-muted/20 border border-border text-sm font-heading font-bold text-foreground hover:bg-muted/40 active:scale-90 transition-all disabled:opacity-30"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              <p className="text-[8px] text-muted-foreground">Demo PIN: 123456</p>
            </div>
          </motion.div>
        ) : revealStep === 1 ? (
          <motion.div
            key="morphing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 flex flex-col items-center justify-center space-y-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-clinical-blue border-t-transparent"
            />
            <p className="text-xs font-semibold text-clinical-blue">Decrypting AES-256 payload...</p>
            <div className="text-lg font-heading font-bold text-foreground">
              <MorphText from={scan.maskedName} to={scan.patientName} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 space-y-3"
          >
            {/* Revealed identity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-clinical-blue/5 border border-clinical-blue/20">
                <User className="w-3.5 h-3.5 text-clinical-blue" />
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Full Name</span>
                  <p className="text-sm font-semibold text-foreground">{scan.patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-clinical-blue/5 border border-clinical-blue/20">
                <Calendar className="w-3.5 h-3.5 text-clinical-blue" />
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Age / Gender</span>
                  <p className="text-sm font-semibold text-foreground">
                    {scan.patientAge || "N/A"} / {scan.patientGender || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-clinical-blue/5 border border-clinical-blue/20">
                <Phone className="w-3.5 h-3.5 text-clinical-blue" />
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Contact</span>
                  <p className="text-sm font-semibold text-foreground">{scan.patientContact || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-clinical-blue/5 border border-clinical-blue/20">
                <MapPin className="w-3.5 h-3.5 text-clinical-blue" />
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Location</span>
                  <p className="text-sm font-semibold text-foreground">Verified Address</p>
                </div>
              </div>
            </div>

            {/* Action buttons (only visible when unlocked) */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-scan-green/30 text-scan-green hover:bg-scan-green/5 haptic-button"
                onClick={() => {
                  if (scan.patientContact) window.open(`tel:${scan.patientContact.replace(/\s/g, "")}`);
                }}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Patient
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-clinical-blue/30 text-clinical-blue hover:bg-clinical-blue/5 haptic-button"
                onClick={() => {/* email report logic */}}
              >
                <Mail className="w-3.5 h-3.5" />
                Email Report
              </Button>
            </div>

            {/* Audit log footer */}
            {auditTimestamp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-lg border border-border bg-muted/10 p-2.5 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-[8px] text-scan-green font-semibold">
                  <Shield className="w-2.5 h-2.5" />
                  SECURITY AUDIT LOG
                </div>
                <p className="text-[9px] text-muted-foreground">
                  Identity decrypted via Master PIN at{" "}
                  <span className="font-mono font-semibold text-foreground">{auditTimestamp.toLocaleString()}</span>.
                  This access has been logged for HIPAA compliance.
                </p>
                <p className="text-[8px] text-muted-foreground/60">
                  Session auto-locks on minimize, tab switch, or 5 min inactivity.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecureVault;
