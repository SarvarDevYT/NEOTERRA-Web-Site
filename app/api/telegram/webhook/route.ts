import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    })
  } catch (error) {
    console.error("sendTelegramMessage error:", error)
  }
}

async function getMinecraftServerStatus() {
  try {
    const res = await fetch("https://api.mcsrvstat.us/3/mc.neoterra.uz", { next: { revalidate: 30 } })
    const data = await res.json()
    if (data.online) {
      return {
        online: true,
        players: data.players?.online || 0,
        maxPlayers: data.players?.max || 100,
        version: data.version || "1.20+",
      }
    }
    return { online: false }
  } catch (error) {
    return { online: false }
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "NeoTerra Telegram Bot Webhook. Send POST updates from Telegram here."
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Check if it is a standard message update
    if (!body.message) {
      return NextResponse.json({ ok: true })
    }

    const { chat, text, from } = body.message
    const chatId = chat.id
    const messageText = (text || "").trim()

    if (!messageText) {
      return NextResponse.json({ ok: true })
    }

    if (!adminDb) {
      await sendTelegramMessage(chatId, "⚠️ Tizim xatoligi: Baza ulanmagan.")
      return NextResponse.json({ ok: true })
    }

    // 1. Check for account linking: /start link_USER_UID
    if (messageText.startsWith("/start link_")) {
      const userUid = messageText.replace("/start link_", "").trim()
      const tgUsername = from.username ? `@${from.username}` : from.first_name

      try {
        const userRef = adminDb.collection("users").doc(userUid)
        const userDoc = await userRef.get()

        if (!userDoc.exists) {
          await sendTelegramMessage(chatId, "❌ <b>Xatolik:</b> Saytdagi profil topilmadi!")
          return NextResponse.json({ ok: true })
        }

        // Link the telegram account details
        await userRef.update({
          telegramUsername: tgUsername,
          telegramChatId: chatId,
          updatedAt: new Date(),
        })

        await sendTelegramMessage(chatId, 
          `✅ <b>Muvaffaqiyatli bog'landi!</b>\n\n` +
          `👤 <b>Telegram Akkaunt:</b> <code>${tgUsername}</code>\n` +
          `Sayt sozlamalari sahifasiga qaytib, ulanishni tekshirishingiz mumkin.`
        )
      } catch (err: any) {
        console.error("Firebase update err in telegram link:", err)
        await sendTelegramMessage(chatId, "⚠️ Ulanishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.")
      }
      return NextResponse.json({ ok: true })
    }

    // 2. Standard Commands
    if (messageText === "/start") {
      await sendTelegramMessage(chatId,
        `👋 <b>Salom! NeoTerra serverining rasmiy botiga xush kelibsiz!</b>\n\n` +
        `🎮 <b>IP Manzil:</b> <code>mc.neoterra.uz</code>\n` +
        `🌐 <b>Sayt:</b> <a href="https://site.neoterra.uz">site.neoterra.uz</a>\n` +
        `🛒 <b>Do'kon:</b> <a href="https://site.neoterra.uz/shop">site.neoterra.uz/shop</a>\n\n` +
        `🤖 <b>Buyruqlar:</b>\n` +
        `▫️ /online - Server onlayn statusi va o'yinchilar soni\n` +
        `▫️ /profile - Sayt balansi va ma'lumotlarni ko'rish\n` +
        `▫️ /shop - Sayt do'koni havolasi\n` +
        `▫️ /help - Buyruqlar haqida yordam`
      )
    } 
    else if (messageText === "/help") {
      await sendTelegramMessage(chatId,
        `🤖 <b>Bot Buyruqlari:</b>\n\n` +
        `▫️ /start - Bot haqida ma'lumot va boshlash\n` +
        `▫️ /online - Serverda hozir nechta o'yinchi borligini bilish\n` +
        `▫️ /profile - Profil sozlamalari va balansingiz\n` +
        `▫️ /shop - Donat do'koni havolasi`
      )
    }
    else if (messageText === "/shop") {
      await sendTelegramMessage(chatId,
        `🛒 <b>NeoTerra Donat Do'koni:</b>\n\n` +
        `Sayt orqali donatlarni sotib oling:\n` +
        `🔗 <a href="https://site.neoterra.uz/shop">https://site.neoterra.uz/shop</a>`
      )
    }
    else if (messageText === "/online") {
      await sendTelegramMessage(chatId, "🔍 <i>Server holati tekshirilmoqda...</i>")
      const status = await getMinecraftServerStatus()
      if (status.online) {
        await sendTelegramMessage(chatId,
          `🟢 <b>Server Onlayn!</b>\n\n` +
          `🎮 <b>O'yinchilar:</b> <code>${status.players} / ${status.maxPlayers}</code>\n` +
          `📦 <b>Versiya:</b> <code>${status.version}</code>\n` +
          `🌐 <b>IP Manzil:</b> <code>mc.neoterra.uz</code>`
        )
      } else {
        await sendTelegramMessage(chatId,
          `🔴 <b>Server Texnik Ishlar Tufayli O'chiq!</b>\n\n` +
          `Iltimos, birozdan so'ng qayta urinib ko'ring.`
        )
      }
    }
    else if (messageText === "/profile") {
      // Query if this chatId is linked to any profile
      const usersRef = adminDb.collection("users")
      const snapshot = await usersRef.where("telegramChatId", "==", chatId).limit(1).get()

      if (snapshot.empty) {
        await sendTelegramMessage(chatId,
          `⚠️ <b>Profil topilmadi!</b>\n\n` +
          `Sizning Telegram akkauntingiz hali sayt profiliga bog'lanmagan.\n` +
          `Bog'lash uchun saytdagi <b>Sozlamalar</b> sahifasiga kiring va "Telegram akkauntini bog'lash" tugmasini bosing.`
        )
      } else {
        const userDoc = snapshot.docs[0]
        const userData = userDoc.data()
        const balance = userData.balance !== undefined ? Number(userData.balance) : 0
        const nick = userData.minecraftUsername || "<i>Bog'lanmagan</i>"
        const email = userData.email || "<i>Kiritilmagan</i>"

        await sendTelegramMessage(chatId,
          `👤 <b>Sizning Profilingiz:</b>\n\n` +
          `🆔 <b>Donat ID:</b> <code>${userDoc.id}</code>\n` +
          `✉️ <b>Email:</b> <code>${email}</code>\n` +
          `🎮 <b>Minecraft Nik:</b> <code>${nick}</code>\n` +
          `💰 <b>Balans:</b> <code>${balance.toLocaleString()} UZS</code>`
        )
      }
    }
    else {
      await sendTelegramMessage(chatId, "❓ Noma'lum buyruq. Barcha buyruqlar uchun /help yozing.")
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("🔴 Telegram webhook handler error:", error)
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
