import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let partners;
    if (category) {
      partners = await sql`
        SELECT * FROM affiliate_partners
        WHERE category = ${category} AND is_active = true
        ORDER BY commission_rate DESC, partner_name ASC
      `;
    } else {
      partners = await sql`
        SELECT * FROM affiliate_partners
        WHERE is_active = true
        ORDER BY category, commission_rate DESC, partner_name ASC
      `;
    }

    return Response.json({ partners });
  } catch (err) {
    console.error("GET /api/affiliates error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, affiliate_code, commission_rate, is_active } = body;

    if (!id) {
      return Response.json({ error: "Partner ID required" }, { status: 400 });
    }

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (affiliate_code !== undefined) {
      setClauses.push(`affiliate_code = $${paramCount++}`);
      values.push(affiliate_code);
    }
    if (commission_rate !== undefined) {
      setClauses.push(`commission_rate = $${paramCount++}`);
      values.push(commission_rate);
    }
    if (is_active !== undefined) {
      setClauses.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE affiliate_partners SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    return Response.json({ partner: result[0] });
  } catch (err) {
    console.error("PUT /api/affiliates error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
