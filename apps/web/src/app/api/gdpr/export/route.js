import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GDPR Data Export - Right to Data Portability
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Collect all user data from all tables
    const [
      userProfile,
      userAuth,
      tips,
      comments,
      savedPlaces,
      trips,
      bookings,
      safetyReports,
      engagements,
      badges,
      follows,
      consents,
    ] = await sql.transaction([
      sql`SELECT * FROM user_profiles WHERE user_id = ${userId}`,
      sql`SELECT id, email, created_at FROM auth_users WHERE id = ${userId}`,
      sql`SELECT * FROM tips WHERE user_id = ${userId}`,
      sql`SELECT * FROM tip_comments WHERE user_id = ${userId}`,
      sql`SELECT * FROM saved_places WHERE user_id = ${userId}`,
      sql`SELECT * FROM trips WHERE user_id = ${userId}`,
      sql`SELECT * FROM bookings WHERE user_id = ${userId}`,
      sql`SELECT * FROM safety_reports WHERE user_id = ${userId}`,
      sql`SELECT * FROM tip_engagements WHERE user_id = ${userId}`,
      sql`SELECT * FROM user_badges WHERE user_id = ${userId}`,
      sql`
        SELECT uf.*, up.username as following_username 
        FROM user_follows uf
        LEFT JOIN user_profiles up ON uf.following_id = up.user_id
        WHERE uf.follower_id = ${userId}
      `,
      sql`SELECT * FROM user_consents WHERE user_id = ${userId}`,
    ]);

    // Log the data export for audit purposes
    await sql`
      INSERT INTO gdpr_audit_log (user_id, action_type, action_details)
      VALUES (
        ${userId},
        'data_export',
        ${JSON.stringify({ timestamp: new Date().toISOString(), ip: request.headers.get("x-forwarded-for") || "unknown" })}
      )
    `;

    // Compile all data into a structured JSON
    const userData = {
      export_date: new Date().toISOString(),
      export_type: "GDPR Data Export - Right to Data Portability",
      user_id: userId,
      account: {
        email: userAuth[0]?.email,
        created_at: userAuth[0]?.created_at,
        profile: userProfile[0] || {},
      },
      content: {
        tips: tips || [],
        comments: comments || [],
        safety_reports: safetyReports || [],
      },
      activity: {
        saved_places: savedPlaces || [],
        trips: trips || [],
        bookings: bookings || [],
        engagements: engagements || [],
        badges: badges || [],
        following: follows || [],
      },
      privacy: {
        consents: consents || [],
      },
      metadata: {
        total_tips: tips.length,
        total_comments: comments.length,
        total_trips: trips.length,
        total_bookings: bookings.length,
      },
    };

    return Response.json(userData, {
      headers: {
        "Content-Disposition": `attachment; filename="tip-trip-data-export-${userId}-${Date.now()}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("GET /api/gdpr/export error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
