export type LesionStatus = "shrinking" | "unchanged" | "growing";

export interface LesionDay {
  day: number;
  sizeMm: number;
  sizeDelta: string;
  status: LesionStatus;
  colorScore: number; // 0-100 redness index
  logged: boolean;
}

export const statusConfig = {
  shrinking: {
    bg: "bg-scan-green/10",
    text: "text-scan-green",
    border: "border-scan-green/30",
    label: "Healing",
    icon: "↓",
  },
  unchanged: {
    bg: "bg-urgency-amber/10",
    text: "text-urgency-amber",
    border: "border-urgency-amber/30",
    label: "No Change",
    icon: "●",
  },
  growing: {
    bg: "bg-urgency-red/10",
    text: "text-urgency-red",
    border: "border-urgency-red/30",
    label: "Growing",
    icon: "↑",
  },
};

export const generateLesionData = (): LesionDay[] => {
  const baseSize = 4.5;
  const data: LesionDay[] = [];
  let currentSize = baseSize;

  for (let d = 1; d <= 14; d++) {
    const delta = d <= 10 ? Math.random() * 0.6 - 0.2 : Math.random() * 0.8 - 0.6;
    currentSize = Math.max(0.5, currentSize + delta);
    const deltaMm = currentSize - baseSize;
    const logged = d <= 11;

    data.push({
      day: d,
      sizeMm: parseFloat(currentSize.toFixed(1)),
      sizeDelta: deltaMm >= 0 ? `+${deltaMm.toFixed(1)}mm` : `${deltaMm.toFixed(1)}mm`,
      status: deltaMm > 0.3 ? "growing" : deltaMm < -0.3 ? "shrinking" : "unchanged",
      colorScore: Math.min(100, Math.max(0, 40 + deltaMm * 20 + Math.random() * 15)),
      logged,
    });
  }
  return data;
};
