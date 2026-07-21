"use server"

import { adminDb } from "@/lib/firebase-admin"

/**
 * Verify a 6-digit link code from the Minecraft server.
 * Links the user's website profile to their Minecraft account.
 */
export async function verifyLinkCode(uid: string, code: string) {
  if (!adminDb || !uid || !code) {
    return { success: false, message: "Ma'lumotlar to'liq emas!" }
  }

  // Validate code format
  if (!/^\d{6}$/.test(code.trim())) {
    return { success: false, message: "Kod 6 ta raqamdan iborat bo'lishi kerak!" }
  }

  try {
    const linkRef = adminDb.collection("link_codes").doc(code.trim())
    const linkDoc = await linkRef.get()

    if (!linkDoc.exists) {
      return { success: false, message: "Kod topilmadi yoki muddati o'tgan!" }
    }

    const linkData = linkDoc.data()!

    // Check if already used
    if (linkData.used) {
      return { success: false, message: "Bu kod allaqachon ishlatilgan!" }
    }

    // Check if expired (5 minutes)
    const expiresAt = linkData.expiresAt?.toDate?.() || new Date(0)
    if (new Date() > expiresAt) {
      return { success: false, message: "Kodning muddati o'tgan! Yangi kod oling." }
    }

    // Link the Minecraft account to the user profile
    const userRef = adminDb.collection("users").doc(uid)
    await userRef.update({
      minecraftUuid: linkData.playerUuid,
      minecraftUsername: linkData.playerName,
      linkedServerId: linkData.serverId,
      linkedAt: new Date(),
      updatedAt: new Date(),
    })

    // Mark code as used
    await linkRef.update({ used: true })

    return {
      success: true,
      message: `Minecraft akkaunt "${linkData.playerName}" muvaffaqiyatli bog'landi!`,
      playerName: linkData.playerName,
    }
  } catch (error: any) {
    console.error("verifyLinkCode error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}

/**
 * Kick the player from the server (self-kick only).
 */
export async function kickPlayer(uid: string) {
  if (!uid) return { success: false, message: "UID topilmadi!" }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://site.neoterra.uz"}/api/server/player`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userUid: uid, action: "kick" }),
    })

    const data = await res.json()
    return { success: data.success, message: data.message || data.error || "Xatolik" }
  } catch (error: any) {
    console.error("kickPlayer error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}

/**
 * Temporarily ban the player for 30 minutes (self-ban only).
 */
export async function tempBanPlayer(uid: string) {
  if (!uid) return { success: false, message: "UID topilmadi!" }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://site.neoterra.uz"}/api/server/player`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userUid: uid, action: "tempban" }),
    })

    const data = await res.json()
    return { success: data.success, message: data.message || data.error || "Xatolik" }
  } catch (error: any) {
    console.error("tempBanPlayer error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}
