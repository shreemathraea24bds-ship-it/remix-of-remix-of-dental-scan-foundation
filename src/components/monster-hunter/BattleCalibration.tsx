import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Eye, Droplets, Settings2, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface BattleCalibrationProps {
  settings: BattleSettings;
  onUpdate: (settings: BattleSettings) => void;
  onResetChecklist?: () => void;
}

export interface BattleSettings {
  timeToDefeat: number;       // 5–20 seconds
  strictFormEnabled: boolean;  // requires 45° angle
  foamSensitivity: number;    // 0–100
  manualApproval: boolean;     // Guild Master must approve
}

export const DEFAULT_BATTLE_SETTINGS: BattleSettings = {
  timeToDefeat: 10,
  strictFormEnabled: false,
  foamSensitivity: 50,
  manualApproval: false,
};

const BattleCalibration = ({ settings, onUpdate, onResetChecklist }: BattleCalibrationProps) => {
  const cardBg = "hsl(var(--commander-surface))";
  const borderColor = "hsl(var(--commander-slate) / 0.3)";
  const textPrimary = "hsl(var(--commander-text))";
  const textMuted = "hsl(var(--commander-muted))";
  const accentColor = "hsl(var(--commander-accent))";

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4" style={{ color: accentColor }} />
          <h3 className="font-heading font-bold text-sm" style={{ color: textPrimary }}>Battle Calibration</h3>
        </div>
        <p className="text-[11px]" style={{ color: textMuted }}>
          Adjust difficulty based on your child's age and skill level.
        </p>
      </div>

      {/* Time-to-Defeat Slider */}
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "hsl(var(--neon-gold))" }} />
            <span className="text-xs font-bold" style={{ color: textPrimary }}>Time-to-Defeat</span>
          </div>
          <span className="text-sm font-bold font-mono px-2 py-0.5 rounded" style={{
            color: "hsl(var(--neon-gold))",
            backgroundColor: "hsl(var(--neon-gold) / 0.1)",
          }}>
            {settings.timeToDefeat}s
          </span>
        </div>
        <p className="text-[10px]" style={{ color: textMuted }}>
          How long the toothbrush must overlap a monster to defeat it. Lower = easier.
        </p>
        <Slider
          value={[settings.timeToDefeat]}
          onValueChange={([v]) => onUpdate({ ...settings, timeToDefeat: v })}
          min={5}
          max={20}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-[9px]" style={{ color: textMuted }}>
          <span>Easy (5s)</span>
          <span>Hard (20s)</span>
        </div>
      </div>

      {/* Strict Form Toggle */}
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: settings.strictFormEnabled ? "hsl(var(--neon-green))" : textMuted }} />
            <div>
              <span className="text-xs font-bold" style={{ color: textPrimary }}>Strict Form</span>
              <p className="text-[10px]" style={{ color: textMuted }}>
                Requires 45° angle detection before damage is dealt
              </p>
            </div>
          </div>
          <Switch
            checked={settings.strictFormEnabled}
            onCheckedChange={(v) => onUpdate({ ...settings, strictFormEnabled: v })}
          />
        </div>
        {settings.strictFormEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-[10px] rounded-lg p-2"
            style={{
              backgroundColor: "hsl(var(--neon-green) / 0.06)",
              border: "1px solid hsl(var(--neon-green) / 0.15)",
              color: "hsl(var(--neon-green) / 0.8)",
            }}
          >
            ✅ AI will verify brush angle before registering damage. Recommended for ages 8+.
          </motion.div>
        )}
      </div>

      {/* Foam Sensitivity Slider */}
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4" style={{ color: "hsl(var(--crystal-cyan))" }} />
            <span className="text-xs font-bold" style={{ color: textPrimary }}>Foam Density Check</span>
          </div>
          <span className="text-sm font-bold font-mono px-2 py-0.5 rounded" style={{
            color: "hsl(var(--crystal-cyan))",
            backgroundColor: "hsl(var(--crystal-cyan) / 0.1)",
          }}>
            {settings.foamSensitivity}%
          </span>
        </div>
        <p className="text-[10px]" style={{ color: textMuted }}>
          Sensitivity for detecting whether enough toothpaste/foam is visible. Higher = stricter.
        </p>
        <Slider
          value={[settings.foamSensitivity]}
          onValueChange={([v]) => onUpdate({ ...settings, foamSensitivity: v })}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-[9px]" style={{ color: textMuted }}>
          <span>Off (0%)</span>
          <span>Max (100%)</span>
        </div>
      </div>

      {/* Manual Approval Toggle */}
      <div className="rounded-xl p-4 space-y-3" style={{
        backgroundColor: settings.manualApproval ? "hsl(var(--neon-purple) / 0.06)" : cardBg,
        border: settings.manualApproval ? "1px solid hsl(var(--neon-purple) / 0.2)" : `1px solid ${borderColor}`,
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: settings.manualApproval ? "hsl(var(--neon-purple))" : textMuted }} />
            <div>
              <span className="text-xs font-bold" style={{ color: textPrimary }}>Guild Master Approval</span>
              <p className="text-[10px]" style={{ color: textMuted }}>
                Victory pauses until you approve the mission
              </p>
            </div>
          </div>
          <Switch
            checked={settings.manualApproval}
            onCheckedChange={(v) => onUpdate({ ...settings, manualApproval: v })}
          />
        </div>
        {settings.manualApproval && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-[10px] rounded-lg p-2 space-y-1"
            style={{
              backgroundColor: "hsl(var(--neon-purple) / 0.08)",
              border: "1px solid hsl(var(--neon-purple) / 0.15)",
              color: "hsl(var(--neon-purple) / 0.8)",
            }}
          >
            <p>🛡️ <strong>Workflow:</strong></p>
            <p>1. Child finishes brushing → sees "Waiting for Guild Master..."</p>
            <p>2. You receive a real-time notification</p>
            <p>3. Tap "Approve Mission" → child sees Clear Crystal animation</p>
          </motion.div>
        )}
      </div>
      {/* Re-run First Siege Checklist */}
      {onResetChecklist && (
        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <h4 className="font-heading font-bold text-xs flex items-center gap-2" style={{ color: textPrimary }}>
            <RotateCcw className="w-3.5 h-3.5" style={{ color: accentColor }} />
            First Siege Checklist
          </h4>
          <p className="text-[10px]" style={{ color: textMuted }}>
            Re-run the pre-launch verification if onboarding a new Hunter or troubleshooting.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            style={{ borderColor, color: accentColor }}
            onClick={onResetChecklist}
          >
            <RotateCcw className="w-3 h-3" />
            Re-run Checklist
          </Button>
        </div>
      )}
    </div>
  );
};

export default BattleCalibration;
