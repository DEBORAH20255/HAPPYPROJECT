import { redis } from "../../../redis-client.js"; // Use your shared client, do NOT re-create here

function getSessionKey(token) {
  return `session:${token}`;
}

export async function GET(request) {
  // Check if Redis client is available (fail fast if not)
  if (!redis) {
    return Response.json(
      { success: false, message: "Redis client not initialized" },
      { status: 500 }
    );
  }

  // Parse cookies from header (robustly handle = in values)
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map(c => {
        const index = c.indexOf("=");
        if (index < 0) return [];
        return [c.slice(0, index).trim(), c.slice(index + 1).trim()];
      })
      .filter(parts => parts.length === 2)
  );

  const sessionToken = cookies.session;

  if (!sessionToken) {
    return Response.json(
      { success: false, message: "No session cookie found" },
      { status: 401 }
    );
  }

  try {
    const email = await redis.get(getSessionKey(sessionToken));

    if (!email) {
      return Response.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 }
      );
    }

    return Response.json({ success: true, email }, { status: 200 });
  } catch (err) {
    console.error("Redis error:", err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}