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
