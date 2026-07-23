"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { revalidatePath } from "next/cache"
import { sendTelegramAdminNotificationAction } from "./telegram"

export interface BanAppeal {
  id: string
  username: string
  userUid?: string
  reason: string
  appealText: string
  status: "pending" | "approved" | "rejected"
  createdAt?: string
}

export async function getBanAppealsAction(): Promise<BanAppeal[]> {
  if (!adminDb) return []

  try {
    const snapshot = await adminDb.collection("ban_appeals")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        username: data.username,
        userUid: data.userUid || null,
        reason: data.reason || "",
        appealText: data.appealText || "",
        status: data.status || "pending",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      }
    })
  } catch (error: any) {
    console.error("getBanAppealsAction error:", error)
    return []
  }
}

export async function submitBanAppealAction(username: string, reason: string, appealText: string, userUid?: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  const cleanUser = username.trim()
  const cleanReason = reason.trim()
  const cleanText = appealText.trim()

  if (!cleanUser || !cleanText) {
    return { success: false, message: "O'yinchi niki va apellyatsiya matnini kiriting!" }
  }

  try {
    const docRef = await adminDb.collection("ban_appeals").add({
      username: cleanUser,
      userUid: userUid || "",
      reason: cleanReason,
      appealText: cleanText,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    })

    // Send Telegram Notification to staff chat!
    sendTelegramAdminNotificationAction(
      `🔨 <b>YANGI BAN APELLIYATSIYASI!</b>\n\n` +
      `👤 <b>O'yinchi:</b> <code>${cleanUser}</code>\n` +
      `❓ <b>Ban sababi:</b> ${cleanReason || "Ko'rsatilmagan"}\n` +
      `📜 <b>Tushuntirish:</b>\n<i>${cleanText}</i>\n\n` +
      `<i>Admin panelda tasdiqlashingiz yoki rad etishingiz mumkin!</i>`
    ).catch(() => {})

    revalidatePath("/bans")
    revalidatePath("/admin/dashboard/appeals")

    return { success: true, message: "Apellyasiya arizangiz yuborildi! Adminlar ko'rib chiqishadi." }
  } catch (error: any) {
    console.error("submitBanAppealAction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}

export async function updateAppealStatusAction(id: string, status: "approved" | "rejected") {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  try {
    const appealRef = adminDb.collection("ban_appeals").doc(id)
    const doc = await appealRef.get()

    if (!doc.exists) return { success: false, message: "Ariza topilmadi!" }

    const data = doc.data()!
    await appealRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    })

    // If approved, send unban command to server command queue!
    if (status === "approved" && data.username) {
      await adminDb.collection("commands_queue").add({
        command: `unban ${data.username}`,
        username: data.username,
        serverId: "",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      })
    }

    revalidatePath("/admin/dashboard/appeals")
    revalidatePath("/bans")

    return { 
      success: true, 
      message: status === "approved" ? `Ariza tasdiqlandi va "${data.username}" unban qilindi!` : "Ariza rad etildi!" 
    }
  } catch (error: any) {
    console.error("updateAppealStatusAction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}
