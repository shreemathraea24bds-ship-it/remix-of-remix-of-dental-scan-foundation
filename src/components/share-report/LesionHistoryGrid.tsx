const mockLesionHistory = [
  { day: 1, sizeMm: 3.2, colorShift: "None", logged: true },
  { day: 4, sizeMm: 3.4, colorShift: "+0.1 ΔE", logged: true },
  { day: 7, sizeMm: 3.5, colorShift: "+0.3 ΔE", logged: true },
  { day: 10, sizeMm: 3.3, colorShift: "+0.2 ΔE", logged: true },
  { day: 14, sizeMm: 3.1, colorShift: "-0.1 ΔE", logged: true },
];

const LesionHistoryGrid = () => (
  <div className="p-5 border-b border-border space-y-3">
    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Section B+ — 14-Day Lesion History
    </h5>
    <div className="grid grid-cols-5 gap-2">
      {mockLesionHistory.map((entry) => (
        <div key={entry.day} className="rounded-lg border border-border overflow-hidden">
          <div className="aspect-square bg-muted/40 flex items-center justify-center">
            <span className="text-[9px] text-muted-foreground font-mono">D{entry.day}</span>
          </div>
          <div className="p-1.5 space-y-0.5">
            <p className="text-[8px] text-foreground font-semibold">{entry.sizeMm}mm</p>
            <p className="text-[7px] text-muted-foreground">{entry.colorShift}</p>
          </div>
        </div>
      ))}
    </div>
    <p className="text-[9px] text-muted-foreground italic">
      Chronological snapshots with size and color delta annotations.
    </p>
  </div>
);

export default LesionHistoryGrid;
