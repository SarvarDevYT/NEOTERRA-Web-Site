"use server";

import { adminDb } from "@/lib/firebase-admin";

export interface SystemSettings {
  inpayEnabled: boolean;
  inpayNoticeMessage?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// System settings ma'lumotlarini olish
export async function getSystemSettingsAction(): Promise<SystemSettings> {
  if (!adminDb) {
    return { inpayEnabled: true };
  }

  try {
    const doc = await adminDb.collection("settings").doc("system").get();
    if (doc.exists) {
      const data = doc.data() as SystemSettings;
      return {
        inpayEnabled: data.inpayEnabled !== false, // Standart holda true
        inpayNoticeMessage: data.inpayNoticeMessage || "InPay to'lov tizimida vaqtinchalik texnik profilaktika ishlari olib borilmoqda. Balansni Telegram Admin orqali to'ldirishingiz mumkin.",
        updatedAt: data.updatedAt,
      };
    }
    return { inpayEnabled: true };
  } catch (error) {
    console.error("getSystemSettingsAction Error:", error);
    return { inpayEnabled: true };
  }
}

// InPay to'lov tizimi holatini (ON/OFF) o'zgartirish
export async function toggleInpayStatusAction(enabled: boolean, noticeMessage?: string): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    return { success: false, message: "Database failure" };
  }

  try {
    await adminDb.collection("settings").doc("system").set(
      {
        inpayEnabled: enabled,
        inpayNoticeMessage: noticeMessage || "InPay to'lov tizimida vaqtinchalik texnik profilaktika ishlari olib borilmoqda.",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      success: true,
      message: enabled ? "InPay to'lov tizimi muvaffaqiyatli FAOLlashtirildi!" : "InPay to'lov tizimi vaqtinchalik TO'XTATILDI (Bloklandi)!",
    };
  } catch (error: any) {
    console.error("toggleInpayStatusAction Error:", error);
    return { success: false, message: error.message || "Failed to update settings" };
  }
}
