import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ArrowLeftRight, Trash2, Calendar, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface TongueRecord {
  id: string;
  image_url: string | null;
  estimated_ph: number;
  ph_range: string;
  confidence: number;
  tongue_defects: any[];
  diseases: any[];
  vitamin_deficiencies: any[];
  summary: string;
  created_at: string;
}

const phRangeColors: Record<string, string> = {
  critical: "text-urgency-red",
  acidic: "text-urgency-amber",
  neutral: "text-scan-green",
  alkaline: "text-clinical-blue",
};

const TongueComparison = () => {
  const [records, setRecords] = useState<TongueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPair, setSelectedPair] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("tongue_analyses")
      .select("id, image_url, estimated_ph, ph_range, confidence, tongue_defects, diseases, vitamin_deficiencies, summary, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) setRecords(data as TongueRecord[]);
    setLoading(false);
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("tongue_analyses").delete().eq("id", id);
    if (!error) {
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success("Record deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  const getPhTrend = () => {
    if (records.length < 2) return null;
    const latest = records[0].estimated_ph;
    const prev = records[1].estimated_ph;
    const diff = latest - prev;
    if (Math.abs(diff) < 0.2) return { icon: <Minus className="w-3.5 h-3.5" />, label: "Stable", color: "text-muted-foreground" };
    if (diff > 0) return { icon: <TrendingUp className="w-3.5 h-3.5" />, label: `+${diff.toFixed(1)} pH`, color: "text-scan-green" };
    return { icon: <TrendingDown className="w-3.5 h-3.5" />, label: `${diff.toFixed(1)} pH`, color: "text-urgency-red" };
  };

  if (loading) return null;
  if (records.length === 0) return null;

  const trend = getPhTrend();
  const a = records[selectedPair[0]];
  const b = records[selectedPair[1]] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-clinical-blue/10 flex items-center justify-center">
            <History className="w-4 h-4 text-clinical-blue" />
          </div>
          <div>
            <h4 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
              Tongue History
            </h4>
            <p className="text-[10px] text-muted-foreground">{records.length} scans · Track changes over time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <Badge variant="outline" className={`text-[9px] gap-1 ${trend.color}`}>
              {trend.icon} {trend.label}
            </Badge>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Compare toggle */}
              {records.length >= 2 && (
                <Button
                  variant={compareMode ? "default" : "outline"}
                  size="sm"
                  className="w-full gap-2 text-[11px]"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {compareMode ? "Exit Compare Mode" : "Compare Before & After"}
                </Button>
              )}

              {/* Compare View */}
              {compareMode && a && b ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground">
                    <span>Select scans to compare by tapping the timeline below</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase text-center">Before</p>
                      {b.image_url ? (
                        <img src={b.image_url} alt="Before" className="w-full aspect-square object-cover rounded-xl border border-border" />
                      ) : (
                        <div className="w-full aspect-square rounded-xl border border-border bg-muted flex items-center justify-center text-[11px] text-muted-foreground">No photo</div>
                      )}
                      <div className="text-center">
                        <p className={`font-heading font-bold text-lg ${phRangeColors[b.ph_range] || "text-foreground"}`}>{b.estimated_ph.toFixed(1)}</p>
                        <p className="text-[9px] text-muted-foreground">{format(new Date(b.created_at), "MMM d, yyyy")}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{(b.tongue_defects?.length || 0)} defects</p>
                      </div>
                    </div>
                    {/* After */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase text-center">After</p>
                      {a.image_url ? (
                        <img src={a.image_url} alt="After" className="w-full aspect-square object-cover rounded-xl border border-border" />
                      ) : (
                        <div className="w-full aspect-square rounded-xl border border-border bg-muted flex items-center justify-center text-[11px] text-muted-foreground">No photo</div>
                      )}
                      <div className="text-center">
                        <p className={`font-heading font-bold text-lg ${phRangeColors[a.ph_range] || "text-foreground"}`}>{a.estimated_ph.toFixed(1)}</p>
                        <p className="text-[9px] text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{(a.tongue_defects?.length || 0)} defects</p>
                      </div>
                    </div>
                  </div>

                  {/* pH change indicator */}
                  <div className="rounded-xl bg-muted/50 border border-border p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">pH Change</p>
                    <p className={`font-heading font-bold text-xl ${
                      a.estimated_ph > b.estimated_ph ? "text-scan-green" : a.estimated_ph < b.estimated_ph ? "text-urgency-red" : "text-muted-foreground"
                    }`}>
                      {a.estimated_ph > b.estimated_ph ? "+" : ""}{(a.estimated_ph - b.estimated_ph).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Defects: {(b.tongue_defects?.length || 0)} → {(a.tongue_defects?.length || 0)}
                      {(a.tongue_defects?.length || 0) < (b.tongue_defects?.length || 0) ? " ✅ Improved" : (a.tongue_defects?.length || 0) > (b.tongue_defects?.length || 0) ? " ⚠️ Worsened" : " — Same"}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Scan Timeline</p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {records.map((rec, i) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                        compareMode && (selectedPair[0] === i || selectedPair[1] === i)
                          ? "bg-clinical-blue/10 border border-clinical-blue/20"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        if (compareMode) {
                          setSelectedPair(prev => prev[0] === i ? [prev[1], i] : [i, prev[0]]);
                        }
                      }}
                    >
                      {rec.image_url ? (
                        <img src={rec.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-semibold ${phRangeColors[rec.ph_range] || "text-foreground"}`}>
                            pH {rec.estimated_ph.toFixed(1)}
                          </span>
                          <span className="text-[9px] text-muted-foreground capitalize">{rec.ph_range}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(rec.created_at), "MMM d, yyyy · h:mm a")}
                        </div>
                        {rec.tongue_defects && rec.tongue_defects.length > 0 && (
                          <p className="text-[9px] text-urgency-amber truncate">
                            {rec.tongue_defects.length} defect{rec.tongue_defects.length > 1 ? "s" : ""}: {rec.tongue_defects.map((d: any) => d.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 shrink-0"
                        onClick={(e) => { e.stopPropagation(); deleteRecord(rec.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TongueComparison;
