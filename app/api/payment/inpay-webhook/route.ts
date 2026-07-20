import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { order_id, amount, status, description } = data

    if (!order_id || !amount || !status) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 })
    }

    const merchantId = process.env.INPAY_MERCHANT_ID
    const merchantToken = process.env.INPAY_MERCHANT_TOKEN

    if (!merchantId || !merchantToken) {
      console.error("🔴 inPAY configuration keys are missing in .env!")
      return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 })
    }

    // 1. Authorize with inPAY to get Bearer Token
    const authUrl = `https://inpay.uz/api/v1/authorization/?merchant_id=${merchantId}&merchant_token=${merchantToken}`
    const authResponse = await fetch(authUrl, { cache: "no-store" })
    const authData = await authResponse.json()

    if (!authData.success || !authData.bearer_token) {
      console.warn("⚠️ Webhook: Failed to authorize with inPAY API")
      return NextResponse.json({ ok: false, error: "Authentication failed" }, { status: 401 })
    }

    const bearerToken = authData.bearer_token

    // 2. Fetch the transaction status directly from the inPAY REST API to verify authenticity
    const txUrl = `https://inpay.uz/api/v1/transactions/?order_id=${order_id}`
    const txResponse = await fetch(txUrl, {
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    })

    const txData = await txResponse.json()

    if (!txData.success || txData.status !== "success") {
      console.warn(`⚠️ Webhook: Transaction verification failed or not success for order_id: ${order_id}`)
      return NextResponse.json({ ok: false, error: "Transaction verification failed" }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ ok: false, error: "Database not initialized" }, { status: 500 })
    }

    // 3. Fetch the corresponding payment record from Firestore
    const paymentsRef = adminDb.collection("payments")
    const snapshot = await paymentsRef.where("inpayOrderId", "==", order_id).limit(1).get()

    if (snapshot.empty) {
      console.warn(`⚠️ Payment order ${order_id} not found in Firestore`)
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 })
    }

    const paymentDoc = snapshot.docs[0]
    const paymentData = paymentDoc.data()

    // 4. Update payment status if it is pending
    if (paymentData.status === "pending") {
      await paymentDoc.ref.update({
        status: "success",
        updatedAt: new Date(),
      })

      // 5. Send Telegram Bot notification if credentials are provided
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID

      if (botToken && adminChatId) {
        const messageText = `✅ <b>Yangi To'lov Qabul Qilindi! (inPAY)</b>\n\n` +
          `👤 <b>O'yinchi:</b> <code>${paymentData.username}</code>\n` +
          `📦 <b>Mahsulot:</b> <code>${paymentData.productId}</code>\n` +
          `💰 <b>Summa:</b> <code>${parseFloat(amount).toLocaleString()} UZS</code>\n` +
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
