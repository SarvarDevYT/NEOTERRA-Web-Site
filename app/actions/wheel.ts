"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { revalidatePath } from "next/cache"
import { sendTelegramAdminNotificationAction } from "./telegram"

export interface WheelReward {
  id: string
  name: string
  name_ru?: string
  name_en?: string
  type: "balance" | "command" | "nothing"
  value: string // e.g. "10000" for balance, "/give {username} diamond 5" for command
  chance: number // Probability weight (1-100)
  color: string
  icon: string
  order: number
}

export async function getWheelRewardsAction(): Promise<WheelReward[]> {
  if (!adminDb) return []

  try {
    const snapshot = await adminDb.collection("wheel_rewards").orderBy("order", "asc").get()
    
    if (snapshot.empty) {
      // Default rewards if collection is empty
      const defaultRewards: WheelReward[] = [
        { id: "1", name: "5,000 UZS Balans", type: "balance", value: "5000", chance: 30, color: "#10b981", icon: "💰", order: 1 },
        { id: "2", name: "Omadingiz kelmadi", type: "nothing", value: "", chance: 30, color: "#6b7280", icon: "😢", order: 2 },
        { id: "3", name: "10,000 UZS Balans", type: "balance", value: "10000", chance: 20, color: "#3b82f6", icon: "💎", order: 3 },
        { id: "4", name: "VIP (1 Kun)", type: "command", value: "lp user {username} parent addtemp vip 1d", chance: 10, color: "#a855f7", icon: "👑", order: 4 },
        { id: "5", name: "20,000 UZS Balans", type: "balance", value: "20000", chance: 8, color: "#f59e0b", icon: "🔥", order: 5 },
        { id: "6", name: "LEGEND (1 Kun)", type: "command", value: "lp user {username} parent addtemp legend 1d", chance: 2, color: "#ef4444", icon: "⚡", order: 6 },
      ]
      return defaultRewards
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<WheelReward, "id">)
    }))
  } catch (error: any) {
    console.error("getWheelRewardsAction error:", error)
    return []
  }
}

export async function updateWheelRewardAction(id: string, rewardData: Partial<WheelReward>) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  try {
    await adminDb.collection("wheel_rewards").doc(id).set(rewardData, { merge: true })
    revalidatePath("/admin/dashboard/wheel")
    revalidatePath("/wheel")
    return { success: true, message: "Sovg'a saqlandi!" }
  } catch (error: any) {
    console.error("updateWheelRewardAction error:", error)
    return { success: false, message: error.message }
  }
}

export async function deleteWheelRewardAction(id: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  try {
    await adminDb.collection("wheel_rewards").doc(id).delete()
    revalidatePath("/admin/dashboard/wheel")
    revalidatePath("/wheel")
    return { success: true, message: "Sovg'a o'chirildi!" }
  } catch (error: any) {
    console.error("deleteWheelRewardAction error:", error)
    return { success: false, message: error.message }
  }
}

export async function spinWheelAction(userUid: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }
  if (!userUid) return { success: false, message: "Tizimga kirmagansiz!" }

  try {
    const userRef = adminDb.collection("users").doc(userUid)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return { success: false, message: "Foydalanuvchi topilmadi!" }
    }

    const userData = userDoc.data()!
    const minecraftUsername = userData.minecraftUsername

    if (!minecraftUsername) {
      return { 
        success: false, 
        message: "Omad g'ildiragini aylantirish uchun avval Minecraft akkauntingizni (/link) ulashingiz kerak!" 
      }
    }

    // 24 hour cooldown check
    const lastSpin = userData.lastWheelSpin?.toDate?.()?.getTime() || 0
    const now = Date.now()
    const cooldownMs = 24 * 60 * 60 * 1000 // 24 hours

    if (now - lastSpin < cooldownMs) {
      const remainingMs = cooldownMs - (now - lastSpin)
      const hours = Math.floor(remainingMs / (1000 * 60 * 60))
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
      return { 
        success: false, 
        message: `Keyingi imkoniyatga ${hours} soat ${minutes} daqiqa qoldi!` 
      }
    }

    const rewards = await getWheelRewardsAction()
    if (rewards.length === 0) {
      return { success: false, message: "G'ildirak sovg'alari sozlanmagan!" }
    }

    // Weighted random selection
    const totalWeight = rewards.reduce((acc, r) => acc + (r.chance || 1), 0)
    let randomNum = Math.random() * totalWeight
    let winningReward = rewards[0]

    for (const reward of rewards) {
      if (randomNum < (reward.chance || 1)) {
        winningReward = reward
        break
      }
      randomNum -= (reward.chance || 1)
    }

    // Grant reward
    if (winningReward.type === "balance") {
      const amount = Number(winningReward.value) || 0
      if (amount > 0) {
        await userRef.update({
          balance: FieldValue.increment(amount),
          lastWheelSpin: FieldValue.serverTimestamp(),
        })
      }
    } else if (winningReward.type === "command") {
      const cmdToRun = winningReward.value.replace(/\{username\}/gi, minecraftUsername)
      await adminDb.collection("commands_queue").add({
        command: cmdToRun,
        username: minecraftUsername,
        userUid: userUid,
        productId: `wheel_win_${winningReward.id}`,
        serverId: "",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      })
      await userRef.update({
        lastWheelSpin: FieldValue.serverTimestamp(),
      })
    } else {
      // Nothing / No prize
      await userRef.update({
        lastWheelSpin: FieldValue.serverTimestamp(),
      })
    }

    // Save history record
    await adminDb.collection("wheel_history").add({
      userUid,
      username: minecraftUsername,
      rewardId: winningReward.id,
      rewardName: winningReward.name,
      createdAt: FieldValue.serverTimestamp(),
    })

    // Send Telegram Notification to staff if winning rare reward (chance <= 10%)
    if (winningReward.chance <= 10 && winningReward.type !== "nothing") {
      sendTelegramAdminNotificationAction(
        `🎡 <b>Omad G'ildiragi G'olibi!</b>\n\n` +
        `👤 <b>O'yinchi:</b> <code>${minecraftUsername}</code>\n` +
        `🎁 <b>Yutgan sovg'asi:</b> <code>${winningReward.name}</code>\n` +
        `🎲 <b>Ehtimolligi:</b> ${winningReward.chance}%`
      ).catch(() => {})
    }

    revalidatePath("/wheel")
    revalidatePath("/settings")

    return {
      success: true,
      reward: winningReward,
      rewardIndex: rewards.findIndex(r => r.id === winningReward.id)
    }
  } catch (error: any) {
    console.error("spinWheelAction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}
