import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useEffect } from "react";
import LanguageSelector from "@/components/LanguageSelector";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"patient" | "dentist">("patient");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.signedIn"));
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, signup_role: role },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // Send welcome email for doctors
        if (role === "dentist" && data.user) {
          supabase.functions.invoke("welcome-doctor", {
            body: { doctorName: fullName, doctorEmail: email },
          }).catch(console.error);
        }

        toast.success(t("auth.checkEmail"));
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-end mb-4">
            <LanguageSelector compact />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            DentaScan<span className="text-clinical-blue ml-1">AI</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isLogin ? t("auth.signInToAccount") : t("auth.createAccount")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-2xl border border-border p-6 shadow-card">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.fullName")}</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Jane Smith" required />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("patient")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === "patient"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-medium text-foreground text-xs">🦷 Patient / Parent</span>
                    <span className="block text-[9px] text-muted-foreground mt-0.5">Scan & track dental health</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("dentist")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === "dentist"
                        ? "border-clinical-blue bg-clinical-blue/10 ring-2 ring-clinical-blue/30"
                        : "border-border bg-card hover:border-clinical-blue/40"
                    }`}
                  >
                    <span className="block font-medium text-foreground text-xs">🏥 Dental Professional</span>
                    <span className="block text-[9px] text-muted-foreground mt-0.5">Triage & earn per case</span>
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
          </div>
          <Button type="submit" className="w-full haptic-button" disabled={loading}>
            {loading ? t("auth.pleaseWait") : isLogin ? t("auth.logIn") : t("auth.createAccountBtn")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-clinical-blue font-medium hover:underline">
            {isLogin ? t("auth.signUp") : t("auth.logIn")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
