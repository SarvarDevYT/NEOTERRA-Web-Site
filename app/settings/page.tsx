"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  linkWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth as firebaseClientAuth } from "@/lib/firebase";
import { updateMinecraftUsername, getUserProfile } from "@/app/actions/player-profile";
import { createInpayPaymentAction } from "@/app/actions/inpay";
import { Shield, Key, Mail, User, LogOut, Check, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage() {
  const { uid, email, minecraftUsername, isAdmin, setAuth, setMinecraftUsername, logout: localLogout } = useAuth();
  const [nickInput, setNickInput] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { lang } = useTranslation();

  const [profile, setProfile] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [isTopupLoading, setIsTopupLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (uid) {
        const data = await getUserProfile(uid, email);
        if (data) {
          setProfile(data);
        }
      }
    }
    loadProfile();
  }, [uid, email]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(topupAmount);
    if (isNaN(amountNum) || amountNum < 1000) {
      toast({
        title: lang === "uz" ? "Xatolik" : lang === "ru" ? "Ошибка" : "Error",
        description: lang === "uz" ? "Minimal to'lov miqdori 1000 UZS" : lang === "ru" ? "Минимальная сумма 1000 UZS" : "Minimum deposit amount is 1000 UZS",
        variant: "destructive",
      });
      return;
    }

    setIsTopupLoading(true);
    try {
      const username = minecraftUsername || email?.split("@")[0] || uid;
      const result = await createInpayPaymentAction(
        "balance_topup",
        username,
        amountNum,
        undefined,
        uid
      );

      if (result.success && result.payUrl) {
        window.location.href = result.payUrl;
      } else {
        toast({
          title: lang === "uz" ? "To'lov xatosi" : lang === "ru" ? "Ошибка платежа" : "Payment error",
          description: result.message || "To'lov havolasini olish imkoni bo'lmadi.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create payment.",
        variant: "destructive",
      });
    } finally {
      setIsTopupLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseClientAuth, (user) => {
      if (user) {
        setUserAuth(user);
        setNickInput(minecraftUsername || "");
      } else {
        setUserAuth(null);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [minecraftUsername, router]);

  const handleLinkNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !nickInput.trim()) return;

    setIsLinking(true);
    try {
      const res = await updateMinecraftUsername(uid, nickInput);
      if (res.success) {
        setMinecraftUsername(nickInput.trim());
        toast({
          title: lang === "uz" ? "Muvaffaqiyatli!" : lang === "ru" ? "Успешно!" : "Success!",
          description: res.message,
        });
      } else {
        toast({
          title: lang === "uz" ? "Xatolik!" : lang === "ru" ? "Ошибка!" : "Error!",
          description: res.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: lang === "uz" ? "Xatolik!" : lang === "ru" ? "Ошибка!" : "Error!",
        description: lang === "uz" ? "Baza bilan bog'lanishda muammo." : lang === "ru" ? "Проблема подключения к базе данных." : "Database connection issue.",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!firebaseClientAuth.currentUser) return;
    setIsLinkingGoogle(true);
    const provider = new GoogleAuthProvider();

    try {
      await linkWithPopup(firebaseClientAuth.currentUser, provider);
      const user = firebaseClientAuth.currentUser;
      const profile = await getUserProfile(user.uid, user.email);
      setAuth({
        uid: user.uid,
        email: user.email,
        minecraftUsername: profile?.minecraftUsername || null,
        isAdmin: profile?.role === "admin" || profile?.role === "owner" || user.email === "admin@neoterra.uz",
      });
      toast({
        title: lang === "uz" ? "Muvaffaqiyatli!" : lang === "ru" ? "Успешно!" : "Success!",
        description: lang === "uz" ? "Google akkaunti muvaffaqiyatli ulandi." : lang === "ru" ? "Аккаунт Google успешно привязан." : "Google account linked successfully.",
      });
    } catch (error: any) {
      console.error("Link google error:", error);
      toast({
        title: lang === "uz" ? "Xatolik!" : lang === "ru" ? "Ошибка!" : "Error!",
        description: error.message || "Google ulanishda xato yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleLogout = async () => {
    await firebaseSignOut(firebaseClientAuth);
    localLogout();
    toast({
      title: lang === "uz" ? "Chiqildi" : lang === "ru" ? "Вышли" : "Logged out",
      description: lang === "uz" ? "Siz tizimdan chiqdingiz." : lang === "ru" ? "Вы успешно вышли из системы." : "You have logged out successfully.",
    });
    router.push("/");
  };

  const isGoogleLinked = userAuth?.providerData.some(
    (p: any) => p.providerId === "google.com"
  );

  if (!uid) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <p className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
          {lang === "uz" ? "Sozlamalar yuklanmoqda..." : lang === "ru" ? "Загрузка настроек..." : "Loading settings..."}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-4xl py-32 px-4 relative z-10 flex-grow">
        <header className="text-center mb-16">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 mb-8 border border-white/10 backdrop-blur-xl shadow-2xl">
            <Key className="h-10 w-10 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 liquid-shadow">
            {lang === "uz" ? (
              <>PROFIL <span className="text-purple-500">SOZLAMALARI</span></>
            ) : lang === "ru" ? (
              <>НАСТРОЙКИ <span className="text-purple-500">ПРОФИЛЯ</span></>
            ) : (
              <>PROFILE <span className="text-purple-500">SETTINGS</span></>
            )}
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto font-medium">
            {lang === "uz"
              ? "Akkaunt sozlamalarini boshqarish, ijtimoiy tarmoqlarni ulash va Minecraft nikingizni tahrirlash."
              : lang === "ru"
              ? "Управление настройками аккаунта, привязка социальных сетей и редактирование вашего никнейма Minecraft."
              : "Manage account settings, link social networks and edit your Minecraft nickname."}
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7 space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  {lang === "uz" ? "Minecraft Nikni Bog'lash" : lang === "ru" ? "Привязать никнейм Minecraft" : "Link Minecraft Nickname"}
                </CardTitle>
                <CardDescription className="text-zinc-400 font-medium">
                  {lang === "uz"
                    ? "Serverdagi do'kondan foydalanish va statistikangizni ko'rish uchun nikingizni kiriting."
                    : lang === "ru"
                    ? "Введите никнейм для доступа к магазину и просмотра статистики."
                    : "Enter your nickname to access the store and view your stats."}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLinkNickname} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="nickname" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                    Minecraft Nik
                  </label>
                  <Input
                    id="nickname"
                    placeholder="Masalan: SarvarGamer"
                    value={nickInput}
                    onChange={(e) => setNickInput(e.target.value)}
                    className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                    required
                    disabled={isLinking}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full font-black tracking-widest h-12 text-sm bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-95" 
                  disabled={isLinking}
                >
                  {isLinking
                    ? lang === "uz"
                      ? "SAQLANMOQDA..."
                      : lang === "ru"
                      ? "СОХРАНЕНИЕ..."
                      : "SAVING..."
                    : lang === "uz"
                    ? "SAQLASH"
                    : lang === "ru"
                    ? "СОХРАНИТЬ"
                    : "SAVE"}
                </Button>
              </form>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  {lang === "uz" ? "Ijtimoiy Tarmoqlarni Ulash" : lang === "ru" ? "Привязка социальных сетей" : "Link Social Accounts"}
                </CardTitle>
                <CardDescription className="text-zinc-400 font-medium">
                  {lang === "uz"
                    ? "Kirishni osonlashtirish uchun Google profilingizni bog'lang."
                    : lang === "ru"
                    ? "Привяжите аккаунт Google для упрощения входа в систему."
                    : "Link your Google profile to make login easier."}
                </CardDescription>
              </CardHeader>
              <div className="space-y-4">
                {isGoogleLinked ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {lang === "uz" ? "Google ulandi" : lang === "ru" ? "Google привязан" : "Google linked"}
                    </span>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{email}</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleLinkGoogle}
                    className="w-full font-bold h-12 bg-white text-black hover:bg-white/90 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    disabled={isLinkingGoogle}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.8l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.6 7.7l3.9 3c.9-2.7 3.4-4.7 6.5-4.7z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                      <path fill="#FBBC05" d="M5.5 14.7c-.2-.6-.3-1.3-.3-2.7s.1-2.1.3-2.7L1.6 6.3C.6 8.3 0 10.6 0 13s.6 4.7 1.6 6.7l3.9-3z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2-6.5-4.7l-3.9 3C3.4 20.3 7.3 23 12 23z"/>
                    </svg>
                    {lang === "uz" ? "Google akkauntini bog'lash" : lang === "ru" ? "Привязать аккаунт Google" : "Link Google Account"}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="md:col-span-5 space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              
              <div className="text-center py-6 bg-zinc-950/40 rounded-2xl mb-6 border border-white/5 relative overflow-hidden">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
                  {lang === "uz" ? "Sizning Balansingiz" : lang === "ru" ? "Ваш Баланс" : "Your Balance"}
                </div>
                <div className="text-3xl font-black text-white italic tracking-tight">
                  {profile ? Number(profile.balance || 0).toLocaleString() : "0"} <span className="text-primary text-lg">UZS</span>
                </div>
              </div>

              {/* Top Up Form */}
              <form onSubmit={handleTopup} className="space-y-4 mb-6 pb-6 border-b border-white/5">
                <div className="space-y-2">
                  <label htmlFor="topup" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                    {lang === "uz" ? "Summani kiriting (UZS)" : lang === "ru" ? "Введите сумму (UZS)" : "Enter amount (UZS)"}
                  </label>
                  <Input
                    id="topup"
                    type="number"
                    placeholder="Masalan: 10000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                    required
                    disabled={isTopupLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full font-black tracking-widest h-12 text-sm bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  disabled={isTopupLoading}
                >
                  <CreditCard className="size-4" />
                  {isTopupLoading 
                    ? (lang === "uz" ? "TO'LDIRILMOQDA..." : lang === "ru" ? "ПОПОЛНЕНИЕ..." : "DEPOSITING...")
                    : (lang === "uz" ? "BALANSNI TO'LDIRISH" : lang === "ru" ? "ПОПОЛНИТЬ БАЛАНС" : "TOP UP BALANCE")}
                </Button>
              </form>
              
              <div className="w-full text-left space-y-2 mb-6">
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold">ID (Donat ID)</span>
                  <span className="text-white font-mono select-all bg-black/40 px-2 py-0.5 rounded border border-white/5 truncate max-w-[150px]">{uid}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold">Email</span>
                  <span className="text-white font-medium truncate max-w-[150px]">{email}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold">
                    {lang === "uz" ? "Roli" : lang === "ru" ? "Роль" : "Role"}
                  </span>
                  <span className="text-primary font-black uppercase">
                    {isAdmin 
                      ? "Admin" 
                      : lang === "uz" 
                      ? "Foydalanuvchi" 
                      : lang === "ru" 
                      ? "Пользователь" 
                      : "User"}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-3">
                {isAdmin && (
                  <Button 
                    onClick={() => router.push("/admin/dashboard")}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 border border-white/5 transition-all active:scale-95"
                  >
                    <Shield className="size-4" /> Admin Panel
                  </Button>
                )}
                <Button 
                  onClick={handleLogout}
                  className="w-full bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-500 hover:text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <LogOut className="size-4" />
                  {lang === "uz" ? "Chiqish" : lang === "ru" ? "Выйти" : "Logout"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
