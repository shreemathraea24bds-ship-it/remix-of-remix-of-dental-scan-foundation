import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownRight, Banknote, TrendingUp, IndianRupee, Users, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const LEDGER_ENTRIES: LedgerEntry[] = [
  { id: "1", type: "credit", label: "Consult Fee", amount: 500, patient: "R***** K.", date: new Date(Date.now() - 3600000) },
  { id: "2", type: "debit", label: "AI Access Fee", amount: 75, patient: "R***** K.", date: new Date(Date.now() - 3600000) },
  { id: "3", type: "credit", label: "Consult Fee", amount: 500, patient: "P***** M.", date: new Date(Date.now() - 7200000) },
  { id: "4", type: "debit", label: "AI Access Fee", amount: 75, patient: "P***** M.", date: new Date(Date.now() - 7200000) },
  { id: "5", type: "credit", label: "Consult Fee", amount: 500, patient: "A***** S.", date: new Date(Date.now() - 14400000) },
  { id: "6", type: "debit", label: "AI Access Fee", amount: 75, patient: "A***** S.", date: new Date(Date.now() - 14400000) },
  { id: "7", type: "credit", label: "Consult Fee", amount: 500, patient: "S***** D.", date: new Date(Date.now() - 86400000) },
  { id: "8", type: "debit", label: "AI Access Fee", amount: 75, patient: "S***** D.", date: new Date(Date.now() - 86400000) },
  { id: "9", type: "credit", label: "Consult Fee", amount: 500, patient: "M***** R.", date: new Date(Date.now() - 172800000) },
  { id: "10", type: "debit", label: "AI Access Fee", amount: 75, patient: "M***** R.", date: new Date(Date.now() - 172800000) },
  { id: "11", type: "credit", label: "Pro Subscription", amount: 200, patient: "K***** V.", date: new Date(Date.now() - 259200000) },
  { id: "12", type: "credit", label: "Consult Fee", amount: 500, patient: "N***** P.", date: new Date(Date.now() - 345600000) },
  { id: "13", type: "debit", label: "AI Access Fee", amount: 75, patient: "N***** P.", date: new Date(Date.now() - 345600000) },
  { id: "14", type: "credit", label: "Pro Subscription", amount: 200, patient: "G***** L.", date: new Date(Date.now() - 432000000) },
  { id: "15", type: "credit", label: "Consult Fee", amount: 500, patient: "T***** B.", date: new Date(Date.now() - 518400000) },
  { id: "16", type: "debit", label: "AI Access Fee", amount: 75, patient: "T***** B.", date: new Date(Date.now() - 518400000) },
  { id: "17", type: "credit", label: "Pro Subscription", amount: 200, patient: "H***** J.", date: new Date(Date.now() - 604800000) },
  { id: "18", type: "credit", label: "Consult Fee", amount: 500, patient: "V***** C.", date: new Date(Date.now() - 691200000) },
  { id: "19", type: "debit", label: "Platform Fee", amount: 82, patient: "System", date: new Date(Date.now() - 691200000) },
  { id: "20", type: "credit", label: "Consult Fee", amount: 500, patient: "D***** W.", date: new Date(Date.now() - 777600000) },
  { id: "21", type: "debit", label: "AI Access Fee", amount: 75, patient: "D***** W.", date: new Date(Date.now() - 777600000) },
];

const TOTAL_REVENUE = 6018;

const Revenue = () => {
  const [withdrawing, setWithdrawing] = useState(false);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const totalCredits = LEDGER_ENTRIES.filter((e) => e.type === "credit").reduce((s, e) => s + e.amount, 0);
  const totalDebits = LEDGER_ENTRIES.filter((e) => e.type === "debit").reduce((s, e) => s + e.amount, 0);
  const totalPatients = new Set(LEDGER_ENTRIES.filter(e => e.patient !== "System").map(e => e.patient)).size;

  const filtered = filter === "all" ? LEDGER_ENTRIES : LEDGER_ENTRIES.filter(e => e.type === filter);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      toast.success(`Withdrawal of ₹${TOTAL_REVENUE} initiated. Funds will arrive in 2-3 business days.`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
            <Link to="/dashboard"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h1 className="font-heading font-bold text-foreground">Revenue Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-6 text-primary-foreground"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/5 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-8 -translate-x-8" />
          <p className="text-sm opacity-80 mb-1">Total Revenue Collected</p>
          <div className="flex items-baseline gap-1">
            <IndianRupee className="w-8 h-8" />
            <span className="text-5xl font-heading font-bold tracking-tight">{TOTAL_REVENUE.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-xs opacity-60 mt-2">Updated just now</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Credits", value: `₹${totalCredits.toLocaleString("en-IN")}`, icon: ArrowUpRight, color: "text-scan-green" },
            { label: "Debits", value: `₹${totalDebits.toLocaleString("en-IN")}`, icon: ArrowDownRight, color: "text-urgency-red" },
            { label: "Patients", value: totalPatients.toString(), icon: Users, color: "text-clinical-blue" },
            { label: "This Month", value: `₹${TOTAL_REVENUE.toLocaleString("en-IN")}`, icon: Calendar, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-heading font-bold text-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter + Withdraw */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(["all", "credit", "debit"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="text-xs capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
          <Button onClick={handleWithdraw} disabled={withdrawing} className="gap-2">
            <Banknote className="w-4 h-4" />
            {withdrawing ? "Processing..." : `Withdraw ₹${TOTAL_REVENUE}`}
          </Button>
        </div>

        {/* Transaction List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${entry.type === "credit" ? "bg-scan-green/10" : "bg-urgency-red/10"}`}>
                      {entry.type === "credit" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-scan-green" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-urgency-red" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.label}</p>
                      <p className="text-xs text-muted-foreground">{entry.patient}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${entry.type === "credit" ? "text-scan-green" : "text-urgency-red"}`}>
                      {entry.type === "credit" ? "+" : "−"}₹{entry.amount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center pb-4">
          <Download className="w-3 h-3 inline mr-1" />
          Batch transfers processed daily · UPI + Bank supported
        </p>
      </div>
    </div>
  );
};

export default Revenue;
