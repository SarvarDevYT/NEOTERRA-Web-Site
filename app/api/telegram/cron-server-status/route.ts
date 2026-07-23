import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { sendTelegramAdminNotificationAction } from "@/app/actions/telegram"

export async function GET(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 })
    }

    const snapshot = await adminDb.collection("servers").get()
    const now = Date.now()

    let totalOnline = 0
    let totalMax = 0
    const serverLines: string[] = []

    if (snapshot.empty) {
      serverLines.push("⚠️ <i>Hozircha bazada serverlar ro'yxatdan o'tmagan.</i>")
    } else {
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const lastPing = data.lastPingTimestamp || 0
        // Consider server online if last heartbeat was within last 3 minutes (180,000 ms)
        const isOnline = data.status === "online" && (now - lastPing < 180000)

        const name = data.displayName || data.name || doc.id
        const online = Number(data.onlinePlayers || 0)
        const max = Number(data.maxPlayers || 100)

        if (isOnline) {
          totalOnline += online
          totalMax += max
          serverLines.push(`🟢 <b>${name}:</b> <code>${online}/${max}</code> (Online)`)
        } else {
          serverLines.push(`🔴 <b>${name}:</b> <i>Offline</i>`)
        }
      })
    }

    const timeStr = new Date().toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

    const reportText = [
      `📊 <b>NEOTERRA SERVER STATISTIKASI (30 DAQIQALIK HISOBOT)</b>`,
      ``,
      `🎮 <b>Jami Onlayn O'yinchilar:</b> <code>${totalOnline} / ${totalMax}</code>`,
      ``,
      `🖥️ <b>Serverlar Holati:</b>`,
      ...serverLines,
      ``,
      `📅 <i>Vaqt: ${timeStr}</i>`,
      `🌐 <i>Sayt: <a href="https://site.neoterra.uz">site.neoterra.uz</a></i>`,
    ].join("\n")

    const res = await sendTelegramAdminNotificationAction(reportText)

    return NextResponse.json({
      success: true,
      message: "Server status report sent to Telegram staff chat!",
      telegramResult: res,
      report: reportText,
    })
  } catch (error: any) {
    console.error("cron-server-status error:", error)
    return NextResponse.json({ error: error.message || "Cron error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
