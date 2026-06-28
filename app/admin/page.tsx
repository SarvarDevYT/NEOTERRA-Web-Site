"use client";

import { useState, useEffect } from "react";
import { setAdminSession } from "../actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, AlertTriangle, Loader2, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { auth as firebaseClientAuth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "unauthorized" | "success">("checking");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseClientAuth, async (user) => {
      if (!user) {
        setAuthState("unauthenticated");
        setUserEmail(null);
        return;
      }

      setUserEmail(user.email);
      setAuthState("checking");

      try {
        const idToken = await user.getIdToken();
        const result = await setAdminSession(idToken);

        if (result?.error) {
          toast.error(result.error);
          setAuthState("unauthorized");
        } else {
          toast.success("Admin panelga yo'naltirilmoqda...");
          setAuthState("success");
          router.push("/admin/dashboard");
        }
      } catch (error: any) {
        console.error("Auth check error:", error);
        toast.error("Tekshirishda xatolik yuz berdi!");
        setAuthState("unauthorized");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(firebaseClientAuth);
      toast.success("Tizimdan chiqildi");
      setAuthState("unauthenticated");
    } catch (error) {
      toast.error("Tizimdan chiqishda xatolik");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <Card className="relative w-full max-w-md border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl text-white shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-purple-500/20 bg-purple-950/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            {authState === "checking" && <Loader2 className="h-7 w-7 animate-spin" />}
            {authState === "unauthenticated" && <Shield className="h-7 w-7" />}
            {authState === "unauthorized" && <AlertTriangle className="h-7 w-7 text-amber-500" />}
            {authState === "success" && <Shield className="h-7 w-7 text-green-500" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Admin Paneli
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            {authState === "checking" && "Tizimga kirish huquqingiz tekshirilmoqda..."}
            {authState === "unauthenticated" && "Admin panelga faqat ruxsat berilgan adminlar va ownerlar kira oladi."}
            {authState === "unauthorized" && "Sizning hisobingizda adminlik huquqi mavjud emas."}
            {authState === "success" && "Muvaffaqiyatli tekshirildi, boshqaruv paneliga o'tilmoqda..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 py-4 text-center">
          {authState === "unauthenticated" && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
              Ushbu sahifaga kirish uchun avval tizimga kiring. Agar tizimga kirgan bo'lsangiz va ushbu xabarni ko'rayotgan bo'lsangiz, sahifani yangilang.
            </div>
          )}

          {authState === "unauthorized" && userEmail && (
            <div className="rounded-lg border border-amber-500/10 bg-amber-950/10 p-4 text-sm text-zinc-300">
              Siz tizimga <strong className="text-white">{userEmail}</strong> orqali kirgansiz. 
              Ushbu hisobda admin yoki owner roli yo'q.
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          {authState === "unauthenticated" && (
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-purple-600 hover:bg-purple-700 font-semibold shadow-lg shadow-purple-600/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Bosh sahifaga qaytish
            </Button>
          )}

          {authState === "unauthorized" && (
            <>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full font-semibold shadow-lg shadow-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" /> Hisobdan chiqish
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Bosh sahifa
              </Button>
            </>
          )}

          {authState === "checking" && (
            <div className="text-zinc-500 text-xs text-center w-full animate-pulse">
              Firebase Auth va Firestore tekshiruvi amalga oshirilmoqda...
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
