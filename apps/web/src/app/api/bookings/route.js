import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Track a booking (for commission)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      booking_type,
      destination_id,
      provider_name,
      booking_url,
      commission_rate,
      booking_amount,
      affiliate_code,
    } = body;

    if (!booking_type || !provider_name || !booking_url) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Calculate commission
    const commission =
      booking_amount && commission_rate
        ? ((booking_amount * commission_rate) / 100).toFixed(2)
        : null;

    const result = await sql`
      INSERT INTO bookings (
        user_id, 
        booking_type, 
        destination_id, 
        provider_name, 
        booking_url, 
        commission_rate,
        booking_amount,
        commission_earned,
        affiliate_code,
        status
      )
      VALUES (
        ${session.user.id}, 
        ${booking_type}, 
        ${destination_id || null}, 
        ${provider_name}, 
        ${booking_url}, 
        ${commission_rate || 10.0},
        ${booking_amount || null},
        ${commission || null},
        ${affiliate_code || null},
        'pending'
      )
      RETURNING *
    `;

    return Response.json({ booking: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get user's bookings
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await sql`
      SELECT 
        b.*,
        d.name as destination_name,
        d.country
      FROM bookings b
      LEFT JOIN destinations d ON b.destination_id = d.id
      WHERE b.user_id = ${session.user.id}
      ORDER BY b.booked_at DESC
    `;

    // Calculate total commission earned
    const totalCommission = await sql`
      SELECT COALESCE(SUM(commission_earned), 0) as total
      FROM bookings
      WHERE user_id = ${session.user.id} AND status = 'completed'
    `;

    return Response.json({
      bookings,
      total_commission_earned: totalCommission[0]?.total || 0,
    });
  } catch (err) {
    console.error("GET /api/bookings error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
