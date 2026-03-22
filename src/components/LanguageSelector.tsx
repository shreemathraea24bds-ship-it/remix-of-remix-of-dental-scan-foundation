import { useI18n, LANGUAGES, type Language } from "@/hooks/useI18n";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  compact?: boolean;
}

const LanguageSelector = ({ compact = false }: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
      <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
        <SelectTrigger className={compact ? "w-16 h-8 text-xs px-2" : "w-44 h-9 text-sm"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-sm">
              <span>{lang.nativeLabel}</span>
              {!compact && (
                <span className="text-muted-foreground ml-1.5 text-xs">({lang.label})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
