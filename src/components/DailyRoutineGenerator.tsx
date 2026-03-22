import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, ChevronDown, ChevronUp, Clock, Droplets, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoutineProps {
  overallHealth: "healthy" | "monitor" | "emergency";
  plaqueLevel: string;
  gumHealth: string;
  defects?: { type: string; severity: string }[];
}

interface RoutineStep {
  time: string;
  action: string;
  detail: string;
  duration: string;
  icon: React.ReactNode;
}

function generateRoutine(props: RoutineProps) {
  const hasPlaque = ["mild", "moderate", "heavy"].includes(props.plaqueLevel);
  const hasGumIssue = props.gumHealth?.includes("inflammation");
  const hasCavity = props.defects?.some(d => d.type === "cavity");
  const hasErosion = props.defects?.some(d => d.type === "erosion");
  const hasSensitivity = props.defects?.some(d => ["crack", "chip", "erosion"].includes(d.type));
  const hasTartar = props.defects?.some(d => d.type === "tartar");
  const hasDiscoloration = props.defects?.some(d => d.type === "discoloration");

  const morning: RoutineStep[] = [
    {
      time: "On waking",
      action: "Oil Pulling",
      detail: "Swish 1 tbsp coconut oil for 10-15 min on empty stomach, then spit out",
      duration: "15 min",
      icon: <Droplets className="w-3.5 h-3.5" />,
    },
    {
      time: "After breakfast",
      action: "Brush with fluoride toothpaste",
      detail: hasSensitivity
        ? "Use desensitizing toothpaste with soft bristles, gentle circular motions"
        : "Use 45° angle, gentle circular strokes covering all surfaces",
      duration: "2 min",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
  ];

  if (hasPlaque || hasTartar) {
    morning.push({
      time: "After brushing",
      action: "Tongue scraping",
      detail: "Scrape tongue from back to front 5-7 times to remove bacteria film",
      duration: "30 sec",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    });
  }

  if (hasGumIssue) {
    morning.push({
      time: "After brushing",
      action: "Salt water rinse",
      detail: "Mix ½ tsp salt in warm water, swish for 30 seconds to reduce inflammation",
      duration: "1 min",
      icon: <Droplets className="w-3.5 h-3.5" />,
    });
  }

  if (hasCavity || hasErosion) {
    morning.push({
      time: "Mid-morning",
      action: "Eat calcium-rich snack",
      detail: "Cheese, yogurt, or almonds — helps remineralize enamel throughout the day",
      duration: "5 min",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    });
  }

  morning.push({
    time: "After lunch",
    action: "Rinse with water",
    detail: "Swish water vigorously for 30 seconds to dislodge food particles",
    duration: "30 sec",
    icon: <Droplets className="w-3.5 h-3.5" />,
  });

  const night: RoutineStep[] = [];

  if (hasPlaque || hasTartar) {
    night.push({
      time: "Before brushing",
      action: "Floss thoroughly",
      detail: "Use C-shape technique, sliding between every tooth including the back ones",
      duration: "3 min",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    });
  } else {
    night.push({
      time: "Before brushing",
      action: "Floss between teeth",
      detail: "Gently slide floss between each tooth, hugging the sides",
      duration: "2 min",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    });
  }

  night.push({
    time: "Bedtime",
    action: "Brush thoroughly",
    detail: hasPlaque
      ? "Use electric toothbrush if available — removes up to 100% more plaque"
      : "Gentle circular motions for 2 full minutes, don't forget gumline",
    duration: "2 min",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  });

  if (hasGumIssue) {
    night.push({
      time: "After brushing",
      action: "Gum massage with turmeric",
      detail: "Mix ½ tsp turmeric + mustard oil, massage gums for 2 min, then rinse",
      duration: "3 min",
      icon: <Droplets className="w-3.5 h-3.5" />,
    });
  }

  if (hasCavity || hasErosion) {
    night.push({
      time: "After brushing",
      action: "Fluoride mouthwash",
      detail: "Swish alcohol-free fluoride rinse for 30 sec. Don't eat/drink after.",
      duration: "1 min",
      icon: <Droplets className="w-3.5 h-3.5" />,
    });
  }

  if (hasDiscoloration) {
    night.push({
      time: "2x per week",
      action: "Baking soda polish",
      detail: "Mix small amount of baking soda with water, brush gently for 1 min for stain removal",
      duration: "1 min",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    });
  }

  night.push({
    time: "Before sleep",
    action: "Avoid snacking",
    detail: "No food or sugary drinks after brushing — saliva flow drops during sleep",
    duration: "—",
    icon: <Clock className="w-3.5 h-3.5" />,
  });

  return { morning, night };
}

const DailyRoutineGenerator = (props: RoutineProps) => {
  const [expanded, setExpanded] = useState(false);
  const { morning, night } = generateRoutine(props);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-clinical-blue/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-clinical-blue" />
          </div>
          <div>
            <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
              Your Daily Routine
            </h4>
            <p className="text-[10px] text-muted-foreground">Personalized based on your scan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] text-clinical-blue border-clinical-blue/30">
            {morning.length + night.length} steps
          </Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Morning Routine */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-plaque" />
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Morning Routine</span>
                </div>
                <div className="space-y-1.5 ml-1 border-l-2 border-plaque/20 pl-3">
                  {morning.map((step, i) => (
                    <motion.div
                      key={`m-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                      className="py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-scan-green">{step.icon}</span>
                        <span className="text-[12px] font-semibold text-foreground flex-1">{step.action}</span>
                        <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{step.duration}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 ml-5">{step.detail}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5 ml-5">⏰ {step.time}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Night Routine */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-clinical-blue" />
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Night Routine</span>
                </div>
                <div className="space-y-1.5 ml-1 border-l-2 border-clinical-blue/20 pl-3">
                  {night.map((step, i) => (
                    <motion.div
                      key={`n-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                      className="py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-clinical-blue">{step.icon}</span>
                        <span className="text-[12px] font-semibold text-foreground flex-1">{step.action}</span>
                        <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{step.duration}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 ml-5">{step.detail}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5 ml-5">⏰ {step.time}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center italic pt-1">
                ✨ Follow this routine daily for best results. Adjust based on your dentist's advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyRoutineGenerator;
