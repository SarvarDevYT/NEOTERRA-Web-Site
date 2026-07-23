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
  signOut as firebaseSignOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth as firebaseClientAuth } from "@/lib/firebase";
import { updateMinecraftUsername, getUserProfile } from "@/app/actions/player-profile";
import { createInpayPaymentAction, getUserPaymentsAction } from "@/app/actions/inpay";
import { verifyLinkCode, kickPlayer, tempBanPlayer } from "@/app/actions/player-link";
import { unlinkTelegramAction, unlinkMinecraftAction } from "@/app/actions/player-profile";
import { getSystemSettingsAction } from "@/app/actions/system-settings";
import { Shield, Key, Mail, User, LogOut, Check, CreditCard, Gamepad2, Ban, DoorOpen, Send, Unlink, HelpCircle, History, FileText, ExternalLink, RefreshCw, Lock, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
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
  const [linkCode, setLinkCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [isAdminTopupOpen, setIsAdminTopupOpen] = useState(false);
  const [adminTopupAmount, setAdminTopupAmount] = useState("");
  const [isUnlinkingTg, setIsUnlinkingTg] = useState(false);
  const [isUnlinkingMc, setIsUnlinkingMc] = useState(false);

  const [payments, setPayments] = useState<any[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
  const [inpayEnabled, setInpayEnabled] = useState(true);
  const [inpayNotice, setInpayNotice] = useState("");

  // Password Management States
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  const hasPasswordProvider = userAuth?.providerData?.some(
    (p: any) => p.providerId === "password"
  );

  // Function to set password for Google users
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      toast({
        title: lang === "uz" ? "Xatolik" : "Error",
        description: lang === "uz" ? "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak." : "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      toast({
        title: lang === "uz" ? "Xatolik" : "Error",
        description: lang === "uz" ? "Parollar bir-biriga mos kelmadi." : "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      const currentUser = firebaseClientAuth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error("Foydalanuvchi topilmadi");

      const credential = EmailAuthProvider.credential(currentUser.email, newPasswordInput);
      try {
        await linkWithCredential(currentUser, credential);
      } catch (linkErr: any) {
        await updatePassword(currentUser, newPasswordInput);
      }

      await currentUser.reload();
      setUserAuth({ ...firebaseClientAuth.currentUser });
      toast({
        title: lang === "uz" ? "Muvaffaqiyatli! 🎉" : "Success!",
        description: lang === "uz" 
          ? "Profilingizga parol muvaffaqiyatli o'rnatildi! Endi email va ushbu parol orqali ham kirsangiz bo'ladi." 
          : "Password set successfully! You can now log in with email & password.",
      });
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      console.error("Set password error:", err);
      toast({
        title: lang === "uz" ? "Xatolik!" : "Error!",
        description: err.message || "Parol o'rnatishda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Function to change password for users who already have password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput) {
      toast({
        title: lang === "uz" ? "Xatolik" : "Error",
        description: lang === "uz" ? "Eski parolingizni kiriting." : "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 6) {
      toast({
        title: lang === "uz" ? "Xatolik" : "Error",
        description: lang === "uz" ? "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak." : "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      toast({
        title: lang === "uz" ? "Xatolik" : "Error",
        description: lang === "uz" ? "Yangi parollar bir-biriga mos kelmadi." : "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      const currentUser = firebaseClientAuth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error("Foydalanuvchi topilmadi");

      // Re-authenticate with current password
      const cred = EmailAuthProvider.credential(currentUser.email, currentPasswordInput);
      await reauthenticateWithCredential(currentUser, cred);

      // Update password
      await updatePassword(currentUser, newPasswordInput);

      toast({
        title: lang === "uz" ? "Muvaffaqiyatli! 🎉" : "Success!",
        description: lang === "uz" ? "Parolingiz muvaffaqiyatli almashtirildi!" : "Password changed successfully!",
      });
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      console.error("Change password error:", err);
      let msg = err.message || "Parolni almashtirishda xatolik yuz berdi.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = lang === "uz" ? "Eski parolingiz noto'g'ri kiritildi!" : "Current password is incorrect!";
      }
      toast({
        title: lang === "uz" ? "Xatolik!" : "Error!",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!email) return;
    setIsSendingResetEmail(true);
    try {
      await sendPasswordResetEmail(firebaseClientAuth, email);
      toast({
        title: lang === "uz" ? "Xabar Yuborildi! 📧" : "Email Sent!",
        description: lang === "uz" 
          ? `Parolni tiklash xabari ${email} pochtasiga yuborildi! Gmailingizni tekshiring.` 
          : `Password reset link sent to ${email}!`,
      });
    } catch (err: any) {
      toast({
        title: lang === "uz" ? "Xatolik!" : "Error!",
        description: err.message || "Xabar yuborishda xato.",
        variant: "destructive",
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      // System Settings check for InPay maintenance mode
      const sysSettings = await getSystemSettingsAction();
      setInpayEnabled(sysSettings.inpayEnabled);
      if (sysSettings.inpayNoticeMessage) {
        setInpayNotice(sysSettings.inpayNoticeMessage);
      }

      if (uid) {
        const data = await getUserProfile(uid, email);
        if (data) {
          setProfile(data);
        }
        
        setIsPaymentsLoading(true);
        const pData = await getUserPaymentsAction(uid);
        if (pData.success && pData.payments) {
          setPayments(pData.payments);
        }
        setIsPaymentsLoading(false);
      }
    }
    loadData();
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
      const username = minecraftUsername || email?.split("@")[0] || uid || "";
      const result = await createInpayPaymentAction(
        "balance_topup",
        username,
        amountNum,
        undefined,
        uid || undefined
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white p-4">
        <p className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse text-sm">
          {lang === "uz" ? "Sozlamalar yuklanmoqda..." : lang === "ru" ? "Загрузка настроек..." : "Loading settings..."}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-6xl py-12 sm:py-20 md:py-28 px-4 sm:px-6 relative z-10 flex-grow">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex h-14 w-14 sm:h-18 sm:w-18 md:h-20 md:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 mb-4 sm:mb-6 border border-white/10 backdrop-blur-xl shadow-2xl">
            <Key className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-3 sm:mb-4 liquid-shadow">
            {lang === "uz" ? (
              <>PROFIL <span className="text-purple-500">SOZLAMALARI</span></>
            ) : lang === "ru" ? (
              <>НАСТРОЙКИ <span className="text-purple-500">ПРОФИЛЯ</span></>
            ) : (
              <>PROFILE <span className="text-purple-500">SETTINGS</span></>
            )}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-xl mx-auto font-medium px-2">
            {lang === "uz"
              ? "Akkaunt sozlamalarini boshqarish, ijtimoiy tarmoqlarni ulash va Minecraft nikingizni tahrirlash."
              : lang === "ru"
              ? "Управление настройками аккаунта, привязка социальных сетей и редактирование вашего никнейма Minecraft."
              : "Manage account settings, link social networks and edit your Minecraft nickname."}
          </p>
        </header>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* CHAP USTUN (LEFT COLUMN - 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. IJTIMOIY TARMOQLARNI ULASH */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                  {lang === "uz" ? "Ijtimoiy Tarmoqlarni Ulash" : lang === "ru" ? "Привязка социальных сетей" : "Link Social Accounts"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                  {lang === "uz"
                    ? "Kirishni osonlashtirish uchun Google profilingizni bog'lang."
                    : lang === "ru"
                    ? "Привяжите аккаунт Google для упрощения входа в систему."
                    : "Link your Google profile to make login easier."}
                </CardDescription>
              </CardHeader>
              
              <div className="space-y-4">
                {/* Google Login Status */}
                {isGoogleLinked ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs sm:text-sm gap-2">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0" />
                      {lang === "uz" ? "Google ulandi" : lang === "ru" ? "Google привязан" : "Google linked"}
                    </span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 uppercase tracking-wider font-medium truncate max-w-[200px] sm:max-w-none">{email}</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleLinkGoogle}
                    className="w-full font-bold h-11 sm:h-12 bg-white text-black hover:bg-white/90 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
                    disabled={isLinkingGoogle}
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.8l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.6 7.7l3.9 3c.9-2.7 3.4-4.7 6.5-4.7z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                      <path fill="#FBBC05" d="M5.5 14.7c-.2-.6-.3-1.3-.3-2.7s.1-2.1.3-2.7L1.6 6.3C.6 8.3 0 10.6 0 13s.6 4.7 1.6 6.7l3.9-3z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2-6.5-4.7l-3.9 3C3.4 20.3 7.3 23 12 23z"/>
                    </svg>
                    {lang === "uz" ? "Google akkauntini bog'lash" : lang === "ru" ? "Привязать аккаунт Google" : "Link Google Account"}
                  </Button>
                )}

                {/* Telegram Linking */}
                <div className="pt-3 border-t border-white/5">
                  {profile?.telegramUsername ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs sm:text-sm gap-2">
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0" />
                        {lang === "uz" ? "Telegram ulandi" : lang === "ru" ? "Telegram привязан" : "Telegram linked"}
                      </span>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-[11px] sm:text-xs text-zinc-500 uppercase tracking-wider font-medium truncate">{profile.telegramUsername}</span>
                        <button
                          onClick={async () => {
                            if (!uid) return;
                            if (!confirm(lang === "uz" ? "Telegram akkauntni uzmoqchimisiz?" : "Unlink Telegram?")) return;
                            setIsUnlinkingTg(true);
                            const res = await unlinkTelegramAction(uid);
                            toast({ title: res.success ? "✅" : "❌", description: res.message });
                            if (res.success) {
                              const data = await getUserProfile(uid, email);
                              if (data) setProfile(data);
                            }
                            setIsUnlinkingTg(false);
                          }}
                          disabled={isUnlinkingTg}
                          className="text-xs text-red-400 hover:text-red-300 underline font-bold shrink-0"
                        >
                          {isUnlinkingTg ? "..." : (lang === "uz" ? "Uzish" : "Unlink")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={`https://t.me/neoterrauz_bot?start=link_${uid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        className="w-full font-bold h-11 sm:h-12 bg-[#229ED9] text-white hover:bg-[#1a8abf] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.012-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        {lang === "uz" ? "Telegram akkauntini bog'lash" : lang === "ru" ? "Привязать аккаунт Telegram" : "Link Telegram Account"}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {/* 2. PAROL XAVFSIZLIGI CARD */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-purple-400 shrink-0" />
                  {!hasPasswordProvider 
                    ? (lang === "uz" ? "Profilga Parol O'rnating" : "Set Profile Password") 
                    : (lang === "uz" ? "Parolni Almashtirish" : "Change Password")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                  {!hasPasswordProvider
                    ? (lang === "uz"
                        ? "Siz Google orqali ro'yxatdan o'tgansiz. Tizimga email va parol bilan ham kirish imkoniyatiga ega bo'lish uchun profilga parol o'rnating."
                        : "Set a password for your account to log in with email and password.")
                    : (lang === "uz"
                        ? "Profil xavfsizligini ta'minlash uchun parolingizni muntazam almashtirib turing."
                        : "Update your password regularly to keep your account secure.")}
                </CardDescription>
              </CardHeader>

              {!hasPasswordProvider ? (
                /* FORM TO SET PASSWORD FOR GOOGLE USER */
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1">
                      <Lock className="size-3" /> {lang === "uz" ? "Yangi Parol" : "New Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-purple-500 h-11 sm:h-12 bg-white/5 rounded-xl text-white font-bold pr-10 text-xs sm:text-sm"
                        required
                        disabled={isPasswordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1">
                      <Lock className="size-3" /> {lang === "uz" ? "Parolni Tasdiqlang" : "Confirm Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-purple-500 h-11 sm:h-12 bg-white/5 rounded-xl text-white font-bold pr-10 text-xs sm:text-sm"
                        required
                        disabled={isPasswordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="w-full font-bold h-11 sm:h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm shadow-lg shadow-purple-600/30"
                  >
                    <ShieldCheck className="size-4" />
                    {isPasswordLoading
                      ? (lang === "uz" ? "O'RNATILMOQDA..." : "SETTING...")
                      : (lang === "uz" ? "PAROLNI O'RNATISH VA BIRIKTIRISH" : "SET & LINK PASSWORD")}
                  </Button>
                </form>
              ) : (
                /* FORM TO CHANGE EXISTING PASSWORD */
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1">
                      <Lock className="size-3" /> {lang === "uz" ? "Eski Parolingiz" : "Current Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-purple-500 h-11 sm:h-12 bg-white/5 rounded-xl text-white font-bold pr-10 text-xs sm:text-sm"
                        required
                        disabled={isPasswordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1">
                      <Lock className="size-3" /> {lang === "uz" ? "Yangi Parol" : "New Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-purple-500 h-11 sm:h-12 bg-white/5 rounded-xl text-white font-bold pr-10 text-xs sm:text-sm"
                        required
                        disabled={isPasswordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1">
                      <Lock className="size-3" /> {lang === "uz" ? "Yangi Parolni Tasdiqlang" : "Confirm New Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-purple-500 h-11 sm:h-12 bg-white/5 rounded-xl text-white font-bold pr-10 text-xs sm:text-sm"
                        required
                        disabled={isPasswordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="w-full font-bold h-11 sm:h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm shadow-lg shadow-purple-600/30"
                  >
                    <KeyRound className="size-4" />
                    {isPasswordLoading
                      ? (lang === "uz" ? "ALMASHTIRILMOQDA..." : "CHANGING...")
                      : (lang === "uz" ? "PAROLNI ALMASHTIRISH" : "CHANGE PASSWORD")}
                  </Button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={isSendingResetEmail}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold underline transition-colors"
                    >
                      {isSendingResetEmail 
                        ? (lang === "uz" ? "Yuborilmoqda..." : "Sending...") 
                        : (lang === "uz" ? "Eski parolingizni unutdingizmi? (Gmail-ga tiklash xabarini yuborish)" : "Forgot password? Send reset email")}
                    </button>
                  </div>
                </form>
              )}
            </Card>

            {/* 2. TO'LOVLAR TARIXI (PAYMENT HISTORY CARD) */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <History className="size-5 text-amber-400 shrink-0" />
                    {lang === "uz" ? "To'lovlar Tarixi" : lang === "ru" ? "История платежей" : "Payment History"}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    {lang === "uz" 
                      ? "InPay va Admin orqali amalga oshirilgan to'lovlar va rasmiy cheklar." 
                      : lang === "ru" 
                      ? "Платежи через InPay и Admin, официальные чеки." 
                      : "Payments made via InPay & Admin, official receipts."}
                  </p>
                </div>

                <Button
                  onClick={async () => {
                    if (uid) {
                      setIsPaymentsLoading(true);
                      const pData = await getUserPaymentsAction(uid);
                      if (pData.success && pData.payments) {
                        setPayments(pData.payments);
                      }
                      setIsPaymentsLoading(false);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80 rounded-xl text-xs flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                >
                  <RefreshCw className={`size-3.5 ${isPaymentsLoading ? "animate-spin" : ""}`} />
                  {lang === "uz" ? "Yangilash" : lang === "ru" ? "Обновить" : "Refresh"}
                </Button>
              </div>

              {isPaymentsLoading ? (
                <div className="py-8 text-center text-zinc-500 text-xs font-medium">
                  {lang === "uz" ? "To'lovlar yuklanmoqda..." : "Loading payments..."}
                </div>
              ) : payments.length === 0 ? (
                <div className="py-8 text-center text-zinc-600 text-xs font-bold uppercase tracking-wider">
                  {lang === "uz" ? "Sizda hali to'lovlar mavjud emas" : lang === "ru" ? "У вас пока нет платежей" : "No payment history found"}
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {payments.map((p) => {
                    const isSuccess = p.status === "success" || p.status === "completed" || p.status === "paid";
                    const isCancelled = p.status === "cancelled" || p.status === "failed" || p.status === "rejected";
                    const isPending = p.status === "pending";

                    const dateStr = new Date(p.createdAt).toLocaleString(lang === "uz" ? "uz-UZ" : "en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const method = (p.paymentMethod || (p.inpayOrderId ? "INPAY" : "ADMIN")).toUpperCase();
                    const receiptUrl = method === "INPAY" ? (p.receiptUrl || (p.inpayOrderId ? `https://inpay.uz/r/${p.inpayOrderId}` : null)) : null;

                    return (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div
                            className={`p-2.5 rounded-xl border shrink-0 ${
                              isSuccess
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : isCancelled
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}
                          >
                            <CreditCard className="size-4 sm:size-5" />
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-2">
                              {/* Payment Method Badge */}
                              {method === "INPAY" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-black tracking-wider uppercase">
                                  ⚡ INPAY
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-black tracking-wider uppercase">
                                  🛡️ ADMIN
                                </span>
                              )}

                              <span className="truncate max-w-[140px] sm:max-w-[200px]">{p.description || "To'lov"}</span>
                              <span className="text-amber-400 text-xs font-mono font-bold ml-auto sm:ml-0">
                                {p.amount.toLocaleString()} UZS
                              </span>
                            </div>

                            <div className="text-[10px] sm:text-[11px] text-zinc-500 font-mono truncate">
                              {dateStr} {p.inpayOrderId ? `· Order: #${p.inpayOrderId}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isSuccess
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : isCancelled
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}
                          >
                            {isSuccess && (lang === "uz" ? "Tasdiqlandi" : lang === "ru" ? "Успешно" : "Success")}
                            {isCancelled && (lang === "uz" ? "Bekor qilindi" : lang === "ru" ? "Отменено" : "Cancelled")}
                            {isPending && (lang === "uz" ? "Kutilmoqda" : lang === "ru" ? "Ожидание" : "Pending")}
                          </span>

                          {/* InPay Receipt Button */}
                          {method === "INPAY" && receiptUrl && (
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-[11px] font-bold transition-all"
                            >
                              <FileText className="size-3" />
                              <span>{lang === "uz" ? "Chek" : "Receipt"}</span>
                              <ExternalLink className="size-2.5 text-amber-400/60" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

          </div>

          {/* O'NG USTUN (RIGHT COLUMN - 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. SIZNING BALANSINGIZ VA TO'LOV FORMASI */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              
              <div className="text-center py-5 sm:py-6 bg-zinc-950/50 rounded-xl sm:rounded-2xl mb-5 border border-white/5 relative overflow-hidden">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
                  {lang === "uz" ? "Sizning Balansingiz" : lang === "ru" ? "Ваш Баланс" : "Your Balance"}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
                  {profile ? Number(profile.balance || 0).toLocaleString() : "0"} <span className="text-primary text-base sm:text-lg">UZS</span>
                </div>
              </div>

              {/* Top Up Form */}
              <form onSubmit={handleTopup} className="space-y-3.5 mb-5 pb-5 border-b border-white/5">
                <div className="space-y-1.5">
                  <label htmlFor="topup" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                    {lang === "uz" ? "Summani kiriting (UZS)" : lang === "ru" ? "Введите сумму (UZS)" : "Enter amount (UZS)"}
                  </label>
                  <Input
                    id="topup"
                    type="number"
                    placeholder="Masalan: 10000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="border-white/10 focus-visible:ring-primary h-11 sm:h-12 bg-white/5 rounded-xl text-white font-bold placeholder:text-zinc-700 text-xs sm:text-sm"
                    required
                    disabled={isTopupLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className={`w-full font-black tracking-wider h-11 sm:h-12 text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                    !inpayEnabled 
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5" 
                      : "bg-primary hover:bg-primary/90 text-white active:scale-95"
                  }`}
                  disabled={isTopupLoading || !inpayEnabled}
                >
                  <CreditCard className="size-4" />
                  {!inpayEnabled 
                    ? (lang === "uz" ? "INPAY VAQTINCHALIK O'CHIRILGAN" : "INPAY TEMPORARILY DISABLED")
                    : isTopupLoading 
                    ? (lang === "uz" ? "TO'LDIRILMOQDA..." : "DEPOSITING...")
                    : (lang === "uz" ? "AVTO TO'LOV (INPAY)" : "AUTO PAY (INPAY)")}
                </Button>

                {!inpayEnabled && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium leading-relaxed">
                    ⚠️ {inpayNotice || (lang === "uz" ? "InPay to'lov tizimida texnik ishlar olib borilmoqda. Balansni Admin orqali to'ldirishingiz mumkin." : "InPay is under maintenance. Please top up via Admin.")}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    const amt = prompt(lang === "uz" ? "Qancha summa to'ldirmoqchisiz (UZS)?" : "How much to top up (UZS)?", "10000");
                    if (!amt || isNaN(Number(amt))) return;
                    const msg = `Salom Admin, mening Donat ID: ${uid}, Email: ${email}. Saytdagi balansimni ${Number(amt).toLocaleString()} UZS ga to'ldirmoqchiman.`;
                    window.open(`https://t.me/neoterrauz_bot?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  className="w-full font-bold h-11 sm:h-12 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center gap-2 border border-white/5"
                >
                  <Send className="size-4 text-purple-400" />
                  {lang === "uz" ? "ADMIN ORQALI TO'LDIRISH (TELEGRAM)" : "TOP UP VIA ADMIN (TELEGRAM)"}
                </Button>
              </form>
              
              {/* User Info Details */}
              <div className="w-full text-left space-y-2">
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold text-[10px] sm:text-xs">ID (Donat ID)</span>
                  <span className="text-white font-mono select-all bg-black/40 px-2 py-0.5 rounded border border-white/5 truncate max-w-[130px] sm:max-w-[160px] text-[11px] sm:text-xs">{uid}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold text-[10px] sm:text-xs">Email</span>
                  <span className="text-white font-medium truncate max-w-[150px] sm:max-w-[180px] text-[11px] sm:text-xs">{email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider font-bold text-[10px] sm:text-xs">{lang === "uz" ? "Roli" : "Role"}</span>
                  <span className="text-purple-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                    {profile?.role || (isAdmin ? "Admin" : "Foydalanuvchi")}
                  </span>
                </div>
              </div>
            </Card>

            {/* 2. MINECRAFT AKKAUNT CARD */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-purple-400 shrink-0" />
                  Minecraft Akkaunt
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 font-medium mt-1">
                  {lang === "uz"
                    ? "Serverda /link buyrug'ini yozing va olingan 6 raqamli kodni kiriting."
                    : "Enter /link on server and input the 6-digit code here."}
                </CardDescription>
              </CardHeader>
              
              <div className="space-y-4">
                {profile?.minecraftUsername ? (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-purple-300">
                      <span>Ulandigan Nik:</span>
                      <span className="font-mono text-white bg-black/40 px-2 py-0.5 rounded border border-white/5">{profile.minecraftUsername}</span>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!uid) return;
                        if (!confirm(lang === "uz" ? "Minecraft nikingizni uzmoqchimisiz?" : "Unlink Minecraft?")) return;
                        setIsUnlinkingMc(true);
                        const res = await unlinkMinecraftAction(uid);
                        toast({ title: res.success ? "✅" : "❌", description: res.message });
                        if (res.success) {
                          const data = await getUserProfile(uid, email);
                          if (data) setProfile(data);
                          setMinecraftUsername(null);
                        }
                        setIsUnlinkingMc(false);
                      }}
                      disabled={isUnlinkingMc}
                      variant="outline"
                      className="w-full h-9 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs font-bold rounded-lg"
                    >
                      <Unlink className="size-3.5 mr-1.5" />
                      {isUnlinkingMc ? "..." : (lang === "uz" ? "Akkauntni uzish" : "Unlink Account")}
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!uid || !linkCode.trim()) return;
                      setIsVerifying(true);
                      const res = await verifyLinkCode(uid, linkCode.trim());
                      toast({ title: res.success ? "✅" : "❌", description: res.message });
                      if (res.success) {
                        setLinkCode("");
                        const data = await getUserProfile(uid, email);
                        if (data) {
                          setProfile(data);
                          if (data.minecraftUsername) setMinecraftUsername(data.minecraftUsername);
                        }
                      }
                      setIsVerifying(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="123456"
                      value={linkCode}
                      onChange={(e) => setLinkCode(e.target.value)}
                      maxLength={6}
                      className="border-white/10 focus-visible:ring-purple-500 h-11 bg-white/5 rounded-xl text-white font-mono text-center tracking-widest text-sm font-bold"
                      required
                      disabled={isVerifying}
                    />
                    <Button
                      type="submit"
                      disabled={isVerifying}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 px-4 rounded-xl transition-all shrink-0 text-xs sm:text-sm"
                    >
                      {isVerifying ? "..." : (lang === "uz" ? "Tasdiqlash" : "Verify")}
                    </Button>
                  </form>
                )}
              </div>
            </Card>

            {/* 3. BUTTONS (ADMIN PANEL & LOGOUT) */}
            <div className="space-y-3 pt-2">
              {isAdmin && (
                <Button 
                  onClick={() => router.push("/admin/dashboard")}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-11 sm:h-12 rounded-xl flex items-center justify-center gap-2 border border-white/5 transition-all active:scale-95 text-xs sm:text-sm"
                >
                  <Shield className="size-4 text-purple-400" /> Admin Panel
                </Button>
              )}
              <Button 
                onClick={handleLogout}
                className="w-full bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-500 hover:text-white font-bold h-11 sm:h-12 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
              >
                <LogOut className="size-4" />
                {lang === "uz" ? "Chiqish" : lang === "ru" ? "Выйти" : "Logout"}
              </Button>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
