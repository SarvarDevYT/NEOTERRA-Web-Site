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
      // Check if wheel settings has been initialized before
      const settingsDoc = await adminDb.collection("settings").doc("wheel_settings").get()
      if (settingsDoc.exists && settingsDoc.data()?.initialized) {
        // Admin intentionally deleted all rewards
        return []
      }

      // First time initialization: Seed default rewards directly into Firestore
      const defaultRewards: WheelReward[] = [
        { id: "1", name: "5,000 UZS Balans", type: "balance", value: "5000", chance: 30, color: "#10b981", icon: "💰", order: 1 },
        { id: "2", name: "Omadingiz kelmadi", type: "nothing", value: "", chance: 30, color: "#6b7280", icon: "😢", order: 2 },
        { id: "3", name: "10,000 UZS Balans", type: "balance", value: "10000", chance: 20, color: "#3b82f6", icon: "💎", order: 3 },
        { id: "4", name: "VIP (1 Kun)", type: "command", value: "lp user {username} parent addtemp vip 1d", chance: 10, color: "#a855f7", icon: "👑", order: 4 },
        { id: "5", name: "20,000 UZS Balans", type: "balance", value: "20000", chance: 8, color: "#f59e0b", icon: "🔥", order: 5 },
        { id: "6", name: "LEGEND (1 Kun)", type: "command", value: "lp user {username} parent addtemp legend 1d", chance: 2, color: "#ef4444", icon: "⚡", order: 6 },
      ]

      const batch = adminDb.batch()
      for (const reward of defaultRewards) {
        const { id, ...data } = reward
        batch.set(adminDb.collection("wheel_rewards").doc(id), data)
      }
      batch.set(adminDb.collection("settings").doc("wheel_settings"), { initialized: true })
      await batch.commit()

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
    await adminDb.collection("settings").doc("wheel_settings").set({ initialized: true }, { merge: true })
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
    await adminDb.collection("settings").doc("wheel_settings").set({ initialized: true }, { merge: true })
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

    // Extra spins & 24 hour cooldown check
    const extraSpins = userData.extraWheelSpins || 0;
    const lastSpin = userData.lastWheelSpin?.toDate?.()?.getTime() || 0;
    const now = Date.now();
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

    const hasExtraSpin = extraSpins > 0;
    const cooldownOver = now - lastSpin >= cooldownMs;

    if (!hasExtraSpin && !cooldownOver) {
      const remainingMs = cooldownMs - (now - lastSpin);
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      return { 
        success: false, 
        message: `Keyingi imkoniyatga ${hours} soat ${minutes} daqiqa qoldi!` 
      };
    }

    const rewards = await getWheelRewardsAction();
    if (rewards.length === 0) {
      return { success: false, message: "G'ildirak sovg'alari sozlanmagan!" };
    }

    // Weighted random selection
    const totalWeight = rewards.reduce((acc, r) => acc + (r.chance || 1), 0);
    let randomNum = Math.random() * totalWeight;
    let winningReward = rewards[0];

    for (const reward of rewards) {
      if (randomNum < (reward.chance || 1)) {
        winningReward = reward;
        break;
      }
      randomNum -= (reward.chance || 1);
    }

    // Prepare user update data
    const userUpdateData: any = {};
    if (hasExtraSpin) {
      userUpdateData.extraWheelSpins = FieldValue.increment(-1);
    } else {
      userUpdateData.lastWheelSpin = FieldValue.serverTimestamp();
    }

    // Grant reward & Record in payments history
    if (winningReward.type === "balance") {
      const amount = Number(winningReward.value) || 0;
      if (amount > 0) {
        userUpdateData.balance = FieldValue.increment(amount);

        // Record in user's payments transaction history
        await adminDb.collection("payments").add({
          userUid: userUid,
          username: minecraftUsername,
          amount: amount,
          productName: `🎰 Omad G'ildiragi Sovg'asi: ${winningReward.name}`,
          provider: "omad_gildiragi",
          status: "completed",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (winningReward.type === "command") {
      const cmdToRun = winningReward.value.replace(/\{username\}/gi, minecraftUsername);
      await adminDb.collection("commands_queue").add({
        command: cmdToRun,
        username: minecraftUsername,
        userUid: userUid,
        productId: `wheel_win_${winningReward.id}`,
        serverId: "",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });

      // Record non-balance prize in payment history as well
      await adminDb.collection("payments").add({
        userUid: userUid,
        username: minecraftUsername,
        amount: 0,
        productName: `🎰 Omad G'ildiragi Sovg'asi: ${winningReward.name}`,
        provider: "omad_gildiragi",
        status: "completed",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await userRef.update(userUpdateData);

    // Save history record
    await adminDb.collection("wheel_history").add({
      userUid,
      username: minecraftUsername,
      rewardId: winningReward.id,
      rewardName: winningReward.name,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Send Telegram Notification to staff if winning rare reward (chance <= 10%)
    if (winningReward.chance <= 10 && winningReward.type !== "nothing") {
      sendTelegramAdminNotificationAction(
        `🎡 <b>Omad G'ildiragi G'olibi!</b>\n\n` +
        `👤 <b>O'yinchi:</b> <code>${minecraftUsername}</code>\n` +
        `🎁 <b>Yutgan sovg'asi:</b> <code>${winningReward.name}</code>\n` +
        `🎲 <b>Ehtimolligi:</b> ${winningReward.chance}%`
      ).catch(() => {});
    }

    revalidatePath("/wheel");
    revalidatePath("/settings");

    return {
      success: true,
      reward: winningReward,
      rewardIndex: rewards.findIndex(r => r.id === winningReward.id)
    };
  } catch (error: any) {
    console.error("spinWheelAction error:", error);
    return { success: false, message: error.message || "Xatolik yuz berdi" };
  }
}

export async function grantWheelSpinAdminAction(userUid: string, count: number = 1) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };
  if (!userUid) return { success: false, message: "User ID kiritilmadi!" };

  try {
    const userRef = adminDb.collection("users").doc(userUid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return { success: false, message: "Foydalanuvchi topilmadi!" };
    }

    await userRef.update({
      extraWheelSpins: FieldValue.increment(count),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const userData = userDoc.data();
    const username = userData?.minecraftUsername || userData?.email || userUid;

    revalidatePath("/admin/dashboard/users");
    revalidatePath("/admin/dashboard/wheel");
    revalidatePath("/wheel");

    return { 
      success: true, 
      message: `"${username}" ga ${count} ta omad g'ildiragi aylantirish imkoniyati berildi!` 
    };
  } catch (error: any) {
    console.error("grantWheelSpinAdminAction error:", error);
    return { success: false, message: error.message || "Xatolik yuz berdi" };
  }
}

export async function grantWheelSpinByUsernameAdminAction(identifier: string, count: number = 1) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };
  const queryStr = identifier.trim();
  if (!queryStr) return { success: false, message: "Foydalanuvchi nik yoki emaili kiritilmadi!" };

  try {
    let userDoc: any = null;

    // Try finding by minecraftUsername
    const nickSnap = await adminDb.collection("users").where("minecraftUsername", "==", queryStr).limit(1).get();
    if (!nickSnap.empty) {
      userDoc = nickSnap.docs[0];
    } else {
      // Try finding by email
      const emailSnap = await adminDb.collection("users").where("email", "==", queryStr).limit(1).get();
      if (!emailSnap.empty) {
        userDoc = emailSnap.docs[0];
      }
    }

    if (!userDoc) {
      return { success: false, message: `"${queryStr}" foydalanuvchisi topilmadi!` };
    }

    await userDoc.ref.update({
      extraWheelSpins: FieldValue.increment(count),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/dashboard/users");
    revalidatePath("/admin/dashboard/wheel");
    revalidatePath("/wheel");

    return { 
      success: true, 
      message: `"${queryStr}" ga ${count} ta omad g'ildiragi aylantirish imkoniyati berildi!` 
    };
  } catch (error: any) {
    console.error("grantWheelSpinByUsernameAdminAction error:", error);
    return { success: false, message: error.message || "Xatolik yuz berdi" };
  }
}
