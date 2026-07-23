"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { revalidatePath } from "next/cache"

export interface PromoCode {
  id: string
  code: string
  discountPercent: number
  maxUses: number
  usedCount: number
  expiresAt?: string | null
  isActive: boolean
  createdAt?: string
}

export async function getPromoCodesAction(): Promise<PromoCode[]> {
  if (!adminDb) return []

  try {
    const snapshot = await adminDb.collection("promocodes").orderBy("code", "asc").get()
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        code: data.code,
        discountPercent: data.discountPercent || 0,
        maxUses: data.maxUses || 0,
        usedCount: data.usedCount || 0,
        expiresAt: data.expiresAt || null,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      }
    })
  } catch (error: any) {
    console.error("getPromoCodesAction error:", error)
    return []
  }
}

export async function savePromoCodeAction(id: string, data: Partial<PromoCode>) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  const cleanCode = String(data.code || "").trim().toUpperCase()
  if (!cleanCode) return { success: false, message: "Promokod kodi bo'sh bo'lishi mumkin emas!" }

  try {
    const promoData = {
      code: cleanCode,
      discountPercent: Number(data.discountPercent) || 10,
      maxUses: Number(data.maxUses) || 100,
      usedCount: Number(data.usedCount) || 0,
      expiresAt: data.expiresAt || null,
      isActive: data.isActive ?? true,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (id) {
      await adminDb.collection("promocodes").doc(id).set(promoData, { merge: true })
    } else {
      await adminDb.collection("promocodes").add({
        ...promoData,
        createdAt: FieldValue.serverTimestamp(),
      })
    }

    revalidatePath("/admin/dashboard/promocodes")
    return { success: true, message: "Promokod saqlandi!" }
  } catch (error: any) {
    console.error("savePromoCodeAction error:", error)
    return { success: false, message: error.message }
  }
}

export async function deletePromoCodeAction(id: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  try {
    await adminDb.collection("promocodes").doc(id).delete()
    revalidatePath("/admin/dashboard/promocodes")
    return { success: true, message: "Promokod o'chirildi!" }
  } catch (error: any) {
    console.error("deletePromoCodeAction error:", error)
    return { success: false, message: error.message }
  }
}

export async function validatePromoCodeAction(code: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  const cleanCode = String(code || "").trim().toUpperCase()
  if (!cleanCode) return { success: false, message: "Kodni kiriting!" }

  try {
    const snapshot = await adminDb.collection("promocodes")
      .where("code", "==", cleanCode)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return { success: false, message: "Bunday promokod mavjud emas!" }
    }

    const doc = snapshot.docs[0]
    const promo = doc.data() as PromoCode

    if (!promo.isActive) {
      return { success: false, message: "Ushbu promokod faol emas!" }
    }

    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return { success: false, message: "Ushbu promokodni ishlatish chegarasiga yetildi!" }
    }

    if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
      return { success: false, message: "Ushbu promokodning amal qilish muddati tugagan!" }
    }

    return { 
      success: true, 
      promoId: doc.id,
      code: promo.code,
      discountPercent: promo.discountPercent,
      message: `${promo.discountPercent}% chegirma qo'llanildi! 🎉`
    }
  } catch (error: any) {
    console.error("validatePromoCodeAction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}
