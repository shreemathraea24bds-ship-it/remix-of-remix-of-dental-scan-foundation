import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Stethoscope, Building2, GraduationCap,
  MapPin, Phone, Mail, Lock, CheckCircle2, User, BadgeCheck, IndianRupee
} from "lucide-react";

const STEPS = ["Account", "Professional", "Clinic", "Review"];

const DoctorSignup = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Professional fields
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");

  // Clinic fields
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [consultationFee, setConsultationFee] = useState("100");

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const canProceed = () => {
    switch (step) {
      case 0: return fullName.trim() && email.trim() && password.length >= 6;
      case 1: return licenseNumber.trim() && specialty.trim();
      case 2: return clinicName.trim() && city.trim();
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            signup_role: "dentist",
            license_number: licenseNumber,
            specialty,
            experience_years: experience,
            clinic_name: clinicName,
            clinic_address: clinicAddress,
            clinic_city: city,
            phone,
            upi_id: upiId,
            consultation_fee: parseInt(consultationFee) || 100,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;

      if (data.user) {
        supabase.functions.invoke("welcome-doctor", {
          body: { doctorName: fullName, doctorEmail: email },
        }).catch(console.error);
      }

      toast.success("Account created! Please check your email to verify.");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 0: Account
    <div key="account" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-clinical-blue" /> Full Name
        </Label>
        <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Jane Smith" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-clinical-blue" /> Email
        </Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dr.jane@clinic.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-clinical-blue" /> Password
        </Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
        <p className="text-[10px] text-muted-foreground">Minimum 6 characters</p>
      </div>
    </div>,

    // Step 1: Professional
    <div key="professional" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="license" className="flex items-center gap-1.5">
          <BadgeCheck className="w-3.5 h-3.5 text-clinical-blue" /> Dental License Number *
        </Label>
        <Input id="license" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="DCI-XXXXX" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="specialty" className="flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-clinical-blue" /> Specialty *
        </Label>
        <select
          id="specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select specialty...</option>
          <option value="General Dentistry">General Dentistry</option>
          <option value="Orthodontics">Orthodontics</option>
          <option value="Periodontics">Periodontics</option>
          <option value="Endodontics">Endodontics</option>
          <option value="Oral Surgery">Oral Surgery</option>
          <option value="Oral Pathology">Oral Pathology</option>
          <option value="Pediatric Dentistry">Pediatric Dentistry</option>
          <option value="Prosthodontics">Prosthodontics</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="experience" className="flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-clinical-blue" /> Years of Experience
        </Label>
        <Input id="experience" type="number" min="0" max="50" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 8" />
      </div>
    </div>,

    // Step 2: Clinic
    <div key="clinic" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clinic" className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-clinical-blue" /> Clinic / Hospital Name *
        </Label>
        <Input id="clinic" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Bright Smile Dental" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-clinical-blue" /> Clinic Address
        </Label>
        <Input id="address" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} placeholder="123 Green Park, Main Road" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city" className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-clinical-blue" /> City *
        </Label>
        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Delhi" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-clinical-blue" /> Contact Number
        </Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-98765-43210" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="upi" className="flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-scan-green" /> UPI ID
        </Label>
        <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="doctor@upi" />
        <p className="text-[10px] text-muted-foreground">For receiving consultation payments from patients</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fee" className="flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-clinical-blue" /> Consultation Fee (₹)
        </Label>
        <Input id="fee" type="number" min="50" max="5000" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="100" />
        <p className="text-[10px] text-muted-foreground">Amount patients pay for a consultation (₹50–₹5000)</p>
      </div>
    </div>,

    // Step 3: Review
    <div key="review" className="space-y-3">
      <p className="text-xs text-muted-foreground text-center mb-4">Please review your details before creating your account.</p>
      {[
        { label: "Name", value: fullName },
        { label: "Email", value: email },
        { label: "License", value: licenseNumber },
        { label: "Specialty", value: specialty },
        { label: "Experience", value: experience ? `${experience} years` : "—" },
        { label: "Clinic", value: clinicName },
        { label: "City", value: city },
        { label: "Phone", value: phone || "—" },
        { label: "UPI ID", value: upiId || "—" },
        { label: "Consultation Fee", value: `₹${consultationFee}` },
      ].map((item) => (
        <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</span>
          <span className="text-xs font-medium text-foreground">{item.value}</span>
        </div>
      ))}
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-lg flex items-center gap-3 h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dentist-info"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <h1 className="font-heading font-bold text-sm text-foreground">Create Provider Account</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
                  i < step ? "bg-clinical-blue/10 text-clinical-blue" :
                  i === step ? "bg-clinical-blue text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 className="w-3 h-3" /> : null}
                  {label}
                </div>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {stepContent[step]}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  variant="clinical"
                  className="flex-1"
                  disabled={!canProceed()}
                  onClick={() => setStep(step + 1)}
                >
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="clinical"
                  className="flex-1"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Creating Account…" : "Create Provider Account"}
                </Button>
              )}
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="text-clinical-blue font-medium hover:underline">Sign In →</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default DoctorSignup;
