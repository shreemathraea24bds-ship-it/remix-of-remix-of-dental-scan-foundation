import { motion } from "framer-motion";
import { Apple, Leaf, Heart, Droplets, ShieldCheck, Home, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DentalRemediesProps {
  overallHealth: "healthy" | "monitor" | "emergency";
  plaqueLevel: string;
  gumHealth: string;
  defects?: { type: string; severity: string }[];
}

interface Remedy {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
}

interface FoodItem {
  name: string;
  benefit: string;
  emoji: string;
}

// Contextual recommendations based on detected issues
function getRecommendations(props: DentalRemediesProps) {
  const foods: FoodItem[] = [];
  const tips: string[] = [];
  const remedies: Remedy[] = [];

  const hasPlaque = ["mild", "moderate", "heavy"].includes(props.plaqueLevel);
  const hasGumIssue = props.gumHealth?.includes("inflammation");
  const hasCavity = props.defects?.some(d => d.type === "cavity");
  const hasErosion = props.defects?.some(d => d.type === "erosion");
  const hasDiscoloration = props.defects?.some(d => d.type === "discoloration");
  const hasTartar = props.defects?.some(d => d.type === "tartar");
  const hasSensitivity = props.defects?.some(d => ["crack", "chip", "erosion"].includes(d.type));

  // --- FOODS ---
  foods.push(
    { name: "Cheese & Yogurt", benefit: "Rich in calcium & casein — remineralizes enamel and neutralizes acids", emoji: "🧀" },
    { name: "Crunchy Apples & Carrots", benefit: "Natural toothbrush — stimulates saliva and scrubs plaque", emoji: "🍎" },
    { name: "Leafy Greens (Spinach, Kale)", benefit: "High in calcium, folic acid — strengthens enamel and gum tissue", emoji: "🥬" },
    { name: "Green Tea", benefit: "Contains catechins — reduces bacteria and inflammation", emoji: "🍵" },
  );

  if (hasCavity || hasErosion) {
    foods.push(
      { name: "Milk & Almonds", benefit: "Calcium + phosphorus rebuild tooth mineral structure", emoji: "🥛" },
      { name: "Strawberries", benefit: "Malic acid gently whitens; vitamin C strengthens gums", emoji: "🍓" },
    );
  }
  if (hasGumIssue) {
    foods.push(
      { name: "Oranges & Bell Peppers", benefit: "Vitamin C boosts collagen production for healthy gums", emoji: "🍊" },
      { name: "Fatty Fish (Salmon)", benefit: "Omega-3 reduces gum inflammation and bleeding", emoji: "🐟" },
    );
  }
  if (hasPlaque || hasTartar) {
    foods.push(
      { name: "Celery & Cucumbers", benefit: "High water content washes away food particles and bacteria", emoji: "🥒" },
      { name: "Sesame Seeds", benefit: "Gently scrub plaque off teeth while providing calcium", emoji: "🌱" },
    );
  }
  if (hasDiscoloration) {
    foods.push(
      { name: "Pineapple", benefit: "Bromelain enzyme helps break down tooth stains naturally", emoji: "🍍" },
    );
  }

  // --- HEALTH TIPS ---
  tips.push(
    "Brush with fluoride toothpaste for 2 minutes, twice daily using gentle circular motions",
    "Wait 30 minutes after eating acidic foods before brushing to protect softened enamel",
    "Drink water after every meal to rinse away food particles and neutralize acids",
    "Replace your toothbrush every 3 months or when bristles are frayed",
  );
  if (hasPlaque) tips.push("Use an electric toothbrush — removes up to 100% more plaque than manual brushing");
  if (hasGumIssue) tips.push("Massage gums gently with your fingertip for 2 minutes daily to improve circulation");
  if (hasCavity) tips.push("Avoid sugary snacks between meals — every sugar exposure causes 20 minutes of acid attack");
  if (hasSensitivity) tips.push("Use desensitizing toothpaste containing potassium nitrate for 2-4 weeks");
  tips.push("Floss daily — cleans 40% of tooth surfaces that brushing misses");

  // --- HOME REMEDIES ---
  remedies.push({
    icon: <Droplets className="w-4 h-4" />,
    title: "Salt Water Rinse",
    description: "Mix ½ tsp salt in warm water. Swish for 30 seconds after meals. Reduces bacteria and soothes inflammation.",
    tag: "Anti-bacterial",
  });
  remedies.push({
    icon: <Leaf className="w-4 h-4" />,
    title: "Oil Pulling (Coconut Oil)",
    description: "Swish 1 tbsp coconut oil for 15-20 minutes on empty stomach. Pulls toxins and reduces plaque.",
    tag: "Detox",
  });

  if (hasGumIssue) {
    remedies.push({
      icon: <Leaf className="w-4 h-4" />,
      title: "Turmeric Paste for Gums",
      description: "Mix ½ tsp turmeric + ½ tsp mustard oil. Apply to gums, massage for 2 min, rinse. Anti-inflammatory.",
      tag: "Gum Care",
    });
    remedies.push({
      icon: <Leaf className="w-4 h-4" />,
      title: "Aloe Vera Gel",
      description: "Apply fresh aloe vera gel directly to inflamed gums. Leave 10 min, rinse. Soothes and heals tissue.",
      tag: "Healing",
    });
  }

  if (hasCavity || hasErosion) {
    remedies.push({
      icon: <Droplets className="w-4 h-4" />,
      title: "Baking Soda Rinse",
      description: "Dissolve 1 tsp baking soda in water. Rinse 2x daily to neutralize mouth acid and protect enamel.",
      tag: "pH Balance",
    });
  }

  if (hasPlaque || hasTartar) {
    remedies.push({
      icon: <Home className="w-4 h-4" />,
      title: "Guava Leaf Chew",
      description: "Chew tender guava leaves for 2-3 minutes. Natural antimicrobial that reduces plaque and bleeding gums.",
      tag: "Plaque Fighter",
    });
  }

  if (hasSensitivity) {
    remedies.push({
      icon: <Leaf className="w-4 h-4" />,
      title: "Clove Oil Application",
      description: "Dab clove oil on sensitive area with cotton ball. Eugenol provides natural numbing and antibacterial relief.",
      tag: "Pain Relief",
    });
  }

  remedies.push({
    icon: <Leaf className="w-4 h-4" />,
    title: "Neem Twig Brushing",
    description: "Chew on neem stick until soft, use as brush. Contains azadirachtin — fights cavities and gum disease naturally.",
    tag: "Traditional",
  });

  return { foods, tips, remedies };
}

const DentalRemedies = (props: DentalRemediesProps) => {
  const { foods, tips, remedies } = getRecommendations(props);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-5"
    >
      {/* Foods Section */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Apple className="w-4 h-4 text-scan-green" />
          <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
            Teeth-Friendly Foods
          </h4>
          <Badge variant="outline" className="ml-auto text-[9px] text-scan-green border-scan-green/30">
            Recommended
          </Badge>
        </div>
        <div className="grid gap-2">
          {foods.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-start gap-2.5 py-1.5"
            >
              <span className="text-lg shrink-0">{f.emoji}</span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground">{f.name}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{f.benefit}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Health Tips */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-gingiva" />
          <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
            Oral Health Tips
          </h4>
        </div>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className="flex items-start gap-2 text-[12px] text-foreground/80"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-clinical-blue shrink-0 mt-0.5" />
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Home Remedies */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-plaque" />
          <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
            Natural Home Remedies
          </h4>
          <Badge variant="outline" className="ml-auto text-[9px] text-urgency-amber border-urgency-amber/30">
            Quick Relief
          </Badge>
        </div>
        <div className="space-y-3">
          {remedies.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              className="rounded-xl bg-muted/40 border border-border p-3 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-scan-green">{r.icon}</span>
                <p className="text-[12px] font-semibold text-foreground flex-1">{r.title}</p>
                <span className="text-[9px] font-medium text-plaque bg-plaque/10 px-2 py-0.5 rounded-full">{r.tag}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{r.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center italic">
        🏠 Home remedies complement professional care — they do not replace dental treatment.
      </p>
    </motion.div>
  );
};

export default DentalRemedies;
