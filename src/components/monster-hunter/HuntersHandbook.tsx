import { useRef } from "react";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BESTIARY, getSeasonalBestiary, getCurrentSeason, SEASONAL_SKINS } from "./types";

const HuntersHandbook = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const season = getCurrentSeason();
  const skin = SEASONAL_SKINS[season];
  const bestiary = getSeasonalBestiary(season);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Hunter's Handbook</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; background: #fff; color: #1a1a2e; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #d4a017; padding-bottom: 12px; }
            .header h1 { font-size: 22px; margin-bottom: 4px; }
            .header p { font-size: 11px; color: #666; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .monster { border: 2px solid #e5e5e5; border-radius: 12px; padding: 12px; page-break-inside: avoid; }
            .monster-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
            .monster-emoji { font-size: 28px; }
            .monster-name { font-size: 14px; font-weight: 800; }
            .monster-habitat { font-size: 10px; color: #888; }
            .detail { font-size: 11px; margin-top: 4px; color: #333; }
            .detail strong { color: #d4a017; }
            .loot { font-size: 10px; color: #666; margin-top: 4px; }
            .rules { margin-top: 20px; border-top: 2px solid #e5e5e5; padding-top: 12px; }
            .rules h2 { font-size: 14px; margin-bottom: 8px; }
            .rule { font-size: 11px; margin-bottom: 6px; padding-left: 16px; position: relative; }
            .rule::before { content: "⚔️"; position: absolute; left: 0; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #aaa; border-top: 1px solid #eee; padding-top: 8px; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚔️ HUNTER'S HANDBOOK ⚔️</h1>
            <p>${season !== "default" ? `${skin.themeEmoji} ${skin.label} Edition` : "Plaque Edition"} — Monster Weak Points Field Guide</p>
          </div>
          <div class="grid">
            ${bestiary.map((m) => `
              <div class="monster">
                <div class="monster-header">
                  <span class="monster-emoji">${m.emoji}</span>
                  <div>
                    <div class="monster-name">${m.name}</div>
                    <div class="monster-habitat">📍 ${m.habitatDetail}</div>
                  </div>
                </div>
                <div class="detail">⚔️ Weakness: <strong>${m.weakness}</strong></div>
                <div class="detail">${m.weaknessTechnique}</div>
                <div class="loot">🎁 Loot: ${m.lootEmoji} ${m.loot}</div>
              </div>
            `).join("")}
          </div>
          <div class="rules">
            <h2>📋 Rules of Engagement</h2>
            <div class="rule">No Button Mashing — Use steady, circular strikes. Too hard damages your Armor (gums)!</div>
            <div class="rule">The Two-Minute Siege — No retreat until the timer hits zero.</div>
            <div class="rule">The Victory Proof — Show the "Quest Complete" screen to the Guild Master.</div>
            <div class="rule">Check Your Lighting — Full bathroom lights so the Scouter can lock targets.</div>
            <div class="rule">Maintain the Stance — Hold device at eye level, keep head still.</div>
          </div>
          <div class="footer">Monster Hunter: Plaque Edition — Tape this to your bathroom mirror! 🪞</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          📖 Hunter's Handbook
        </h4>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
          <Printer className="w-3.5 h-3.5" />
          Print
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        A printable one-page reference to tape on the bathroom mirror. Shows all monster weak points!
      </p>

      {/* Preview */}
      <div ref={printRef} className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="text-center space-y-1 border-b border-border pb-3">
          <p className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
            ⚔️ Monster Weak Points ⚔️
          </p>
          <p className="text-[9px] text-muted-foreground">
            {season !== "default" ? `${skin.themeEmoji} ${skin.label} Edition` : "Plaque Edition"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {bestiary.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{m.emoji}</span>
                <div>
                  <p className="text-[10px] font-bold text-foreground leading-tight">{m.name}</p>
                  <p className="text-[8px] text-muted-foreground">📍 {m.habitat}</p>
                </div>
              </div>
              <p className="text-[9px] text-plaque-gold font-bold">⚔️ {m.weakness}</p>
              <p className="text-[8px] text-muted-foreground">{m.weaknessTechnique}</p>
              <p className="text-[8px] text-muted-foreground">{m.lootEmoji} {m.loot}</p>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-border pt-2 space-y-1">
          <p className="text-[9px] font-bold text-foreground">📋 Quick Rules</p>
          {["Steady circular strikes — no mashing!", "Full 2-minute siege", "Show Victory Screen to Guild Master"].map((r) => (
            <p key={r} className="text-[8px] text-muted-foreground">⚔️ {r}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HuntersHandbook;
