import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Check, ArrowLeft, Share, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full space-y-6 text-center"
      >
        <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => navigate("/monster-hunter")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="text-6xl">⚔️🦷</div>

        <div className="space-y-2">
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Install Plaque Hunter
          </h1>
          <p className="text-sm text-muted-foreground">
            Add to your home screen for instant daily quests — no app store needed!
          </p>
        </div>

        {isInstalled ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="rounded-2xl bg-primary/10 border border-primary/20 p-6 space-y-3"
          >
            <Check className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm font-bold text-primary">Already Installed!</p>
            <p className="text-xs text-muted-foreground">Open from your home screen for the best experience.</p>
            <Button onClick={() => navigate("/monster-hunter")} className="w-full">
              Go to Monster Hunter
            </Button>
          </motion.div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <Button onClick={handleInstall} size="lg" className="w-full gap-2 bg-plaque-gold hover:bg-plaque-gold/90 text-foreground font-bold text-base py-6">
              <Download className="w-5 h-5" />
              Install Now
            </Button>
            <p className="text-[10px] text-muted-foreground">Works offline • No app store • Instant access</p>
          </div>
        ) : isIOS ? (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-left">
            <p className="text-xs font-bold text-foreground text-center">Install on iPhone / iPad</p>
            <div className="space-y-3">
              {[
                { icon: <Share className="w-4 h-4" />, text: "Tap the Share button in Safari" },
                { icon: <Smartphone className="w-4 h-4" />, text: 'Scroll down and tap "Add to Home Screen"' },
                { icon: <Check className="w-4 h-4" />, text: 'Tap "Add" to confirm' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-plaque-gold/10 flex items-center justify-center text-plaque-gold flex-shrink-0">
                    {step.icon}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-left">
            <p className="text-xs font-bold text-foreground text-center">Install on Android</p>
            <div className="space-y-3">
              {[
                { icon: <MoreVertical className="w-4 h-4" />, text: "Tap the menu (⋮) in your browser" },
                { icon: <Download className="w-4 h-4" />, text: 'Tap "Install app" or "Add to Home screen"' },
                { icon: <Check className="w-4 h-4" />, text: 'Tap "Install" to confirm' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-plaque-gold/10 flex items-center justify-center text-plaque-gold flex-shrink-0">
                    {step.icon}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="ghost" className="text-xs text-muted-foreground" onClick={() => navigate("/monster-hunter")}>
          Skip for now
        </Button>
      </motion.div>
    </div>
  );
};

export default Install;
