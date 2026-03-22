import { type LesionDay, statusConfig } from "./types";

interface DayTimelineProps {
  data: LesionDay[];
  loggedDays: LesionDay[];
  selectedDay: number;
  onSelectDay: (index: number) => void;
}

const DayTimeline = ({ data, loggedDays, selectedDay, onSelectDay }: DayTimelineProps) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide" role="tablist" aria-label="Lesion timeline days">
      <div className="flex gap-1.5 justify-center min-w-fit px-2 py-1">
        {data.map((d) => {
          const loggedIndex = loggedDays.findIndex((ld) => ld.day === d.day);
          const isLogged = d.logged;
          const isSelected = isLogged && loggedDays[selectedDay]?.day === d.day;
          const config = statusConfig[d.status];

          return (
            <button
              key={d.day}
              onClick={() => isLogged && loggedIndex >= 0 && onSelectDay(loggedIndex)}
              disabled={!isLogged}
              role="tab"
              aria-selected={isSelected}
              aria-label={`Day ${d.day}${isLogged ? `, ${d.sizeMm}mm, ${config.label}` : ", not yet logged"}`}
              className={`
                relative w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-mono font-semibold
                transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${isSelected
                  ? "ring-2 ring-clinical-blue bg-clinical-blue text-card scale-110 shadow-md"
                  : ""
                }
                ${isLogged && !isSelected
                  ? `${config.bg} ${config.text} hover:scale-110 cursor-pointer`
                  : ""
                }
                ${!isLogged
                  ? "bg-muted text-muted-foreground/30 cursor-default"
                  : ""
                }
              `}
            >
              {d.day}
              {/* Status dot for logged non-selected days */}
              {isLogged && !isSelected && (
                <span className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${
                  d.status === "growing" ? "bg-urgency-red" :
                  d.status === "shrinking" ? "bg-scan-green" : "bg-urgency-amber"
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DayTimeline;
