import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    message: "NeoTerra inPAY Webhook Handler. Send a POST request with payload to verify payments." 
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("📥 inPAY Webhook received payload:", JSON.stringify(data))

    const orderId = data.order_id || data.orderId || data.id
    const amount = data.amount || data.price
    const rawStatus = String(data.status || "").toLowerCase()

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing order_id" }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ ok: false, error: "Database not initialized" }, { status: 500 })
    }

    // 1. Fetch the corresponding payment record from Firestore
    const paymentsRef = adminDb.collection("payments")
    const snapshot = await paymentsRef.where("inpayOrderId", "==", String(orderId)).limit(1).get()

    if (snapshot.empty) {
      console.warn(`⚠️ Payment order ${orderId} not found in Firestore`)
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 })
    }

    const paymentDoc = snapshot.docs[0]
    const paymentData = paymentDoc.data()

    // 2. Update payment status if it is pending
    if (paymentData.status === "pending") {
      const isSuccessStatus = ["success", "paid", "completed", "1", "true", "ok"].includes(rawStatus) || !rawStatus

      if (isSuccessStatus) {
        await paymentDoc.ref.update({
          status: "success",
          updatedAt: new Date(),
        })

        // If it is a balance topup, increment the user's balance
        if (paymentData.productId === "balance_topup" && paymentData.userUid) {
          const userRef = adminDb.collection("users").doc(paymentData.userUid)
          await userRef.update({
            balance: FieldValue.increment(Number(paymentData.amount || amount || 0)),
            updatedAt: FieldValue.serverTimestamp(),
          })
          console.log(`✅ User ${paymentData.userUid} balance incremented by ${paymentData.amount}`)
        }

        // 3. Send User Telegram notification if telegramChatId is linked
        if (botToken && paymentData.userUid) {
          try {
            const userDoc = await adminDb.collection("users").doc(paymentData.userUid).get()
            const uData = userDoc.data()
            if (uData && uData.telegramChatId) {
              const userMsg = 
                `💰 <b>BALANSINGIZ MUVAFFAQIYATLI TO'LDIRILDI!</b>\n\n` +
                `💳 <b>To'ldirilgan summa:</b> <code>${Number(paymentData.amount || amount || 0).toLocaleString()} UZS</code>\n` +
                `💵 <b>Joriy balans:</b> <code>${Number(uData.balance || 0).toLocaleString()} UZS</code>\n\n` +
                `<i>Rahmat! Donatlarni sotib olishingiz mumkin! 🛒</i>`

              fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: uData.telegramChatId,
                  text: userMsg,
                  parse_mode: "HTML",
                }),
              }).catch(e => console.error("User TG topup notify err:", e))
            }
          } catch (e) {
            console.error("User fetch for TG notify err:", e)
          }
        }

        // 4. Send Admin Telegram Bot notification
        if (botToken && adminChatId) {
          let messageText = ""
          if (paymentData.productId === "balance_topup") {
            messageText = `💰 <b>Balans To'ldirildi! (inPAY)</b>\n\n` +
              `👤 <b>Foydalanuvchi:</b> <code>${paymentData.username || "—"}</code>\n` +
              `🆔 <b>Foydalanuvchi ID:</b> <code>${paymentData.userUid}</code>\n` +
              `💰 <b>Summa:</b> <code>${Number(paymentData.amount).toLocaleString()} UZS</code>\n` +
              `🆔 <b>Order:</b> <code>${orderId}</code>`
          } else {
            messageText = `✅ <b>Yangi To'lov Qabul Qilindi! (inPAY)</b>\n\n` +
              `👤 <b>O'yinchi:</b> <code>${paymentData.username || "—"}</code>\n` +
              `📦 <b>Mahsulot:</b> <code>${paymentData.productId}</code>\n` +
              `💰 <b>Summa:</b> <code>${Number(paymentData.amount).toLocaleString()} UZS</code>\n` +
              `🆔 <b>Order:</b> <code>${orderId}</code>`
          }

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
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("🔴 inPAY webhook handler error:", error)
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
