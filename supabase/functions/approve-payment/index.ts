import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is a dentist
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid token");

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "dentist")
      .maybeSingle();

    if (!roleData) throw new Error("Unauthorized: dentist role required");

    const { claimId, action } = await req.json();
    if (!claimId || !["approve", "reject"].includes(action)) {
      throw new Error("Invalid request: claimId and action (approve/reject) required");
    }

    // Get the claim
    const { data: claim, error: claimError } = await supabaseAdmin
      .from("payment_claims")
      .select("*")
      .eq("id", claimId)
      .single();

    if (claimError || !claim) throw new Error("Claim not found");

    if (action === "approve") {
      // Insert subscription
      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: claim.user_id,
          plan: "pro",
          status: "active",
          started_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (subError) throw new Error("Failed to create subscription: " + subError.message);
    }

    // Update claim status
    const { error: updateError } = await supabaseAdmin
      .from("payment_claims")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", claimId);

    if (updateError) throw new Error("Failed to update claim: " + updateError.message);

    return new Response(
      JSON.stringify({ success: true, action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
