import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, Users, Shield, IndianRupee, Smartphone, Brain, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const slides = [
  {
    title: "DentaScan AI",
    subtitle: "Investor Pitch Deck",
    icon: Rocket,
    color: "from-primary to-clinical-blue",
    content: (
      <div className="text-center space-y-4">
        <h2 className="font-heading font-bold text-3xl text-foreground">
          DentaScan<span className="text-clinical-blue ml-1">AI</span>
        </h2>
        <p className="text-lg text-muted-foreground">AI-Powered Dental Triage for the Next Billion Patients</p>
        <div className="flex justify-center gap-3 mt-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">HealthTech</span>
          <span className="px-3 py-1 rounded-full bg-scan-green/10 text-scan-green text-xs font-semibold">AI + Gamification</span>
          <span className="px-3 py-1 rounded-full bg-urgency-amber/10 text-urgency-amber text-xs font-semibold">B2B2C SaaS</span>
        </div>
      </div>
    ),
  },
  {
    title: "The Problem",
    subtitle: "A $380B gap in dental care",
    icon: Target,
    color: "from-urgency-red to-urgency-amber",
    content: (
      <div className="grid grid-cols-2 gap-4">
        {[
          { stat: "3.5B", label: "People with untreated dental disease globally", color: "text-urgency-red" },
          { stat: "70%", label: "Indian children skip proper brushing daily", color: "text-urgency-amber" },
          { stat: "1:10K", label: "Dentist-to-patient ratio in rural India", color: "text-urgency-red" },
          { stat: "₹0", label: "Revenue tools available for solo-practice dentists", color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/20 rounded-xl p-4 border border-border">
            <p className={`text-2xl font-heading font-bold ${s.color}`}>{s.stat}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "The Solution",
    subtitle: "3 products, 1 ecosystem",
    icon: Brain,
    color: "from-clinical-blue to-scan-green",
    content: (
      <div className="space-y-3">
        {[
          { name: "Monster Hunter", desc: "AR gamified brushing for kids (6-12 yrs)", badge: "Consumer", badgeColor: "bg-neon-blue/10 text-neon-blue" },
          { name: "Parent Portal", desc: "Anti-cheat heatmaps + report sharing", badge: "Prosumer", badgeColor: "bg-urgency-amber/10 text-urgency-amber" },
          { name: "Provider Portal", desc: "EHR-grade triage with AI diagnostics", badge: "Enterprise", badgeColor: "bg-clinical-blue/10 text-clinical-blue" },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/10">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Revenue Model",
    subtitle: "Per-transaction + subscription",
    icon: IndianRupee,
    color: "from-scan-green to-clinical-blue",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-scan-green/20 bg-scan-green/5 p-4 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Patient Fee</p>
            <p className="text-2xl font-heading font-bold text-scan-green">₹100</p>
            <p className="text-[9px] text-muted-foreground">Per consult</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Platform Take</p>
            <p className="text-2xl font-heading font-bold text-primary">₹75</p>
            <p className="text-[9px] text-muted-foreground">AI + hosting</p>
          </div>
          <div className="rounded-xl border border-urgency-amber/20 bg-urgency-amber/5 p-4 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Pro Sub</p>
            <p className="text-2xl font-heading font-bold text-urgency-amber">₹200</p>
            <p className="text-[9px] text-muted-foreground">Per month</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">LTV per doctor: <span className="font-bold text-foreground">₹9,000/yr</span> · LTV per family: <span className="font-bold text-foreground">₹2,400/yr</span></p>
        </div>
      </div>
    ),
  },
  {
    title: "Traction",
    subtitle: "Early metrics & milestones",
    icon: TrendingUp,
    color: "from-urgency-amber to-scan-green",
    content: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "MVP Features Built", value: "25+", sub: "Modules live" },
          { label: "Security Standard", value: "HIPAA", sub: "AES-256 E2E" },
          { label: "AI Models", value: "4", sub: "Dental analysis engines" },
          { label: "Target Market", value: "₹380B", sub: "Global dental market" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border p-4 bg-muted/10 text-center">
            <p className="text-2xl font-heading font-bold text-foreground">{m.value}</p>
            <p className="text-xs font-semibold text-foreground mt-1">{m.label}</p>
            <p className="text-[9px] text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Go-to-Market",
    subtitle: "Bottom-up doctor acquisition",
    icon: Users,
    color: "from-clinical-blue to-primary",
    content: (
      <div className="space-y-3">
        {[
          { phase: "Phase 1", title: "Clinic Flyers + Word of Mouth", timeline: "Month 1-3", status: "Active" },
          { phase: "Phase 2", title: "Dental College Partnerships", timeline: "Month 3-6", status: "Planned" },
          { phase: "Phase 3", title: "Insurance Provider Integration", timeline: "Month 6-12", status: "Roadmap" },
          { phase: "Phase 4", title: "International Expansion (SEA)", timeline: "Year 2", status: "Vision" },
        ].map((p) => (
          <div key={p.phase} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/10">
            <div className="w-14 text-[9px] font-bold text-primary">{p.phase}</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{p.title}</p>
              <p className="text-[9px] text-muted-foreground">{p.timeline}</p>
            </div>
            <span className="text-[8px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{p.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "The Ask",
    subtitle: "Seed round",
    icon: Rocket,
    color: "from-primary to-scan-green",
    content: (
      <div className="text-center space-y-6">
        <div className="inline-flex flex-col items-center gap-2">
          <p className="text-4xl font-heading font-bold text-foreground">₹50L</p>
          <p className="text-sm text-muted-foreground">Seed Round · Pre-Revenue</p>
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[
            { pct: "40%", label: "AI & Engineering" },
            { pct: "30%", label: "Doctor Acquisition" },
            { pct: "30%", label: "Compliance & Ops" },
          ].map((a) => (
            <div key={a.label} className="rounded-xl border border-border p-3 bg-muted/10">
              <p className="text-lg font-heading font-bold text-primary">{a.pct}</p>
              <p className="text-[9px] text-muted-foreground">{a.label}</p>
            </div>
          ))}
        </div>
        <Button size="lg" asChild className="gap-2">
          <Link to="/auth">
            <Shield className="w-4 h-4" />
            Try the Live Demo
          </Link>
        </Button>
      </div>
    ),
  },
];

const PitchDeck = () => {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="font-heading font-bold text-sm text-foreground">
          DentaScan<span className="text-clinical-blue ml-1">AI</span>
          <span className="text-muted-foreground font-normal ml-2">Pitch Deck</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{current + 1} / {slides.length}</span>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">Print</Button>
        </div>
      </header>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden">
              {/* Slide header */}
              <div className={`px-8 py-6 bg-gradient-to-r ${slide.color} text-primary-foreground`}>
                <div className="flex items-center gap-3">
                  <slide.icon className="w-6 h-6" />
                  <div>
                    <h2 className="font-heading font-bold text-2xl">{slide.title}</h2>
                    <p className="text-sm opacity-80">{slide.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Slide content */}
              <div className="p-8">
                {slide.content}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="border-t border-border bg-card px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-muted hover:bg-muted-foreground/30"}`} />
          ))}
        </div>
        <Button variant="ghost" size="sm" disabled={current === slides.length - 1} onClick={() => setCurrent((c) => c + 1)} className="gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PitchDeck;
