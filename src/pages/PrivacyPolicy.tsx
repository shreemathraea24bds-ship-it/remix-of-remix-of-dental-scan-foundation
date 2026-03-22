import { Shield, Trash2, Eye, Lock, Server, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const privacyPoints = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Your Data is Encrypted",
    description: "All dental images and health data are encrypted using AES-256 encryption at rest and TLS 1.3 in transit. Your scans are as secure as your banking data.",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "We Never Sell Your Data",
    description: "Your dental images, health analyses, and personal information are never sold, shared with third parties, or used for advertising. Period.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "You Control Who Sees Your Scans",
    description: "Only you decide who can view your reports. Shared clinical links are PIN-protected and expire after 48 hours. Your dentist can only access data you explicitly share.",
  },
  {
    icon: <Server className="w-5 h-5" />,
    title: "Data Stays in Your Region",
    description: "All medical imagery is stored on HIPAA-compliant servers within your geographic region. We follow strict data residency requirements for healthcare data.",
  },
  {
    icon: <Trash2 className="w-5 h-5" />,
    title: "Delete Your Data Anytime",
    description: "You can permanently delete all your scans, analyses, and account data at any time. Once deleted, your data is irrecoverably removed from all servers within 30 days.",
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-3xl flex items-center gap-3 h-14 px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="font-heading font-bold text-sm text-foreground">Privacy Policy</h1>
      </div>
    </header>

    <main className="container max-w-3xl px-4 py-10 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-scan-green/10 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-scan-green" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground">The Patient Privacy Promise</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your oral health data deserves the same protection as any medical record. Here's our commitment to you.
        </p>
      </div>

      {/* 5-Point Promise */}
      <div className="space-y-4">
        {privacyPoints.map((point, i) => (
          <div key={i} className="flex gap-4 p-5 rounded-2xl border border-border bg-card shadow-card">
            <div className="w-10 h-10 rounded-xl bg-clinical-blue/10 flex items-center justify-center text-clinical-blue flex-shrink-0">
              {point.icon}
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm text-foreground mb-1">{point.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{point.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legal fine print */}
      <div className="rounded-xl bg-muted/30 border border-border p-5 space-y-3">
        <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">Additional Information</h3>
        <div className="text-[11px] text-muted-foreground leading-relaxed space-y-2">
          <p>DentaScan AI processes dental images using artificial intelligence to provide triage-level health assessments. This service is not a medical device and does not provide clinical diagnoses.</p>
          <p>We comply with applicable data protection regulations including GDPR (for EU users) and follow HIPAA best practices for health data protection.</p>
          <p>For data deletion requests, account inquiries, or privacy concerns, contact our privacy team at <strong className="text-foreground">privacy@dentascan.ai</strong>.</p>
          <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
      </div>
    </main>
  </div>
);

export default PrivacyPolicy;
