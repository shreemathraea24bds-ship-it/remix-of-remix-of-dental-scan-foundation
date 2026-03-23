import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Shield, LogOut, Home, CreditCard, ShieldAlert, Bell, IndianRupee, Receipt, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import TriageQueue from "@/components/dashboard/TriageQueue";
import ClinicalView from "@/components/dashboard/ClinicalView";
import ActionCenter from "@/components/dashboard/ActionCenter";
import ConsultationInbox from "@/components/dashboard/ConsultationInbox";
import PaymentClaimsPanel from "@/components/dashboard/PaymentClaimsPanel";
import ReceiptApprovalPanel from "@/components/dashboard/ReceiptApprovalPanel";
import DoctorWelcomeModal from "@/components/dashboard/DoctorWelcomeModal";
import KillSwitch from "@/components/dashboard/KillSwitch";
import { mockScans, demoScan, type PatientScan } from "@/components/dashboard/mockData";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Dashboard = () => {
  const { user, loading, isDentist, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedScan, setSelectedScan] = useState<PatientScan | null>(null);
  const [showPayments, setShowPayments] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [showKillSwitch, setShowKillSwitch] = useState(false);

  const allScans = sandboxMode ? [demoScan, ...mockScans] : mockScans;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  // Show welcome modal on first dashboard visit
  useEffect(() => {
    if (user && !loading) {
      const welcomeKey = `dentascan-doctor-welcomed-${user.id}`;
      if (!localStorage.getItem(welcomeKey)) {
        setShowWelcome(true);
        localStorage.setItem(welcomeKey, "true");
      }
    }
  }, [user, loading]);

  const handleLockdown = useCallback(() => {
    // Kill switch activated — redirect to auth
    navigate("/auth");
  }, [navigate]);

  const handleBruteForce = useCallback(() => {
    // Auto-trigger kill switch on 5 failed PIN attempts
    if (user) {
      handleLockdown();
    }
  }, [user, handleLockdown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-clinical-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Welcome Modal */}
      <DoctorWelcomeModal
        doctorName={profile?.full_name || user?.email?.split("@")[0] || "Doctor"}
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        onGoToDashboard={() => setShowWelcome(false)}
      />

      {/* Kill Switch Dialog */}
      <Dialog open={showKillSwitch} onOpenChange={setShowKillSwitch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-urgency-red">
              <ShieldAlert className="w-5 h-5" />
              Guardian Protocol
            </DialogTitle>
          </DialogHeader>
          {user && (
            <KillSwitch doctorId={user.id} onLockdown={handleLockdown} />
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
            <Link to="/"><Home className="w-4 h-4" /></Link>
          </Button>
          <h1 className="font-heading font-bold text-sm text-foreground">
            DentaScan<span className="text-clinical-blue ml-1">AI</span>
            <span className="text-muted-foreground font-normal ml-2">Provider Portal</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-scan-green bg-scan-green/10 px-2 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            HIPAA
          </div>
          <button
            onClick={() => { setSandboxMode(!sandboxMode); if (!sandboxMode) setSelectedScan(demoScan); }}
            className={`text-[9px] font-bold px-2 py-1 rounded-full transition-colors ${sandboxMode ? "bg-urgency-amber/10 text-urgency-amber" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {sandboxMode ? "🎮 SANDBOX" : "🎮 Demo"}
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-[9px] text-urgency-red hover:bg-urgency-red/10 h-7 px-2"
            onClick={() => setShowKillSwitch(true)}
          >
            <ShieldAlert className="w-3 h-3" />
            <span className="hidden sm:inline">Kill Switch</span>
          </Button>
          <Button
            variant={showInbox ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => { setShowInbox(!showInbox); setShowPayments(false); setShowReceipts(false); }}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Requests</span>
          </Button>
          <Button
            variant={showReceipts ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => { setShowReceipts(!showReceipts); setShowPayments(false); setShowInbox(false); }}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Receipts</span>
          </Button>
          <Button
            variant={showPayments ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => { setShowPayments(!showPayments); setShowInbox(false); setShowReceipts(false); }}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Payments</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => navigate("/revenue")}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Revenue</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => navigate("/health-tips")}
          >
            <HeartPulse className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Health Tips</span>
          </Button>
          <span className="text-xs text-muted-foreground hidden md:inline">{profile?.full_name || user?.email}</span>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { signOut(); navigate("/auth"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Three-pane layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Triage Queue */}
        <div className="w-72 border-r border-border flex-shrink-0 bg-card/50">
          <TriageQueue
            scans={allScans}
            selectedId={selectedScan?.id ?? null}
            onSelect={setSelectedScan}
          />
        </div>

        {/* Center: Clinical Deep-Dive */}
        <div className="flex-1 min-w-0">
          {selectedScan ? (
            <ClinicalView scan={selectedScan} onBruteForceDetected={handleBruteForce} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">Select a patient from the queue</p>
                <p className="text-[10px] text-muted-foreground/60">Click on any triage item to view clinical details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Action Center or Payment Claims */}
        <div className="w-64 border-l border-border flex-shrink-0 bg-card/50">
          {showInbox ? (
            <ConsultationInbox />
          ) : showReceipts ? (
            <ReceiptApprovalPanel />
          ) : showPayments ? (
            <PaymentClaimsPanel />
          ) : (
            <ActionCenter scan={selectedScan} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
