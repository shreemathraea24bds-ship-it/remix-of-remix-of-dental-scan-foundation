import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider, useI18n } from "@/hooks/useI18n";
import LanguagePickerScreen from "@/components/LanguagePickerScreen";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DentistInfo from "./pages/DentistInfo";
import MonsterHunter from "./pages/MonsterHunter";
import Install from "./pages/Install";
import Pricing from "./pages/Pricing";
import BiteForceAnalysis from "./pages/BiteForceAnalysis";
import PhPredictor from "./pages/PhPredictor";
import FlossingCoach from "./pages/FlossingCoach";
import Tools from "./pages/Tools";
import ToolsDashboard from "./pages/ToolsDashboard";
import Reviews from "./pages/Reviews";
import ClinicFlyer from "./pages/ClinicFlyer";
import DoctorWalkthrough from "./pages/DoctorWalkthrough";
import PitchDeck from "./pages/PitchDeck";
import DoctorSignup from "./pages/DoctorSignup";
import Revenue from "./pages/Revenue";
import HealthTips from "./pages/HealthTips";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { hasChosenLanguage } = useI18n();

  if (!hasChosenLanguage) {
    return <LanguagePickerScreen />;
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes — no payment gate */}
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/landing" element={<Landing />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/dentist-info" element={<DentistInfo />} />
            <Route path="/install" element={<Install />} />
            <Route path="/doctor-signup" element={<DoctorSignup />} />
            <Route path="/walkthrough" element={<DoctorWalkthrough />} />
            <Route path="/pitch-deck" element={<PitchDeck />} />
            <Route path="/clinic-flyer" element={<ClinicFlyer />} />

            {/* Protected routes — require payment */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/monster-hunter" element={<ProtectedRoute><MonsterHunter /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            <Route path="/bite-force" element={<ProtectedRoute><BiteForceAnalysis /></ProtectedRoute>} />
            <Route path="/ph-predictor" element={<ProtectedRoute><PhPredictor /></ProtectedRoute>} />
            <Route path="/flossing-coach" element={<ProtectedRoute><FlossingCoach /></ProtectedRoute>} />
            <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
            <Route path="/tools-dashboard" element={<ProtectedRoute><ToolsDashboard /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/revenue" element={<ProtectedRoute><Revenue /></ProtectedRoute>} />
            <Route path="/health-tips" element={<ProtectedRoute><HealthTips /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
