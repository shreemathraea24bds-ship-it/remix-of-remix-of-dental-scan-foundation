import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface BattleEvent {
  id: string;
  child_id: string;
  event_type: string;
  hunter_name: string;
  monsters_defeated: number;
  total_monsters: number;
  duration_seconds: number;
  streak: number;
  loot_collected: string[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface FamilyLink {
  id: string;
  parent_id: string;
  child_id: string;
  link_code: string;
  status: string;
  created_at: string;
}

export function useFamilySync() {
  const { user } = useAuth();
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [familyLink, setFamilyLink] = useState<FamilyLink | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<FamilyLink[]>([]);
  const [liveEvents, setLiveEvents] = useState<BattleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load existing family links
  useEffect(() => {
    if (!user) return;
    loadFamilyData();
  }, [user]);

  const loadFamilyData = async () => {
    if (!user) return;
    setLoading(true);

    // Check if user is a child (has a pairing code)
    const { data: code } = await supabase
      .from("pairing_codes")
      .select("*")
      .eq("child_id", user.id)
      .maybeSingle();
    if (code) setPairingCode(code.code);

    // Check if user is a parent (has linked children)
    const { data: parentLinks } = await supabase
      .from("family_links")
      .select("*")
      .eq("parent_id", user.id);
    if (parentLinks && parentLinks.length > 0) {
      setLinkedChildren(parentLinks);
    }

    // Check if user is a child (has a parent link)
    const { data: childLink } = await supabase
      .from("family_links")
      .select("*")
      .eq("child_id", user.id)
      .maybeSingle();
    if (childLink) setFamilyLink(childLink);

    setLoading(false);
  };

  // Generate pairing code for child
  const generatePairingCode = useCallback(async (hunterName: string) => {
    if (!user) return null;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Upsert pairing code
    const { error } = await supabase
      .from("pairing_codes")
      .upsert({
        child_id: user.id,
        code,
        hunter_name: hunterName,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        claimed: false,
      }, { onConflict: "child_id" });

    if (!error) {
      setPairingCode(code);
      return code;
    }
    return null;
  }, [user]);

  // Parent claims a child's pairing code
  const claimPairingCode = useCallback(async (code: string) => {
    if (!user) return { success: false, error: "Not logged in" };

    // Find the pairing code
    const { data: pairingData, error: findError } = await supabase
      .from("pairing_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("claimed", false)
      .maybeSingle();

    if (findError || !pairingData) {
      return { success: false, error: "Invalid or expired code" };
    }

    if (pairingData.child_id === user.id) {
      return { success: false, error: "You can't link to yourself" };
    }

    // Create family link
    const { error: linkError } = await supabase
      .from("family_links")
      .insert({
        parent_id: user.id,
        child_id: pairingData.child_id,
        link_code: code.toUpperCase(),
      });

    if (linkError) {
      return { success: false, error: "Failed to link. Already paired?" };
    }

    // Mark code as claimed
    await supabase
      .from("pairing_codes")
      .update({ claimed: true })
      .eq("id", pairingData.id);

    await loadFamilyData();
    return { success: true, hunterName: pairingData.hunter_name };
  }, [user]);

  // Post a battle event (called by child after battle)
  const postBattleEvent = useCallback(async (event: {
    event_type: string;
    hunter_name: string;
    monsters_defeated: number;
    total_monsters: number;
    duration_seconds: number;
    streak: number;
    loot_collected: string[];
    metadata?: Record<string, any>;
  }) => {
    if (!user) return;

    await supabase.from("battle_events").insert({
      child_id: user.id,
      ...event,
      metadata: event.metadata || {},
    });
  }, [user]);

  // Subscribe to realtime battle events (for parents)
  useEffect(() => {
    if (!user || linkedChildren.length === 0) return;

    const childIds = linkedChildren.map((l) => l.child_id);

    const channel = supabase
      .channel("battle-events-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "battle_events",
        },
        (payload) => {
          const newEvent = payload.new as BattleEvent;
          if (childIds.includes(newEvent.child_id)) {
            setLiveEvents((prev) => [newEvent, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Load recent events
    supabase
      .from("battle_events")
      .select("*")
      .in("child_id", childIds)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setLiveEvents(data as BattleEvent[]);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, linkedChildren]);

  return {
    pairingCode,
    familyLink,
    linkedChildren,
    liveEvents,
    loading,
    generatePairingCode,
    claimPairingCode,
    postBattleEvent,
    isParent: linkedChildren.length > 0,
    isLinkedChild: !!familyLink,
  };
}
