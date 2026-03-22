import { motion } from "framer-motion";

interface CircularCountdownProps {
  currentDay: number;
  totalDays: number;
}

const CircularCountdown = ({ currentDay, totalDays }: CircularCountdownProps) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = currentDay / totalDays;
  const strokeDashoffset = circumference * (1 - progress);

  const isLate = currentDay >= 11;

  return (
    <div className="relative flex items-center justify-center" role="progressbar" aria-valuenow={currentDay} aria-valuemin={1} aria-valuemax={totalDays} aria-label={`Day ${currentDay} of ${totalDays}`}>
      <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
        {/* Track */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="5"
        />
        {/* Progress */}
        <motion.circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={isLate ? "hsl(var(--urgency-red))" : "hsl(var(--clinical-blue))"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={currentDay}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-2xl font-heading font-bold ${isLate ? "text-urgency-red" : "text-foreground"}`}
        >
          {currentDay}
        </motion.span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">of {totalDays}</span>
      </div>
    </div>
  );
};

export default CircularCountdown;
