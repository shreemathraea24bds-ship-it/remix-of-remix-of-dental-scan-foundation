import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import ScannerInterface from "@/components/ScannerInterface";
import PlaqueHeatmapToggle from "@/components/PlaqueHeatmapToggle";
import TriagePriorityCard from "@/components/TriagePriorityCard";
import LesionGrowthTracker from "@/components/LesionGrowthTracker";
import ToothNavigator from "@/components/ToothNavigator";
import ProcessingSkeleton from "@/components/ProcessingSkeleton";
import CameraCapture from "@/components/CameraCapture";
import AnalysisResults, { type DentalAnalysis } from "@/components/AnalysisResults";
import ScanResultView from "@/components/ScanResultView";
import ShareReport from "@/components/ShareReport";
import EmergencyDrawer from "@/components/EmergencyDrawer";
import MedicalDisclaimer, { DISCLAIMER_KEY } from "@/components/MedicalDisclaimer";
import ConsultationRequest from "@/components/ConsultationRequest";
import InviteDentist from "@/components/InviteDentist";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn, Crown, Stethoscope, Scan, Zap } from "lucide-react";
import ProGate from "@/components/ProGate";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/LanguageSelector";
import aiScanImg from "@/assets/ai-scan.jpg";
import dentalClinicImg from "@/assets/dental-clinic.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, isDentist, isPro } = useAuth();
  const { t } = useI18n();
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DentalAnalysis | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string>("");
  const [emergencyDrawerOpen, setEmergencyDrawerOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => !localStorage.getItem(DISCLAIMER_KEY));
  const [showConsultation, setShowConsultation] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem("dentascan-onboarded");
    if (!onboarded) {
      navigate("/onboarding", { replace: true });
    }
  }, [navigate]);

  const handleCapture = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setCapturedImageUrl(imageBase64);
    setAnalysisResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-dental", {
        body: { imageBase64 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysisResult(data as DentalAnalysis);
      toast.success("Analysis complete!");
      if ((data as DentalAnalysis).overallHealth === "emergency") {
        setEmergencyDrawerOpen(true);
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-blue w-[500px] h-[500px] -top-40 -right-40 fixed opacity-30" />
      <div className="orb orb-purple w-[400px] h-[400px] top-1/2 -left-40 fixed opacity-20" />

      {/* Header */}
      <header className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-5xl flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scan className="w-3.5 h-3.5 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-lg tracking-tight text-foreground">
              DentaScan<span className="gradient-text ml-1">AI</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            {user && isDentist && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("index.providerPortal")}</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing" className="flex items-center gap-1.5 text-plaque">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">{isPro ? "Pro ✓" : "Pro"}</span>
              </Link>
            </Button>
            {!user && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/auth" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("nav.signIn")}</span>
                </Link>
              </Button>
            )}
            <LanguageSelector compact />
            <span className="text-[10px] font-semibold text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">
              v2.0
            </span>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-10 space-y-20 relative z-10">
        {/* AI scan hero banner */}
        <section className="relative -mx-4 overflow-hidden rounded-2xl">
          <img src={aiScanImg} alt="AI dental scan" className="w-full h-48 sm:h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-heading font-bold text-2xl text-foreground">
                  {t("index.aiAnalysis")}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t("index.aiAnalysisDesc")}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <ProGate feature="AI Dental Scanner">
            <div className="glass-card p-6 space-y-6">
              <CameraCapture onCapture={handleCapture} isAnalyzing={isAnalyzing} />
              {isAnalyzing && <ProcessingSkeleton />}
              {analysisResult && capturedImageUrl && (
                <>
                  <AnalysisResults analysis={analysisResult} imageUrl={capturedImageUrl} />
                  <div className="border-t border-border/50 pt-6">
                    <ScanResultView imageUrl={capturedImageUrl} />
                  </div>
                  <div className="border-t border-border/50 pt-6">
                    <ShareReport analysis={analysisResult} imageUrl={capturedImageUrl} />
                  </div>
                </>
              )}
            </div>
          </ProGate>
        </section>

        {/* Consultation Request */}
        {user && (
          <section className="space-y-6">
            {/* Clinic banner */}
            <div className="relative -mx-4 overflow-hidden rounded-2xl">
              <img src={dentalClinicImg} alt="Modern dental clinic" className="w-full h-36 sm:h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-between px-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-scan-green/20 backdrop-blur-sm flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-scan-green" />
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-foreground">
                      Connect with a Dentist
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Request a video call, phone call, or WhatsApp consultation with a dental professional.
                  </p>
                </div>
                {!showConsultation && (
                  <Button className="gap-2 bg-scan-green hover:bg-scan-green/90 haptic-button" onClick={() => setShowConsultation(true)}>
                    <Stethoscope className="w-4 h-4" />
                    Request
                  </Button>
                )}
              </div>
            </div>
            {showConsultation && (
              <ConsultationRequest onClose={() => setShowConsultation(false)} />
            )}
            <InviteDentist />
          </section>
        )}

        {/* Triage Engine */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-urgency-red/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-urgency-red" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                {t("index.triageEngine")}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md pl-10">
              {t("index.triageDesc")}
            </p>
          </div>
          <ProGate feature="Triage Engine">
            <div className="grid sm:grid-cols-3 gap-4">
              <TriagePriorityCard
                priority="emergency"
                title="Acute Pulpitis Detected"
                summary="Severe inflammation of the dental pulp. Immediate treatment recommended within 24 hours."
                toothId="14"
                onFindEmergencyDentist={() => setEmergencyDrawerOpen(true)}
              />
              <TriagePriorityCard
                priority="monitor"
                title="Early Caries · Buccal"
                summary="Initial demineralization observed on buccal surface. Monitor and reassess in 30 days."
                toothId="26"
              />
              <TriagePriorityCard
                priority="healthy"
                title="No Findings"
                summary="Tooth surface appears healthy. No abnormalities detected during scan analysis."
                toothId="11"
              />
            </div>
          </ProGate>
        </section>

        {/* Lesion Tracker */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-urgency-amber/10 flex items-center justify-center">
                <Scan className="w-4 h-4 text-urgency-amber" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                {t("index.lesionTracker")}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md pl-10">
              {t("index.lesionDesc")}
            </p>
          </div>
          <ProGate feature="Lesion Tracker">
            <div className="glass-card p-6">
              <LesionGrowthTracker />
            </div>
          </ProGate>
        </section>

        {/* Scanner Demo */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scan className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                {t("index.scannerInterface")}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md pl-10">
              {t("index.scannerDesc")}
            </p>
          </div>
          <ScannerInterface onScanChange={setIsScanning} />
        </section>

        {/* Heatmap Toggle */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-plaque/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-plaque" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                {t("index.plaqueHeatmap")}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md pl-10">
              {t("index.plaqueDesc")}
            </p>
          </div>
          <div className="glass-card p-8 flex justify-center">
            <PlaqueHeatmapToggle />
          </div>
        </section>

        {/* Tooth Navigator */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-crystal-cyan/10 flex items-center justify-center">
                <Scan className="w-4 h-4 text-crystal-cyan" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                {t("index.toothNavigator")}
              </h2>
            </div>
          </div>
          <div className="glass-card p-6">
            <ToothNavigator isScanning={isScanning} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-16 relative z-10">
        <div className="container max-w-5xl px-4 flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
          <Link to="/tools" className="hover:text-foreground transition-colors font-semibold text-primary">🛠️ {t("index.allTools")}</Link>
          <span className="text-border">·</span>
          <Link to="/bite-force" className="hover:text-foreground transition-colors">🎤 Bite-Force</Link>
          <span className="text-border">·</span>
          <Link to="/ph-predictor" className="hover:text-foreground transition-colors">💧 pH Predictor</Link>
          <span className="text-border">·</span>
          <Link to="/flossing-coach" className="hover:text-foreground transition-colors">🧵 Flossing Coach</Link>
          <span className="text-border">·</span>
          <Link to="/monster-hunter" className="hover:text-foreground transition-colors text-plaque">🦷 Monster Hunter</Link>
          <span className="text-border">·</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">{t("index.privacyPolicy")}</Link>
          <span className="text-border">·</span>
          <Link to="/dentist-info" className="hover:text-foreground transition-colors">{t("index.forDentists")}</Link>
          <span className="text-border">·</span>
          <Link to="/landing" className="hover:text-foreground transition-colors">{t("index.about")}</Link>
        </div>
      </footer>

      <EmergencyDrawer open={emergencyDrawerOpen} onClose={() => setEmergencyDrawerOpen(false)} />
      {showDisclaimer && <MedicalDisclaimer onAccept={() => setShowDisclaimer(false)} />}
    </div>
  );
};

export default Index;
