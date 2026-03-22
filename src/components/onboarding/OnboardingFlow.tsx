import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SkipForward, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import WelcomeCards, { cardData } from "@/components/onboarding/WelcomeCards";
import CalibrationScreen from "@/components/onboarding/CalibrationScreen";
import PracticeScan from "@/components/onboarding/PracticeScan";

const TOTAL_STEPS = cardData.length + 2; // 3 welcome + calibration + practice

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);

  const isWelcome = step < cardData.length;
  const isCalibration = step === cardData.length;
  const isPractice = step === cardData.length + 1;

  const next = useCallback(() => {
    if (step >= TOTAL_STEPS - 1) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, onComplete]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <h1 className="font-heading font-bold text-sm text-foreground">
          DentaScan<span className="text-clinical-blue ml-1">AI</span>
        </h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1"
          onClick={onComplete}
        >
          <SkipForward className="w-3.5 h-3.5" />
          Skip
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {isWelcome && <WelcomeCards key={`welcome-${step}`} currentStep={step} />}
          {isCalibration && <CalibrationScreen key="calibration" />}
          {isPractice && <PracticeScan key="practice" />}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 space-y-4">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-clinical-blue"
                  : i < step
                  ? "w-1.5 bg-clinical-blue/40"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Next / Finish button */}
        {!isPractice ? (
          <Button
            variant="clinical"
            className="w-full max-w-sm mx-auto haptic-button gap-2"
            onClick={next}
          >
            {isCalibration ? (
              <>
                <Camera className="w-4 h-4" />
                Try Practice Scan
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="clinical"
            className="w-full max-w-sm mx-auto haptic-button gap-2"
            onClick={onComplete}
          >
            Start Scanning
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
