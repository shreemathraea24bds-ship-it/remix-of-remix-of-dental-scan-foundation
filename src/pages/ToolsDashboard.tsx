import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Droplets, Sparkles, Swords, ChevronRight, Zap, Shield, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";

const tools = [
  {
    title: "Bite Force Analysis",
    subtitle: "Acoustic Jaw Diagnostics",
    description: "Record jaw sounds to detect bruxism, TMJ disorders, and bite irregularities using AI-powered acoustic analysis.",
    icon: Activity,
    href: "/bite-force",
    gradient: "from-urgency-red/20 to-monitor-amber/10",
    iconBg: "bg-urgency-red/15",
    iconColor: "text-urgency-red",
    features: ["Real-time frequency visualization", "Defect detection", "Recovery plans"],
    badge: "Pro",
  },
  {
    title: "pH Predictor",
    subtitle: "Tongue Health Scanner",
    description: "Capture your tongue photo for AI-driven oral pH estimation, vitamin deficiency detection, and health condition screening.",
    icon: Droplets,
    href: "/ph-predictor",
    gradient: "from-scan-green/20 to-clinical-blue/10",
    iconBg: "bg-scan-green/15",
    iconColor: "text-scan-green",
    features: ["pH estimation", "Vitamin analysis", "Disease screening"],
    badge: "Core",
  },
  {
    title: "Flossing Coach",
    subtitle: "Guided Dental Hygiene",
    description: "Interactive zone-by-zone flossing guide with AI before/after scans to measure plaque removal effectiveness.",
    icon: Sparkles,
    href: "/flossing-coach",
    gradient: "from-clinical-blue/20 to-gingiva-pink/10",
    iconBg: "bg-clinical-blue/15",
    iconColor: "text-clinical-blue",
    features: ["Zone-by-zone guide", "Before/after scans", "Plaque scoring"],
    badge: "Core",
  },
  {
    title: "Monster Hunter",
    subtitle: "Kids Brushing Game",
    description: "Gamified brushing experience where kids hunt plaque monsters across tooth sectors — with parent command center and rewards.",
    icon: Swords,
    href: "/monster-hunter",
    gradient: "from-plaque-gold/20 to-gingiva-pink/10",
    iconBg: "bg-plaque-gold/15",
    iconColor: "text-plaque-gold",
    features: ["AR-style battles", "Parent portal", "Trophy room"],
    badge: "New",
  },
];

const badgeStyles: Record<string, string> = {
  Pro: "bg-urgency-red/15 text-urgency-red",
  Core: "bg-clinical-blue/15 text-clinical-blue",
  New: "bg-scan-green/15 text-scan-green",
};

const stats = [
  { label: "AI Models", value: "4+", icon: Zap },
  { label: "Health Metrics", value: "50+", icon: Shield },
  { label: "User Rating", value: "4.9", icon: Star },
];

const ToolsDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
              <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <h1 className="font-heading font-bold text-base text-foreground">
              Tools <span className="text-clinical-blue">Dashboard</span>
            </h1>
          </div>
          <LanguageSelector compact />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Your Dental <span className="text-clinical-blue">Toolkit</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              AI-powered diagnostics, guided hygiene coaching, and gamified brushing — all in one place.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center gap-6 md:gap-10 mt-8"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <s.icon className="w-4 h-4 text-clinical-blue" />
                  <span className="text-xl md:text-2xl font-heading font-bold text-foreground">{s.value}</span>
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Link to={tool.href} className="block group">
                <Card className="border-border/60 hover:border-clinical-blue/40 transition-all duration-300 overflow-hidden h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <CardContent className="p-5 md:p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl ${tool.iconBg} flex items-center justify-center`}>
                        <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.badge && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyles[tool.badge]}`}>
                            {tool.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-clinical-blue transition-colors" />
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-foreground text-lg mb-0.5">{tool.title}</h3>
                    <p className="text-[11px] text-clinical-blue font-medium mb-2">{tool.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{tool.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {tool.features.map((f) => (
                        <span
                          key={f}
                          className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ToolsDashboard;
