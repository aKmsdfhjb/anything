import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a safety report
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      destination_id,
      report_type,
      title,
      description,
      severity,
      location_name,
      location_latitude,
      location_longitude,
    } = body;

    if (!report_type || !title || !description) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check user reputation before allowing critical reports
    const userProfile = await sql`
      SELECT reputation_score, is_verified
      FROM user_profiles
      WHERE user_id = ${session.user.id}
    `;

    const canPostCritical =
      userProfile[0]?.reputation_score >= 50 || userProfile[0]?.is_verified;

    if (severity === "critical" && !canPostCritical) {
      return Response.json(
        {
          error: "Critical warnings require verified status or 50+ reputation",
        },
        { status: 403 },
      );
    }

    const result = await sql`
      INSERT INTO safety_reports (
        user_id,
        destination_id,
        report_type,
        title,
        description,
        severity,
        location_name,
        location_latitude,
        location_longitude,
        verified
      )
      VALUES (
        ${session.user.id},
        ${destination_id || null},
        ${report_type},
        ${title},
        ${description},
        ${severity || "medium"},
        ${location_name || null},
        ${location_latitude || null},
        ${location_longitude || null},
        ${canPostCritical}
      )
      RETURNING *
    `;

    // Award reputation for safety reports
    await sql`
      UPDATE user_profiles
      SET reputation_score = reputation_score + 10
      WHERE user_id = ${session.user.id}
    `;

    return Response.json({ report: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/safety-reports error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get safety reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destination_id");
    const reportType = searchParams.get("report_type");

    let query = `
      SELECT 
        sr.*,
        up.username,
        up.reputation_score,
        up.is_verified,
        d.name as destination_name,
        d.country
      FROM safety_reports sr
      JOIN user_profiles up ON sr.user_id = up.user_id
      LEFT JOIN destinations d ON sr.destination_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (destinationId) {
      params.push(destinationId);
      query += ` AND sr.destination_id = $${params.length}`;
    }

    if (reportType) {
      params.push(reportType);
      query += ` AND sr.report_type = $${params.length}`;
    }

    query += ` ORDER BY sr.severity DESC, sr.created_at DESC LIMIT 50`;

    const reports = await sql(query, params);

    return Response.json({ reports });
  } catch (err) {
    console.error("GET /api/safety-reports error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
