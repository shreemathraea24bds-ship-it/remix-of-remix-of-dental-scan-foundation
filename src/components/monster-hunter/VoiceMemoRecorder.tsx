import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveVoiceMemo, getVoiceMemo, deleteVoiceMemo, playVoiceMemo } from "./voiceLines";

const MAX_DURATION = 5; // seconds

const VoiceMemoRecorder = () => {
  const [hasRecording, setHasRecording] = useState(() => !!getVoiceMemo());
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
        await saveVoiceMemo(blob);
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
    await playVoiceMemo();
    setIsPlaying(false);
  };

  const handleDelete = () => {
    deleteVoiceMemo();
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
        <Volume2 className="w-4 h-4 text-plaque-gold" />
        <h5 className="font-heading font-bold text-xs text-foreground">Guild Master's Battle Cry</h5>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Record a 5-second "Battle Cry" that plays as a Special Support Ability during the final 30 seconds of battle.
      </p>

      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-urgency-red/5 border border-urgency-red/20 rounded-xl p-3"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-urgency-red/20 flex items-center justify-center"
            >
              <div className="w-3 h-3 rounded-full bg-urgency-red" />
            </motion.div>
            <div className="flex-1">
              <p className="text-xs font-bold text-urgency-red">Recording...</p>
              <p className="text-[10px] text-muted-foreground">{elapsed}s / {MAX_DURATION}s</p>
            </div>
            <Button size="icon" variant="outline" className="h-8 w-8 border-urgency-red/30" onClick={stopRecording}>
              <Square className="w-3.5 h-3.5 text-urgency-red" />
            </Button>
          </motion.div>
        ) : hasRecording ? (
          <motion.div
            key="recorded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-scan-green/5 border border-scan-green/20 rounded-xl p-3"
          >
            <div className="w-8 h-8 rounded-full bg-scan-green/20 flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-scan-green" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-scan-green">Battle Cry Ready!</p>
              <p className="text-[10px] text-muted-foreground">Plays during the final 30 seconds of battle</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handlePlay}
                disabled={isPlaying}
              >
                <Play className={`w-3.5 h-3.5 ${isPlaying ? "text-scan-green" : "text-muted-foreground"}`} />
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
              className="w-full gap-2 text-xs border-plaque-gold/20 text-plaque-gold hover:bg-plaque-gold/5 haptic-button"
              onClick={startRecording}
            >
              <Mic className="w-4 h-4" />
              Record Battle Cry (5 sec max)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceMemoRecorder;
