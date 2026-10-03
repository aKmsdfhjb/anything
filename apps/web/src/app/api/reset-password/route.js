import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Find a valid (unused, not expired) token
    const tokens = await sql`
      SELECT prt.id, prt.user_id, au.email
      FROM password_reset_tokens prt
      JOIN auth_users au ON prt.user_id = au.id
      WHERE prt.token = ${token}
        AND prt.used = false
        AND prt.expires_at > NOW()
    `;

    if (tokens.length === 0) {
      return Response.json(
        {
          error:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    const resetToken = tokens[0];

    // Hash the new password
    const hashedPassword = await hash(password);

    // Update the password and mark token as used
    await sql.transaction([
      sql`
        UPDATE auth_accounts
        SET password = ${hashedPassword}
        WHERE "userId" = ${resetToken.user_id} AND provider = 'credentials'
      `,
      sql`
        UPDATE password_reset_tokens
        SET used = true
        WHERE token = ${token}
      `,
    ]);

    return Response.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
