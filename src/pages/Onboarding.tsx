import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const Onboarding = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("dentascan-onboarded", "true");
    navigate("/", { replace: true });
  };

  return <OnboardingFlow onComplete={handleComplete} />;
};

export default Onboarding;
