import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const data = await request.json()
    const { code, playerUuid, playerName, serverId } = data

    if (!code || !playerUuid || !playerName || !serverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 })
    }

    // Validate server exists
    const serverDoc = await adminDb.collection("servers").doc(serverId).get()
    if (!serverDoc.exists) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    // Verify HMAC signature from plugin
    const serverData = serverDoc.data()
    const secretKey = serverData?.secretKey || ""
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
      // Also check X-Signature for HMAC auth
      const xSignature = request.headers.get("X-Signature")
      const xServerId = request.headers.get("X-Server-ID")
      if (!xSignature || xServerId !== serverId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Store the link code in Firestore with expiry
    const linkRef = adminDb.collection("link_codes").doc(code)
    await linkRef.set({
      code,
      playerUuid,
      playerName,
      serverId,
      used: false,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    })

    return NextResponse.json({ success: true, message: "Link code stored" })
  } catch (error: any) {
    console.error("Server link API error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
