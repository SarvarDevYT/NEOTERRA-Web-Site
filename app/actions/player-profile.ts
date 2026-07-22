"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function updateMinecraftUsername(uid: string, username: string) {
  if (!uid || !username) {
    return { success: false, message: "Ma'lumotlar to'liq emas!" }
  }

  if (!adminDb) {
    return { success: false, message: "Firebase Admin sozlanmagan!" }
  }

  try {
    const userRef = adminDb.collection("users").doc(uid)
    await userRef.set({
      minecraftUsername: username.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })

    return { success: true, message: "Minecraft nikingiz muvaffaqiyatli bog'landi!" }
  } catch (error) {
    console.error("Error updating minecraft username:", error)
    return { success: false, message: "Bazada xatolik yuz berdi." }
  }
}

export async function unlinkTelegramAction(uid: string) {
  if (!uid || !adminDb) return { success: false, message: "Parametrlar yetarsiz" }
  try {
    await adminDb.collection("users").doc(uid).update({
      telegramUsername: FieldValue.delete(),
      telegramChatId: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return { success: true, message: "Telegram akkaunt uzildi!" }
  } catch (error: any) {
    return { success: false, message: error.message || "Xatolik" }
  }
}

export async function unlinkMinecraftAction(uid: string) {
  if (!uid || !adminDb) return { success: false, message: "Parametrlar yetarsiz" }
  try {
    await adminDb.collection("users").doc(uid).update({
      minecraftUsername: FieldValue.delete(),
      minecraftUuid: FieldValue.delete(),
      linkedServerId: FieldValue.delete(),
      linkedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return { success: true, message: "Minecraft akkaunt uzildi!" }
  } catch (error: any) {
    return { success: false, message: error.message || "Xatolik" }
  }
}

export async function getAllUsersAdminAction() {
  if (!adminDb) return []
  try {
    const snapshot = await adminDb.collection("users").get()
    return snapshot.docs.map(doc => {
      const data = doc.data() || {}
      return {
        uid: doc.id,
        email: data.email || doc.id.substring(0, 10) + "...",
        role: data.role || "user",
        minecraftUsername: data.minecraftUsername || null,
        balance: data.balance !== undefined ? Number(data.balance) : 0,
        telegramUsername: data.telegramUsername || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      }
    })
  } catch (error) {
    console.error("getAllUsersAdminAction error:", error)
    return []
  }
}

export async function updateUserBalanceAdminAction(uid: string, amount: number, isSet: boolean = false) {
  if (!uid || !adminDb) return { success: false, message: "Parametrlar yetarsiz" }
  try {
    const userRef = adminDb.collection("users").doc(uid)
    const userDoc = await userRef.get()
    const userData = userDoc.data() || {}

    let addedAmount = amount
    if (isSet) {
      const currentBalance = Number(userData.balance || 0)
      addedAmount = amount - currentBalance
      await userRef.update({ balance: amount, updatedAt: FieldValue.serverTimestamp() })
    } else {
      await userRef.update({ balance: FieldValue.increment(amount), updatedAt: FieldValue.serverTimestamp() })
    }

    // Record admin balance topup transaction in payments collection
    try {
      const paymentRef = adminDb.collection("payments").doc()
      await paymentRef.set({
        id: paymentRef.id,
        inpayOrderId: null,
        paymentMethod: "ADMIN",
        productId: "balance_topup",
        username: userData.minecraftUsername || userData.email || "Admin",
        amount: Math.abs(addedAmount > 0 ? addedAmount : amount),
        tokenQty: null,
        userUid: uid,
        status: "success",
        description: isSet ? `Admin: Balans ${amount.toLocaleString()} UZS ga o'zgartirildi` : `Admin: Balans +${amount.toLocaleString()} UZS to'ldirildi`,
        payUrl: null,
        receiptUrl: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    } catch (payErr) {
      console.error("Failed to log admin balance transaction:", payErr)
    }

    return { success: true, message: "Balans yangilandi va yozuv saqlandi!" }
  } catch (error: any) {
    return { success: false, message: error.message || "Xatolik" }
  }
}

export async function updateUserRoleAdminAction(uid: string, role: "admin" | "user") {
  if (!uid || !adminDb) return { success: false, message: "Parametrlar yetarsiz" }
  try {
    const userRef = adminDb.collection("users").doc(uid)
    await userRef.update({ role, updatedAt: FieldValue.serverTimestamp() })
    return { success: true, message: `Foydalanuvchi rolining holati ${role.toUpperCase()} ga o'zgartirildi!` }
  } catch (error: any) {
    return { success: false, message: error.message || "Xatolik" }
  }
}

/**
 * Foydalanuvchi profilini oladi.
 * Eslatma: Client Componentga Firestore ning Timestamp kabi classlarini to'g'ridan-to'g'ri o'tkazib bo'lmaydi.
 * Shuning uchun ma'lumotlarni serialize qilamiz (matn yoki raqam ko'rinishida yuboramiz).
 */
export async function getUserProfile(uid: string, email?: string | null) {
  if (!uid || !adminDb) return null

  try {
    const userRef = adminDb.collection("users").doc(uid)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
      const data = userDoc.data();
      if (!data) return null;
      return {
        email: data.email || null,
        role: data.role || "user",
        minecraftUsername: data.minecraftUsername || null,
        balance: data.balance !== undefined ? Number(data.balance) : 0,
        telegramUsername: data.telegramUsername || null,
        telegramChatId: data.telegramChatId || null,
        minecraftUuid: data.minecraftUuid || null,
        linkedServerId: data.linkedServerId || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      }
    }

    // Yangi foydalanuvchi — Firestore'da avtomatik yaratamiz
    await userRef.set({
      email: email || null,
      role: "user",
      minecraftUsername: null,
      balance: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    console.log(`[getUserProfile] Yangi foydalanuvchi yaratildi: ${uid}`)
    
    return {
      email: email || null,
      role: "user",
      minecraftUsername: null,
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error getting/creating user profile:", error)
    return null
  }
}
