import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

const ProGate = ({ children }: ProGateProps) => {
  // Free plan users can access all features
  return <>{children}</>;
};

export default ProGate;
