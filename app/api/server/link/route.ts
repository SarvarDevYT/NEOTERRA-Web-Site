import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

function validateAuth(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const serverKey = process.env.SERVER_API_KEY || "NEOTERRA_DEFAULT_SECRET_KEY"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.substring(7)
  return token === serverKey
}

export async function POST(request: Request) {
  try {
    if (!validateAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
