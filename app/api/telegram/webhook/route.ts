import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "📊 Server Onlayn" }, { text: "👤 Mening Profilim" }],
    [{ text: "🛒 Donat Do'koni" }, { text: "💬 Yordam & Aloqa" }]
  ],
  resize_keyboard: true,
  is_persistent: true,
}

const INLINE_SHOP_KEYBOARD = {
  inline_keyboard: [
    [{ text: "🛒 Do'konga o'tish (Sayt)", url: "https://site.neoterra.uz/shop" }],
    [{ text: "⚙️ Profil Sozlamalari", url: "https://site.neoterra.uz/settings" }]
  ]
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
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
        reply_markup: replyMarkup || MAIN_KEYBOARD,
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
    
    // Handle message update or callback query
    const message = body.message || body.edited_message
    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const { chat, text, from } = message
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
      const tgUsername = from.username ? `@${from.username}` : (from.first_name || "Foydalanuvchi")

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
          `👤 <b>Telegram Akkaunt:</b> <code>${tgUsername}</code>\n\n` +
          `Endi xaridlaringiz va donat cheklaringiz to'g'ridan-to'g'ri shu botga keladi. Sayt sozlamalari sahifasiga qaytib ulanishni tekshirishingiz mumkin.`,
          INLINE_SHOP_KEYBOARD
        )
      } catch (err: any) {
        console.error("Firebase update err in telegram link:", err)
        await sendTelegramMessage(chatId, "⚠️ Ulanishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.")
      }
      return NextResponse.json({ ok: true })
    }

    // 2. Standard Commands and Keyboard Buttons
    if (messageText === "/start" || messageText === "/menu") {
      await sendTelegramMessage(chatId,
        `👋 <b>Salom, ${from.first_name || "O'yinchi"}! NeoTerra Minecraft serverining rasmiy botiga xush kelibsiz!</b>\n\n` +
        `🎮 <b>IP Manzil:</b> <code>mc.neoterra.uz</code>\n` +
        `🌐 <b>Rasmiy Sayt:</b> <a href="https://site.neoterra.uz">site.neoterra.uz</a>\n` +
        `🛒 <b>Donat Do'koni:</b> <a href="https://site.neoterra.uz/shop">site.neoterra.uz/shop</a>\n\n` +
        `Quydagi menyu tugmalari orqali kerakli bo'limni tanlang:`,
        MAIN_KEYBOARD
      )
    } 
    else if (messageText === "📊 Server Onlayn" || messageText === "/online") {
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
    else if (messageText === "👤 Mening Profilim" || messageText === "/profile") {
      const usersRef = adminDb.collection("users")
      const snapshot = await usersRef.where("telegramChatId", "==", chatId).limit(1).get()

      if (snapshot.empty) {
        await sendTelegramMessage(chatId,
          `⚠️ <b>Profil topilmadi!</b>\n\n` +
          `Sizning Telegram akkauntingiz hali sayt profiliga bog'lanmagan.\n\n` +
          `Bog'lash uchun saytdagi <b>Sozlamalar</b> sahifasiga kiring va <b>"Telegram akkauntini bog'lash"</b> tugmasini bosing.`,
          INLINE_SHOP_KEYBOARD
        )
      } else {
        const userDoc = snapshot.docs[0]
        const userData = userDoc.data()
        const balance = userData.balance !== undefined ? Number(userData.balance) : 0
        const nick = userData.minecraftUsername || "<i>Bog'lanmagan</i>"
        const email = userData.email || docIdShort(userDoc.id)

        await sendTelegramMessage(chatId,
          `👤 <b>Sizning Profilingiz:</b>\n\n` +
          `🆔 <b>Donat ID:</b> <code>${userDoc.id}</code>\n` +
          `✉️ <b>Email:</b> <code>${email}</code>\n` +
          `🎮 <b>Minecraft Nik:</b> <code>${nick}</code>\n` +
          `👑 <b>Rol:</b> <code>${(userData.role || "user").toUpperCase()}</code>\n` +
          `💰 <b>Balans:</b> <code>${balance.toLocaleString()} UZS</code>`,
          INLINE_SHOP_KEYBOARD
        )
      }
    }
    else if (messageText === "🛒 Donat Do'koni" || messageText === "/shop") {
      await sendTelegramMessage(chatId,
        `🛒 <b>NeoTerra Donat Do'koni:</b>\n\n` +
        `Vip, Legend, Keys, Tangalar va Unban xizmatlarini rasmiy saytimiz orqali zudlik bilan xarid qilishingiz mumkin!\n\n` +
        `🔗 <b>Havola:</b> <a href="https://site.neoterra.uz/shop">https://site.neoterra.uz/shop</a>`,
        INLINE_SHOP_KEYBOARD
      )
    }
    else if (messageText === "💬 Yordam & Aloqa" || messageText === "/help") {
      await sendTelegramMessage(chatId,
        `💬 <b>Qo'llab-quvvatlash Xizmati:</b>\n\n` +
        `Savollaringiz yoki to'lov bo'yicha muammolar bo'lsa rasmiy qo'llab-quvvatlash xizmati bilan bog'laning:\n\n` +
        `📢 <b>Rasmiy Kanal:</b> @NeoTerraUz\n` +
        `👨‍💻 <b>Admin:</b> @SarvarDevYT\n` +
        `🌐 <b>Sayt:</b> <a href="https://site.neoterra.uz">site.neoterra.uz</a>`
      )
    }
    else {
      await sendTelegramMessage(chatId, "❓ Kerakli bo'limni tanlash uchun pastdagi menyu tugmalaridan foydalaning.")
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("🔴 Telegram webhook handler error:", error)
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}

function docIdShort(id: string) {
  return id.length > 12 ? id.substring(0, 10) + "..." : id
}
