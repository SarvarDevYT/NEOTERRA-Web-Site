/**
 * NeoTerra - Firebase Setup Script
 * 
 * Bu scriptni bir marta ishlatib, admin akkaunt va barcha
 * kerakli Firestore collectionlarni yaratib oling.
 * 
 * Ishlatish: node scripts/setup-firebase.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env faylidan o'qish
const envPath = join(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`${name}="([^"]+)"`));
  return match ? match[1] : null;
}

// Firebase Admin SDK ni ishga tushirish
const app = initializeApp({
  credential: cert({
    projectId: getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    clientEmail: getEnvVar("FIREBASE_CLIENT_EMAIL"),
    privateKey: getEnvVar("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================
// SOZLAMALAR - O'ZINGIZGA QARAB O'ZGARTIRING
// ============================================================
const ADMIN_EMAIL = "admin@neoterra.uz";
const ADMIN_PASSWORD = "Admin123!"; // Keyin o'zgartiring!
const ADMIN_DISPLAY_NAME = "NeoTerra Admin";
// ============================================================

async function setup() {
  console.log("🔥 NeoTerra Firebase Setup boshlandi...\n");

  // 1. Admin foydalanuvchi yaratish
  let adminUid;
  try {
    // Avval mavjudligini tekshirish
    const existingUser = await auth.getUserByEmail(ADMIN_EMAIL).catch(() => null);

    if (existingUser) {
      console.log(`✅ Admin allaqachon mavjud: ${ADMIN_EMAIL} (UID: ${existingUser.uid})`);
      adminUid = existingUser.uid;
    } else {
      const newUser = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_DISPLAY_NAME,
        emailVerified: true,
      });
      console.log(`✅ Admin akkaunt yaratildi: ${ADMIN_EMAIL}`);
      console.log(`   UID: ${newUser.uid}`);
      console.log(`   Parol: ${ADMIN_PASSWORD}  ⚠️ Iltimos keyin o'zgartiring!`);
      adminUid = newUser.uid;
    }
  } catch (error) {
    console.error("❌ Admin yaratishda xato:", error.message);
    process.exit(1);
  }

  // 2. Firestore'da admin users dokumentini yaratish
  try {
    await db.collection("users").doc(adminUid).set(
      {
        email: ADMIN_EMAIL,
        displayName: ADMIN_DISPLAY_NAME,
        role: "admin",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`✅ Firestore: users/${adminUid} yaratildi (role: admin)`);
  } catch (error) {
    console.error("❌ Firestore users yaratishda xato:", error.message);
  }

  // 3. Namunaviy news qo'shish
  try {
    const newsRef = await db.collection("news").add({
      title: "NeoTerra Serveriga Xush Kelibsiz! 🎮",
      content:
        "NeoTerra - O'zbekistonning eng yaxshi Minecraft serveri! Biz bilan o'ynang va sarguzashtlarga tayyorlaning.\n\nServer manzili: play.neoterra.uz\nVersiя: 1.20+\n\nKo'p qiziqarli tadbirlar va yangiliklar kutilmoqda!",
      author: "NeoTerra Admin",
      image: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`✅ Firestore: news/${newsRef.id} - Namunaviy yangilik qo'shildi`);
  } catch (error) {
    console.error("❌ News yaratishda xato:", error.message);
  }

  // 4. Namunaviy qoidalar qo'shish
  try {
    const rulesData = [
      {
        title: "1. Umumiy Qoidalar",
        description:
          "Boshqa o'yinchilarni hurmat qiling. Haqorat, kamsitish va tahdid qilish qat'iyan man etiladi.",
        order: 1,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        title: "2. Cheat va Hack",
        description:
          "Har qanday turdagi cheat, hack yoki exploit ishlatish darhol va muddatsiz ban bilan jazolanadi.",
        order: 2,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        title: "3. Reklama",
        description:
          "Boshqa serverlar yoki loyihalar reklamasini qilish qat'iyan man etiladi.",
        order: 3,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
    ];

    for (const rule of rulesData) {
      await db.collection("rules").add(rule);
    }
    console.log(`✅ Firestore: rules/ - 3 ta namunaviy qoida qo'shildi`);
  } catch (error) {
    console.error("❌ Rules yaratishda xato:", error.message);
  }

  // 5. Namunaviy staff qo'shish
  try {
    const staffData = [
      {
        nickname: "NeoTerra_Owner",
        role: "Owner",
        discord: null,
        telegram: null,
        imageUrl: null,
        order: 0,
        createdAt: FieldValue.serverTimestamp(),
      },
      {
        nickname: "NeoAdmin",
        role: "Admin",
        discord: null,
        telegram: null,
        imageUrl: null,
        order: 1,
        createdAt: FieldValue.serverTimestamp(),
      },
    ];

    for (const member of staffData) {
      await db.collection("staff").add(member);
    }
    console.log(`✅ Firestore: staff/ - 2 ta namunaviy xodim qo'shildi`);
  } catch (error) {
    console.error("❌ Staff yaratishda xato:", error.message);
  }

  // 6. Namunaviy donat mahsulotlarini qo'shish
  try {
    const productsData = [
      { name: "IMMORTAL", price: "70,000 UZS", category: "RANKLAR", type: "rank", image: "/images/light-20blue.jpg", order: 1 },
      { name: "NEO++", price: "55,000 UZS", category: "RANKLAR", type: "rank", image: "/images/pink.jpg", order: 2 },
      { name: "HERO", price: "40,000 UZS", category: "RANKLAR", type: "rank", image: "/images/red.jpg", order: 3 },
      { name: "ULTIMATE", price: "29,000 UZS", category: "RANKLAR", type: "rank", image: "/images/yellow.jpg", order: 4 },
      { name: "LEGEND", price: "15,000 UZS", category: "RANKLAR", type: "rank", image: "/images/blue.jpg", order: 5 },
      { name: "ELITE", price: "9,000 UZS", category: "RANKLAR", type: "rank", image: "/images/green.jpg", order: 6 },
      { name: "COMBAT", price: "5,000 UZS", category: "RANKLAR", type: "rank", image: "/images/orange.jpg", order: 7 },
      { name: "DONATE CASE", price: "15,000 UZS", category: "KEYS-LAR", type: "key", image: "/images/donate-case.jpg", order: 8 },
      { name: "KIT CASE", price: "9,000 UZS", category: "KEYS-LAR", type: "key", image: "/images/kit-case.jpg", order: 9 },
      { name: "ITEM CASE", price: "1,800 UZS", category: "KEYS-LAR", type: "key", image: "/images/item-case.jpg", order: 10 },
      { name: "SPHERE CASE", price: "5,000 UZS", category: "KEYS-LAR", type: "key", image: "/images/sphere-case.jpg", order: 11 },
      { name: "TOKEN", price: "3,000 UZS", category: "VALYUTA", type: "token", image: "/images/token.jpg", order: 12 },
      { name: "UNBAN", price: "5,000 UZS", category: "UNBAN/UNMUTE", type: "unban", image: "/images/barrier.jpg", order: 13 },
      { name: "UNMUTE", price: "2,000 UZS", category: "UNBAN/UNMUTE", type: "unmute", image: "/images/barrier.jpg", order: 14 }
    ];

    for (const prod of productsData) {
      await db.collection("products").add({
        ...prod,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }
    console.log(`✅ Firestore: products/ - Default donat mahsulotlari yuklandi`);
  } catch (error) {
    console.error("❌ Donatlarni yaratishda xato:", error.message);
  }

  console.log("\n🎉 Setup muvaffaqiyatli yakunlandi!");
  console.log("─".repeat(50));
  console.log("Admin kirish ma'lumotlari:");
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Parol   : ${ADMIN_PASSWORD}`);
  console.log(`  URL     : http://localhost:3000/admin`);
  console.log("─".repeat(50));
  console.log("⚠️  Parolni kirganingizdan keyin o'zgartirishni unutmang!");
  console.log("");

  process.exit(0);
}

setup().catch((error) => {
  console.error("Setup xatosi:", error);
  process.exit(1);
});
