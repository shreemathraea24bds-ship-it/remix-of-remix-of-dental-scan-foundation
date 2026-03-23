import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ADMIN_EMAIL = "shreemaganesh01@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, transactionId } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DentaScan AI <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `💰 New Pro Payment Claim — ${userName || userEmail}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
            <h2 style="color:#1a1a2e;">New Pro Payment Claim</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;">User</td><td style="padding:8px 0;font-weight:600;">${userName || "N/A"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;font-weight:600;">${userEmail}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">UPI Txn ID</td><td style="padding:8px 0;font-weight:600;">${transactionId || "Not provided"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Time</td><td style="padding:8px 0;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
            </table>
            <p style="margin-top:20px;color:#666;font-size:13px;">Log in to the Provider Portal to approve this claim.</p>
          </div>
        `,
      }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
