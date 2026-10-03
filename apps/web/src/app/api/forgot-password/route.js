import sql from "@/app/api/utils/sql";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email FROM auth_users WHERE email = ${email}
    `;

    if (users.length === 0) {
      // Don't reveal whether email exists — return success either way
      return Response.json({
        message:
          "If an account with that email exists, a reset link has been generated.",
      });
    }

    const user = users[0];

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Expire in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate any existing unused tokens for this user
    await sql`
      UPDATE password_reset_tokens 
      SET used = true 
      WHERE user_id = ${user.id} AND used = false
    `;

    // Create new token
    await sql`
      INSERT INTO password_reset_tokens (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt.toISOString()})
    `;

    // Build the reset URL using the request's origin
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "localhost:4000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;
    const resetUrl = `${baseUrl}/account/reset-password?token=${token}`;

    return Response.json({
      message:
        "If an account with that email exists, a reset link has been generated.",
      // Include the reset URL so the user can access it
      resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
