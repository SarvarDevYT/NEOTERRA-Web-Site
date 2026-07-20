import { NextResponse } from "next/server"
import crypto from "crypto"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { order_id, amount, status, signature, description } = data

    if (!order_id || !amount || !status || !signature) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 })
    }

    const salt = process.env.INPAY_SALT
    if (!salt) {
      console.error("🔴 INPAY_SALT is missing in environment variables!")
      return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 })
    }

    // 1. Verify inPAY SHA-256 Signature
    // Format: sha256(order_id + amount + status + SALT)
    const expectedSignature = crypto
      .createHash("sha256")
      .update(`${order_id}${amount}${status}${salt}`)
      .digest("hex")

    if (expectedSignature !== signature) {
      console.warn("⚠️ Invalid signature received from inPAY webhook")
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 403 })
    }

    if (!adminDb) {
      return NextResponse.json({ ok: false, error: "Database not initialized" }, { status: 500 })
    }

    // 2. Fetch the corresponding payment record from Firestore
    const paymentsRef = adminDb.collection("payments")
    const snapshot = await paymentsRef.where("inpayOrderId", "==", order_id).limit(1).get()

    if (snapshot.empty) {
      console.warn(`⚠️ Payment order ${order_id} not found in Firestore`)
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 })
    }

    const paymentDoc = snapshot.docs[0]
    const paymentData = paymentDoc.data()

    // 3. Update payment status if it is pending and status is success
    if (paymentData.status === "pending") {
      await paymentDoc.ref.update({
        status: status,
        updatedAt: new Date(),
      })

      // 4. Send Telegram Bot notification if credentials are provided
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID

      if (botToken && adminChatId && status === "success") {
        const messageText = `✅ <b>Yangi To'lov Qabul Qilindi! (inPAY)</b>\n\n` +
          `👤 <b>O'yinchi:</b> <code>${paymentData.username}</code>\n` +
          `📦 <b>Mahsulot:</b> <code>${paymentData.productId}</code>\n` +
          `💰 <b>Summa:</b> <code>${amount.toLocaleString()} UZS</code>\n` +
          `🆔 <b>Order:</b> <code>${order_id}</code>\n` +
          `📝 <b>Izoh:</b> <code>${description || paymentData.description}</code>`

        const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
        try {
          await fetch(tgUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: adminChatId,
              text: messageText,
              parse_mode: "HTML",
            }),
          })
        } catch (tgError) {
          console.error("🔴 Telegram admin notification failed:", tgError)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("🔴 inPAY webhook handler error:", error)
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
