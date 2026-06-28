"use server";

import { litebans } from "@/lib/litebans";

export async function getBansAction() {
  try {
    // 1. So'nggi banlarni olamiz
    const bans = await litebans.litebans_bans.findMany({
      orderBy: { time: "desc" },
      take: 20,
    });

    return { success: true, data: JSON.parse(JSON.stringify(bans)) };
  } catch (error: any) {
    console.error("LiteBans Fetch Error:", error);
    // Return empty list gracefully instead of crashing the app if MySQL is offline or auth fails
    return { 
      success: true, 
      data: [], 
      error: true, 
      message: "Tizim ma'lumotlar bazasiga ulanolmadi (MySQL vaqtincha faol emas)." 
    };
  }
}

export async function getMutesAction() {
  try {
    const mutes = await litebans.litebans_mutes.findMany({
      orderBy: { time: "desc" },
      take: 20,
    });

    return { success: true, data: JSON.parse(JSON.stringify(mutes)) };
  } catch (error: any) {
    console.error("LiteMutes Fetch Error:", error);
    return { 
      success: true, 
      data: [], 
      error: true, 
      message: "Tizim ma'lumotlar bazasiga ulanolmadi (MySQL vaqtincha faol emas)." 
    };
  }
}

// UUID'ni o'yinchi niki bilan bog'lash (History'dan qidiramiz)
export async function getPlayerNameAction(uuid: string) {
    try {
        const history = await litebans.litebans_history.findFirst({
            where: { uuid },
            orderBy: { date: 'desc' }
        });
        return history ? history.name : "Noma'lum";
    } catch (error) {
        return "Noma'lum";
    }
}
