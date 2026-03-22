import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CommandCardsProps {
  onDoubleXP: () => void;
  onEmergencyAlert: (tooth: string) => void;
  onSendPraise: (message: string) => void;
}

const CommandCards = ({ onDoubleXP, onEmergencyAlert, onSendPraise }: CommandCardsProps) => {
  const [doubleXPActive, setDoubleXPActive] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [praiseSent, setPraiseSent] = useState(false);
  const [toothTarget, setToothTarget] = useState("");
  const [praiseMessage, setPraiseMessage] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const cardBg = "hsl(var(--commander-surface))";
  const borderColor = "hsl(var(--commander-slate) / 0.3)";
  const textPrimary = "hsl(var(--commander-text))";
  const textMuted = "hsl(var(--commander-muted))";

  const handleDoubleXP = () => {
    setDoubleXPActive(true);
    onDoubleXP();
    setTimeout(() => setDoubleXPActive(false), 3000);
  };

  const handleAlert = () => {
    if (!toothTarget.trim()) return;
    onEmergencyAlert(toothTarget.trim());
    setAlertSent(true);
    setToothTarget("");
    setTimeout(() => { setAlertSent(false); setExpandedCard(null); }, 2000);
  };

  const handlePraise = () => {
    const msg = praiseMessage.trim() || "Great Job, Hunter! 🎉";
    onSendPraise(msg);
    setPraiseSent(true);
    setPraiseMessage("");
    setTimeout(() => { setPraiseSent(false); setExpandedCard(null); }, 2000);
  };

  const cards = [
    {
      id: "double-xp",
      icon: <Zap className="w-5 h-5" />,
      title: "Double XP Day",
      description: "Doubles all shard rewards for the next session. Use when motivation is low!",
      color: "hsl(var(--neon-gold))",
      bgGlow: "hsl(var(--neon-gold) / 0.06)",
      action: (
        <Button
          onClick={handleDoubleXP}
          disabled={doubleXPActive}
          className="w-full font-bold gap-2 text-xs"
          style={{
            fontFamily: "'Roboto', sans-serif",
            backgroundColor: doubleXPActive ? "hsl(var(--neon-green) / 0.2)" : "hsl(var(--neon-gold))",
            color: doubleXPActive ? "hsl(var(--neon-green))" : "black",
          }}
        >
          {doubleXPActive ? (
            <><CheckCircle className="w-4 h-4" /> Double XP Activated!</>
          ) : (
            <><Zap className="w-4 h-4" /> Activate Double XP</>
          )}
        </Button>
      ),
    },
    {
      id: "emergency",
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Emergency Alert",
      description: "Manually spawn a Gold Monster on a specific tooth the child is neglecting.",
      color: "hsl(var(--urgency-red))",
      bgGlow: "hsl(var(--urgency-red) / 0.06)",
      action: (
        <div className="space-y-2">
          <Input
            placeholder="Which tooth? e.g. Back left molar"
            value={toothTarget}
            onChange={(e) => setToothTarget(e.target.value)}
            className="text-sm"
            style={{ backgroundColor: "hsl(var(--commander-navy))", borderColor, color: textPrimary }}
          />
          <Button
            onClick={handleAlert}
            disabled={alertSent || !toothTarget.trim()}
            className="w-full font-bold gap-2 text-xs"
            style={{
              backgroundColor: alertSent ? "hsl(var(--neon-green) / 0.2)" : "hsl(var(--urgency-red))",
              color: alertSent ? "hsl(var(--neon-green))" : "white",
            }}
          >
            {alertSent ? (
              <><CheckCircle className="w-4 h-4" /> Gold Monster Spawned!</>
            ) : (
              <><AlertTriangle className="w-4 h-4" /> Spawn Gold Monster</>
            )}
          </Button>
        </div>
      ),
    },
    {
      id: "praise",
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Guild Master's Praise",
      description: "Send a real-time 'Great Job!' text bubble onto your child's screen.",
      color: "hsl(var(--neon-green))",
      bgGlow: "hsl(var(--neon-green) / 0.06)",
      action: (
        <div className="space-y-2">
          <Input
            placeholder="Great Job, Hunter! 🎉"
            value={praiseMessage}
            onChange={(e) => setPraiseMessage(e.target.value)}
            className="text-sm"
            style={{ backgroundColor: "hsl(var(--commander-navy))", borderColor, color: textPrimary }}
          />
          <Button
            onClick={handlePraise}
            disabled={praiseSent}
            className="w-full font-bold gap-2 text-xs"
            style={{
              backgroundColor: praiseSent ? "hsl(var(--neon-green) / 0.2)" : "hsl(var(--neon-green))",
              color: praiseSent ? "hsl(var(--neon-green))" : "black",
            }}
          >
            {praiseSent ? (
              <><CheckCircle className="w-4 h-4" /> Praise Sent!</>
            ) : (
              <><MessageCircle className="w-4 h-4" /> Send Praise</>
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: textPrimary }}>
        🃏 Command Cards
      </h3>
      <p className="text-[11px]" style={{ color: textMuted }}>
        Tactical tools to keep your Hunter motivated and on target.
      </p>
      
      {cards.map((card) => {
        const isExpanded = expandedCard === card.id;
        return (
          <motion.div
            key={card.id}
            layout
            className="rounded-xl overflow-hidden cursor-pointer"
            style={{
              backgroundColor: isExpanded ? card.bgGlow : cardBg,
              border: `1px solid ${isExpanded ? card.color + "40" : borderColor}`,
            }}
            onClick={() => !isExpanded && setExpandedCard(card.id)}
          >
            <div className="flex items-center gap-3 p-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.color + "15", color: card.color }}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: textPrimary }}>{card.title}</p>
                <p className="text-[10px]" style={{ color: textMuted }}>{card.description}</p>
              </div>
              {!isExpanded && (
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: textMuted }} />
              )}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 pb-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {card.action}
                  <button
                    onClick={() => setExpandedCard(null)}
                    className="w-full text-center mt-2 text-[10px]"
                    style={{ color: textMuted }}
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

const ChevronRight = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default CommandCards;
