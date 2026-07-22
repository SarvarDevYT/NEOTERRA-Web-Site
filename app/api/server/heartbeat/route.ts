import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const secretKey = process.env.SERVER_API_KEY || "neoterra2026Nsarvar2010Sneoterrateamuz";

    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.replace("Bearer ", "").trim() !== secretKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serverId, serverName, motd, onlinePlayers, maxPlayers, version } = body;

    if (!serverId) {
      return NextResponse.json({ error: "serverId is required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const now = new Date();
    const serverRef = adminDb.collection("servers").doc(serverId);

    await serverRef.set(
      {
        id: serverId,
        name: serverName || serverId,
        displayName: serverName || serverId,
        motd: motd || "NeoTerra Minecraft Server",
        onlinePlayers: onlinePlayers || 0,
        maxPlayers: maxPlayers || 100,
        version: version || "1.21.3",
        status: "online",
        lastPing: now.toISOString(),
        lastPingTimestamp: Date.now(),
        isActive: true,
        updatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: `Server ${serverId} heartbeat recorded successfully!`,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Heartbeat API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
