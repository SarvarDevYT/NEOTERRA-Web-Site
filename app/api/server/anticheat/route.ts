import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const secretKey = process.env.SERVER_API_KEY || "neoterra2026Nsarvar2010Sneoterrateamuz"

    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.replace("Bearer ", "").trim() !== secretKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { username, uuid, checkName, category, violations, serverId, serverName, riskLevel, eventType } = body

    if (!username || !checkName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 })
    }

    const timestamp = Date.now()

    // 1. Add log to anticheat_logs collection
    await adminDb.collection("anticheat_logs").add({
      username,
      uuid: uuid || "",
      checkName,
      category: category || "COMBAT",
      violations: violations || 1,
      serverId: serverId || "main",
      serverName: serverName || "Server",
      riskLevel: riskLevel || "low",
      eventType: eventType || "detection",
      timestamp,
      createdAt: new Date(),
    })

    // Auto-register/sync server to 'servers' collection if provided
    if (serverId && serverName) {
      const serverRef = adminDb.collection("servers").doc(serverId)
      const sDoc = await serverRef.get()
      if (!sDoc.exists) {
        await serverRef.set({
          name: serverName,
          displayName: serverName,
          order: 0,
          isActive: true,
          createdAt: new Date(),
        })
      }
    }

    // 2. Update or set suspect summary in anticheat_suspects
    const suspectRef = adminDb.collection("anticheat_suspects").doc(username.toLowerCase())
    const suspectDoc = await suspectRef.get()

    if (suspectDoc.exists) {
      const data = suspectDoc.data()!
      const currentViolations = (data.totalViolations || 0) + (violations || 1)
      let newRisk = data.riskLevel || "low"
      
      if (currentViolations >= 20 || riskLevel === "critical") {
        newRisk = "critical"
      } else if (currentViolations >= 10 || riskLevel === "high") {
        newRisk = "high"
      } else if (currentViolations >= 5 || riskLevel === "medium") {
        newRisk = "medium"
      }

      await suspectRef.update({
        totalViolations: currentViolations,
        lastCheckName: checkName,
        lastCategory: category,
        riskLevel: newRisk,
        lastDetectedAt: timestamp,
        updatedAt: new Date(),
      })
    } else {
      await suspectRef.set({
        username,
        uuid: uuid || "",
        totalViolations: violations || 1,
        lastCheckName: checkName,
        lastCategory: category,
        riskLevel: riskLevel || "low",
        lastDetectedAt: timestamp,
        createdAt: new Date(),
      })
    }

    return NextResponse.json({ success: true, message: "Anticheat event logged" })
  } catch (error: any) {
    console.error("Anticheat API Error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ logs: [], stats: {} })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const logsSnapshot = await adminDb
      .collection("anticheat_logs")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get()

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Get total counts
    const suspectsSnapshot = await adminDb.collection("anticheat_suspects").get()
    const totalSuspects = suspectsSnapshot.size
    
    let criticalCount = 0
    let highCount = 0
    let mediumCount = 0
    let lowCount = 0

    suspectsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.riskLevel === "critical") criticalCount++
      else if (data.riskLevel === "high") highCount++
      else if (data.riskLevel === "medium") mediumCount++
      else lowCount++
    })

    return NextResponse.json({
      logs,
      stats: {
        totalDetections: logsSnapshot.size,
        totalSuspects,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error fetching anticheat data" }, { status: 500 })
  }
}
