import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Clock, Receipt, ImageIcon, X, Search, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { toast } from "sonner";

interface PaymentReceipt {
  id: string;
  user_id: string;
  name: string;
  payment_date: string;
  payment_time: string;
  amount: string;
  reference_id: string;
  transaction_id: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

const ReceiptApprovalPanel = () => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const fetchReceipts = async () => {
    const { data, error } = await supabase
      .from("payment_receipts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch receipts:", error);
    } else {
      setReceipts((data as PaymentReceipt[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReceipts();
    const channel = supabase
      .channel("receipt-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_receipts" }, () => fetchReceipts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAction = async (receiptId: string, action: "verified" | "rejected") => {
    setProcessing(receiptId);
    try {
      const { error } = await supabase
        .from("payment_receipts")
        .update({ status: action })
        .eq("id", receiptId);
      if (error) throw error;
      toast.success(`Receipt ${action} successfully!`);
    } catch (err: any) {
      console.error("Action failed:", err);
      toast.error(err.message || "Action failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkAction = useCallback(async (action: "verified" | "rejected") => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from("payment_receipts")
        .update({ status: action })
        .in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} receipt(s) ${action} successfully!`);
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error("Bulk action failed:", err);
      toast.error(err.message || "Bulk action failed");
    } finally {
      setBulkProcessing(false);
    }
  }, [selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1 text-[hsl(var(--plaque-gold))] border-[hsl(var(--plaque-gold))]/30"><Clock className="w-3 h-3" />Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="gap-1 text-[hsl(var(--scan-green))] border-[hsl(var(--scan-green))]/30"><CheckCircle className="w-3 h-3" />Verified</Badge>;
      case "rejected":
        return <Badge variant="outline" className="gap-1 text-destructive border-destructive/30"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesFilter = statusFilter === "all" || r.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.transaction_id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [receipts, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE));
  const pageReceipts = filteredReceipts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);
  useEffect(() => { setSelectedIds(new Set()); }, [searchQuery, statusFilter, currentPage]);

  const pendingCount = receipts.filter((r) => r.status === "pending").length;
  const pendingOnPage = pageReceipts.filter((r) => r.status === "pending");
  const allPendingSelected = pendingOnPage.length > 0 && pendingOnPage.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    const allSelected = allPendingSelected;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pendingOnPage.forEach((r) => allSelected ? next.delete(r.id) : next.add(r.id));
      return next;
    });
  };

  const filterButtons: { label: string; value: typeof statusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Receipt className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Payment Receipts</h2>
        {pendingCount > 0 && (
          <Badge className="ml-auto bg-[hsl(var(--plaque-gold))] text-[hsl(var(--plaque-gold-foreground,0_0%_0%))]">
            {pendingCount}
          </Badge>
        )}
      </div>

      {/* Search & Filter */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search name or txn ID…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <div className="flex gap-1">
          {filterButtons.map((f) => (
            <Button key={f.value} size="sm" variant={statusFilter === f.value ? "default" : "outline"} className="flex-1 h-7 text-[10px] px-1" onClick={() => setStatusFilter(f.value)}>
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="p-2 border-b border-border bg-muted/50 flex items-center gap-2 animate-fade-in">
          <CheckSquare className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-foreground font-medium">{selectedIds.size} selected</span>
          <div className="ml-auto flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[10px] text-[hsl(var(--scan-green))] border-[hsl(var(--scan-green))]/30 hover:bg-[hsl(var(--scan-green))]/10" disabled={bulkProcessing} onClick={() => handleBulkAction("verified")}>
              <CheckCircle className="w-3 h-3 mr-1" />Verify All
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/10" disabled={bulkProcessing} onClick={() => handleBulkAction("rejected")}>
              <XCircle className="w-3 h-3 mr-1" />Reject All
            </Button>
          </div>
        </div>
      )}

      {/* Expanded image overlay */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <div className="relative max-w-lg max-h-[80vh]">
            <button onClick={() => setExpandedImage(null)} className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted z-10">
              <X className="w-4 h-4" />
            </button>
            <img src={expandedImage} alt="Receipt" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">{receipts.length === 0 ? "No payment receipts yet" : "No matching receipts"}</p>
          </div>
        ) : (
          <>
            {pendingOnPage.length > 0 && (
              <div className="px-4 py-2 border-b border-border flex items-center gap-2 bg-muted/30">
                <Checkbox checked={allPendingSelected} onCheckedChange={toggleSelectAll} className="h-3.5 w-3.5" />
                <span className="text-[10px] text-muted-foreground">Select all pending ({pendingOnPage.length})</span>
              </div>
            )}
            <div className="divide-y divide-border">
              {pageReceipts.map((receipt) => (
                <div key={receipt.id} className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    {receipt.status === "pending" && (
                      <Checkbox checked={selectedIds.has(receipt.id)} onCheckedChange={() => toggleSelect(receipt.id)} className="mt-0.5 h-3.5 w-3.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{receipt.name || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">Txn: {receipt.transaction_id || "N/A"}</p>
                        </div>
                        {statusBadge(receipt.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground mt-1">
                        <span>₹{receipt.amount}</span>
                        <span>{receipt.payment_date}</span>
                        <span>Ref: {receipt.reference_id || "N/A"}</span>
                        <span>{receipt.payment_time}</span>
                      </div>
                      {receipt.image_url && (
                        <button onClick={() => setExpandedImage(receipt.image_url)} className="w-full rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors cursor-pointer group mt-2">
                          <div className="relative">
                            <img src={receipt.image_url} alt="Payment receipt" className="w-full h-28 object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </div>
                        </button>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(receipt.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                      {receipt.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="flex-1 text-[hsl(var(--scan-green))] border-[hsl(var(--scan-green))]/30 hover:bg-[hsl(var(--scan-green))]/10" disabled={processing === receipt.id} onClick={() => handleAction(receipt.id, "verified")}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />Verify
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" disabled={processing === receipt.id} onClick={() => handleAction(receipt.id, "rejected")}>
                            <XCircle className="w-3.5 h-3.5 mr-1" />Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {filteredReceipts.length > ITEMS_PER_PAGE && (
        <div className="p-3 border-t border-border flex items-center justify-between">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="w-3 h-3" />Prev
          </Button>
          <span className="text-[10px] text-muted-foreground">{currentPage} / {totalPages}</span>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next<ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReceiptApprovalPanel;