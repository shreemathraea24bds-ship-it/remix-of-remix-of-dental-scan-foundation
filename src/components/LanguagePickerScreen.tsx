import { LANGUAGES, type Language } from "@/hooks/useI18n";
import { useI18n } from "@/hooks/useI18n";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LanguagePickerScreen = () => {
  const { language, setLanguage, markLanguageChosen } = useI18n();

  const handleSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleContinue = () => {
    markLanguageChosen();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-6 text-center"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Choose Your Language</h1>
          <p className="text-muted-foreground text-sm mt-1">Select your preferred language</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`p-3 rounded-xl border text-left transition-all ${
                language === lang.code
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="block font-medium text-foreground text-sm">
                {lang.nativeLabel}
              </span>
              <span className="block text-xs text-muted-foreground">{lang.label}</span>
            </button>
          ))}
        </div>

        <Button onClick={handleContinue} className="w-full" size="lg">
          Continue
        </Button>
      </motion.div>
    </div>
  );
};

export default LanguagePickerScreen;
