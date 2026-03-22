import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scan, CalendarClock, ShieldCheck, Stethoscope, ArrowRight, Smartphone, Zap, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import aiScanImg from "@/assets/ai-scan.jpg";
import dentalCheckupImg from "@/assets/dental-checkup.jpg";
import healthySmileImg from "@/assets/healthy-smile.jpg";

const features = [
  {
    icon: <Eye className="w-5 h-5" />,
    title: "AI Plaque Heatmap",
    description: "Gaussian-blur heatmap overlays reveal plaque and biofilm invisible to the naked eye.",
    gradient: "from-primary/20 to-crystal-cyan/10",
  },
  {
    icon: <CalendarClock className="w-5 h-5" />,
    title: "14-Day Lesion Tracker",
    description: "Longitudinal tracking with automatic biopsy alerts when a lesion persists beyond 10 days.",
    gradient: "from-scan-green/20 to-primary/10",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Secure Clinical Export",
    description: "PIN-protected, 48-hour expiring links ensure only your dentist sees your data.",
    gradient: "from-neon-purple/15 to-primary/10",
  },
];

const stats = [
  { value: "50K+", label: "Scans Completed" },
  { value: "98%", label: "Detection Accuracy" },
  { value: "<3s", label: "Analysis Time" },
  { value: "AES-256", label: "Encryption" },
];

const Landing = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Background orbs */}
    <div className="orb orb-blue w-[600px] h-[600px] -top-40 -right-40 fixed opacity-40" />
    <div className="orb orb-purple w-[500px] h-[500px] top-1/3 -left-60 fixed opacity-30" />
    <div className="orb orb-cyan w-[400px] h-[400px] bottom-20 right-1/4 fixed opacity-20" />

    {/* Header */}
    <header className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="container max-w-6xl flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Scan className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-lg text-foreground">
            DentaScan<span className="gradient-text ml-1">AI</span>
          </h1>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector compact />
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 haptic-button" asChild>
            <Link to="/">
              Try Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>

    <main className="container max-w-6xl px-4 relative z-10">
      {/* Hero section */}
      <section className="py-24 sm:py-32 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full"
          >
            <Zap className="w-3 h-3" />
            AI-Powered Dental Triage
          </motion.span>

          <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] max-w-3xl mx-auto">
            Your Pocket Dentist.{" "}
            <span className="gradient-text">Detect Early. Act Fast.</span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            DentaScan AI uses computer vision to detect cavities, map plaque build-up, and track oral lesions —
            giving you clinical-grade insights from your phone's camera.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="gap-2 haptic-button bg-primary hover:bg-primary/90 shadow-glow text-base px-8 h-12" asChild>
            <Link to="/">
              <Smartphone className="w-4 h-4" />
              Start Free Scan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 text-base h-12 border-border/60 hover:border-primary/40 hover:bg-primary/5" asChild>
            <Link to="/dentist-info">
              <Stethoscope className="w-4 h-4" />
              For Dentists
            </Link>
          </Button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <p className="text-xl sm:text-2xl font-heading font-bold gradient-text">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Hero image showcase */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="relative -mt-8 mb-8"
      >
        <div className="glass-card overflow-hidden">
          <div className="grid sm:grid-cols-3 gap-0">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={aiScanImg} alt="AI dental scan visualization" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <p className="absolute bottom-3 left-3 text-[10px] font-semibold text-foreground">AI Scan Analysis</p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={dentalCheckupImg} alt="Dental checkup" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <p className="absolute bottom-3 left-3 text-[10px] font-semibold text-foreground">Professional Review</p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={healthySmileImg} alt="Healthy smile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <p className="absolute bottom-3 left-3 text-[10px] font-semibold text-foreground">Healthy Results</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <section className="py-20 space-y-12">
        <div className="text-center space-y-3">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            Clinical-Grade Features
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Everything you need for comprehensive dental monitoring, right from your phone.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i + 0.2, duration: 0.5 }}
              className="glass-card-hover p-6 space-y-4"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-primary`}>
                {f.icon}
              </div>
              <h4 className="font-heading font-semibold text-foreground">{f.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About with clinic image */}
      <section className="py-20 space-y-8">
        <div className="text-center space-y-3">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
            About DentaScan AI
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 items-center max-w-4xl mx-auto">
          <div className="glass-card overflow-hidden rounded-2xl">
            <img src={dentalCheckupImg} alt="Dentist performing checkup" className="w-full h-full object-cover aspect-[4/3]" />
          </div>
          <div className="glass-card p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              DentaScan AI transforms your smartphone into a clinical-grade dental screening tool. Our plaque heatmap identifies biofilm deposits invisible to the naked eye.
            </p>
            <p>
              The 14-Day Lesion Tracker provides longitudinal monitoring with automatic biopsy referral alerts when a lesion persists beyond 10 days.
            </p>
            <p>
              Share results securely with PIN-protected clinical links that expire after 48 hours. Your data is encrypted with AES-256 and never sold.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card gradient-border p-10 sm:p-14 text-center space-y-6 relative overflow-hidden"
        >
          <div className="orb orb-blue w-[300px] h-[300px] -top-20 -right-20 absolute" />
          <div className="orb orb-purple w-[250px] h-[250px] -bottom-20 -left-20 absolute" />
          <div className="relative z-10 space-y-6">
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Ready to take control of your <span className="gradient-text">oral health</span>?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join thousands of users who detect dental issues early with AI-powered screening.
            </p>
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 shadow-glow haptic-button text-base px-8 h-12" asChild>
              <Link to="/">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 space-y-4">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/dentist-info" className="hover:text-foreground transition-colors">For Dentists</Link>
          <Link to="/reviews" className="hover:text-foreground transition-colors">Reviews</Link>
          <Link to="/pitch-deck" className="hover:text-foreground transition-colors">Pitch Deck</Link>
          <span>© {new Date().getFullYear()} DentaScan AI</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-medium text-center">
          Developed by Shreemathrae, Shobica Rani, Dharshana, Dhamayenthi & Dhanushri
        </p>
        <p className="text-[9px] text-muted-foreground text-center">
          AI analysis for informational purposes only. Not a medical device.
        </p>
      </footer>
    </main>
  </div>
);

export default Landing;
