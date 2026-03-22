import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Copy, Check, UserPlus, Loader2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useFamilySync, type BattleEvent } from "@/hooks/useFamilySync";
import { toast } from "sonner";

const FamilySyncPanel = () => {
  const { user } = useAuth();
  const sync = useFamilySync();
  const [mode, setMode] = useState<"choose" | "child" | "parent">("choose");
  const [codeInput, setCodeInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
        <WifiOff className="w-8 h-8 text-muted-foreground mx-auto" />
        <h4 className="font-heading font-bold text-sm text-foreground">Sign In Required</h4>
        <p className="text-xs text-muted-foreground">
          Both the Hunter and the Guild Master need accounts to sync. Sign in from the main app first.
        </p>
      </div>
    );
  }

  if (sync.loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already linked - show status and live events
  if (sync.isParent || sync.isLinkedChild) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
          <Wifi className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-bold text-primary">
              {sync.isParent ? `Linked to ${sync.linkedChildren.length} Hunter(s)` : "Linked to Guild Master"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {sync.isParent ? "Live battle events will appear below" : "Your battles are being reported to the Guild Master"}
            </p>
          </div>
        </div>

        {sync.isParent && (
          <LiveEventsFeed events={sync.liveEvents} />
        )}

        {sync.isLinkedChild && sync.pairingCode && (
          <div className="text-center text-[10px] text-muted-foreground">
            Your link code: <span className="font-mono font-bold text-foreground">{sync.pairingCode}</span>
          </div>
        )}
      </div>
    );
  }

  // Child already has a code
  if (sync.pairingCode && mode !== "parent") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-plaque-gold/20 bg-gradient-to-br from-plaque-gold/5 via-card to-card p-6 text-center space-y-4">
          <Link2 className="w-8 h-8 text-plaque-gold mx-auto" />
          <h4 className="font-heading font-bold text-sm text-foreground">Your Guild Link Code</h4>
          <p className="text-xs text-muted-foreground">Give this code to the Guild Master (parent) to link your devices.</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-[0.3em] text-plaque-gold bg-plaque-gold/10 px-4 py-2 rounded-xl">
              {sync.pairingCode}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => {
                navigator.clipboard.writeText(sync.pairingCode!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Expires in 24 hours</p>
        </div>
        <Button
          variant="ghost"
          className="w-full text-xs text-muted-foreground"
          onClick={() => setMode("parent")}
        >
          I'm the Guild Master instead →
        </Button>
      </div>
    );
  }

  // Role selection
  if (mode === "choose") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <Link2 className="w-8 h-8 text-plaque-gold mx-auto" />
          <h4 className="font-heading font-bold text-sm text-foreground">Guild Sync</h4>
          <p className="text-xs text-muted-foreground">Link Hunter and Guild Master devices for live battle reports.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 border-plaque-gold/20 hover:bg-plaque-gold/5"
            onClick={() => setMode("child")}
          >
            <span className="text-2xl">⚔️</span>
            <span className="text-xs font-bold">I'm the Hunter</span>
            <span className="text-[9px] text-muted-foreground">Generate a link code</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 border-primary/20 hover:bg-primary/5"
            onClick={() => setMode("parent")}
          >
            <span className="text-2xl">🛡️</span>
            <span className="text-xs font-bold">I'm the Guild Master</span>
            <span className="text-[9px] text-muted-foreground">Enter a link code</span>
          </Button>
        </div>
      </div>
    );
  }

  // Child: generate code
  if (mode === "child") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <span className="text-3xl">⚔️</span>
          <h4 className="font-heading font-bold text-sm text-foreground">Generate Link Code</h4>
          <p className="text-xs text-muted-foreground">Create a code for your Guild Master to connect.</p>
        </div>
        <Button
          className="w-full bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold gap-2"
          disabled={generatingCode}
          onClick={async () => {
            setGeneratingCode(true);
            const hunterName = (() => {
              try { return localStorage.getItem("dentascan-hunter-name") || "Hunter"; } catch { return "Hunter"; }
            })();
            await sync.generatePairingCode(hunterName);
            setGeneratingCode(false);
          }}
        >
          {generatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Generate My Code
        </Button>
        <Button variant="ghost" className="w-full text-xs" onClick={() => setMode("choose")}>← Back</Button>
      </div>
    );
  }

  // Parent: enter code
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <span className="text-3xl">🛡️</span>
        <h4 className="font-heading font-bold text-sm text-foreground">Enter Hunter's Code</h4>
        <p className="text-xs text-muted-foreground">Enter the 6-character code from the Hunter's device.</p>
      </div>
      <Input
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
        placeholder="ABC123"
        maxLength={6}
        className="text-center text-xl font-mono font-bold tracking-[0.3em]"
      />
      <Button
        className="w-full bg-primary hover:bg-primary/90 font-bold gap-2"
        disabled={codeInput.length < 6 || claiming}
        onClick={async () => {
          setClaiming(true);
          const result = await sync.claimPairingCode(codeInput);
          setClaiming(false);
          if (result.success) {
            toast.success(`Linked to ${result.hunterName}! Live events are now streaming.`);
          } else {
            toast.error(result.error);
          }
        }}
      >
        {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        Link to Hunter
      </Button>
      <Button variant="ghost" className="w-full text-xs" onClick={() => setMode("choose")}>← Back</Button>
    </div>
  );
};

// Live events feed component
const LiveEventsFeed = ({ events }: { events: BattleEvent[] }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-6 space-y-2">
        <p className="text-xs text-muted-foreground italic">No battle reports yet.</p>
        <p className="text-[10px] text-muted-foreground">Events appear here in real-time when the Hunter completes a battle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      <AnimatePresence>
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-3 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {event.event_type === "milestone"
                  ? `🏆 ${event.hunter_name} hit a milestone!`
                  : `⚔️ ${event.hunter_name} completed a battle!`}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {new Date(event.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>🎯 {event.monsters_defeated}/{event.total_monsters} defeated</span>
              <span>⏱ {event.duration_seconds}s</span>
              <span>🔥 {event.streak}-day streak</span>
            </div>
            {event.loot_collected && event.loot_collected.length > 0 && (
              <p className="text-[10px] text-plaque-gold">
                Loot: {event.loot_collected.join(", ")}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FamilySyncPanel;
