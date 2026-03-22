import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Sun, Moon, Lightbulb, Smartphone, Eye, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shouldPlayDailyBriefing, playDailyBriefing, markDailyBriefingPlayed, getDailyBriefing } from "./voiceLines";

interface GuildBriefingProps {
  hunterName: string;
  currentStreak: number;
  onStartBattle: () => void;
}

const STORAGE_KEY = "dentascan-hunter-name";

function getTimeOfDay(): "morning" | "night" {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 17 ? "morning" : "night";
}

const BRIEFINGS = {
  morning: {
    icon: <Sun className="w-5 h-5 text-plaque-gold" />,
    title: "Morning Patrol",
    greeting: "Hunters, to your stations!",
    script: (name: string) =>
      `${name || "Hunter"}, my scouts report a massive Sugar-Saur migration on the Southern Molars. If we don't clear them out before school, they'll start building fortifications. Grab your Sonic Saber and report back when the map is 100% green. Go!`,
    actionLabel: "Begin Morning Patrol!",
  },
  night: {
    icon: <Moon className="w-5 h-5 text-primary" />,
    title: "Night Patrol",
    greeting: "Listen up, Hunter!",
    script: (name: string) =>
      `${name || "Hunter"}, the Night-Gnashers are moving in. They think we're tired and our guard is down. I need a full 2-minute sweep of the Gum-line Trenches. If you bring me back a 'Perfect Clean' report, your streak stays alive. Do not let the monsters win the night!`,
    actionLabel: "Begin Night Patrol!",
  },
};

const TACTICAL_TIPS = [
  {
    icon: <Lightbulb className="w-4 h-4 text-plaque-gold" />,
    title: "Check Your Lighting!",
    instruction:
      "The AI sensors can't see monsters in the dark. Make sure the bathroom lights are at full power so the 'Scouter' can lock onto your targets.",
  },
  {
    icon: <Smartphone className="w-4 h-4 text-primary" />,
    title: "Maintain the Stance!",
    instruction:
      "Hold the device at eye level. If you tilt the screen, the monsters will hide in the 'blind spots' of your teeth. Keep your head still and let the brush do the hunting.",
  },
  {
    icon: <Eye className="w-4 h-4 text-scan-green" />,
    title: "The Victory Proof!",
    instruction:
      "Once the final boss is defeated, bring the device to the Guild Master. They need to see the 'Quest Complete' screen before the streak is logged in the Guild Books.",
  },
];

const GuildBriefing = ({ hunterName: propName, currentStreak, onStartBattle }: GuildBriefingProps) => {
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || propName || ""; } catch { return propName || ""; }
  });
  const [phase, setPhase] = useState<"name" | "briefing">(name ? "briefing" : "name");
  const [showTips, setShowTips] = useState(false);
  const [playingBriefing, setPlayingBriefing] = useState(false);
  const briefingPlayedRef = useRef(false);

  const timeOfDay = getTimeOfDay();
  const briefing = BRIEFINGS[timeOfDay];

  // Auto-play mother's daily briefing once per day when briefing card is shown
  useEffect(() => {
    if (phase !== "briefing" || briefingPlayedRef.current) return;
    if (!shouldPlayDailyBriefing()) return;
    briefingPlayedRef.current = true;
    // Small delay so the UI renders first
    const timeout = setTimeout(async () => {
      setPlayingBriefing(true);
      markDailyBriefingPlayed();
      await playDailyBriefing();
      setPlayingBriefing(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, [phase]);

  const handleManualPlay = async () => {
    setPlayingBriefing(true);
    await playDailyBriefing();
    setPlayingBriefing(false);
  };

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    try { localStorage.setItem(STORAGE_KEY, name.trim()); } catch {}
    setPhase("briefing");
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {phase === "name" ? (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border-2 border-plaque-gold/20 bg-gradient-to-br from-plaque-gold/5 via-card to-primary/5 p-6 text-center space-y-4"
          >
            <div className="text-4xl">⚔️</div>
            <h3 className="font-heading font-bold text-lg text-foreground">Hunter Registration</h3>
            <p className="text-xs text-muted-foreground">Enter your name to receive your daily briefing from the Guild Master.</p>
            <Input
              placeholder="Your Hunter name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="text-center text-sm font-bold border-plaque-gold/20"
            />
            <Button onClick={handleNameSubmit} className="bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold gap-2">
              <Megaphone className="w-4 h-4" />
              Report for Duty
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Briefing Card */}
            <div className="rounded-2xl border border-plaque-gold/20 bg-gradient-to-br from-plaque-gold/5 via-card to-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                {briefing.icon}
                <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                  🎙️ {briefing.title} — Daily Briefing
                </h3>
              </div>

              <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-3">
                <p className="text-xs font-bold text-plaque-gold uppercase tracking-wider">{briefing.greeting}</p>
                <p className="text-[12px] text-foreground leading-relaxed italic">
                  "{briefing.script(name)}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">— The Guild Master</p>
                  {playingBriefing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5 text-[10px] text-primary font-bold"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        <Volume2 className="w-3 h-3" />
                      </motion.div>
                      Guild Master Speaking...
                    </motion.div>
                  )}
                  {!playingBriefing && shouldPlayDailyBriefing() === false && getDailyBriefing() && (
                    <button
                      onClick={handleManualPlay}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      Replay
                    </button>
                  )}
                </div>
              </div>

              {currentStreak > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-plaque-gold font-bold">🔥 Active Streak: {currentStreak} days</span>
                  <span className="text-muted-foreground">— Don't break the chain, {name || "Hunter"}!</span>
                </div>
              )}

              <Button onClick={onStartBattle} className="w-full bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold gap-2 py-5 text-base">
                <Megaphone className="w-5 h-5" />
                {briefing.actionLabel}
              </Button>
            </div>

            {/* Tactical Instructions */}
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showTips ? "rotate-90" : ""}`} />
              <span className="font-bold uppercase tracking-wider">📋 Tactical Instructions</span>
            </button>

            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {TACTICAL_TIPS.map((tip) => (
                    <div key={tip.title} className="rounded-xl border border-border bg-muted/20 p-3 flex gap-3 items-start">
                      <div className="mt-0.5">{tip.icon}</div>
                      <div>
                        <p className="text-[11px] font-bold text-foreground">{tip.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.instruction}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuildBriefing;
