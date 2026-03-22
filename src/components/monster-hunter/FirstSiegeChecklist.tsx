import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Paintbrush, Camera, Gift, Droplets, CheckCircle, Circle, ChevronRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface FirstSiegeChecklistProps {
  hasRewards: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const CHECKLIST_ITEMS = [
  {
    id: "lumen",
    title: "The Lumen Test",
    subtitle: "Lighting Check",
    icon: <Sun className="w-5 h-5" />,
    description: "Ensure the bathroom light is bright and not casting a shadow over the child's mouth.",
    proTip: "A small ring light or desk lamp near the mirror increases Monster Detection by 50%.",
    emoji: "💡",
  },
  {
    id: "saber",
    title: "The Saber Sync",
    subtitle: "Toothbrush Recognition",
    icon: <Paintbrush className="w-5 h-5" />,
    description: "Test the camera with the child's actual toothbrush. Look for the Blue Aura around the brush head.",
    proTip: "If no aura appears, the brush may be too close or moving too fast for calibration.",
    emoji: "🪥",
  },
  {
    id: "calibration",
    title: 'The "Say Cheese" Calibration',
    subtitle: "Face Positioning",
    icon: <Camera className="w-5 h-5" />,
    description: "Have the child stand so their face is centered in the camera frame with head relatively still.",
    proTip: "A small stool helps position shorter Hunters at the perfect height for the Mirror of Truth.",
    emoji: "📸",
  },
  {
    id: "bounty",
    title: "The Bounty Verification",
    subtitle: "Reward Setup",
    icon: <Gift className="w-5 h-5" />,
    description: "Open the Bounty Workshop and ensure at least the 3-Day Scout Reward is set.",
    proTip: "Check that the Manual Approval toggle matches your preference (On = high supervision).",
    emoji: "🎁",
  },
  {
    id: "foam",
    title: "The Foam Factor",
    subtitle: "Toothpaste Check",
    icon: <Droplets className="w-5 h-5" />,
    description: "Use a pea-sized amount of white toothpaste for best AI foam tracking.",
    proTip: "Clear or dark-colored gels are harder for the AI to track as cleaning progress.",
    emoji: "🫧",
  },
];

const STORAGE_KEY = "dentascan-first-siege-done";

const FirstSiegeChecklist = ({ hasRewards, onComplete, onSkip }: FirstSiegeChecklistProps) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedItem, setExpandedItem] = useState<string | null>("lumen");

  const allChecked = CHECKLIST_ITEMS.every(item => checked[item.id]);
  const completedCount = CHECKLIST_ITEMS.filter(item => checked[item.id]).length;
  const progress = (completedCount / CHECKLIST_ITEMS.length) * 100;

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // Auto-advance to next unchecked
      if (!prev[id]) {
        const currentIdx = CHECKLIST_ITEMS.findIndex(item => item.id === id);
        const nextUnchecked = CHECKLIST_ITEMS.find((item, i) => i > currentIdx && !next[item.id]);
        if (nextUnchecked) setExpandedItem(nextUnchecked.id);
      }
      return next;
    });
  };

  const handleComplete = () => {
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    onComplete();
  };

  const cardBg = "hsl(var(--commander-surface))";
  const borderColor = "hsl(var(--commander-slate) / 0.3)";
  const textPrimary = "hsl(var(--commander-text))";
  const textMuted = "hsl(var(--commander-muted))";
  const accentColor = "hsl(var(--commander-accent))";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto"
          style={{ backgroundColor: `${accentColor}15`, border: `2px solid ${accentColor}30` }}>
          <Rocket className="w-8 h-8" style={{ color: accentColor }} />
        </div>
        <h2 className="font-heading font-bold text-xl" style={{ color: textPrimary }}>
          First Siege Checklist
        </h2>
        <p className="text-xs max-w-sm mx-auto" style={{ color: textMuted }}>
          Complete these checks before your Hunter's first battle to ensure the "Mirror of Truth" works perfectly.
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span style={{ color: textMuted }}>Pre-flight Check</span>
          <span style={{ color: accentColor }}>{completedCount}/{CHECKLIST_ITEMS.length}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}15` }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: allChecked ? "hsl(var(--neon-green))" : accentColor }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item, i) => {
          const isChecked = !!checked[item.id];
          const isExpanded = expandedItem === item.id;
          const isBountyItem = item.id === "bounty";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: cardBg,
                border: isChecked
                  ? "1px solid hsl(var(--neon-green) / 0.25)"
                  : `1px solid ${borderColor}`,
              }}
            >
              {/* Item Header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: isChecked ? "hsl(var(--neon-green) / 0.1)" : `${accentColor}10`,
                    color: isChecked ? "hsl(var(--neon-green))" : accentColor,
                  }}
                >
                  {isChecked ? <CheckCircle className="w-5 h-5" /> : item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: isChecked ? "hsl(var(--neon-green))" : textPrimary }}>
                    {item.emoji} {item.title}
                  </p>
                  <p className="text-[10px]" style={{ color: textMuted }}>{item.subtitle}</p>
                </div>
                <ChevronRight
                  className="w-4 h-4 transition-transform flex-shrink-0"
                  style={{
                    color: textMuted,
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                        {item.description}
                      </p>

                      <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(var(--neon-gold) / 0.06)", border: "1px solid hsl(var(--neon-gold) / 0.15)" }}>
                        <p className="text-[10px]" style={{ color: "hsl(var(--neon-gold))" }}>
                          <strong>Pro-Tip:</strong> {item.proTip}
                        </p>
                      </div>

                      {isBountyItem && !hasRewards && (
                        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "hsl(var(--urgency-red) / 0.06)", border: "1px solid hsl(var(--urgency-red) / 0.15)" }}>
                          <p className="text-[10px] font-bold" style={{ color: "hsl(var(--urgency-red))" }}>
                            ⚠️ No rewards set yet! Go to the Bounty tab first.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`check-${item.id}`}
                          checked={isChecked}
                          onCheckedChange={() => toggleCheck(item.id)}
                          className="border-2"
                          style={{ borderColor: isChecked ? "hsl(var(--neon-green))" : accentColor }}
                        />
                        <label htmlFor={`check-${item.id}`} className="text-xs font-bold cursor-pointer" style={{ color: isChecked ? "hsl(var(--neon-green))" : textPrimary }}>
                          {isChecked ? "Verified ✓" : "Mark as verified"}
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          className="w-full gap-2 font-bold text-sm h-12"
          disabled={!allChecked}
          onClick={handleComplete}
          style={{
            backgroundColor: allChecked ? "hsl(var(--neon-green))" : `${accentColor}30`,
            color: allChecked ? "black" : textMuted,
          }}
        >
          <Rocket className="w-4 h-4" />
          {allChecked ? "Launch First Siege!" : `Complete all ${CHECKLIST_ITEMS.length} checks to proceed`}
        </Button>

        <button
          onClick={onSkip}
          className="w-full text-[10px] py-2 transition-colors"
          style={{ color: `${textMuted}80` }}
        >
          Skip checklist (experienced Guild Master)
        </button>
      </div>
    </div>
  );
};

export { STORAGE_KEY as FIRST_SIEGE_KEY };
export default FirstSiegeChecklist;
