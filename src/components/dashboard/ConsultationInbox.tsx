import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Phone, MessageSquare, CheckCircle2, X, Clock,
  User, Bell, PhoneCall
} from "lucide-react";

interface ConsultationRequest {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string | null;
  status: string;
  message: string | null;
  contact_phone: string | null;
  preferred_mode: string;
  created_at: string;
  jitsi_room: string | null;
}

const ConsultationInbox = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("consultation_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setRequests(data as ConsultationRequest[]);
      setLoading(false);
    };
    fetchRequests();

    // Realtime for new requests
    const channel = supabase
      .channel("doctor-consultation-inbox")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "consultation_requests",
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setRequests(prev => [payload.new as ConsultationRequest, ...prev]);
          toast.info("New consultation request received!");
        } else if (payload.eventType === "UPDATE") {
          setRequests(prev =>
            prev.map(r => r.id === (payload.new as any).id ? payload.new as ConsultationRequest : r)
          );
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAccept = async (req: ConsultationRequest) => {
    if (!user) return;
    const { error } = await supabase
      .from("consultation_requests")
      .update({
        status: "accepted",
        doctor_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", req.id);
    if (error) {
      toast.error("Failed to accept request");
      return;
    }
    toast.success(`Accepted consultation with ${req.patient_name}`);

    // Auto-open video call if preferred
    if (req.preferred_mode === "video" && req.jitsi_room) {
      window.open(`https://meet.jit.si/${req.jitsi_room}`, "_blank");
    }
  };

  const handleDecline = async (req: ConsultationRequest) => {
    const { error } = await supabase
      .from("consultation_requests")
      .update({ status: "declined" })
      .eq("id", req.id);
    if (error) toast.error("Failed to decline request");
    else toast.info("Request declined");
  };

  const handleCall = (req: ConsultationRequest) => {
    if (req.preferred_mode === "video" && req.jitsi_room) {
      window.open(`https://meet.jit.si/${req.jitsi_room}`, "_blank");
    } else if (req.preferred_mode === "whatsapp" && req.contact_phone) {
      window.open(`https://wa.me/${req.contact_phone.replace(/[^0-9]/g, "")}`, "_blank");
    } else if (req.preferred_mode === "phone" && req.contact_phone) {
      window.open(`tel:${req.contact_phone}`, "_self");
    }
  };

  const modeIcon = (mode: string) => {
    switch (mode) {
      case "video": return <Video className="w-3.5 h-3.5 text-clinical-blue" />;
      case "phone": return <Phone className="w-3.5 h-3.5 text-scan-green" />;
      case "whatsapp": return <MessageSquare className="w-3.5 h-3.5 text-scan-green" />;
      default: return <Phone className="w-3.5 h-3.5" />;
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const activeRequests = requests.filter(r => r.status === "accepted");
  const pastRequests = requests.filter(r => r.status === "declined" || r.status === "completed");

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-clinical-blue" />
          Consultation Requests
        </h2>
        {pendingRequests.length > 0 && (
          <p className="text-[10px] text-urgency-amber font-semibold mt-0.5">
            {pendingRequests.length} pending request{pendingRequests.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-clinical-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-urgency-amber px-1">New Requests</p>
            <AnimatePresence>
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="rounded-xl border border-urgency-amber/30 bg-urgency-amber/5 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{req.patient_name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          {modeIcon(req.preferred_mode)}
                          <span className="capitalize">{req.preferred_mode}</span>
                          <span>·</span>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {req.message && (
                    <div className="rounded-lg bg-background/50 p-2 border-l-2 border-clinical-blue/30">
                      <p className="text-[10px] text-muted-foreground italic">"{req.message}"</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="clinical"
                      size="sm"
                      className="flex-1 h-8 text-[10px] gap-1"
                      onClick={() => handleAccept(req)}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] gap-1 text-muted-foreground"
                      onClick={() => handleDecline(req)}
                    >
                      <X className="w-3 h-3" /> Decline
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Active Consultations */}
        {activeRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-scan-green px-1">Active Consultations</p>
            {activeRequests.map((req) => (
              <div key={req.id} className="rounded-xl border border-scan-green/30 bg-scan-green/5 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{req.patient_name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{req.preferred_mode} consultation</p>
                  </div>
                  <Button
                    variant="clinical"
                    size="sm"
                    className="h-7 text-[10px] gap-1"
                    onClick={() => handleCall(req)}
                  >
                    <PhoneCall className="w-3 h-3" />
                    {req.preferred_mode === "video" ? "Join Call" : req.preferred_mode === "whatsapp" ? "WhatsApp" : "Call"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past */}
        {pastRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Past</p>
            {pastRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="rounded-xl border border-border bg-muted/20 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">{req.patient_name}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    req.status === "declined" ? "bg-urgency-red/10 text-urgency-red" : "bg-muted text-muted-foreground"
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground">No consultation requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationInbox;
