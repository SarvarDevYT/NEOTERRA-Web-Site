const fs = require('fs');
const path = require('path');

// .env faylini o'qish
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Regex bilan o'zgaruvchilarni ajratish
function getVar(name) {
  const regex = new RegExp(`^${name}="([\\s\\S]*?)"`, 'm');
  const match = envContent.match(regex);
  return match ? match[1] : null;
}

const projectId = getVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
const clientEmail = getVar('FIREBASE_CLIENT_EMAIL');
const privateKeyRaw = getVar('FIREBASE_PRIVATE_KEY');

console.log('=== Firebase Admin SDK Debug ===\n');
console.log('PROJECT_ID:', projectId || 'NOT FOUND!');
console.log('CLIENT_EMAIL:', clientEmail || 'NOT FOUND!');

if (privateKeyRaw) {
  // \\n → actual newline
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  console.log('PRIVATE_KEY: Found');
  console.log('  Raw starts with:', privateKeyRaw.substring(0, 60));
  console.log('  Has actual newlines:', privateKey.includes('\n'));
  console.log('  Key length:', privateKey.length);
  console.log('  Starts correctly:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));

  // Firebase Admin SDK ni sinab ko'rish
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    const db = admin.firestore();
    console.log('\n✅ Firebase Admin SDK muvaffaqiyatli ishga tushdi!');
    
    // Firestore dan o'qish
    db.collection('news').get().then(snap => {
      console.log(`✅ Firestore news collection: ${snap.size} ta hujjat`);
      snap.docs.forEach(doc => {
        console.log(`   - ${doc.id}: ${doc.data().title}`);
      });
      return db.collection('rules').get();
    }).then(snap => {
      console.log(`✅ Firestore rules collection: ${snap.size} ta hujjat`);
      return db.collection('users').get();
    }).then(snap => {
      console.log(`✅ Firestore users collection: ${snap.size} ta hujjat`);
      process.exit(0);
    }).catch(err => {
      console.error('❌ Firestore read xatosi:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('\n❌ Firebase Admin SDK xatosi:', err.message);
    process.exit(1);
  }
} else {
  console.log('PRIVATE_KEY: NOT FOUND!');
  process.exit(1);
}
