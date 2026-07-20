import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

function validateAuth(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const serverKey = process.env.SERVER_API_KEY || "NEOTERRA_DEFAULT_SECRET_KEY"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.substring(7)
  return token === serverKey
}

export async function GET(request: Request) {
  try {
    if (!validateAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const commandsRef = adminDb.collection("commands_queue")
    const snapshot = await commandsRef.where("status", "==", "pending").limit(50).get()

    const commands = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        command: data.command,
        username: data.username,
        userUid: data.userUid || null,
        productId: data.productId || null,
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      }
    })

    return NextResponse.json({ success: true, commands })
  } catch (error: any) {
    console.error("🔴 Server command fetch error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
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
    const { id, status } = data

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    if (status !== "executed" && status !== "failed") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const commandDocRef = adminDb.collection("commands_queue").doc(id)
    const doc = await commandDocRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Command not found" }, { status: 404 })
    }

    await commandDocRef.update({
      status: status,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, message: `Command status updated to ${status}` })
  } catch (error: any) {
    console.error("🔴 Server command update error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
