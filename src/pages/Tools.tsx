import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Mic, Droplets, Heart, Activity, Shield, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";
import LanguageSelector from "@/components/LanguageSelector";

interface ToolCard {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bg: string;
  badge?: string;
  features: string[];
}

const tools: ToolCard[] = [
  {
    title: "AI Dental Scanner",
    subtitle: "Computer Vision Analysis",
    description: "Capture or upload a dental photo and receive a comprehensive AI analysis covering cavities, plaque, gum health, teeth arrangement, and defects.",
    icon: <Camera className="w-6 h-6" />,
    href: "/",
    color: "text-clinical-blue",
    bg: "bg-clinical-blue/8",
    badge: "Core",
    features: ["Cavity detection", "Plaque heatmap", "Teeth arrangement", "Defect mapping", "Gum health scoring"],
  },
  {
    title: "Bite-Force Analysis",
    subtitle: "Acoustic Diagnostics",
    description: "Record jaw sounds via microphone to detect bruxism grinding, clenching, and TMJ clicking using real-time FFT frequency analysis + AI diagnosis.",
    icon: <Mic className="w-6 h-6" />,
    href: "/bite-force",
    color: "text-urgency-amber",
    bg: "bg-urgency-amber/8",
    badge: "New",
    features: ["Real-time FFT visualization", "Bruxism detection", "TMJ click analysis", "Night guard recommendation", "Risk factor assessment"],
  },
  {
    title: "pH Predictor",
    subtitle: "Oral Acidity Estimation",
    description: "Analyze tongue photos, symptoms, and dietary intake to estimate oral pH levels and assess demineralization risk at the critical pH 5.5 threshold.",
    icon: <Droplets className="w-6 h-6" />,
    href: "/ph-predictor",
    color: "text-scan-green",
    bg: "bg-scan-green/8",
    badge: "New",
    features: ["Tongue coating analysis", "pH level estimation", "Dietary impact scoring", "Demineralization risk", "Personalized diet suggestions"],
  },
  {
    title: "Flossing Coach",
    subtitle: "Guided Oral Hygiene",
    description: "Interactive 32-tooth animated guide with auto-advancing timer, ghost-string visualization, and tooth-by-tooth technique instructions.",
    icon: <Heart className="w-6 h-6" />,
    href: "/flossing-coach",
    color: "text-gingiva",
    bg: "bg-gingiva/8",
    features: ["32-zone coverage", "5s per-tooth timer", "Animated dental map", "Technique guidance", "Session tracking"],
  },
  {
    title: "Monster Hunter",
    subtitle: "Gamified Brushing",
    description: "Camera-based mouth detection spawns tooth monsters that can only be defeated by real brushing motion. Fun for kids and adults alike!",
    icon: <Swords className="w-6 h-6" />,
    href: "/monster-hunter",
    color: "text-neon-purple",
    bg: "bg-purple-500/8",
    badge: "New",
    features: ["Mouth detection", "Brushing motion tracking", "Monster battles", "Trophy room", "Daily missions"],
  },
  {
    title: "Triage Engine",
    subtitle: "Priority Assessment",
    description: "AI-powered priority-based triage with emergency detection, appointment urgency scoring, and actionable clinical next steps.",
    icon: <Activity className="w-6 h-6" />,
    href: "/#triage-guide",
    color: "text-urgency-red",
    bg: "bg-urgency-red/8",
    badge: "Pro",
    features: ["Emergency detection", "Priority scoring", "Appointment booking", "Sensitivity tracking", "Cleaning countdown"],
  },
  {
    title: "Lesion Tracker",
    subtitle: "14-Day Protocol",
    description: "Longitudinal lesion monitoring with photo gallery, progress timeline, and automatic biopsy alert when a lesion persists beyond 10 days.",
    icon: <Shield className="w-6 h-6" />,
    href: "/#lesion-tracker",
    color: "text-plaque",
    bg: "bg-plaque/8",
    badge: "Pro",
    features: ["Photo timeline gallery", "Size delta tracking", "Color score analysis", "Auto biopsy alert", "14-day protocol"],
  },
];

const badgeStyles: Record<string, string> = {
  Core: "bg-clinical-blue/10 text-clinical-blue border-clinical-blue/20",
  New: "bg-scan-green/10 text-scan-green border-scan-green/20",
  Pro: "bg-plaque/10 text-plaque border-plaque/20",
};

const Tools = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl flex items-center gap-3 h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <h1 className="font-heading font-bold text-lg text-foreground">
            DentaScan<span className="text-clinical-blue ml-1">{t("nav.tools")}</span>
          </h1>
          <div className="ml-auto">
            <LanguageSelector compact />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-10 space-y-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 bg-clinical-blue/10 text-clinical-blue rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> {t("tools.hero")}
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground max-w-lg mx-auto leading-tight">
            {t("tools.headline")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t("tools.heroDesc")}
          </p>
        </motion.section>

        {/* Tool Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={tool.href}
                className="group block h-full rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl ${tool.bg} flex items-center justify-center ${tool.color}`}>
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <Badge variant="outline" className={`text-[9px] ${badgeStyles[tool.badge] || ""}`}>
                      {tool.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-heading font-bold text-foreground group-hover:text-clinical-blue transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{tool.subtitle}</p>
                </div>

                <p className="text-[12px] text-muted-foreground leading-relaxed">{tool.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tool.features.map((f) => (
                    <span key={f} className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center">
          ⚕️ {t("tools.disclaimer")}
        </p>
      </main>
    </div>
  );
};

export default Tools;
