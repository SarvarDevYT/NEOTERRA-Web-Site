import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const data = await request.json()
    const { userUid, action } = data

    if (!userUid || !action) {
      return NextResponse.json({ error: "Missing userUid or action" }, { status: 400 })
    }

    if (action !== "kick" && action !== "tempban") {
      return NextResponse.json({ error: "Invalid action. Must be 'kick' or 'tempban'" }, { status: 400 })
    }

    // Get user profile to find linked Minecraft username
    const userDoc = await adminDb.collection("users").doc(userUid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    const minecraftUsername = userData?.minecraftUsername
    const linkedServerId = userData?.linkedServerId

    if (!minecraftUsername) {
      return NextResponse.json({ error: "No Minecraft account linked" }, { status: 400 })
    }

    // Generate the appropriate command
    let command: string
    if (action === "kick") {
      command = `kick ${minecraftUsername} Sayt orqali chiqarildi`
    } else {
      command = `tempban ${minecraftUsername} 30m Sayt orqali 30 daqiqalik ban`
    }

    // Write to commands_queue for the linked server
    const queueRef = adminDb.collection("commands_queue")
    await queueRef.add({
      command,
      username: minecraftUsername,
      userUid,
      serverId: linkedServerId || "",
      productId: `self_${action}`,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ 
      success: true, 
      message: action === "kick" 
        ? "O'yinchi serverdan chiqarildi" 
        : "O'yinchiga 30 daqiqalik ban berildi" 
    })
  } catch (error: any) {
    console.error("Server player API error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
