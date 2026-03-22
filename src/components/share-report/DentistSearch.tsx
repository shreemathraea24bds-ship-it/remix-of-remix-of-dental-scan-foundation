import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RegisteredDentist {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
}

interface DentistSearchProps {
  selectedDentist: RegisteredDentist | null;
  onSelect: (dentist: RegisteredDentist) => void;
}

const DentistSearch = ({ selectedDentist, onSelect }: DentistSearchProps) => {
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [dentists, setDentists] = useState<RegisteredDentist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDentists = async () => {
      // Fetch profiles with dentist role from user_roles
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "dentist");

      if (!roleData || roleData.length === 0) {
        // Fallback: fetch profiles marked as dentist
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "dentist");

        if (profileData) {
          setDentists(profileData.map(p => ({
            id: p.id,
            name: p.full_name || "Doctor",
            specialty: "General Dentistry",
            clinic: "DentaScan Verified",
          })));
        }
        setLoading(false);
        return;
      }

      const doctorIds = roleData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", doctorIds);

      if (profiles) {
        setDentists(profiles.map(p => ({
          id: p.id,
          name: p.full_name || "Doctor",
          specialty: "General Dentistry",
          clinic: "DentaScan Verified",
        })));
      }
      setLoading(false);
    };
    fetchDentists();
  }, []);

  const filtered = dentists.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <BadgeCheck className="w-3 h-3 text-clinical-blue" />
        Registered Dentists Only
      </h5>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search registered dentist by name…"
          className="pl-9 text-xs h-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowList(true); }}
          onFocus={() => setShowList(true)}
        />
      </div>
      {loading && (
        <p className="text-[10px] text-muted-foreground text-center py-2">Loading doctors…</p>
      )}
      <AnimatePresence>
        {showList && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 max-h-36 overflow-y-auto"
          >
            {filtered.length > 0 ? filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => { onSelect(d); setSearch(d.name); setShowList(false); toast.success(`Selected ${d.name}`); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:bg-muted/50 ${
                  selectedDentist?.id === d.id ? "bg-clinical-blue/5 border border-clinical-blue/20" : ""
                }`}
              >
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  {d.name}
                  <BadgeCheck className="w-3 h-3 text-clinical-blue" />
                </p>
                <p className="text-[10px] text-muted-foreground">{d.specialty} · {d.clinic}</p>
              </button>
            )) : (
              <p className="text-[10px] text-muted-foreground text-center py-3">
                {search ? "No registered dentists match your search" : "No dentists registered yet. Ask your dentist to join DentaScan!"}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DentistSearch;
