import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDentist: boolean;
  isPro: boolean;
  isTrialing: boolean;
  trialDaysLeft: number;
  isPaymentVerified: boolean;
  isApproved: boolean;
  profile: { full_name: string; role: string } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isDentist: false,
  isPro: false,
  isTrialing: false,
  trialDaysLeft: 0,
  isPaymentVerified: false,
  isApproved: false,
  profile: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDentist, setIsDentist] = useState(false);
  const [hasPaidPro, setHasPaidPro] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);

  const TRIAL_DAYS = 1;

  const getTrialInfo = (u: User | null) => {
    if (!u?.created_at) return { isTrialing: false, trialDaysLeft: 0 };
    const created = new Date(u.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));
    return { isTrialing: daysLeft > 0, trialDaysLeft: daysLeft };
  };

  const { isTrialing, trialDaysLeft } = getTrialInfo(user);
  const isPro = hasPaidPro || isTrialing;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setIsDentist(false);
        setHasPaidPro(false);
        setIsPaymentVerified(false);
        setIsApproved(false);
        setProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const [profileRes, roleRes, subRes, receiptRes] = await Promise.all([
      supabase.from("profiles").select("full_name, role, is_approved").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "dentist").maybeSingle(),
      supabase.from("subscriptions").select("status").eq("user_id", userId).eq("status", "active").maybeSingle(),
      supabase.from("payment_receipts").select("status").eq("user_id", userId).in("status", ["verified", "pending"]).maybeSingle(),
    ]);
    setProfile(profileRes.data ? { full_name: profileRes.data.full_name, role: profileRes.data.role } : null);
    setIsApproved(!!(profileRes.data as any)?.is_approved);
    setIsDentist(!!roleRes.data);
    setHasPaidPro(!!subRes.data);
    setIsPaymentVerified(!!receiptRes.data);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isDentist, isPro, isTrialing, trialDaysLeft, isPaymentVerified, isApproved, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
