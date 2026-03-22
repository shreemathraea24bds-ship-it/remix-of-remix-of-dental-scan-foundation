import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ScrollText, Lightbulb, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ContractData {
  hunterName: string;
  guildMasterName: string;
  scoutReward: string;
  knightReward: string;
  masterReward: string;
  hunterSigned: boolean;
  guildMasterSigned: boolean;
  dateOfCommission: string;
}

const STORAGE_KEY = "dentascan-quest-contract";

function loadContract(): ContractData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    hunterName: "",
    guildMasterName: "",
    scoutReward: "",
    knightReward: "",
    masterReward: "",
    hunterSigned: false,
    guildMasterSigned: false,
    dateOfCommission: new Date().toISOString().slice(0, 10),
  };
}

function saveContract(data: ContractData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const QuestContract = () => {
  const [contract, setContract] = useState<ContractData>(loadContract);
  const [showTips, setShowTips] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (partial: Partial<ContractData>) => {
    setContract((prev) => {
      const next = { ...prev, ...partial };
      saveContract(next);
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    saveContract(contract);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isSigned = contract.hunterSigned && contract.guildMasterSigned;

  return (
    <div className="space-y-5">
      {/* Contract Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-plaque-gold/30 bg-gradient-to-br from-plaque-gold/5 via-card to-plaque-gold/5 p-5 text-center space-y-2"
      >
        <div className="flex justify-center gap-1 text-2xl">⚔️ <ScrollText className="w-6 h-6 text-plaque-gold" /> ⚔️</div>
        <h3 className="font-heading font-bold text-base text-foreground tracking-wide uppercase">
          The Monster Hunter's Guild Contract
        </h3>
        <p className="text-[10px] text-muted-foreground italic">A sacred pact between Hunter and Guild Master</p>
      </motion.div>

      {/* Parties */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-plaque-gold uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-3 h-3" /> Lead Hunter (Child's Name)
          </label>
          <Input
            placeholder="Enter Hunter's name…"
            value={contract.hunterName}
            onChange={(e) => update({ hunterName: e.target.value })}
            className="text-sm border-plaque-gold/20 focus-visible:ring-plaque-gold/40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ScrollText className="w-3 h-3" /> Guild Master (Parent's Name)
          </label>
          <Input
            placeholder="Enter Guild Master's name…"
            value={contract.guildMasterName}
            onChange={(e) => update({ guildMasterName: e.target.value })}
            className="text-sm border-primary/20 focus-visible:ring-primary/40"
          />
        </div>
      </div>

      {/* Section I: Primary Mission */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
          I. The Primary Mission
        </h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          The Hunter hereby agrees to patrol the <span className="text-foreground font-medium">Oral Frontier twice daily</span> (Morning and Night). 
          A mission is only considered "Complete" when the AI Scan confirms a <span className="text-scan-green font-medium">100% Clean Map</span> and 
          all Plaque Monsters have been banished.
        </p>
      </div>

      {/* Section II: Rules of Engagement */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
        <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
          II. Rules of Engagement
        </h4>
        <div className="space-y-2">
          {[
            { icon: "🛡️", title: "No Button Mashing", desc: "Brushing too hard damages the \"Armor\" (Gums). The Hunter must use steady, circular strikes." },
            { icon: "⏱️", title: "The Two-Minute Siege", desc: "No retreat until the timer hits zero." },
            { icon: "📋", title: "The Daily Report", desc: "The Hunter must show the \"Victory Screen\" to the Guild Master for final validation." },
          ].map((rule) => (
            <div key={rule.title} className="flex gap-2.5 items-start">
              <span className="text-sm mt-0.5">{rule.icon}</span>
              <div>
                <p className="text-[11px] font-bold text-foreground">{rule.title}</p>
                <p className="text-[10px] text-muted-foreground">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section III: The Bounty */}
      <div className="rounded-xl border border-plaque-gold/20 bg-plaque-gold/5 p-4 space-y-3">
        <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-plaque-gold" /> III. The Bounty (The Loot)
        </h4>
        <div className="space-y-3">
          {[
            { streak: 3, rank: "Scout Level", emoji: "🥉", placeholder: "e.g. Choice of dessert or 15 mins extra gaming", value: contract.scoutReward, field: "scoutReward" as const },
            { streak: 7, rank: "Knight Level", emoji: "🥈", placeholder: "e.g. A small toy, trip to the park, or 'Stay up 30 mins late' pass", value: contract.knightReward, field: "knightReward" as const },
            { streak: 30, rank: "Master Hunter", emoji: "🥇", placeholder: "e.g. A new video game, movie night, or Lego set", value: contract.masterReward, field: "masterReward" as const },
          ].map((tier) => (
            <div key={tier.field} className="space-y-1">
              <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <span>{tier.emoji}</span>
                {tier.streak}-Day Streak ({tier.rank})
              </label>
              <Textarea
                placeholder={tier.placeholder}
                value={tier.value}
                onChange={(e) => update({ [tier.field]: e.target.value })}
                className="text-[11px] min-h-[44px] resize-none border-plaque-gold/20"
                rows={1}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section IV: Penalties */}
      <div className="rounded-xl border border-urgency-red/20 bg-urgency-red/5 p-4 space-y-2">
        <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
          IV. Penalties & Failed Quests
        </h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          If a night is missed, the <span className="text-urgency-red font-medium">Streak Counter resets to zero</span>. 
          The Monsters reclaim the territory, and the Hunter must begin their journey anew from the <span className="text-urgency-red font-medium italic">Gates of Gingivitis</span>.
        </p>
      </div>

      {/* Signatures */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">Signatures</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => update({ hunterSigned: !contract.hunterSigned })}
            className={`rounded-lg border-2 border-dashed p-3 text-center transition-all ${
              contract.hunterSigned
                ? "border-scan-green bg-scan-green/10"
                : "border-border hover:border-plaque-gold/40"
            }`}
          >
            {contract.hunterSigned ? (
              <CheckCircle2 className="w-5 h-5 text-scan-green mx-auto mb-1" />
            ) : (
              <Swords className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            )}
            <p className="text-[10px] font-bold text-foreground">
              {contract.hunterName || "Hunter"}
            </p>
            <p className="text-[9px] text-muted-foreground">
              {contract.hunterSigned ? "Signed ✓" : "Tap to sign"}
            </p>
          </button>
          <button
            onClick={() => update({ guildMasterSigned: !contract.guildMasterSigned })}
            className={`rounded-lg border-2 border-dashed p-3 text-center transition-all ${
              contract.guildMasterSigned
                ? "border-scan-green bg-scan-green/10"
                : "border-border hover:border-primary/40"
            }`}
          >
            {contract.guildMasterSigned ? (
              <CheckCircle2 className="w-5 h-5 text-scan-green mx-auto mb-1" />
            ) : (
              <ScrollText className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            )}
            <p className="text-[10px] font-bold text-foreground">
              {contract.guildMasterName || "Guild Master"}
            </p>
            <p className="text-[9px] text-muted-foreground">
              {contract.guildMasterSigned ? "Signed ✓" : "Tap to sign"}
            </p>
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Date of Commission: {contract.dateOfCommission}</span>
          {isSigned && <span className="text-scan-green font-bold">CONTRACT ACTIVE ⚔️</span>}
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold gap-2">
        <ScrollText className="w-4 h-4" />
        {saved ? "✓ Contract Saved!" : "Save Contract"}
      </Button>

      {/* Pro Tips */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center justify-between w-full"
        >
          <h4 className="font-heading font-bold text-xs text-foreground flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-plaque-gold" />
            Pro Tips for the Guild Master
          </h4>
          {showTips ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2.5 pt-2"
            >
              {[
                { emoji: "⚡", title: "Double XP Weekends", desc: "Offer double digital currency for brushing on Saturday and Sunday mornings — the hardest times to stay consistent." },
                { emoji: "💎", title: "The \"Legendary\" Spawn", desc: "Once a month, tell your child a Rare Diamond Dragon has been spotted on their back molars. Defeat it for a special one-time treat." },
                { emoji: "🤝", title: "Co-Op Mode", desc: "Brush with them! Two hunters brushing together unlocks the \"Unity Aura\" — a shared victory bonus." },
              ].map((tip) => (
                <div key={tip.title} className="flex gap-2.5 items-start">
                  <span className="text-sm mt-0.5">{tip.emoji}</span>
                  <div>
                    <p className="text-[11px] font-bold text-foreground">{tip.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestContract;
