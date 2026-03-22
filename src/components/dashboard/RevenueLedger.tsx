import { useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, Banknote, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface LedgerEntry {
  id: string;
  type: "credit" | "debit";
  label: string;
  amount: number;
  patient: string;
  date: Date;
}

const MOCK_LEDGER: LedgerEntry[] = [
  { id: "1", type: "credit", label: "Consult Fee", amount: 100, patient: "R***** K.", date: new Date(Date.now() - 3600000) },
  { id: "2", type: "debit", label: "AI Access Fee", amount: 75, patient: "R***** K.", date: new Date(Date.now() - 3600000) },
  { id: "3", type: "credit", label: "Consult Fee", amount: 100, patient: "P***** M.", date: new Date(Date.now() - 7200000) },
  { id: "4", type: "debit", label: "AI Access Fee", amount: 75, patient: "P***** M.", date: new Date(Date.now() - 7200000) },
  { id: "5", type: "credit", label: "Consult Fee", amount: 100, patient: "A***** S.", date: new Date(Date.now() - 14400000) },
  { id: "6", type: "debit", label: "AI Access Fee", amount: 75, patient: "A***** S.", date: new Date(Date.now() - 14400000) },
  { id: "7", type: "credit", label: "Consult Fee", amount: 100, patient: "S***** D.", date: new Date(Date.now() - 86400000) },
  { id: "8", type: "debit", label: "AI Access Fee", amount: 75, patient: "S***** D.", date: new Date(Date.now() - 86400000) },
];

const RevenueLedger = () => {
  const [withdrawing, setWithdrawing] = useState(false);

  const totalCredits = MOCK_LEDGER.filter((e) => e.type === "credit").reduce((s, e) => s + e.amount, 0);
  const totalDebits = MOCK_LEDGER.filter((e) => e.type === "debit").reduce((s, e) => s + e.amount, 0);
  const netEarnings = totalCredits - totalDebits;
  const canWithdraw = netEarnings >= 500;

  const handleWithdraw = () => {
    if (!canWithdraw) {
      toast.error(`Minimum ₹500 required. Current balance: ₹${netEarnings}`);
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      toast.success("Withdrawal of ₹" + netEarnings + " initiated. Funds will arrive in 2-3 business days.");
    }, 1500);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-clinical-blue" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Revenue Ledger</h4>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="rounded-lg border border-scan-green/20 bg-scan-green/5 p-2 text-center">
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Credits</span>
          <p className="text-lg font-heading font-bold text-scan-green">₹{totalCredits}</p>
        </div>
        <div className="rounded-lg border border-urgency-red/20 bg-urgency-red/5 p-2 text-center">
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Debits</span>
          <p className="text-lg font-heading font-bold text-urgency-red">₹{totalDebits}</p>
        </div>
        <div className="rounded-lg border border-clinical-blue/20 bg-clinical-blue/5 p-2 text-center">
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Net</span>
          <p className="text-lg font-heading font-bold text-clinical-blue">₹{netEarnings}</p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="max-h-48 overflow-y-auto px-3 space-y-1">
        {MOCK_LEDGER.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 text-[10px]"
          >
            <div className="flex items-center gap-2">
              {entry.type === "credit" ? (
                <ArrowUpRight className="w-3 h-3 text-scan-green" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-urgency-red" />
              )}
              <div>
                <span className="font-medium text-foreground">{entry.label}</span>
                <span className="text-muted-foreground ml-1.5">{entry.patient}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${entry.type === "credit" ? "text-scan-green" : "text-urgency-red"}`}>
                {entry.type === "credit" ? "+" : "−"}₹{entry.amount}
              </span>
              <span className="text-muted-foreground/60">{entry.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Withdraw */}
      <div className="p-3 border-t border-border">
        <Button
          onClick={handleWithdraw}
          disabled={!canWithdraw || withdrawing}
          className="w-full gap-2"
          variant={canWithdraw ? "default" : "secondary"}
        >
          <Banknote className="w-4 h-4" />
          {canWithdraw
            ? `Withdraw ₹${netEarnings} to Bank`
            : `₹${500 - netEarnings} more to reach ₹500 threshold`}
        </Button>
        <p className="text-[8px] text-muted-foreground text-center mt-1.5">
          <TrendingUp className="w-2.5 h-2.5 inline" /> Batch transfers processed daily · UPI + Bank supported
        </p>
      </div>
    </div>
  );
};

export default RevenueLedger;
