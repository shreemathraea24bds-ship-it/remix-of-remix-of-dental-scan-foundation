import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { LesionDay, LesionStatus } from "@/components/lesion-tracker/types";
import { toast } from "sonner";

export interface LesionSession {
  lesionId: string;
  entries: LesionDay[];
  isLoading: boolean;
  isDemo: boolean;
  addEntry: (sizeMm: number, colorScore: number, notes?: string) => Promise<void>;
}

export const useLesionTracker = (lesionId?: string): LesionSession => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LesionDay[]>([]);
  const [currentLesionId, setCurrentLesionId] = useState(lesionId || "");
  const [isLoading, setIsLoading] = useState(false);
  const isDemo = !user;

  // Load entries from DB
  useEffect(() => {
    if (isDemo) return;

    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("lesion_entries")
          .select("*")
          .eq("patient_id", user!.id)
          .order("entry_day", { ascending: true });

        if (currentLesionId) {
          query = query.eq("lesion_id", currentLesionId);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          if (!currentLesionId) {
            setCurrentLesionId(data[0].lesion_id);
          }

          const mapped: LesionDay[] = [];
          for (let d = 1; d <= 14; d++) {
            const entry = data.find((e) => e.entry_day === d);
            if (entry) {
              mapped.push({
                day: d,
                sizeMm: entry.size_mm,
                sizeDelta: entry.size_delta || "+0.0mm",
                status: (entry.status as LesionStatus) || "unchanged",
                colorScore: entry.color_score || 50,
                logged: true,
              });
            } else {
              mapped.push({
                day: d,
                sizeMm: 0,
                sizeDelta: "+0.0mm",
                status: "unchanged",
                colorScore: 0,
                logged: false,
              });
            }
          }
          setEntries(mapped);
        } else {
          // No entries yet — show empty 14-day grid
          setEntries(
            Array.from({ length: 14 }, (_, i) => ({
              day: i + 1,
              sizeMm: 0,
              sizeDelta: "+0.0mm",
              status: "unchanged" as LesionStatus,
              colorScore: 0,
              logged: false,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load lesion data:", err);
        toast.error("Failed to load lesion data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [user, currentLesionId, isDemo]);

  const addEntry = useCallback(
    async (sizeMm: number, colorScore: number, notes?: string) => {
      if (!user) {
        toast.error("Sign in to track lesions");
        return;
      }

      const loggedDays = entries.filter((e) => e.logged);
      const nextDay = loggedDays.length + 1;
      if (nextDay > 14) {
        toast.error("14-day protocol complete");
        return;
      }

      const baseSize = loggedDays.length > 0 ? loggedDays[0].sizeMm : sizeMm;
      const deltaMm = sizeMm - baseSize;
      const status: LesionStatus =
        deltaMm > 0.3 ? "growing" : deltaMm < -0.3 ? "shrinking" : "unchanged";
      const sizeDelta = deltaMm >= 0 ? `+${deltaMm.toFixed(1)}mm` : `${deltaMm.toFixed(1)}mm`;

      // Check flagging (10+ days unchanged/growing)
      const streak = (() => {
        let s = 0;
        for (let i = loggedDays.length - 1; i >= 0; i--) {
          if (loggedDays[i].status === "unchanged" || loggedDays[i].status === "growing") s++;
          else break;
        }
        if (status === "unchanged" || status === "growing") s++;
        return s;
      })();
      const isFlagged = streak >= 10;

      const lid = currentLesionId || crypto.randomUUID();
      if (!currentLesionId) setCurrentLesionId(lid);

      try {
        const { error } = await supabase.from("lesion_entries").insert({
          patient_id: user.id,
          lesion_id: lid,
          entry_day: nextDay,
          size_mm: sizeMm,
          size_delta: sizeDelta,
          status,
          color_score: colorScore,
          is_flagged: isFlagged,
          notes: notes || null,
        });

        if (error) throw error;

        setEntries((prev) =>
          prev.map((e) =>
            e.day === nextDay
              ? { ...e, sizeMm, sizeDelta, status, colorScore, logged: true }
              : e
          )
        );

        toast.success(`Day ${nextDay} logged!`);
        if (isFlagged) {
          toast.warning("⚠️ Biopsy referral recommended — lesion persists 10+ days");
        }
      } catch (err) {
        console.error("Failed to save entry:", err);
        toast.error("Failed to save entry");
      }
    },
    [user, entries, currentLesionId]
  );

  return { lesionId: currentLesionId, entries, isLoading, isDemo, addEntry };
};
