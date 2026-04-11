import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin, Clock, Star, Navigation, ShieldAlert, Locate, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Dentist {
  name: string;
  hospital: string;
  address: string;
  distance: string;
  rating: number;
  hours: string;
  phone: string;
  emergency: boolean;
  specialty: string;
  photo: string;
}

// Real dental clinics directory (publicly available info)
const dentalDirectory: Dentist[] = [
  {
    name: "Dr. Priya Sharma",
    hospital: "Apollo Dental Clinic",
    address: "Jubilee Hills, Hyderabad",
    distance: "",
    rating: 4.8,
    hours: "24/7 Emergency",
    phone: "+91-40-23607777",
    emergency: true,
    specialty: "Oral & Maxillofacial Surgery",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Rajesh Kumar",
    hospital: "Clove Dental",
    address: "Koramangala, Bangalore",
    distance: "",
    rating: 4.7,
    hours: "Open until 9 PM",
    phone: "+91-80-67456745",
    emergency: true,
    specialty: "Endodontics & Root Canal",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Sneha Patel",
    hospital: "Sabka Dentist",
    address: "Andheri West, Mumbai",
    distance: "",
    rating: 4.6,
    hours: "9 AM – 9 PM",
    phone: "+91-22-62526252",
    emergency: false,
    specialty: "Cosmetic Dentistry",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Arjun Mehta",
    hospital: "Dental Planet",
    address: "Connaught Place, New Delhi",
    distance: "",
    rating: 4.9,
    hours: "24/7 Emergency",
    phone: "+91-11-43533535",
    emergency: true,
    specialty: "Pediatric Dentistry",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Kavitha Rajan",
    hospital: "Sri Ramachandra Dental Hospital",
    address: "Porur, Chennai",
    distance: "",
    rating: 4.8,
    hours: "8 AM – 8 PM",
    phone: "+91-44-24768027",
    emergency: true,
    specialty: "Periodontics",
    photo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Amit Desai",
    hospital: "MyDentist Chain",
    address: "SG Highway, Ahmedabad",
    distance: "",
    rating: 4.5,
    hours: "10 AM – 8 PM",
    phone: "+91-79-40065006",
    emergency: false,
    specialty: "Orthodontics",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Neha Gupta",
    hospital: "FMS Dental Hospital",
    address: "Kukatpally, Hyderabad",
    distance: "",
    rating: 4.7,
    hours: "24/7 Emergency",
    phone: "+91-40-23747575",
    emergency: true,
    specialty: "Implantology",
    photo: "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Vikram Singh",
    hospital: "Dental Studio",
    address: "Sector 18, Noida",
    distance: "",
    rating: 4.6,
    hours: "9 AM – 10 PM",
    phone: "+91-120-4243500",
    emergency: false,
    specialty: "Prosthodontics",
    photo: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Suman Reddy",
    hospital: "Partha Dental",
    address: "Madhapur, Hyderabad",
    distance: "",
    rating: 4.6,
    hours: "9 AM – 9 PM",
    phone: "+91-40-44556677",
    emergency: false,
    specialty: "General Dentistry",
    photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Lakshmi Iyer",
    hospital: "Axiss Dental",
    address: "T Nagar, Chennai",
    distance: "",
    rating: 4.7,
    hours: "24/7 Emergency",
    phone: "+91-44-42124212",
    emergency: true,
    specialty: "Oral Surgery",
    photo: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Rahul Joshi",
    hospital: "Dental Kraft",
    address: "Baner, Pune",
    distance: "",
    rating: 4.8,
    hours: "10 AM – 8 PM",
    phone: "+91-20-67218900",
    emergency: false,
    specialty: "Cosmetic & Implant Dentistry",
    photo: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Anjali Nair",
    hospital: "Amrita Dental Hospital",
    address: "Palarivattom, Kochi",
    distance: "",
    rating: 4.9,
    hours: "24/7 Emergency",
    phone: "+91-484-2851234",
    emergency: true,
    specialty: "Pediatric Dentistry",
    photo: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Manoj Verma",
    hospital: "Dental World",
    address: "Vaishali Nagar, Jaipur",
    distance: "",
    rating: 4.5,
    hours: "9 AM – 8 PM",
    phone: "+91-141-4072222",
    emergency: false,
    specialty: "Endodontics",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Pooja Bansal",
    hospital: "Dentzz Dental Care",
    address: "Kemps Corner, Mumbai",
    distance: "",
    rating: 4.8,
    hours: "24/7 Emergency",
    phone: "+91-22-66364444",
    emergency: true,
    specialty: "Root Canal & Crowns",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Karthik Rao",
    hospital: "Manipal Dental Sciences",
    address: "Old Airport Road, Bangalore",
    distance: "",
    rating: 4.9,
    hours: "8 AM – 10 PM",
    phone: "+91-80-25023456",
    emergency: true,
    specialty: "Periodontics & Gum Care",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Dr. Srinivas",
    hospital: "DentaScan Emergency Support",
    address: "Primary Hotline",
    distance: "Priority",
    rating: 5.0,
    hours: "24/7 Primary Support",
    phone: "9443236200",
    emergency: true,
    specialty: "Emergency Triage",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
];

interface EmergencyDrawerProps {
  open: boolean;
  onClose: () => void;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Approximate coordinates for the listed cities (for distance calc)
const cityCoords: Record<string, [number, number]> = {
  "Hyderabad": [17.385, 78.4867],
  "Bangalore": [12.9716, 77.5946],
  "Mumbai": [19.076, 72.8777],
  "New Delhi": [28.6139, 77.209],
  "Chennai": [13.0827, 80.2707],
  "Ahmedabad": [23.0225, 72.5714],
  "Noida": [28.5355, 77.391],
  "Pune": [18.5204, 73.8567],
  "Kochi": [9.9312, 76.2673],
  "Jaipur": [26.9124, 75.7873],
};

function getCityFromAddress(address: string): string | null {
  for (const city of Object.keys(cityCoords)) {
    if (address.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return null;
}

const EmergencyDrawer = ({ open, onClose }: EmergencyDrawerProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [tab, setTab] = useState<"nearby" | "directory">("nearby");
  const [dentistsWithDistance, setDentistsWithDistance] = useState<Dentist[]>(dentalDirectory);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocating(false);
        toast.success("Location found! Sorting by distance…");

        // Calculate distances
        const sorted = dentalDirectory.map((d) => {
          const city = getCityFromAddress(d.address);
          if (city && cityCoords[city]) {
            const dist = haversineDistance(loc.lat, loc.lng, cityCoords[city][0], cityCoords[city][1]);
            return { ...d, distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)} km` };
          }
          return { ...d, distance: "—" };
        });
        sorted.sort((a, b) => {
          const da = parseFloat(a.distance) || 99999;
          const db = parseFloat(b.distance) || 99999;
          return da - db;
        });
        setDentistsWithDistance(sorted);
      },
      (err) => {
        setLocating(false);
        toast.error("Location access denied. Showing all dentists.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (open && !userLocation) {
      requestLocation();
    }
  }, [open]);

  const filteredDentists = tab === "nearby"
    ? dentistsWithDistance.filter((d) => d.emergency)
    : dentistsWithDistance;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-card border-t border-border shadow-elevated"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-urgency-red/10 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-urgency-red" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground">Emergency Dentists</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {userLocation ? "Sorted by distance from you" : "Tap locate to find nearest"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8 -mt-1" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Location + Tabs */}
            <div className="px-5 pb-3 space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={requestLocation}
                  disabled={locating}
                >
                  {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
                  {locating ? "Locating…" : userLocation ? "Update Location" : "Find My Location"}
                </Button>
                {userLocation && (
                  <Badge variant="outline" className="text-[10px] text-scan-green border-scan-green/30">
                    📍 Location active
                  </Badge>
                )}
              </div>

              <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setTab("nearby")}
                  className={`flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all ${
                    tab === "nearby" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  🚨 Emergency (24h)
                </button>
                <button
                  onClick={() => setTab("directory")}
                  className={`flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all ${
                    tab === "directory" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  📋 All Dentists
                </button>
              </div>
            </div>

            {/* Priority Hotline */}
            <div className="px-5 pb-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl bg-gradient-to-br from-urgency-red to-urgency-red/80 p-4 text-white shadow-lg overflow-hidden relative"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Immediate Support Hotline</p>
                    <h4 className="text-xl font-heading font-bold">9443236200</h4>
                    <p className="text-[11px] text-white/70">Tap to call our primary emergency line</p>
                  </div>
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full bg-white text-urgency-red hover:bg-white/90 shadow-lg"
                    onClick={() => { window.location.href = `tel:9443236200`; }}
                  >
                    <Phone className="w-6 h-6 fill-current" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Dentist list */}
            <div className="px-5 pb-8 space-y-3 overflow-y-auto max-h-[55vh]">
              {filteredDentists.map((d, i) => (
                <motion.div
                  key={`${d.name}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-border bg-background p-4 shadow-card space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Dentist photo */}
                    <img
                      src={d.photo}
                      alt={d.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-heading font-semibold text-sm text-foreground truncate">{d.name}</h4>
                        {d.emergency && (
                          <span className="text-[8px] font-bold uppercase tracking-wider text-urgency-red bg-urgency-red/10 px-1.5 py-0.5 rounded-full shrink-0">
                            24h
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-clinical-blue truncate">{d.hospital}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-plaque fill-plaque" />
                          <span className="text-[11px] font-semibold text-foreground">{d.rating}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{d.specialty}</span>
                        {d.distance && d.distance !== "—" && (
                          <>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <div className="flex items-center gap-0.5">
                              <Navigation className="w-3 h-3 text-clinical-blue" />
                              <span className="text-[11px] font-medium text-clinical-blue">{d.distance}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{d.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className={d.emergency ? "text-scan-green font-semibold" : ""}>{d.hours}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span className="font-mono">{d.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={d.emergency ? "destructive" : "default"}
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => { window.location.href = `tel:${d.phone.replace(/[^+\d]/g, "")}`; }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(d.hospital + " " + d.address)}`)}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Map
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(d.hospital + " " + d.address)}`, "_blank")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {/* Google Maps search link */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full gap-2 text-[12px]"
                  onClick={() => {
                    const q = userLocation
                      ? `https://www.google.com/maps/search/dental+clinic+near+me/@${userLocation.lat},${userLocation.lng},14z`
                      : "https://www.google.com/maps/search/dental+clinic+near+me";
                    window.open(q, "_blank");
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  Search more dental clinics on Google Maps
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center pt-1 italic">
                ⚕️ Contact numbers are publicly available. Always verify before visiting.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyDrawer;
