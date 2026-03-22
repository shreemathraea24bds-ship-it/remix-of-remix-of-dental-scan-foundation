import { Check, Crown, Shield, Zap, ExternalLink, QrCode, Sparkles, SendHorizonal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LanguageSelector from "@/components/LanguageSelector";
import phonepeQr from "@/assets/phonepe-qr.jpg";

const UPI_ID = "shreenira@axl";
const AMOUNT = 59;

const features = [
  "AI Dental Scanner",
  "Real-time parent-child sync",
  "Unlimited battle events",
  "Monster evolution system",
  "Priority support",
  "Family sync across devices",
  "Detailed progress reports",
];

const freeFeatures = [
  "Basic brushing game",
  "3 monster battles/day",
  "Local progress only",
];

const Pricing = () => {
  const { user, isPro, isTrialing, trialDaysLeft, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showQr, setShowQr] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [pendingClaim, setPendingClaim] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("payment_claims")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data }) => {
        setPendingClaim(!!data);
      });
  }, [user]);

  const handleUPIPay = () => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=DentaScan%20Pro&am=${AMOUNT}&cu=INR&tn=Pro%20Plan%20Subscription`;
    window.location.href = upiUrl;
  };

  const handleClaimPayment = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }
    setClaiming(true);
    try {
      const { error } = await supabase.from("payment_claims").insert({
        user_id: user.id,
        user_email: user.email ?? "",
        user_name: profile?.full_name ?? "",
        upi_transaction_id: txnId.trim() || null,
      });
      if (error) throw error;

      // Send email notification
      await supabase.functions.invoke("notify-payment", {
        body: {
          userEmail: user.email,
          userName: profile?.full_name,
          transactionId: txnId.trim(),
        },
      });

      toast.success("Payment claim submitted! We'll verify and activate your Pro account shortly.");
      setShowClaimForm(false);
      setTxnId("");
    } catch (err: any) {
      console.error("Claim error:", err);
      toast.error(err.message || "Failed to submit claim");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground text-sm"
          >
            {t("nav.back")}
          </button>
          <LanguageSelector compact />
        </div>
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="gap-1">
            <Crown className="w-3 h-3" /> {t("pricing.title")}
          </Badge>
          <h1 className="text-2xl font-bold text-foreground font-[Outfit]">
            {t("pricing.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("pricing.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pb-12 space-y-4 max-w-md mx-auto">
        {/* Free Plan */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground font-[Outfit]">{t("pricing.free")}</h3>
              <span className="text-2xl font-bold text-foreground">₹0</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("pricing.foreverFree")}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {freeFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-[hsl(var(--scan-green))]" />
                {f}
              </div>
            ))}
            {isPro ? (
              <Badge variant="secondary" className="gap-1 text-xs">Free tier</Badge>
            ) : (
              <Button variant="outline" className="w-full mt-4" disabled>
                {t("pricing.currentPlan")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-[hsl(var(--primary))] border-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            {t("pricing.recommended")}
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[hsl(var(--plaque-gold))]" />
                <h3 className="font-semibold text-foreground font-[Outfit]">{t("pricing.pro")}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">₹{AMOUNT}</span>
                <span className="text-xs text-muted-foreground">{t("pricing.perMonth")}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("pricing.subtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-[hsl(var(--scan-green))]" />
                {f}
              </div>
            ))}

            {isPro && !isTrialing ? (
              <div className="w-full mt-4 bg-[hsl(var(--scan-green))]/10 text-[hsl(var(--scan-green))] border border-[hsl(var(--scan-green))]/30 rounded-lg py-3 flex items-center justify-center gap-2 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                {t("pricing.activePro")}
              </div>
            ) : isTrialing ? (
              <div className="w-full mt-4 bg-primary/10 text-primary border border-primary/30 rounded-lg py-3 flex flex-col items-center gap-1 text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Zap className="w-4 h-4" />
                  {t("pricing.trialActive")} — {trialDaysLeft} {t("pricing.daysLeft")}
                </div>
                <p className="text-[11px] opacity-80">{t("pricing.allProUnlocked")}</p>
              </div>
            ) : pendingClaim ? (
              <div className="w-full mt-4 bg-[hsl(var(--plaque-gold))]/10 text-[hsl(var(--plaque-gold))] border border-[hsl(var(--plaque-gold))]/30 rounded-lg py-3 flex flex-col items-center gap-1 text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Clock className="w-4 h-4" />
                  {t("pricing.paymentReview")}
                </div>
                <p className="text-[11px] opacity-80">{t("pricing.paymentReviewSub")}</p>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleUPIPay}
                  className="w-full mt-4 bg-primary text-primary-foreground gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("pricing.payViaUPI")} ₹{AMOUNT}
                </Button>

                <button
                  onClick={() => setShowQr((v) => !v)}
                  className="w-full text-center text-xs text-primary font-medium mt-2 flex items-center justify-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {showQr ? t("pricing.hideQR") : t("pricing.scanQR")}
                </button>

                {showQr && (
                  <div className="flex justify-center pt-2">
                    <img
                      src={phonepeQr}
                      alt="PhonePe UPI QR Code"
                      className="w-52 h-52 rounded-xl border border-border object-contain"
                    />
                  </div>
                )}

                <div className="text-center pt-2 space-y-1">
                   <p className="text-[11px] text-muted-foreground">
                     {t("pricing.upiId")}: <span className="font-mono font-medium text-foreground">{UPI_ID}</span>
                   </p>
                   <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                     <Shield className="w-3 h-3" />
                     {t("pricing.securePayment")}
                   </div>
                </div>

                {/* Payment Claim Section */}
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  {!showClaimForm ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!user) { toast.error(t("pricing.signInFirst")); navigate("/auth"); return; }
                        setShowClaimForm(true);
                      }}
                      className="w-full gap-2"
                    >
                      <SendHorizonal className="w-4 h-4" />
                      {t("pricing.confirmPayment")}
                    </Button>
                  ) : (
                    <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">{t("pricing.enterTxnId")}</p>
                      <Input
                        placeholder={t("pricing.txnIdPlaceholder")}
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setShowClaimForm(false); setTxnId(""); }}
                          className="flex-1"
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleClaimPayment}
                          disabled={claiming}
                          className="flex-1 gap-1"
                        >
                          {claiming ? t("pricing.submitting") : t("pricing.submitClaim")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;
