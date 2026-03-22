import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CircularCountdown from "./lesion-tracker/CircularCountdown";
import LesionGalleryCard from "./lesion-tracker/LesionGalleryCard";
import BiopsyAlert from "./lesion-tracker/BiopsyAlert";
import DayTimeline from "./lesion-tracker/DayTimeline";
import { generateLesionData, type LesionDay } from "./lesion-tracker/types";
import { useLesionTracker } from "@/hooks/useLesionTracker";
import { Skeleton } from "@/components/ui/skeleton";

const LesionGrowthTracker = () => {
  const { entries, isLoading, isDemo, addEntry } = useLesionTracker();
  const [demoData] = useState(generateLesionData);
  const [selectedDay, setSelectedDay] = useState(0);
  const [direction, setDirection] = useState(1);

  // Use DB data when authenticated, demo data otherwise
  const data: LesionDay[] = isDemo ? demoData : entries;
  const loggedDays = data.filter((d) => d.logged);
  const current = loggedDays[selectedDay] || loggedDays[0];

  const unchangedStreak = (() => {
    let streak = 0;
    for (let i = loggedDays.length - 1; i >= 0; i--) {
      if (loggedDays[i].status === "unchanged" || loggedDays[i].status === "growing") streak++;
      else break;
    }
    return streak;
  })();

  const showBiopsyAlert = unchangedStreak >= 10;

  const navigate = useCallback((dir: -1 | 1) => {
    setDirection(dir);
    setSelectedDay((p) => Math.max(0, Math.min(loggedDays.length - 1, p + dir)));
  }, [loggedDays.length]);

  const selectDay = useCallback((index: number) => {
    setDirection(index > selectedDay ? 1 : -1);
    setSelectedDay(index);
  }, [selectedDay]);

  const handleLogDay = async () => {
    // Simulate a measurement for demo — in production this would come from AI analysis
    const prevSize = loggedDays.length > 0 ? loggedDays[loggedDays.length - 1].sizeMm : 4.5;
    const newSize = parseFloat((prevSize + (Math.random() * 0.6 - 0.2)).toFixed(1));
    const colorScore = Math.min(100, Math.max(0, 40 + Math.random() * 30));
    await addEntry(newSize, colorScore);
    // Select the newly logged day
    setSelectedDay(loggedDays.length);
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="w-full text-center py-8 space-y-3">
        <p className="text-sm text-muted-foreground">No lesion entries yet.</p>
        {!isDemo && (
          <Button variant="clinical" className="gap-1.5 haptic-button" onClick={handleLogDay}>
            <ImagePlus className="w-4 h-4" />
            Start Day 1
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header + Circular Countdown */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-sm text-foreground">
            Oral Lesion Tracker
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {loggedDays.length} of 14 days logged
            {isDemo && <span className="ml-1 text-urgency-amber">(Demo)</span>}
          </p>
        </div>
        <CircularCountdown currentDay={current.day} totalDays={14} />
      </div>

      {/* Biopsy Alert */}
      <AnimatePresence>
        {showBiopsyAlert && <BiopsyAlert streakDays={unchangedStreak} />}
      </AnimatePresence>

      {/* Swipe Gallery */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full flex-shrink-0 haptic-button"
            disabled={selectedDay === 0}
            onClick={() => navigate(-1)}
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <LesionGalleryCard key={current.day} entry={current} direction={direction} />
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full flex-shrink-0 haptic-button"
            disabled={selectedDay >= loggedDays.length - 1}
            onClick={() => navigate(1)}
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Day Timeline */}
      <DayTimeline
        data={data}
        loggedDays={loggedDays}
        selectedDay={selectedDay}
        onSelectDay={selectDay}
      />

      {/* Upload prompt */}
      {loggedDays.length < 14 && (
        <div className="flex items-center justify-center pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs haptic-button"
            onClick={isDemo ? undefined : handleLogDay}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            {isDemo ? `Log Day ${loggedDays.length + 1} Photo` : `Log Day ${loggedDays.length + 1}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LesionGrowthTracker;
