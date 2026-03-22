import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, QrCode, Sword, Stethoscope, Shield, Star, Zap, Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ClinicFlyer = () => {
  const flyerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav - hidden on print */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="container max-w-4xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <h1 className="font-heading font-bold text-sm text-foreground">Clinic Marketing Flyer</h1>
          </div>
          <Button variant="clinical" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print Flyer
          </Button>
        </div>
      </header>

      {/* Flyer Content */}
      <div className="container max-w-4xl px-4 py-8 print:p-0 print:max-w-none">
        <div
          ref={flyerRef}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevated print:shadow-none print:border-none print:rounded-none"
          style={{ aspectRatio: "210/297" }}
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-[hsl(215,50%,20%)] to-[hsl(215,70%,45%)] px-8 py-6 text-center">
            <h1 className="text-white font-heading font-bold text-2xl tracking-tight">
              DentaScan<span className="text-[hsl(210,100%,70%)]"> AI</span>
            </h1>
            <p className="text-white/70 text-xs mt-1 tracking-widest uppercase">The Future of Family Dentistry</p>
          </div>

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-urgency-amber/10 to-clinical-blue/10 px-8 py-5 text-center border-b border-border">
            <h2 className="font-heading font-bold text-xl text-foreground">
              STOP THE BRUSHING BATTLES AT HOME! ⚔️🦷
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Is your child a "Monster Hunter"? Join our clinic's digital guild!
            </p>
          </div>

          {/* Two-Column Split */}
          <div className="grid grid-cols-2 min-h-0">
            {/* Left - Doctor/Professional Side */}
            <div className="border-r border-border p-6 space-y-4 bg-card">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-clinical-blue" />
                <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">For Parents</h3>
              </div>

              <div className="space-y-3">
                {[
                  { icon: <Download className="w-4 h-4" />, title: "Download the App", desc: "Watch your child fight AR monsters on their actual teeth." },
                  { icon: <Zap className="w-4 h-4" />, title: "Get AI Insights", desc: 'See which spots your child is missing with "Heatmap" technology.' },
                  { icon: <Star className="w-4 h-4" />, title: "Earn Rewards", desc: 'You set the "Loot" — they earn the "Clear Crystal" victory!' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-clinical-blue/10 flex items-center justify-center flex-shrink-0 text-clinical-blue mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Professional Review */}
              <div className="rounded-xl border border-clinical-blue/20 bg-clinical-blue/5 p-3 mt-4">
                <p className="text-[10px] font-semibold text-clinical-blue uppercase tracking-wider mb-1">Stay Connected to Your Doctor</p>
                <ul className="text-[10px] text-muted-foreground space-y-1">
                  <li>✓ Complete a 7-day streak in the app</li>
                  <li>✓ Send your DentaScan Report directly to this clinic</li>
                  <li>✓ Unlock a professional AI review for just ₹100</li>
                </ul>
              </div>
            </div>

            {/* Right - Gaming/Child Side */}
            <div className="p-6 space-y-4 bg-gradient-to-b from-urgency-amber/5 to-card">
              <div className="flex items-center gap-2">
                <Sword className="w-5 h-5 text-urgency-amber" />
                <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">For the Kids</h3>
              </div>

              <div className="space-y-3">
                {[
                  { emoji: "⚔️", title: "Battle Epic Monsters!", desc: "Fight the Molar Mauler and the Gingivitis Goblins!" },
                  { emoji: "🗡️", title: "Level Up Your Saber", desc: "Collect rare Crystal Shards and upgrade your weapons!" },
                  { emoji: "💎", title: "Win the Clear Crystal", desc: "Complete 14 days and earn the legendary Clear Crystal victory!" },
                  { emoji: "🏆", title: "Trophy Room", desc: "Show off your monster collection and battle streaks!" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-lg mt-0.5">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monster Preview */}
              <div className="rounded-xl border border-urgency-amber/20 bg-urgency-amber/5 p-3 text-center">
                <p className="text-[10px] font-semibold text-urgency-amber uppercase tracking-wider mb-1">This Week's Monster</p>
                <p className="text-2xl">🦠</p>
                <p className="text-xs font-heading font-bold text-foreground">The Plaque Phantom</p>
                <p className="text-[9px] text-muted-foreground">Defeat it by brushing your molars!</p>
              </div>
            </div>
          </div>

          {/* Doctor Name + QR Section */}
          <div className="border-t border-border bg-muted/20 px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="rounded-lg border border-dashed border-border bg-card px-4 py-3">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Your Dental Professional</p>
                  <p className="text-lg font-heading font-bold text-foreground mt-0.5">Dr. ___________________</p>
                  <p className="text-[10px] text-muted-foreground">Clinic: ___________________</p>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] text-scan-green">
                  <Shield className="w-3 h-3" />
                  <span className="font-semibold">HIPAA Compliant · AES-256 Encrypted · AI-Powered</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-border bg-card flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                    <p className="text-[8px] text-muted-foreground mt-1">QR CODE</p>
                  </div>
                </div>
                <p className="text-[9px] font-semibold text-foreground">Scan to Download</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-[hsl(215,50%,20%)] to-[hsl(215,70%,45%)] px-8 py-3 text-center">
            <p className="text-white/90 text-xs font-semibold">
              Join our Clinic Guild today! 🛡️
            </p>
            <p className="text-white/50 text-[8px] mt-0.5 tracking-wider">
              PRECISION TRIAGE · PROFESSIONAL GROWTH · DENTASCAN AI
            </p>
          </div>
        </div>

        {/* Print instructions - hidden on print */}
        <div className="mt-6 text-center space-y-2 print:hidden">
          <p className="text-xs text-muted-foreground">
            Click "Print Flyer" to print this on A4 paper. Fill in the doctor's name and add your clinic's QR code.
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" />
            Print as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicFlyer;
