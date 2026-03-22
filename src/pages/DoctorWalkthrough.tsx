import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight, Lock, Unlock, LayoutDashboard, GitCompare, Edit3, IndianRupee, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const scenes = [
  {
    id: 1,
    title: "Secure Login",
    time: "0:00 – 0:10",
    icon: Lock,
    color: "text-clinical-blue",
    bg: "bg-clinical-blue/10",
    description: "Enter your Private Master Password. Masked patient names transform into full identities with dual-layer HIPAA authentication.",
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <Lock className="w-5 h-5 text-urgency-amber" />
          <div className="flex-1 text-sm font-mono text-muted-foreground">P****** K****</div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-scan-green/10 border border-scan-green/30"
        >
          <Unlock className="w-5 h-5 text-scan-green" />
          <div className="flex-1 text-sm font-semibold text-foreground">Priya Kumar</div>
          <span className="text-[8px] font-bold text-scan-green bg-scan-green/10 px-2 py-0.5 rounded-full">DECRYPTED</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 2,
    title: "3-Pane Dashboard",
    time: "0:10 – 0:25",
    icon: LayoutDashboard,
    color: "text-urgency-red",
    bg: "bg-urgency-red/10",
    description: "Patients auto-sorted by urgency. Tap a Red Badge to open the DICOM-style viewer with AI-highlighted lesions and measurement tools.",
    visual: (
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/30 rounded-lg p-2 space-y-1.5 border border-border">
          <div className="text-[8px] font-bold uppercase text-muted-foreground">Queue</div>
          {["red", "red", "amber", "green"].map((u, i) => (
            <div key={i} className={`h-5 rounded flex items-center gap-1 px-1.5 text-[8px] ${u === "red" ? "bg-urgency-red/10 text-urgency-red" : u === "amber" ? "bg-urgency-amber/10 text-urgency-amber" : "bg-scan-green/10 text-scan-green"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${u === "red" ? "bg-urgency-red" : u === "amber" ? "bg-urgency-amber" : "bg-scan-green"}`} />
              {u === "red" ? "EMRG" : u === "amber" ? "MON" : "OK"}
            </div>
          ))}
        </div>
        <div className="bg-foreground/90 rounded-lg p-2 flex items-center justify-center border border-clinical-blue/20">
          <div className="text-[8px] text-clinical-blue/50 font-mono">DICOM VIEWER</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2 space-y-1 border border-border">
          <div className="text-[8px] font-bold uppercase text-muted-foreground">Actions</div>
          {["Approve", "Call", "Refer"].map((a) => (
            <div key={a} className="h-4 rounded bg-primary/10 text-[7px] text-primary flex items-center px-1.5">{a}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "AI Precision & Overrule",
    time: "0:25 – 0:40",
    icon: GitCompare,
    color: "text-urgency-amber",
    bg: "bg-urgency-amber/10",
    description: "Use the Time-Travel slider to compare scans over time. Correct AI findings with the Human Overrule tool — your input becomes the primary clinical record.",
    visual: (
      <div className="space-y-2">
        <div className="h-16 rounded-lg bg-foreground/90 relative overflow-hidden border border-border">
          <div className="absolute left-0 top-0 bottom-0 w-1/2 border-r-2 border-primary" />
          <div className="absolute top-1 left-1 text-[7px] text-muted-foreground/50 font-mono">BASELINE</div>
          <div className="absolute top-1 right-1 text-[7px] text-clinical-blue/50 font-mono">CURRENT</div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg border border-urgency-amber/30 bg-urgency-amber/5 text-[9px]">
          <Edit3 className="w-3 h-3 text-urgency-amber" />
          <span className="line-through text-muted-foreground">Caries</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-bold text-urgency-amber">Enamel Stain</span>
          <span className="ml-auto text-[7px] bg-urgency-amber/10 text-urgency-amber px-1.5 py-0.5 rounded-full font-bold">DR. CORRECTED</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Revenue Bridge",
    time: "0:40 – 0:55",
    icon: IndianRupee,
    color: "text-scan-green",
    bg: "bg-scan-green/10",
    description: "Your ₹100 consultation fee is credited instantly. The ₹75 platform fee ensures top-tier AI analysis and HIPAA-grade security. Track earnings in the Revenue Ledger.",
    visual: (
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-scan-green/20 bg-scan-green/5 p-2 text-center">
          <div className="text-[7px] uppercase text-muted-foreground">Credit</div>
          <div className="text-sm font-heading font-bold text-scan-green">₹100</div>
        </div>
        <div className="rounded-lg border border-urgency-red/20 bg-urgency-red/5 p-2 text-center">
          <div className="text-[7px] uppercase text-muted-foreground">Fee</div>
          <div className="text-sm font-heading font-bold text-urgency-red">₹75</div>
        </div>
        <div className="rounded-lg border border-clinical-blue/20 bg-clinical-blue/5 p-2 text-center">
          <div className="text-[7px] uppercase text-muted-foreground">Net</div>
          <div className="text-sm font-heading font-bold text-clinical-blue">₹25</div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Your Clinic, AI-Optimized",
    time: "0:55 – 1:00",
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    description: "DentaScan. Triage with precision. Grow with ease. Log in to your portal today.",
    visual: (
      <div className="text-center py-4 space-y-2">
        <h3 className="font-heading font-bold text-lg text-foreground">
          DentaScan<span className="text-clinical-blue ml-1">AI</span>
        </h3>
        <p className="text-[10px] text-muted-foreground">Precision Triage · Professional Growth</p>
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-[7px] font-bold bg-scan-green/10 text-scan-green px-2 py-0.5 rounded-full">HIPAA</span>
          <span className="text-[7px] font-bold bg-clinical-blue/10 text-clinical-blue px-2 py-0.5 rounded-full">AES-256</span>
          <span className="text-[7px] font-bold bg-urgency-amber/10 text-urgency-amber px-2 py-0.5 rounded-full">E2E</span>
        </div>
      </div>
    ),
  },
];

const DoctorWalkthrough = () => {
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setActiveScene(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= scenes.length) {
        clearInterval(interval);
        setIsPlaying(false);
      } else {
        setActiveScene(i);
      }
    }, 3000);
  };

  const scene = scenes[activeScene];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">
              DentaScan<span className="text-clinical-blue ml-1">AI</span>
              <span className="text-muted-foreground font-normal text-sm ml-2">— 60-Second Walkthrough</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">For Dental Professionals joining the Provider Network</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePlay} disabled={isPlaying} className="gap-1.5">
              <Play className="w-3.5 h-3.5" />
              {isPlaying ? "Playing..." : "Auto-Play"}
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Join Portal</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Scene timeline */}
          <div className="space-y-2">
            {scenes.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScene(i)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${i === activeScene ? `${s.bg} border-current ${s.color}` : "border-border hover:bg-muted/30"}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${i === activeScene ? s.color : "text-muted-foreground"}`} />
                    <div>
                      <p className={`text-xs font-semibold ${i === activeScene ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</p>
                      <p className="text-[9px] text-muted-foreground">{s.time}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active scene */}
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            >
              <div className={`px-6 py-4 border-b border-border ${scene.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${scene.bg} flex items-center justify-center`}>
                    <scene.icon className={`w-5 h-5 ${scene.color}`} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-foreground">{scene.title}</h2>
                    <p className="text-[10px] text-muted-foreground font-mono">{scene.time}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-foreground leading-relaxed">{scene.description}</p>
                <div className="rounded-xl border border-border p-4 bg-muted/10">
                  {scene.visual}
                </div>
              </div>
              <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeScene === 0}
                  onClick={() => setActiveScene((p) => p - 1)}
                  className="text-xs"
                >
                  ← Previous
                </Button>
                <div className="flex gap-1">
                  {scenes.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === activeScene ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeScene === scenes.length - 1}
                  onClick={() => setActiveScene((p) => p + 1)}
                  className="text-xs"
                >
                  Next →
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center space-y-3">
          <Button size="lg" asChild className="gap-2">
            <Link to="/auth">
              <Shield className="w-4 h-4" />
              Join the Provider Network
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="text-[10px] text-muted-foreground">Free sandbox mode included · No charges until your first patient review</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorWalkthrough;
