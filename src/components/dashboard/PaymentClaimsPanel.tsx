import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PaymentClaim {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  upi_transaction_id: string | null;
  status: string;
  created_at: string;
}

const PaymentClaimsPanel = () => {
  const [claims, setClaims] = useState<PaymentClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchClaims = async () => {
    const { data, error } = await supabase
      .from("payment_claims")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch claims:", error);
    } else {
      setClaims((data as PaymentClaim[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAction = async (claimId: string, action: "approve" | "reject") => {
    setProcessing(claimId);
    try {
      const { data, error } = await supabase.functions.invoke("approve-payment", {
        body: { claimId, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Claim ${action === "approve" ? "approved" : "rejected"} successfully!`);
      fetchClaims();
    } catch (err: any) {
      console.error("Action failed:", err);
      toast.error(err.message || "Action failed");
    } finally {
      setProcessing(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1 text-[hsl(var(--plaque-gold))] border-[hsl(var(--plaque-gold))]/30"><Clock className="w-3 h-3" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="gap-1 text-[hsl(var(--scan-green))] border-[hsl(var(--scan-green))]/30"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="gap-1 text-destructive border-destructive/30"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = claims.filter((c) => c.status === "pending").length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Payment Claims</h2>
        {pendingCount > 0 && (
          <Badge className="ml-auto bg-[hsl(var(--plaque-gold))] text-[hsl(var(--plaque-gold-foreground,0_0%_0%))]">
            {pendingCount}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No payment claims yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {claims.map((claim) => (
              <div key={claim.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {claim.user_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">{claim.user_email}</p>
                  </div>
                  {statusBadge(claim.status)}
                </div>

                {claim.upi_transaction_id && (
                  <p className="text-[11px] text-muted-foreground">
                    Txn: <span className="font-mono text-foreground">{claim.upi_transaction_id}</span>
                  </p>
                )}

                <p className="text-[10px] text-muted-foreground">
                  {new Date(claim.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>

                {claim.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[hsl(var(--scan-green))] border-[hsl(var(--scan-green))]/30 hover:bg-[hsl(var(--scan-green))]/10"
                      disabled={processing === claim.id}
                      onClick={() => handleAction(claim.id, "approve")}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={processing === claim.id}
                      onClick={() => handleAction(claim.id, "reject")}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentClaimsPanel;
