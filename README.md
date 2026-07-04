# 🌌 NeoTerra Minecraft Server Web Portal

Welcome to the official web portal for **NeoTerra** — one of the most innovative and modern Minecraft servers in Uzbekistan. 

This repository contains the source code for the fully responsive, multilingual web application that serves as the main hub for the NeoTerra community. It features user authentication, a store, server statistics, rules, ban lists, and full PWA compatibility.

---

## 🚀 Server Connection Details
* **Server IP (Uzbekistan):** `play.neoterra.uz` or `mc.neoterra.uz`
* **Official Website:** [site.neoterra.uz](https://site.neoterra.uz)

---

## ✨ Features

### 1. 🌐 Complete Multilingual Localization (i18n)
* Full support for three languages: **Uzbek (UZ)**, **Russian (RU)**, and **English (EN)**.
* High-performance, client-side translation using a custom Zustand-based store (`useTranslation`) preventing translation delays and layout layout shifting.

### 2. 🛒 Dynamic Donate Shop (Store)
* Integration of ranks, key crates, server currencies, and unbans.
* Supports secure payments and inputs with Minecraft nickname validation.

### 3. 📊 Live Server Statistics & Bans List (Litebans)
* Connected to MySQL database via **Prisma ORM** to dynamically display server bans, mutes, and player statistics (top kills, deaths, play time) in real-time.

### 4. 🔐 User Account Settings & Profile
* Secure Firebase Authentication (Email/Password & Google Sign-In).
* Custom profile settings allowing users to link their Firebase profile to their Minecraft nickname.
* Advanced Admin Dashboard for news publishing, rules adjustments, and team member management.

### 5. 📰 Dynamic News & Rules System
* Live news feeds and rules lists pulled directly from **Firebase Firestore** with full support for localized titles and content.

### 6. 📱 PWA & Microsoft Store Ready
* Progressive Web App configuration with active Service Worker (`sw.js`) caching.
* Verified manifest layout, optimized to build `.msixbundle` formats for the **Microsoft Store**.

---

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router, Server Actions)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Radix UI (Shadcn/ui Components)
* **Database & CMS:** Firebase Firestore + MySQL (for Litebans database)
* **ORM:** Prisma ORM
* **Authentication:** Firebase Auth (Google OAuth & Email/Password)
* **State Management:** Zustand (Persisted language storage)
* **Icons:** Lucide React

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
# Next-Auth & General
NEXT_PUBLIC_APP_URL=https://site.neoterra.uz

# Firebase Client configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin configuration (JSON payload or individual credentials)
FIREBASE_CLIENT_EMAIL=your_admin_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Database Connection (Litebans MySQL server)
LITEBANS_DATABASE_URL="mysql://username:password@host:port/database_name"
```

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Build Production Application
```bash
npm run build
```

---

## 🤝 Community & Support
* **Telegram Channel:** [@NeoTerraUz](https://t.me/NeoTerraUz)
* **Technical Admin Support:** [@NeoTerraAdmin](https://t.me/NeoTerraAdmin)
* **YouTube Channel:** [NeoTerra MC](https://www.youtube.com/@NeoTerraMC)
* **Email Support:** `neoterramc@gmail.com`

---

*Developed with ❤️ by the NeoTerra Developer Team.*
