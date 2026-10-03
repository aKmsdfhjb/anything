import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user's consent status
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consents = await sql`
      SELECT * FROM user_consents
      WHERE user_id = ${session.user.id}
        AND withdrawn_at IS NULL
      ORDER BY created_at DESC
    `;

    return Response.json({ consents });
  } catch (err) {
    console.error("GET /api/gdpr/consent error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Record user consent
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { consent_type, consented = true } = body;

    if (!consent_type) {
      return Response.json({ error: "Missing consent_type" }, { status: 400 });
    }

    const validTypes = [
      "privacy_policy",
      "terms_of_service",
      "marketing",
      "data_processing",
    ];
    if (!validTypes.includes(consent_type)) {
      return Response.json({ error: "Invalid consent_type" }, { status: 400 });
    }

    // Get IP and user agent for audit trail
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const consent = await sql`
      INSERT INTO user_consents (user_id, consent_type, consented, ip_address, user_agent)
      VALUES (${session.user.id}, ${consent_type}, ${consented}, ${ip}, ${userAgent})
      RETURNING *
    `;

    // Log consent action
    await sql`
      INSERT INTO gdpr_audit_log (user_id, action_type, action_details, ip_address)
      VALUES (
        ${session.user.id},
        'consent_update',
        ${JSON.stringify({ consent_type, consented, timestamp: new Date().toISOString() })},
        ${ip}
      )
    `;

    return Response.json({ consent: consent[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/gdpr/consent error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Withdraw consent
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consent_type = searchParams.get("consent_type");

    if (!consent_type) {
      return Response.json({ error: "Missing consent_type" }, { status: 400 });
    }

    // Mark consent as withdrawn
    await sql`
      UPDATE user_consents
      SET withdrawn_at = NOW()
      WHERE user_id = ${session.user.id}
        AND consent_type = ${consent_type}
        AND withdrawn_at IS NULL
    `;

    // Log withdrawal
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await sql`
      INSERT INTO gdpr_audit_log (user_id, action_type, action_details, ip_address)
      VALUES (
        ${session.user.id},
        'consent_update',
        ${JSON.stringify({
          consent_type,
          action: "withdrawn",
          timestamp: new Date().toISOString(),
        })},
        ${ip}
      )
    `;

    return Response.json({ success: true, message: "Consent withdrawn" });
  } catch (err) {
    console.error("DELETE /api/gdpr/consent error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
