import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Schedule notifications for flight documents
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { document_id, flight_time, check_in_time } = body;

    if (!document_id || !flight_time) {
      return Response.json(
        { error: "Missing document_id or flight_time" },
        { status: 400 },
      );
    }

    // Update document with flight time
    const result = await sql`
      UPDATE trip_documents
      SET flight_time = ${flight_time}, 
          check_in_time = ${check_in_time || null},
          reminder_sent = false
      WHERE id = ${document_id} AND user_id = ${session.user.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    return Response.json({
      document: result[0],
      message: "Flight reminder scheduled successfully",
    });
  } catch (err) {
    console.error("POST /api/notifications/schedule error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get upcoming flight reminders
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const reminders = await sql`
      SELECT td.*, t.trip_name, d.name as destination_name
      FROM trip_documents td
      JOIN trips t ON td.trip_id = t.id
      JOIN destinations d ON t.destination_id = d.id
      WHERE td.user_id = ${session.user.id}
        AND td.flight_time IS NOT NULL
        AND td.flight_time BETWEEN ${now.toISOString()} AND ${next48Hours.toISOString()}
        AND td.reminder_sent = false
      ORDER BY td.flight_time ASC
    `;

    return Response.json({ reminders });
  } catch (err) {
    console.error("GET /api/notifications/schedule error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
