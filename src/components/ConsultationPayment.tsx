import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, CheckCircle2, Loader2, Lock, QrCode, Copy, Shield
} from "lucide-react";

interface ConsultationPaymentProps {
  consultationId: string;
  doctorId: string;
  doctorName: string;
  amount: number;
  doctorUpiId: string | null;
  onPaymentComplete: () => void;
}

const ConsultationPayment = ({
  consultationId,
  doctorId,
  doctorName,
  amount,
  doctorUpiId,
  onPaymentComplete,
}: ConsultationPaymentProps) => {
  const { user } = useAuth();
  const [txnId, setTxnId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "pending" | "verified" | "rejected">("unpaid");

  // Check existing payment
  useEffect(() => {
    if (!user) return;
    const checkPayment = async () => {
      const { data } = await supabase
        .from("consultation_payments")
        .select("status")
        .eq("consultation_id", consultationId)
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setPaymentStatus(data.status as any);
      }
    };
    checkPayment();

    // Realtime for payment verification
    const channel = supabase
      .channel(`payment-${consultationId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "consultation_payments",
        filter: `consultation_id=eq.${consultationId}`,
      }, (payload) => {
        const updated = payload.new as any;
        setPaymentStatus(updated.status);
        if (updated.status === "verified") {
          toast.success("Payment verified! Your consultation is confirmed.");
          onPaymentComplete();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, consultationId]);

  const upiId = doctorUpiId || "shreenira@axl";

  const handleUPIPay = () => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(doctorName)}&am=${amount}&cu=INR&tn=Consultation%20${consultationId.slice(0, 8)}`;
    window.open(upiUrl, "_blank");
    setShowQR(true);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied!");
  };

  const handleSubmitTxn = async () => {
    if (!txnId.trim() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("consultation_payments").insert({
        consultation_id: consultationId,
        patient_id: user.id,
        doctor_id: doctorId,
        amount,
        upi_transaction_id: txnId.trim(),
        status: "pending",
      });
      if (error) throw error;

      // Update consultation request payment_status
      await supabase
        .from("consultation_requests")
        .update({ payment_status: "pending" })
        .eq("id", consultationId);

      setPaymentStatus("pending");
      toast.success("Payment submitted! The doctor will verify it shortly.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (paymentStatus === "verified") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-scan-green/30 bg-scan-green/5 p-4 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-scan-green mx-auto" />
        <p className="text-xs font-semibold text-scan-green">Payment Verified</p>
        <p className="text-[10px] text-muted-foreground">₹{amount} paid to {doctorName}</p>
      </motion.div>
    );
  }

  if (paymentStatus === "pending") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-urgency-amber/30 bg-urgency-amber/5 p-4 text-center space-y-2">
        <Loader2 className="w-6 h-6 text-urgency-amber mx-auto animate-spin" />
        <p className="text-xs font-semibold text-urgency-amber">Payment Verification Pending</p>
        <p className="text-[10px] text-muted-foreground">Your transaction ID has been submitted. The doctor will verify it soon.</p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-clinical-blue" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Consultation Fee</h4>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-semibold text-urgency-amber bg-urgency-amber/10 px-2 py-0.5 rounded-full">
          <Lock className="w-3 h-3" /> UNPAID
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-foreground">₹{amount}</p>
          <p className="text-[10px] text-muted-foreground">Pay to <span className="font-semibold text-foreground">{doctorName}</span></p>
        </div>

        {/* UPI ID display */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase font-semibold">Doctor's UPI ID</p>
            <p className="text-xs font-mono font-semibold text-foreground">{upiId}</p>
          </div>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleCopyUPI}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Button onClick={handleUPIPay} className="w-full gap-2" size="sm">
          <IndianRupee className="w-3.5 h-3.5" />
          Pay ₹{amount} via UPI
        </Button>

        <AnimatePresence>
          {showQR && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
              <div className="border border-border rounded-lg p-3 bg-muted/20">
                <p className="text-[9px] text-muted-foreground text-center mb-2">Or scan QR code in any UPI app</p>
                <img
                  src="/assets/phonepe-qr.jpg"
                  alt="UPI QR"
                  className="w-32 h-32 mx-auto rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
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
                  Submit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showQR && (
          <button onClick={() => setShowQR(true)} className="w-full text-center text-[10px] text-clinical-blue hover:underline flex items-center justify-center gap-1">
            <QrCode className="w-3 h-3" /> Already paid? Enter Transaction ID
          </button>
        )}

        <div className="flex items-center gap-1.5 justify-center text-[9px] text-muted-foreground">
          <Shield className="w-3 h-3 text-scan-green" />
          Direct payment to doctor · Secure UPI transfer
        </div>
      </div>
    </div>
  );
};

export default ConsultationPayment;
