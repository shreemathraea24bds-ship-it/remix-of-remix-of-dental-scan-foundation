import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scan, CalendarClock } from "lucide-react";

export interface OnboardingCard {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  illustration: React.ReactNode;
}

const cardData: OnboardingCard[] = [
  {
    title: "Your Pocket Dentist",
    subtitle: "Detect cavities, plaque build-up, and oral lesions early — before they become emergencies.",
    icon: <ShieldCheck className="w-5 h-5" />,
    illustration: (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        <defs>
          <linearGradient id="tooth-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--clinical-blue))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--clinical-blue))" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <rect x="50" y="20" width="100" height="120" rx="20" fill="url(#tooth-grad)" stroke="hsl(var(--clinical-blue))" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M80 55 Q100 40 120 55 Q125 75 115 95 Q105 110 100 120 Q95 110 85 95 Q75 75 80 55Z" fill="hsl(var(--clinical-blue))" fillOpacity="0.12" stroke="hsl(var(--clinical-blue))" strokeWidth="1.5" />
        <circle cx="100" cy="75" r="8" fill="none" stroke="hsl(var(--scan-green))" strokeWidth="1.5" strokeDasharray="3 2">
          <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="2s" repeatCount="indefinite" additive="sum" />
        </circle>
        <circle cx="100" cy="75" r="3" fill="hsl(var(--scan-green))" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Precision",
    subtitle: "Our plaque heatmap highlights problem areas invisible to the naked eye — like a thermal scan for your teeth.",
    icon: <Scan className="w-5 h-5" />,
    illustration: (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        <defs>
          <radialGradient id="heat1" cx="40%" cy="35%">
            <stop offset="0%" stopColor="hsl(var(--urgency-red))" stopOpacity="0.5" />
            <stop offset="60%" stopColor="hsl(var(--monitor-amber))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--scan-green))" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="heat2" cx="65%" cy="60%">
            <stop offset="0%" stopColor="hsl(var(--monitor-amber))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x="30" y="10" width="140" height="140" rx="16" fill="hsl(var(--muted))" fillOpacity="0.3" stroke="hsl(var(--border))" strokeWidth="1" />
        <rect x="40" y="20" width="120" height="120" rx="12" fill="hsl(var(--card))" />
        <circle cx="85" cy="65" r="35" fill="url(#heat1)" />
        <circle cx="120" cy="90" r="25" fill="url(#heat2)" />
        <line x1="40" y1="80" x2="160" y2="80" stroke="hsl(var(--clinical-blue))" strokeWidth="1" strokeOpacity="0.3">
          <animate attributeName="y1" values="30;130;30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" values="30;130;30" dur="3s" repeatCount="indefinite" />
        </line>
      </svg>
    ),
  },
  {
    title: "Life-Saving Tracking",
    subtitle: "Track oral lesions over 14 days. If something doesn't heal, our AI flags it for urgent dental review.",
    icon: <CalendarClock className="w-5 h-5" />,
    illustration: (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        {Array.from({ length: 14 }, (_, i) => {
          const col = i % 7;
          const row = Math.floor(i / 7);
          const x = 30 + col * 22;
          const y = 30 + row * 50;
          const filled = i < 11;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width="18"
                height="18"
                rx="4"
                fill={filled ? (i >= 9 ? "hsl(var(--urgency-red))" : "hsl(var(--scan-green))") : "hsl(var(--muted))"}
                fillOpacity={filled ? 0.2 : 0.3}
                stroke={filled ? (i >= 9 ? "hsl(var(--urgency-red))" : "hsl(var(--scan-green))") : "hsl(var(--border))"}
                strokeWidth="1"
              />
              <text x={x + 9} y={y + 13} textAnchor="middle" fontSize="8" fill="hsl(var(--foreground))" fillOpacity={filled ? 0.7 : 0.3}>
                {i + 1}
              </text>
            </g>
          );
        })}
        <text x="100" y="145" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">14-Day Protocol</text>
      </svg>
    ),
  },
];

interface WelcomeCardsProps {
  currentStep: number;
}

const WelcomeCards = React.forwardRef<HTMLDivElement, WelcomeCardsProps>(({ currentStep }, ref) => {
  const card = cardData[currentStep];
  if (!card) return null;

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center text-center px-6 space-y-6"
    >
      {/* Illustration */}
      <div className="w-48 h-40">
        {card.illustration}
      </div>

      {/* Text */}
      <div className="space-y-2 max-w-xs">
        <div className="flex items-center justify-center gap-2 text-clinical-blue">
          {card.icon}
          <h2 className="font-heading font-bold text-xl text-foreground">{card.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{card.subtitle}</p>
      </div>
    </motion.div>
  );
});

WelcomeCards.displayName = "WelcomeCards";

export { cardData };
export default WelcomeCards;
