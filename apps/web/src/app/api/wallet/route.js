import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET — all documents across all of the user's trips (owned + collaborative)
// filter param: 'mine' | 'shared' | 'private'
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "mine"; // mine | shared | private
    const tripId = searchParams.get("trip_id"); // optional trip filter

    const userId = session.user.id;

    // Build trip access subquery: all trips the user owns or is an accepted collaborator on
    let tripFilter = tripId ? `AND t.id = ${parseInt(tripId)}` : "";

    // mine = documents I uploaded (regardless of private/shared)
    // shared = documents other people shared (is_private=false, not uploaded by me)
    // private = my private documents only
    let docs;

    if (filter === "mine") {
      docs = await sql`
        SELECT
          td.id, td.trip_id, td.user_id, td.document_type, td.title,
          td.file_url, td.file_type, td.file_size, td.notes,
          td.is_private, td.created_at,
          up.username AS added_by_username,
          up.profile_image AS added_by_image,
          COALESCE(d.name, t.custom_destination) AS trip_destination,
          COALESCE(d.country, '') AS trip_country,
          t.trip_name, t.start_date, t.end_date,
          t.id AS trip_id_val
        FROM trip_documents td
        JOIN trips t ON td.trip_id = t.id
        LEFT JOIN destinations d ON t.destination_id = d.id
        LEFT JOIN user_profiles up ON td.user_id = up.user_id
        WHERE td.user_id = ${userId}
          AND (
            t.user_id = ${userId}
            OR EXISTS (
              SELECT 1 FROM trip_collaborators tc
              WHERE tc.trip_id = t.id AND tc.user_id = ${userId} AND tc.status = 'accepted'
            )
          )
        ORDER BY td.created_at DESC
      `;
    } else if (filter === "shared") {
      // Shared by OTHERS with me (not my own uploads, not private)
      docs = await sql`
        SELECT
          td.id, td.trip_id, td.user_id, td.document_type, td.title,
          td.file_url, td.file_type, td.file_size, td.notes,
          td.is_private, td.created_at,
          up.username AS added_by_username,
          up.profile_image AS added_by_image,
          COALESCE(d.name, t.custom_destination) AS trip_destination,
          COALESCE(d.country, '') AS trip_country,
          t.trip_name, t.start_date, t.end_date,
          t.id AS trip_id_val
        FROM trip_documents td
        JOIN trips t ON td.trip_id = t.id
        LEFT JOIN destinations d ON t.destination_id = d.id
        LEFT JOIN user_profiles up ON td.user_id = up.user_id
        WHERE td.user_id != ${userId}
          AND (td.is_private = false OR td.is_private IS NULL)
          AND (
            t.user_id = ${userId}
            OR EXISTS (
              SELECT 1 FROM trip_collaborators tc
              WHERE tc.trip_id = t.id AND tc.user_id = ${userId} AND tc.status = 'accepted'
            )
          )
        ORDER BY td.created_at DESC
      `;
    } else if (filter === "private") {
      // My own private documents
      docs = await sql`
        SELECT
          td.id, td.trip_id, td.user_id, td.document_type, td.title,
          td.file_url, td.file_type, td.file_size, td.notes,
          td.is_private, td.created_at,
          up.username AS added_by_username,
          up.profile_image AS added_by_image,
          COALESCE(d.name, t.custom_destination) AS trip_destination,
          COALESCE(d.country, '') AS trip_country,
          t.trip_name, t.start_date, t.end_date,
          t.id AS trip_id_val
        FROM trip_documents td
        JOIN trips t ON td.trip_id = t.id
        LEFT JOIN destinations d ON t.destination_id = d.id
        LEFT JOIN user_profiles up ON td.user_id = up.user_id
        WHERE td.user_id = ${userId}
          AND td.is_private = true
          AND (
            t.user_id = ${userId}
            OR EXISTS (
              SELECT 1 FROM trip_collaborators tc
              WHERE tc.trip_id = t.id AND tc.user_id = ${userId} AND tc.status = 'accepted'
            )
          )
        ORDER BY td.created_at DESC
      `;
    } else {
      docs = [];
    }

    // Also return list of accessible trips for the selector
    const trips = await sql`
      SELECT t.id, t.trip_name, t.start_date, t.end_date,
             COALESCE(d.name, t.custom_destination) AS destination_name
      FROM trips t
      LEFT JOIN destinations d ON t.destination_id = d.id
      WHERE t.user_id = ${userId}
         OR EXISTS (
           SELECT 1 FROM trip_collaborators tc
           WHERE tc.trip_id = t.id AND tc.user_id = ${userId} AND tc.status = 'accepted'
         )
      ORDER BY t.start_date DESC
    `;

    return Response.json({ documents: docs, trips });
  } catch (err) {
    console.error("GET /api/wallet error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
