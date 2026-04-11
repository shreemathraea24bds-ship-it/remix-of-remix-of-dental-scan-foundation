import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Phone, Send, Loader2, CheckCircle2, Clock,
  MessageSquare, Stethoscope, X, BadgeCheck, IndianRupee
} from "lucide-react";
import ConsultationPayment from "./ConsultationPayment";

interface ConsultationRequestProps {
  onClose?: () => void;
  defaultMessage?: string;
}

interface DoctorProfile {
  id: string;
  full_name: string;
  role: string;
  upi_id: string | null;
  consultation_fee: number;
}

const ConsultationRequest = ({ onClose, defaultMessage = "" }: ConsultationRequestProps) => {
  const { user, profile } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [message, setMessage] = useState(defaultMessage);
  const [contactPhone, setContactPhone] = useState("");
  const [preferredMode, setPreferredMode] = useState<"video" | "phone" | "whatsapp">("video");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  // Fetch dentist profiles
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role, upi_id, consultation_fee")
        .eq("role", "dentist");
      if (data) setDoctors(data as DoctorProfile[]);
    };
    fetchDoctors();
  }, []);

  // Fetch my existing requests
  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("consultation_requests")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setMyRequests(data);
    };
    fetchRequests();

    // Realtime subscription for status updates
    const channel = supabase
      .channel("my-consultation-requests")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "consultation_requests",
        filter: `patient_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setMyRequests(prev =>
            prev.map(r => r.id === (payload.new as any).id ? payload.new : r)
          );
          const updated = payload.new as any;
          if (updated.status === "accepted") {
            toast.success("A doctor accepted your consultation request!");
          }
        } else if (payload.eventType === "INSERT") {
          setMyRequests(prev => [payload.new as any, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to request a consultation.");
      return;
    }
    setLoading(true);
    try {
      const roomName = `dentascan-consult-${Date.now()}`;
      const { error } = await supabase.from("consultation_requests").insert({
        patient_id: user.id,
        patient_name: profile?.full_name || "Anonymous",
        doctor_id: selectedDoctor || null,
        message: message || null,
        contact_phone: contactPhone || null,
        preferred_mode: preferredMode,
        jitsi_room: roomName,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Consultation request sent! A doctor will respond soon.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const joinVideoCall = (room: string) => {
    window.open(`https://meet.jit.si/${room}`, "_blank");
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-card text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-scan-green/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-scan-green" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground">Request Sent!</h3>
        <p className="text-sm text-muted-foreground">
          Your consultation request has been sent. You'll be notified when a doctor accepts.
        </p>
        <Button variant="outline" onClick={() => setSent(false)}>Send Another Request</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Request Form */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-clinical-blue" />
            Request Consultation
          </h3>
          {onClose && (
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Doctor Selection */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1.5">
            <BadgeCheck className="w-3 h-3 text-clinical-blue" />
            Select a Registered Doctor
          </Label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            <button
              onClick={() => setSelectedDoctor(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                !selectedDoctor ? "bg-clinical-blue/10 border border-clinical-blue/30" : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <p className="font-semibold text-foreground">Any Available Doctor</p>
              <p className="text-[10px] text-muted-foreground">First available doctor will respond</p>
            </button>
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  selectedDoctor === doc.id ? "bg-clinical-blue/10 border border-clinical-blue/30" : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    {doc.full_name}
                    <BadgeCheck className="w-3 h-3 text-clinical-blue" />
                  </p>
                  <span className="text-[10px] font-bold text-scan-green flex items-center gap-0.5">
                    <IndianRupee className="w-2.5 h-2.5" />₹{doc.consultation_fee}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Verified DentaScan Provider</p>
              </button>
            ))}
            {doctors.length === 0 && (
              <p className="text-[10px] text-muted-foreground px-3 py-2">
                No doctors registered yet. Ask your dentist to create a Provider account on DentaScan!
              </p>
            )}
          </div>
        </div>

        {/* Preferred Mode */}
        <div className="space-y-2">
          <Label className="text-xs">How would you like to connect?</Label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { mode: "video" as const, icon: <Video className="w-4 h-4" />, label: "Video Call" },
              { mode: "phone" as const, icon: <Phone className="w-4 h-4" />, label: "Phone Call" },
              { mode: "whatsapp" as const, icon: <MessageSquare className="w-4 h-4" />, label: "WhatsApp" },
            ]).map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setPreferredMode(mode)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  preferredMode === mode
                    ? "border-clinical-blue bg-clinical-blue/10 ring-2 ring-clinical-blue/30"
                    : "border-border bg-card hover:border-clinical-blue/40"
                }`}
              >
                <div className="flex justify-center mb-1 text-clinical-blue">{icon}</div>
                <span className="text-[10px] font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Phone */}
        {(preferredMode === "phone" || preferredMode === "whatsapp") && (
          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="text-xs">Your Phone Number</Label>
            <Input
              id="contact-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91-98765-43210"
              className="text-sm"
            />
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-xs">Describe your concern (optional)</Label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Sharp pain when drinking cold water on the lower left side..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
          />
        </div>

        <Button
          variant="clinical"
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={loading || ((preferredMode === "phone" || preferredMode === "whatsapp") && !contactPhone)}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Consultation Request
        </Button>
      </div>

      {/* My Requests Status */}
      {myRequests.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-card space-y-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Requests</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {myRequests.map((req) => {
              const doctor = doctors.find(d => d.id === req.doctor_id);
              return (
                <div key={req.id} className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <p className="text-xs font-semibold text-foreground capitalize">{req.preferred_mode} consultation</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString()}
                        {doctor && ` · Dr. ${doctor.full_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === "pending" && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-urgency-amber/10 text-urgency-amber flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Waiting
                        </span>
                      )}
                      {req.status === "accepted" && (
                        <>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-scan-green/10 text-scan-green">
                            Accepted
                          </span>
                          {req.preferred_mode === "video" && req.jitsi_room && req.payment_status === "verified" && (
                            <Button
                              variant="clinical"
                              size="sm"
                              className="h-6 text-[10px] px-2 gap-1"
                              onClick={() => joinVideoCall(req.jitsi_room)}
                            >
                              <Video className="w-3 h-3" /> Join Call
                            </Button>
                          )}
                        </>
                      )}
                      {req.status === "declined" && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-urgency-red/10 text-urgency-red">
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Show payment widget for accepted requests that aren't paid yet */}
                  {req.status === "accepted" && req.payment_status !== "verified" && req.doctor_id && (
                    <ConsultationPayment
                      consultationId={req.id}
                      doctorId={req.doctor_id}
                      doctorName={doctor?.full_name || "Doctor"}
                      amount={doctor?.consultation_fee || 100}
                      doctorUpiId={doctor?.upi_id || null}
                      onPaymentComplete={() => {
                        setMyRequests(prev =>
                          prev.map(r => r.id === req.id ? { ...r, payment_status: "verified" } : r)
                        );
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRequest;
