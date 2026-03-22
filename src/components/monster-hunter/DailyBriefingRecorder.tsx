import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDailyBriefing, getDailyBriefing, deleteDailyBriefing, playDailyBriefing } from "./voiceLines";

const MAX_DURATION = 15; // seconds — longer than battle cry

const DailyBriefingRecorder = () => {
  const [hasRecording, setHasRecording] = useState(() => !!getDailyBriefing());
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await saveDailyBriefing(blob);
        setHasRecording(true);
        setIsRecording(false);
        setElapsed(0);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= MAX_DURATION - 1) {
            mediaRecorderRef.current?.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            return MAX_DURATION;
          }
          return e + 1;
        });
      }, 1000);
    } catch {
      // Microphone permission denied
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    await playDailyBriefing();
    setIsPlaying(false);
  };

  const handleDelete = () => {
    deleteDailyBriefing();
    setHasRecording(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-primary" />
        <h5 className="font-heading font-bold text-xs text-foreground">Daily Mission Briefing</h5>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Record a 15-second daily briefing that auto-plays when your Hunter opens the app. 
        Give them their mission orders, encourage them, or warn them about what monsters await!
      </p>

      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-3"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center"
            >
              <div className="w-3 h-3 rounded-full bg-destructive" />
            </motion.div>
            <div className="flex-1">
              <p className="text-xs font-bold text-destructive">Recording Briefing...</p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground">{elapsed}s / {MAX_DURATION}s</p>
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-destructive/60 rounded-full"
                    style={{ width: `${(elapsed / MAX_DURATION) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <Button size="icon" variant="outline" className="h-8 w-8 border-destructive/30" onClick={stopRecording}>
              <Square className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </motion.div>
        ) : hasRecording ? (
          <motion.div
            key="recorded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary">Daily Briefing Set!</p>
              <p className="text-[10px] text-muted-foreground">Auto-plays once per day when Hunter opens the app</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handlePlay}
                disabled={isPlaying}
              >
                <Play className={`w-3.5 h-3.5 ${isPlaying ? "text-primary" : "text-muted-foreground"}`} />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleDelete}>
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              variant="outline"
              className="w-full gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5 haptic-button"
              onClick={startRecording}
            >
              <Mic className="w-4 h-4" />
              Record Daily Briefing (15 sec max)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">💡 Briefing Ideas</p>
        <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
          <li>"Good morning Hunter! The Sugar-Saurs are back — show them no mercy!"</li>
          <li>"Tonight's mission: clear all Gum-line Grime-lins before bed. I'm counting on you!"</li>
          <li>"Remember: circular motions on the molars. The Guild Master is watching!"</li>
        </ul>
      </div>
    </div>
  );
};

export default DailyBriefingRecorder;
