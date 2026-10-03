import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all conversations for the current user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");
    const otherUserId = searchParams.get("other_user_id");

    // Get specific conversation messages
    if (conversationId) {
      const messages = await sql`
        SELECT 
          m.*,
          sender.username as sender_username,
          sender.profile_image as sender_profile_image,
          receiver.username as receiver_username
        FROM messages m
        JOIN user_profiles sender ON m.sender_id = sender.user_id
        JOIN user_profiles receiver ON m.receiver_id = receiver.user_id
        WHERE m.conversation_id = ${parseInt(conversationId)}
        ORDER BY m.created_at ASC
      `;

      // Mark messages as read
      await sql`
        UPDATE messages
        SET read = true
        WHERE conversation_id = ${parseInt(conversationId)}
        AND receiver_id = ${session.user.id}
        AND read = false
      `;

      return Response.json({ messages });
    }

    // Get or create conversation with specific user
    if (otherUserId) {
      let conversation = await sql`
        SELECT * FROM conversations
        WHERE (user1_id = ${session.user.id} AND user2_id = ${otherUserId})
        OR (user1_id = ${otherUserId} AND user2_id = ${session.user.id})
        LIMIT 1
      `;

      if (conversation.length === 0) {
        conversation = await sql`
          INSERT INTO conversations (user1_id, user2_id)
          VALUES (${session.user.id}, ${otherUserId})
          RETURNING *
        `;
      }

      return Response.json({ conversation: conversation[0] });
    }

    // Get all conversations
    const conversations = await sql`
      SELECT 
        c.*,
        CASE 
          WHEN c.user1_id = ${session.user.id} THEN up2.username
          ELSE up1.username
        END as other_username,
        CASE 
          WHEN c.user1_id = ${session.user.id} THEN up2.profile_image
          ELSE up1.profile_image
        END as other_profile_image,
        CASE 
          WHEN c.user1_id = ${session.user.id} THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = ${session.user.id} AND read = false) as unread_count
      FROM conversations c
      JOIN user_profiles up1 ON c.user1_id = up1.user_id
      JOIN user_profiles up2 ON c.user2_id = up2.user_id
      WHERE c.user1_id = ${session.user.id} OR c.user2_id = ${session.user.id}
      ORDER BY c.last_message_at DESC
    `;

    return Response.json({ conversations });
  } catch (err) {
    console.error("GET /api/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Send a message
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiver_id, content, conversation_id } = body;

    if (!receiver_id || !content?.trim()) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      let conversation = await sql`
        SELECT id FROM conversations
        WHERE (user1_id = ${session.user.id} AND user2_id = ${receiver_id})
        OR (user1_id = ${receiver_id} AND user2_id = ${session.user.id})
        LIMIT 1
      `;

      if (conversation.length === 0) {
        const newConv = await sql`
          INSERT INTO conversations (user1_id, user2_id)
          VALUES (${session.user.id}, ${receiver_id})
          RETURNING id
        `;
        convId = newConv[0].id;
      } else {
        convId = conversation[0].id;
      }
    }

    // Create message
    const message = await sql`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, content)
      VALUES (${convId}, ${session.user.id}, ${receiver_id}, ${content.trim()})
      RETURNING *
    `;

    // Update conversation last_message_at
    await sql`
      UPDATE conversations
      SET last_message_at = NOW()
      WHERE id = ${convId}
    `;

    return Response.json({ message: message[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
