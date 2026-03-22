import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Shield,
  Loader2,
  Camera,
  Sparkles,
  Clock,
} from "lucide-react";
import phonepeQr from "@/assets/phonepe-qr.jpg";

const PaymentGate = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [hasScreenshot, setHasScreenshot] = useState(false);

  // Check is_approved status from profiles
  useEffect(() => {
    if (!user) {
      setCheckingStatus(false);
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_approved, screenshot_url")
        .eq("id", user.id)
        .single();

      if (data?.is_approved) {
        setIsApproved(true);
      }
      if (data?.screenshot_url) {
        setHasScreenshot(true);
      }
      setCheckingStatus(false);
    };
    check();
  }, [user]);

  // Redirect if approved
  useEffect(() => {
    if (isApproved && !checkingStatus) {
      navigate("/", { replace: true });
    }
  }, [isApproved, checkingStatus, navigate]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payments")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("payments")
        .getPublicUrl(filePath);

      // Update profile with screenshot URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ screenshot_url: urlData.publicUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;

      // Notify admin
      try {
        await supabase.functions.invoke("notify-payment", {
          body: {
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email,
            transactionId: filePath,
          },
        });
      } catch (notifyErr) {
        console.error("Email notification failed:", notifyErr);
      }

      setUploaded(true);
      toast.success("Screenshot uploaded! Waiting for admin approval.");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading || checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already uploaded screenshot, waiting for approval
  if (hasScreenshot || uploaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground">Payment Under Review</h3>
              <p className="text-sm text-muted-foreground">
                Your payment is being verified by{" "}
                <span className="font-semibold text-foreground">shreemaganesh01@gmail.com</span>.
                Please wait for approval.
              </p>
              <p className="text-xs text-muted-foreground">You'll get full access once approved.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Activate DentaScan<span className="text-primary">AI</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            One-time ₹100 activation to unlock full access
          </p>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-5">
            {/* Plan info */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Activation Plan</p>
                  <p className="text-3xl font-heading font-bold text-foreground mt-1">₹100</p>
                </div>
                <div className="text-right">
                  <Sparkles className="w-6 h-6 text-primary mb-1" />
                  <p className="text-[10px] text-muted-foreground">Full Access</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                <span>✓ AI Dental Scanner</span>
                <span>✓ pH Predictor</span>
                <span>✓ Bite Force Analysis</span>
                <span>✓ Flossing Coach</span>
                <span>✓ Monster Hunter</span>
                <span>✓ Doctor Consults</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <p className="text-xs font-medium text-foreground mb-2">Scan QR to Pay via UPI</p>
              <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border-2 border-primary/20">
                <img src={phonepeQr} alt="UPI QR Code" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">UPI ID: shreenira@axl</p>
            </div>

            {/* Upload receipt */}
            <div>
              <label
                htmlFor="receipt-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : previewUrl ? (
                  <img src={previewUrl} alt="Receipt" className="h-full object-contain rounded-lg" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-primary/60 mb-2" />
                    <p className="text-sm font-medium text-foreground">Upload Payment Screenshot</p>
                    <p className="text-[10px] text-muted-foreground">Take a screenshot after paying ₹100</p>
                  </>
                )}
              </label>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentGate;
