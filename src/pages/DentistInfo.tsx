import { Link } from "react-router-dom";
import {
  ArrowLeft, FileText, ShieldCheck, Smartphone, ClipboardList,
  Lock, IndianRupee, Video, MessageSquare, Shield, Eye,
  CheckCircle2, Users, Zap, BadgeCheck, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import doctorHero from "@/assets/doctor-hero.jpg";
import dentalExam from "@/assets/dental-exam.png";
import clinicTech from "@/assets/clinic-tech.png";
import aiScan from "@/assets/ai-scan.png";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const DentistInfo = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Background orbs */}
    <div className="orb orb-blue w-[500px] h-[500px] -top-40 -right-40 fixed opacity-30" />
    <div className="orb orb-purple w-[400px] h-[400px] bottom-20 -left-40 fixed opacity-20" />

    <header className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="container max-w-3xl flex items-center gap-3 h-14 px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="font-heading font-bold text-sm text-foreground">For Dental Professionals</h1>
      </div>
    </header>

    <main className="container max-w-3xl px-4 py-0 space-y-14 relative z-10">
      {/* Hero with doctor background */}
      <motion.div {...fadeUp} className="relative -mx-4 overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0">
          <img
            src={doctorHero}
            alt="Professional dentist in clinic"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </div>
        <div className="relative z-10 px-6 pt-24 pb-12 sm:pt-32 sm:pb-16 space-y-4">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/15 border border-primary/25 px-3 py-1 rounded-full backdrop-blur-sm">
            <BadgeCheck className="w-3 h-3" />
            Provider Portal
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground leading-tight max-w-lg">
            DentaScan <span className="gradient-text">Provider Portal</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            A professional, HIPAA-compliant medical triage platform. Receive AI-analyzed patient scans, unlock clinical reports, and earn through consultations.
          </p>
          <div className="flex gap-3 pt-2">
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow haptic-button" asChild>
              <Link to="/doctor-signup">
                Create Account
              </Link>
            </Button>
            <Button variant="outline" className="gap-2 border-border/60 hover:border-primary/40 backdrop-blur-sm" asChild>
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Report Guide */}
      <motion.section {...fadeUp} className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-clinical-blue" />
          How It Works
        </h3>
        {[
          {
            icon: <FileText className="w-5 h-5" />,
            title: "Report Structure",
            content: "Each report includes a Triage Level badge (Emergency/Monitor/Routine), plaque coverage comparison, lesion history grid, and AI diagnostic notes."
          },
          {
            icon: <ShieldCheck className="w-5 h-5" />,
            title: "Secure Report Access",
            content: "Patient identities are encrypted (E2EE, AES-256). Reports show masked names like P****** K**** until you authenticate with your Private Master Password."
          },
          {
            icon: <ClipboardList className="w-5 h-5" />,
            title: "AI Limitations",
            content: "DentaScan AI is a triage assistant, not a diagnostic tool. All clinical decisions remain the sole responsibility of the licensed dental professional."
          },
          {
            icon: <Smartphone className="w-5 h-5" />,
            title: "Provider Dashboard",
            content: "Access a 3-pane EHR-style dashboard with urgency-sorted triage queue, DICOM-style clinical viewer, and action center with referral tools."
          },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 p-5 glass-card-hover">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-foreground mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
            </div>
          </div>
        ))}
      </motion.section>

      {/* Dental Exam Image Banner */}
      <motion.div {...fadeUp} className="relative rounded-2xl overflow-hidden h-48 sm:h-56">
        <img src={dentalExam} alt="Professional dental examination" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="max-w-xs space-y-2">
            <h3 className="font-heading font-bold text-lg text-foreground">Precision Diagnostics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">AI-powered analysis combined with professional clinical expertise for accurate triage.</p>
          </div>
        </div>
      </motion.div>

      {/* Secure Vault Feature */}
      <motion.section {...fadeUp} className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5 text-urgency-amber" />
          Secure Vault — Patient Privacy
        </h3>
        <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-urgency-amber/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-urgency-amber" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-foreground">Private Master Password</h4>
              <p className="text-[10px] text-muted-foreground">Separate from the patient's PIN — only you can decrypt identities</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Encrypted State", desc: "P****** K****", icon: <Lock className="w-4 h-4" /> },
              { label: "Password Entry", desc: "6-digit Master PIN", icon: <Eye className="w-4 h-4" /> },
              { label: "Identity Revealed", desc: "Full Name + Contact", icon: <CheckCircle2 className="w-4 h-4" /> },
            ].map((step, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-muted/30 border border-border">
                <div className="w-8 h-8 rounded-full bg-clinical-blue/10 flex items-center justify-center mx-auto mb-2 text-clinical-blue">
                  {step.icon}
                </div>
                <p className="text-[9px] font-semibold text-foreground">{step.label}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground text-center italic">
            Even if someone accesses the database, they only see scrambled text without your Private Password.
          </p>
        </div>
      </motion.section>

      {/* Payment Gateway */}
      <motion.section {...fadeUp} className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-scan-green" />
          Payment Gateway — Earn Per Case
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Doctor Fee */}
          <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">You Pay</span>
              <span className="text-2xl font-heading font-bold text-foreground">₹75</span>
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">AI Processing & Platform Access</h4>
            <ul className="space-y-1.5 text-[10px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-scan-green mt-0.5 flex-shrink-0" />
                High-resolution AI tooth-mapping & lesion measurements
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-scan-green mt-0.5 flex-shrink-0" />
                Unlock patient identity, contact details & Medical Vault
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-scan-green mt-0.5 flex-shrink-0" />
                Secure HIPAA-compliant data hosting
              </li>
            </ul>
            <div className="rounded-lg bg-muted/30 p-2 text-[8px] text-muted-foreground">
              <span className="font-semibold text-foreground">Refund:</span> Non-refundable once patient identity is decrypted.
            </div>
          </div>

          {/* Patient Fee */}
          <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Patient Pays</span>
              <span className="text-2xl font-heading font-bold text-foreground">₹100</span>
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">Consultation Booking Fee</h4>
            <ul className="space-y-1.5 text-[10px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-scan-green mt-0.5 flex-shrink-0" />
                Direct payment to you for remote clinical review
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-scan-green mt-0.5 flex-shrink-0" />
                Covers digital evaluation + 5-min text/video follow-up
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-scan-green mt-0.5 flex-shrink-0" />
                Patient consents to share scan data with verified professional
              </li>
            </ul>
            <div className="rounded-lg bg-muted/30 p-2 text-[8px] text-muted-foreground">
              <span className="font-semibold text-foreground">Refund:</span> Non-refundable once doctor accepts the scan.
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="rounded-2xl border border-border bg-muted/10 p-4">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">Revenue Flow Per Case</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-card border border-border">
              <Users className="w-5 h-5 text-clinical-blue mx-auto mb-1" />
              <p className="text-xs font-heading font-bold text-foreground">Patient</p>
              <p className="text-lg font-heading font-bold text-foreground">₹100</p>
              <p className="text-[8px] text-muted-foreground">Gets professional opinion</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <BadgeCheck className="w-5 h-5 text-scan-green mx-auto mb-1" />
              <p className="text-xs font-heading font-bold text-foreground">Doctor</p>
              <p className="text-lg font-heading font-bold text-foreground">₹75</p>
              <p className="text-[8px] text-muted-foreground">Pre-analyzed patient lead</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <Zap className="w-5 h-5 text-urgency-amber mx-auto mb-1" />
              <p className="text-xs font-heading font-bold text-foreground">Platform</p>
              <p className="text-lg font-heading font-bold text-scan-green">Net</p>
              <p className="text-[8px] text-muted-foreground">AI & server security</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Chief Complaint + Tele-Consult */}
      <motion.section {...fadeUp} className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-clinical-blue" />
          Clinical Features
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-clinical-blue/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-clinical-blue" />
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">Chief Complaint Log</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              AI transcribes the patient's reported symptoms. Click the waveform icon to hear the original audio memo from the patient or parent.
            </p>
            <div className="rounded-lg bg-muted/30 p-3 border-l-2 border-clinical-blue/30">
              <p className="text-[10px] text-muted-foreground italic">
                "Sharp pain when drinking cold water on the lower left side…"
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-scan-green/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-scan-green" />
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">One-Tap Tele-Consult</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Launch a secure Jitsi Meet video call directly with the patient to discuss scan results. No app install needed — works in browser.
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-scan-green">
              <Shield className="w-3 h-3" />
              <span className="font-semibold">End-to-end encrypted · HIPAA compliant</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Clinic Tech Image Banner */}
      <motion.div {...fadeUp} className="relative rounded-2xl overflow-hidden h-48 sm:h-56">
        <img src={clinicTech} alt="Modern dental clinic with advanced technology" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-end px-6">
          <div className="max-w-xs space-y-2 text-right">
            <h3 className="font-heading font-bold text-lg text-foreground">Advanced Technology</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">DICOM-style viewers, AI heatmaps, and EHR integration — all in your browser.</p>
          </div>
        </div>
      </motion.div>

      {/* Feature Comparison */}
      <motion.section {...fadeUp} className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground text-center">Child vs. Doctor View</h3>
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wider">Feature</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wider">Child (Monster Hunter)</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-[9px] tracking-wider">Doctor (DentaScan)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Visuals", "Cartoon Monsters", "Heatmaps & Lesion Outlines"],
                ["Language", '"The Molar Mauler"', '"Potential Stage 2 Caries"'],
                ["Goal", "Get the Clear Crystal", "Diagnostic Triage"],
                ["Cost", "Free (Gaming)", "₹75 Access / ₹100 Consult"],
                ["Security", "Fun Avatars", "E2EE + Master Password"],
              ].map(([feature, child, doctor], i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-semibold text-foreground">{feature}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{child}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{doctor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* AI Scan Banner */}
      <motion.div {...fadeUp} className="relative rounded-2xl overflow-hidden h-40">
        <img src={aiScan} alt="AI dental scan visualization" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg text-foreground">Powered by <span className="gradient-text">Advanced AI</span></h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">Every scan is processed through our multi-model AI pipeline for comprehensive dental analysis.</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeUp} className="pb-8">
        <div className="glass-card gradient-border p-8 text-center space-y-4 relative overflow-hidden">
          <div className="orb orb-blue w-[200px] h-[200px] -top-10 -right-10 absolute" />
          <div className="relative z-10 space-y-4">
            <h3 className="font-heading font-bold text-xl text-foreground">
              Ready to join the <span className="gradient-text">DentaScan network</span>?
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow haptic-button" size="lg" asChild>
                <Link to="/doctor-signup">
                  Create Provider Account
                </Link>
              </Button>
              <Button variant="outline" className="gap-2 border-border/60 hover:border-primary/40" size="lg" asChild>
                <Link to="/clinic-flyer">
                  <Printer className="w-4 h-4" />
                  Download Clinic Flyer
                </Link>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Already have an account?{" "}
              <Link to="/dashboard" className="text-primary underline">Go to Dashboard →</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  </div>
);

export default DentistInfo;
