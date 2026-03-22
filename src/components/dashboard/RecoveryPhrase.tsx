import { useState, useMemo } from "react";
import { Shield, Copy, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

// BIP-39 inspired word list (simplified subset)
const WORD_LIST = [
  "anchor", "breeze", "castle", "delta", "ember", "frost", "glacier", "harbor",
  "ivory", "jungle", "knight", "lantern", "marble", "nebula", "oasis", "pinnacle",
  "quartz", "ridge", "summit", "timber", "umbra", "vault", "willow", "zenith",
  "alpine", "beacon", "cipher", "drift", "eclipse", "forge", "granite", "haven",
  "iris", "jasper", "keystone", "lotus", "mesa", "nexus", "orchid", "prism",
  "quill", "raven", "shard", "thorn", "unity", "viper", "warden", "xerus",
];

function generatePhrase(): string[] {
  const words: string[] = [];
  const used = new Set<number>();
  while (words.length < 12) {
    const idx = Math.floor(Math.random() * WORD_LIST.length);
    if (!used.has(idx)) {
      used.add(idx);
      words.push(WORD_LIST[idx]);
    }
  }
  return words;
}

// SHA-256 hash (returns hex string)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface RecoveryPhraseSetupProps {
  onComplete: (hash: string) => void;
}

export const RecoveryPhraseSetup = ({ onComplete }: RecoveryPhraseSetupProps) => {
  const [step, setStep] = useState<"generate" | "verify" | "done">("generate");
  const [phrase] = useState(() => generatePhrase());
  const [copied, setCopied] = useState(false);
  const [verifyInputs, setVerifyInputs] = useState<Record<number, string>>({});
  const [verifyError, setVerifyError] = useState("");

  // Random 3 indices to verify
  const verifyIndices = useMemo(() => {
    const indices = new Set<number>();
    while (indices.size < 3) {
      indices.add(Math.floor(Math.random() * 12));
    }
    return Array.from(indices).sort((a, b) => a - b);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase.join(" "));
    setCopied(true);
    toast.success("Recovery phrase copied. Store it safely!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    const allCorrect = verifyIndices.every(
      (idx) => verifyInputs[idx]?.toLowerCase().trim() === phrase[idx]
    );
    if (!allCorrect) {
      setVerifyError("One or more words are incorrect. Please check your recovery phrase.");
      return;
    }
    const hash = await sha256(phrase.join(" "));
    setStep("done");
    onComplete(hash);
    toast.success("Recovery phrase verified and securely hashed.");
  };

  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-scan-green/30 bg-scan-green/5 p-4 text-center space-y-2"
      >
        <CheckCircle2 className="w-8 h-8 text-scan-green mx-auto" />
        <h4 className="text-sm font-bold text-foreground">Recovery Phrase Secured</h4>
        <p className="text-[10px] text-muted-foreground">
          Your SHA-256 hash has been stored. The plain-text phrase was never sent to our servers.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Shield className="w-4 h-4 text-clinical-blue" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {step === "generate" ? "Generate Recovery Phrase" : "Verify Recovery Phrase"}
        </h4>
      </div>

      {step === "generate" ? (
        <div className="p-4 space-y-4">
          <div className="rounded-lg border border-urgency-amber/20 bg-urgency-amber/5 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-urgency-amber flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-foreground">
              Write down these 12 words <strong>in order</strong>. This is the ONLY way to recover your account after an Emergency Lockdown. Never share or screenshot this phrase.
            </p>
          </div>

          {/* Word grid */}
          <div className="grid grid-cols-3 gap-2">
            {phrase.map((word, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-border bg-muted/20"
              >
                <span className="text-[9px] font-mono text-muted-foreground w-4 text-right">{i + 1}.</span>
                <span className="text-xs font-mono font-semibold text-foreground">{word}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-scan-green" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            <Button size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => setStep("verify")}>
              I've Written It Down →
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <p className="text-[10px] text-muted-foreground">
            Enter the following words from your recovery phrase to verify:
          </p>

          <div className="space-y-2">
            {verifyIndices.map((idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground w-16">Word #{idx + 1}:</span>
                <Input
                  value={verifyInputs[idx] || ""}
                  onChange={(e) => {
                    setVerifyInputs((p) => ({ ...p, [idx]: e.target.value }));
                    setVerifyError("");
                  }}
                  placeholder={`Enter word ${idx + 1}`}
                  className="h-8 text-xs font-mono"
                />
              </div>
            ))}
          </div>

          {verifyError && (
            <p className="text-[10px] text-urgency-red font-semibold">{verifyError}</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setStep("generate")}>
              ← Go Back
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={handleVerify}
              disabled={verifyIndices.some((idx) => !verifyInputs[idx]?.trim())}
            >
              <Shield className="w-3.5 h-3.5" />
              Verify & Secure
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Recovery verification for post-lockdown
interface RecoveryVerifyProps {
  storedHash: string;
  onRecovered: () => void;
}

export const RecoveryVerify = ({ storedHash, onRecovered }: RecoveryVerifyProps) => {
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    const phrase = words.map((w) => w.toLowerCase().trim()).join(" ");
    const hash = await sha256(phrase);

    if (hash === storedHash) {
      toast.success("Account recovered! Vaults re-enabled.");
      onRecovered();
    } else {
      setError("Recovery phrase does not match. Please try again.");
    }
    setVerifying(false);
  };

  return (
    <div className="rounded-xl border border-urgency-amber/30 bg-card shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-urgency-amber/5 flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-urgency-amber" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Account Recovery</h4>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground">Enter your 12-word recovery phrase to restore vault access:</p>
        <div className="grid grid-cols-3 gap-1.5">
          {words.map((w, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-[8px] font-mono text-muted-foreground w-3">{i + 1}</span>
              <Input
                value={w}
                onChange={(e) => {
                  const nw = [...words];
                  nw[i] = e.target.value;
                  setWords(nw);
                  setError("");
                }}
                className="h-7 text-[10px] font-mono px-1.5"
                placeholder="word"
              />
            </div>
          ))}
        </div>
        {error && <p className="text-[10px] text-urgency-red">{error}</p>}
        <Button
          className="w-full gap-1.5"
          onClick={handleVerify}
          disabled={words.some((w) => !w.trim()) || verifying}
        >
          <Shield className="w-3.5 h-3.5" />
          {verifying ? "Verifying hash..." : "Recover Account"}
        </Button>
      </div>
    </div>
  );
};

export default RecoveryPhraseSetup;
