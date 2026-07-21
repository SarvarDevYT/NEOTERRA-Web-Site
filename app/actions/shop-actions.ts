"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

function generateMinecraftCommands(product: any, username: string, qty: string = "1"): string[] {
  // If product has a custom command defined by admin, use it
  if (product.command && typeof product.command === "string" && product.command.trim()) {
    const lines = product.command.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0)
    return lines.map((cmd: string) =>
      cmd.replace(/{username}/g, username)
         .replace(/{qty}/g, qty)
         .replace(/{product}/g, product.id)
    )
  }

  // Legacy fallback: if no command field, guess based on category
  const category = (product.category || "").toUpperCase()
  const pId = product.id.toLowerCase()

  if (category === "RANKLAR") {
    return [`lp user ${username} parent add ${pId}`]
  } else if (category === "KEYS-LAR") {
    return [`crate give to ${username} ${pId} ${qty}`]
  } else if (category === "VALYUTA") {
    const qtyVal = parseInt(qty) || parseInt(product.name.replace(/[^0-9]/g, "")) || 1000
    return [`eco give ${username} ${qtyVal}`]
  } else if (category === "UNBAN/UNMUTE") {
    if (pId.includes("mute")) {
      return [`unmute ${username}`]
    }
    return [`unban ${username}`]
  }

  return [`say ${username} bought ${product.name}`]
}

export async function purchaseProductWithBalanceAction(
  productId: string,
  userUid: string,
  username: string,
  tokenQty?: string
) {
  if (!adminDb) {
    return { success: false, message: "Database not configured!" }
  }

  try {
    const userRef = adminDb.collection("users").doc(userUid)
    const productRef = adminDb.collection("products").doc(productId)

    const result = await adminDb.runTransaction(async (transaction) => {
      // 1. Fetch user profile
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists) {
        throw new Error("User profile not found!")
      }
      const userData = userDoc.data() || {}
      const userBalance = userData.balance !== undefined ? Number(userData.balance) : 0

      // 2. Fetch product
      const productDoc = await transaction.get(productRef)
      if (!productDoc.exists) {
        throw new Error("Product not found!")
      }
      const productData = productDoc.data() || {}
      productData.id = productDoc.id

      // 3. Calculate price
      let price = 0
      const rawPrice = productData.price || "0"
      if (productData.type === "token") {
        const pricePerToken = parseInt(rawPrice.replace(/[^0-9]/g, "")) || 50
        const qty = parseInt(tokenQty || "1") || 1
        price = pricePerToken * qty
      } else {
        price = parseInt(rawPrice.replace(/[^0-9]/g, "")) || 1000
      }

      // 4. Validate balance
      if (userBalance < price) {
        throw new Error("Balansingizda yetarli mablag' mavjud emas!")
      }

      // 5. Generate delivery commands
      const commands = generateMinecraftCommands(productData, username, tokenQty)

      // 6. Deduct balance
      transaction.update(userRef, {
        balance: FieldValue.increment(-price),
        updatedAt: FieldValue.serverTimestamp(),
      })

      // 7. Write to command_queue
      let targetServerId = productData.serverId || ""
      if (!targetServerId) {
        const activeServersSnap = await adminDb!.collection("servers").where("isActive", "==", true).limit(1).get()
        if (!activeServersSnap.empty) {
          targetServerId = activeServersSnap.docs[0].id
        }
      }

      const queueRef = adminDb!.collection("commands_queue")
      for (const cmd of commands) {
        const commandDocRef = queueRef.doc()
        transaction.set(commandDocRef, {
          id: commandDocRef.id,
          command: cmd,
          username: username,
          userUid: userUid,
          productId: productId,
          serverId: targetServerId,
          amount: price,
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }

      return { success: true, price, userDocData: userData, productName: productData.name }
    })

    // Send Telegram Notification to user if they have linked Telegram account
    if (result.success && result.userDocData?.telegramChatId) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (botToken) {
        const userTgMessage = 
          `🎉 <b>XARID QILINGAN DONAT MUVAFFAQIYATLI FAOLLASHTIRILDI!</b>\n\n` +
          `📦 <b>Mahsulot:</b> <code>${result.productName}</code>\n` +
          `💰 <b>Sarf qilingan summa:</b> <code>${result.price.toLocaleString()} UZS</code>\n` +
          `🎮 <b>Minecraft Nik:</b> <code>${username}</code>\n` +
          `⏰ <b>Sana:</b> <code>${new Date().toLocaleString("uz-UZ")}</code>\n\n` +
          `<i>Rahmat! Serverda yaxshi o'yin tilaymiz! 🎮</i>`

        try {
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: result.userDocData.telegramChatId,
              text: userTgMessage,
              parse_mode: "HTML",
            }),
          }).catch(err => console.error("User Telegram notification fetch err:", err))
        } catch (e) {
          console.error("User Telegram notification err:", e)
        }
      }
    }

    return {
      success: true,
      message: "Xarid muvaffaqiyatli amalga oshirildi!",
      price: result.price,
    }
  } catch (error: any) {
    console.error("Purchase transaction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}
