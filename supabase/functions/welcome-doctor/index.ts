import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, doctorEmail } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const portalUrl = req.headers.get("origin") || "https://pearly-view-ai.lovable.app";

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DentaScan AI <onboarding@resend.dev>",
        to: [doctorEmail],
        subject: `Welcome to the Guild, Doctor! Your DentaScan Provider Portal is Active 🛡️🦷`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:40px 32px;text-align:center;">
      <h1 style="color:#ffffff;font-size:28px;margin:0 0 4px;">DentaScan<span style="color:#60a5fa;"> AI</span></h1>
      <p style="color:#93c5fd;font-size:13px;margin:0;letter-spacing:1px;">PROVIDER NETWORK</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">Dear Dr. ${doctorName || "Doctor"},</p>
      
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Welcome to the future of AI-assisted dental triage. You have successfully joined the 
        <strong style="color:#1e293b;">DentaScan Provider Network</strong>, the professional gateway 
        for the Monster Hunter pediatric ecosystem.
      </p>
      
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Your account is now active, and you have been assigned your <strong style="color:#1e293b;">Secure Clinical Vault</strong>.
      </p>

      <!-- Security Credentials -->
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#0369a1;font-size:14px;margin:0 0 12px;">🔑 Your Security Credentials</h3>
        <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 8px;">
          To maintain HIPAA-compliant data sharing, your access is protected by two layers:
        </p>
        <ul style="color:#475569;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
          <li><strong>Private Master Password:</strong> Set during your first login</li>
          <li><strong>Patient Safety Key:</strong> A unique 6-digit PIN from each patient</li>
        </ul>
        <p style="color:#dc2626;font-size:12px;margin:12px 0 0;font-weight:600;">
          ⚠️ Never share your Master Password. It is the only way to decrypt private patient identities.
        </p>
      </div>

      <!-- Workflow -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#1e293b;font-size:14px;margin:0 0 12px;">💼 How the Triage Queue Works</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px;vertical-align:top;width:28px;color:#2563eb;font-weight:bold;font-size:14px;">1.</td>
            <td style="padding:8px 0;color:#475569;font-size:13px;line-height:1.5;">
              <strong style="color:#1e293b;">Review the Triage Badge</strong><br>
              Scans arrive labeled Emergency, Monitor, or Routine based on AI lesion & plaque detection.
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px;vertical-align:top;color:#2563eb;font-weight:bold;font-size:14px;">2.</td>
            <td style="padding:8px 0;color:#475569;font-size:13px;line-height:1.5;">
              <strong style="color:#1e293b;">Unlock the Identity</strong><br>
              Click "Unlock Report" to view patient's full name, contact & chief complaint.<br>
              <span style="color:#0369a1;font-weight:600;">Processing Fee: ₹75</span> (Covers AI mapping & secure hosting)
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px;vertical-align:top;color:#2563eb;font-weight:bold;font-size:14px;">3.</td>
            <td style="padding:8px 0;color:#475569;font-size:13px;line-height:1.5;">
              <strong style="color:#1e293b;">Earn Your Consultation Fee</strong><br>
              For every scan reviewed, the patient pays <span style="color:#16a34a;font-weight:600;">₹100 Professional Consultation Fee</span> directly to your account.
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px;vertical-align:top;color:#2563eb;font-weight:bold;font-size:14px;">4.</td>
            <td style="padding:8px 0;color:#475569;font-size:13px;line-height:1.5;">
              <strong style="color:#1e293b;">Connect & Refer</strong><br>
              Use the "Bridge" button for secure video calls to bring patients into your clinic.
            </td>
          </tr>
        </table>
      </div>

      <!-- Payment Setup -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:28px;">
        <h3 style="color:#15803d;font-size:14px;margin:0 0 8px;">🛠️ Setting Up Your Payments</h3>
        <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">
          To receive your ₹100 consult fees, log in and link your UPI ID or Bank Account under the 
          <strong>'Revenue & Payouts'</strong> tab.
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${portalUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
          LOG IN TO PROVIDER PORTAL
        </a>
      </div>

      <!-- Support -->
      <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;margin:0;">
        If you have questions regarding the AI heatmap or technical integration,<br>
        our Provider Support team is available 24/7.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <p style="color:#1e293b;font-size:13px;font-weight:600;margin:0 0 4px;">The DentaScan Clinical Team</p>
      <p style="color:#94a3b8;font-size:11px;margin:0;letter-spacing:1px;">PRECISION TRIAGE · PROFESSIONAL GROWTH</p>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;">
        <p style="color:#cbd5e1;font-size:10px;margin:0;">
          🔒 HIPAA Compliant · E2E Encrypted · AES-256
        </p>
      </div>
    </div>
  </div>
</body>
</html>
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
