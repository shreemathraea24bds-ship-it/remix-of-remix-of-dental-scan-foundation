import { useState } from "react";
import { Lock, IndianRupee, CheckCircle2, Loader2, BadgeCheck, FileText, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { type PatientScan } from "./mockData";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface PaymentGateProps {
  scan: PatientScan;
  onDoctorPaid: () => void;
}

const UPI_ID = "shreenira@axl";

const PaymentGate = ({ scan, onDoctorPaid }: PaymentGateProps) => {
  const [txnId, setTxnId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [doctorConsent, setDoctorConsent] = useState(false);
  const [showDoctorTerms, setShowDoctorTerms] = useState(false);
  const [showPatientTerms, setShowPatientTerms] = useState(false);

  const handleUPIPay = () => {
    if (!doctorConsent) {
      toast.error("Please accept the Terms of Service before proceeding.");
      return;
    }
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=DentaScan%20AI&am=75&cu=INR&tn=Report%20Access%20${scan.id}`;
    window.open(upiUrl, "_blank");
    setShowQR(true);
  };

  const handleSubmitTxn = () => {
    if (!txnId.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Payment verified! Report unlocked.");
      onDoctorPaid();
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Doctor Access Fee */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-clinical-blue" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Report Access & AI Processing Fee</h4>
          </div>
          {scan.doctorAccessPaid ? (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-scan-green bg-scan-green/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> PAID
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-urgency-amber bg-urgency-amber/10 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> LOCKED
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {scan.doctorAccessPaid ? (
            <motion.div key="paid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-scan-green mx-auto mb-2" />
              <p className="text-xs text-scan-green font-semibold">Report Unlocked</p>
              <p className="text-[9px] text-muted-foreground">Full AI analysis and patient identity accessible</p>
            </motion.div>
          ) : (
            <motion.div key="unpaid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-3">
              <div className="text-center">
                <p className="text-2xl font-heading font-bold text-foreground">₹75</p>
                <p className="text-[10px] text-muted-foreground">One-time access · AI report + patient lead</p>
              </div>

              {/* Doctor Terms of Service */}
              <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
                <button
                  onClick={() => setShowDoctorTerms(!showDoctorTerms)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    Terms of Service — Doctor Access
                  </span>
                  {showDoctorTerms ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <AnimatePresence>
                  {showDoctorTerms && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2 text-[9px] text-muted-foreground leading-relaxed">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-foreground text-[10px]">Report Access & AI Processing Fee: ₹75</p>
                          <div className="space-y-1 pl-2 border-l-2 border-clinical-blue/20">
                            <p><span className="font-semibold text-foreground">Purpose:</span> This fee covers high-resolution AI tooth-mapping, lesion measurements, and secure HIPAA-compliant data hosting.</p>
                            <p><span className="font-semibold text-foreground">Service:</span> Unlocks the patient's private identity, contact details, and the full "Medical Vault" for this specific case.</p>
                            <p><span className="font-semibold text-foreground">Refund Policy:</span> Non-refundable once the patient identity has been decrypted and accessed.</p>
                            <p><span className="font-semibold text-foreground">Security:</span> By paying this fee, you agree to maintain patient confidentiality and use the Private Password only for authorized clinical review.</p>
                            <p><span className="font-semibold text-foreground">Liability:</span> DentaScan AI provides AI-assisted triage only. All clinical decisions remain the sole responsibility of the licensed dental professional.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Doctor Consent */}
              <div className="flex items-start gap-2 px-1">
                <Checkbox
                  id="doctor-consent"
                  checked={doctorConsent}
                  onCheckedChange={(checked) => setDoctorConsent(!!checked)}
                  className="mt-0.5"
                />
                <label htmlFor="doctor-consent" className="text-[9px] text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the <button onClick={(e) => { e.preventDefault(); setShowDoctorTerms(true); }} className="text-clinical-blue underline">Terms of Service</button> and will maintain patient confidentiality under HIPAA/GDPR guidelines.
                </label>
              </div>

              <Button onClick={handleUPIPay} className="w-full gap-2" size="sm" disabled={!doctorConsent}>
                <IndianRupee className="w-3.5 h-3.5" />
                Unlock Patient Identity — ₹75
              </Button>

              {showQR && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                  <div className="border border-border rounded-lg p-3 bg-muted/20">
                    <p className="text-[9px] text-muted-foreground text-center mb-2">Or scan QR code</p>
                    <img src="/assets/phonepe-qr.jpg" alt="UPI QR" className="w-32 h-32 mx-auto rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="Enter UPI Transaction ID"
                      className="h-8 text-xs"
                    />
                    <Button size="sm" onClick={handleSubmitTxn} disabled={!txnId.trim() || submitting} className="h-8 gap-1">
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Verify
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Patient Consultation Status */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-clinical-blue" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Patient Consultation Fee</h4>
          </div>
          <span className="text-lg font-heading font-bold text-foreground">₹100</span>
        </div>
        <div className="p-4 space-y-3">
          {scan.consultationPaid ? (
            <div className="flex items-center gap-2 text-scan-green">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="text-xs font-semibold">Consultation Paid</p>
                <p className="text-[9px] text-muted-foreground">Patient paid ₹100 for professional review</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-urgency-amber">
              <Lock className="w-5 h-5" />
              <div>
                <p className="text-xs font-semibold">Awaiting Payment</p>
                <p className="text-[9px] text-muted-foreground">Patient hasn't paid consultation fee yet</p>
              </div>
            </div>
          )}

          {/* Patient Terms (expandable) */}
          <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
            <button
              onClick={() => setShowPatientTerms(!showPatientTerms)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                Terms of Service — Patient Consultation
              </span>
              {showPatientTerms ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {showPatientTerms && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2 text-[9px] text-muted-foreground leading-relaxed">
                    <div className="space-y-1.5">
                      <p className="font-semibold text-foreground text-[10px]">Consultation Booking Fee: ₹100</p>
                      <div className="space-y-1 pl-2 border-l-2 border-clinical-blue/20">
                        <p><span className="font-semibold text-foreground">Purpose:</span> Direct payment to the Dental Professional for a remote clinical review of the DentaScan report.</p>
                        <p><span className="font-semibold text-foreground">Service:</span> Covers digital evaluation of AI-flagged issues and a 5-minute text/video follow-up if required.</p>
                        <p><span className="font-semibold text-foreground">Refunds:</span> Non-refundable once the Doctor "Accepts" the scan for review.</p>
                        <p><span className="font-semibold text-foreground">Data Sharing:</span> By paying, the patient agrees to share scan data with a verified dental professional for triage purposes.</p>
                        <p><span className="font-semibold text-foreground">Disclaimer:</span> This is a triage service and does not replace an in-person physical dental examination.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Revenue Flow Summary */}
      <div className="rounded-xl border border-border bg-muted/10 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="w-3 h-3 text-scan-green" />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Secure Payment Summary</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[8px] text-muted-foreground uppercase">Patient Pays</p>
            <p className="text-sm font-heading font-bold text-foreground">₹100</p>
            <p className="text-[8px] text-muted-foreground">Consultation</p>
          </div>
          <div>
            <p className="text-[8px] text-muted-foreground uppercase">Doctor Pays</p>
            <p className="text-sm font-heading font-bold text-foreground">₹75</p>
            <p className="text-[8px] text-muted-foreground">AI Access</p>
          </div>
          <div>
            <p className="text-[8px] text-muted-foreground uppercase">Security</p>
            <p className="text-sm font-heading font-bold text-scan-green">E2EE</p>
            <p className="text-[8px] text-muted-foreground">AES-256</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGate;
