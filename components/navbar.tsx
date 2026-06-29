"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, User as UserIcon, LogOut as LogOutIcon, Shield, Key, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { type Language } from "@/lib/dictionaries"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth as firebaseClientAuth } from "@/lib/firebase"
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { getUserProfile, updateMinecraftUsername } from "@/app/actions/player-profile"

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { t, lang, setLang } = useTranslation()
  const { toast } = useToast()

  // Firebase Auth states
  const { uid, email, minecraftUsername, isAdmin, setAuth, setMinecraftUsername, logout: localLogout } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login")
  
  // Form states
  const [emailInput, setEmailInput] = React.useState("")
  const [passwordInput, setPasswordInput] = React.useState("")
  const [nickInput, setNickInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLinking, setIsLinking] = React.useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false)

  // Listen to Firebase Auth state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseClientAuth, async (user) => {
      if (user) {
        // Fetch extra profile data from Firestore (auto-creates if new user)
        const profile = await getUserProfile(user.uid, user.email)
        setAuth({
          uid: user.uid,
          email: user.email,
          minecraftUsername: profile?.minecraftUsername || null,
          isAdmin: profile?.role === "admin" || profile?.role === "owner" || user.email === "admin@neoterra.uz",
        })
      } else {
        localLogout()
      }
    })
    return () => unsubscribe()
  }, [setAuth, localLogout])


  const navLinks = [
    { name: t("nav", "home"), href: "/" },
    { name: t("nav", "news"), href: "/news" },
    { name: t("nav", "shop"), href: "/shop" },
    { name: t("nav", "stats"), href: "/stats" },
    { name: lang === "uz" ? "JAMOA" : lang === "ru" ? "КОМАНДА" : "TEAM", href: "/staff" },
    { name: lang === "uz" ? "JAZOLAR" : lang === "ru" ? "НАКАЗАНИЯ" : "PENALTIES", href: "/bans" },
    { name: t("nav", "rules"), href: "/rules" },
    { name: t("nav", "help"), href: "/help" },
    { name: t("nav", "social"), href: "/social" },
  ]

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(firebaseClientAuth, provider)
      setIsLoginOpen(false)
      toast({
        title: "Muvaffaqiyatli!",
        description: "Google orqali tizimga kirdingiz.",
      })
    } catch (error: any) {
      toast({
        title: "Xatolik!",
        description: error.message || "Google orqali kirishda xato.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !passwordInput) {
      toast({
        title: "Xatolik",
        description: "Email va parolni kiriting.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(firebaseClientAuth, emailInput, passwordInput)
        toast({
          title: "Xush kelibsiz!",
          description: "Tizimga muvaffaqiyatli kirdingiz.",
        })
      } else {
        await createUserWithEmailAndPassword(firebaseClientAuth, emailInput, passwordInput)
        toast({
          title: "Ro'yxatdan o'tildi!",
          description: "Akkauntingiz yaratildi.",
        })
      }
      setIsLoginOpen(false)
      setEmailInput("")
      setPasswordInput("")
    } catch (error: any) {
      toast({
        title: "Xatolik!",
        description: error.message || "Kirish/Ro'yxatdan o'tishda xatolik.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkNickname = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid || !nickInput.trim()) return

    setIsLinking(true)
    try {
      const res = await updateMinecraftUsername(uid, nickInput)
      if (res.success) {
        setMinecraftUsername(nickInput.trim())
        setIsLinkDialogOpen(false)
        setNickInput("")
        toast({
          title: "Muvaffaqiyatli!",
          description: res.message,
        })
      } else {
        toast({
          title: "Xatolik!",
          description: res.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Xatolik!",
        description: "Baza bilan bog'lanishda muammo.",
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleLogout = async () => {
    await firebaseSignOut(firebaseClientAuth)
    localLogout()
    toast({
      title: "Chiqildi",
      description: "Siz tizimdan chiqdingiz.",
    })
  }

  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass-effect rounded-[2.5rem] px-6 h-16 flex items-center justify-between shadow-2xl">
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tighter text-white liquid-shadow group-hover:scale-105 transition-transform whitespace-nowrap">
              NEO <span className="text-primary">TERRA</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1 gap-1 px-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-full text-[12px] lg:text-[13px] font-bold tracking-wider transition-all duration-300 whitespace-nowrap",
                pathname === link.href ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5",
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {uid ? (
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all h-10 shadow-lg group">
                    <UserIcon className="size-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-tight text-white max-w-[120px] truncate">
                      {minecraftUsername || email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-zinc-950/80 backdrop-blur-2xl border-white/10 p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" align="end">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5 flex flex-col gap-1">
                    <span>
                      {lang === "uz" ? "Mening Profilim" : lang === "ru" ? "Мой Профиль" : "My Profile"}
                    </span>
                    <span className="text-white/40 normal-case font-medium">{email}</span>
                  </DropdownMenuLabel>
                  
                  <div className="px-2 py-4 flex flex-col items-center justify-center bg-zinc-950/40 rounded-xl mb-2 border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 blur-xl -z-10 group-hover:bg-primary/10 transition-colors" />
                    {minecraftUsername ? (
                      <>
                        <img 
                          src={`https://mc-heads.net/body/${minecraftUsername}/100`} 
                          alt={minecraftUsername}
                          className="h-32 w-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="mt-2 text-xs font-black text-white italic tracking-tighter uppercase">{minecraftUsername}</div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <span className="text-xs text-zinc-500 font-bold block mb-2">
                          {lang === "uz" ? "Minecraft nik bog'lanmagan" : lang === "ru" ? "Никнейм Minecraft не привязан" : "Minecraft nickname not linked"}
                        </span>
                        <Button 
                          onClick={() => setIsLinkDialogOpen(true)}
                          className="text-[10px] font-bold tracking-wider uppercase h-8 px-4 rounded-full bg-primary hover:bg-primary/90"
                        >
                          {lang === "uz" ? "Bog'lash" : lang === "ru" ? "Привязать" : "Link Nickname"}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator className="bg-primary/10" />
                  
                  <Link href="/settings">
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary py-2.5 rounded-md">
                      <Key className="size-4 text-white/70" />
                      <span className="font-bold text-xs uppercase tracking-wider text-white/70">
                        {lang === "uz" ? "Sozlamalar" : lang === "ru" ? "Настройки" : "Settings"}
                      </span>
                    </DropdownMenuItem>
                  </Link>

                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary py-2.5 rounded-md">
                        <Shield className="size-4" />
                        <span className="font-bold text-xs uppercase tracking-wider">Admin Panel</span>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  <DropdownMenuSeparator className="bg-primary/10" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive py-2.5 rounded-md"
                  >
                    <LogOutIcon className="size-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {lang === "uz" ? "Chiqish" : lang === "ru" ? "Выйти" : "Logout"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Minecraft Nickname Link Dialog */}
              <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent className="sm:max-w-[400px] border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">
                      Minecraft Nikni Bog'lash
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 font-medium">
                      Serverdagi do'kondan foydalanish va statistikangizni ko'rish uchun nikingizni kiriting.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLinkNickname} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="nickname" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                        Minecraft Nik
                      </label>
                      <Input
                        id="nickname"
                        placeholder="Masalan: SarvarGamer"
                        value={nickInput}
                        onChange={(e) => setNickInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-xl text-white font-bold"
                        required
                        disabled={isLinking}
                      />
                    </div>
                    <DialogFooter className="mt-2">
                      <Button type="submit" className="w-full font-black tracking-widest h-12 text-sm bg-primary hover:bg-primary/90 rounded-xl" disabled={isLinking}>
                        {isLinking ? "SAQLANMOQDA..." : "SAQLASH"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-primary hover:bg-primary/80 px-6 font-bold shadow-lg shadow-primary/20">
                  KIRISH
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]">
                <DialogHeader className="relative">
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
                  <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter liquid-shadow relative z-10">
                    NEO<span className="text-primary italic">TERRA</span> <span className="text-white/40">{authMode === "login" ? "KIRISH" : "ROYXATDAN O'TISH"}</span>
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 font-medium">
                    {authMode === "login" ? "Tizimga kirish uchun ma'lumotlarni kiriting." : "Ro'yxatdan o'tish uchun ma'lumotlarni to'ldiring."}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 mt-2">
                  <Button 
                    onClick={handleGoogleLogin} 
                    className="w-full font-bold h-12 bg-white text-black hover:bg-white/90 rounded-xl flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.8l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.6 7.7l3.9 3c.9-2.7 3.4-4.7 6.5-4.7z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                      <path fill="#FBBC05" d="M5.5 14.7c-.2-.6-.3-1.3-.3-2.7s.1-2.1.3-2.7L1.6 6.3C.6 8.3 0 10.6 0 13s.6 4.7 1.6 6.7l3.9-3z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2-6.5-4.7l-3.9 3C3.4 20.3 7.3 23 12 23z"/>
                    </svg>
                    Google orqali kirish
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-950 px-2 text-zinc-500 font-bold">YOKI</span></div>
                  </div>

                  <form onSubmit={handleEmailAuth} className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1">
                        <Mail className="size-3" /> Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@neoterra.uz"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-xl text-white font-bold"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1">
                        <Lock className="size-3" /> Parol
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-xl text-white font-bold"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full font-black tracking-widest h-12 bg-primary hover:bg-primary/90 rounded-xl mt-2" 
                      disabled={isLoading}
                    >
                      {isLoading ? "TEKSHIRILMOQDA..." : authMode === "login" ? "KIRISH" : "RO'YXATDAN O'TISH"}
                    </Button>
                  </form>

                  <div className="text-center mt-2">
                    <button 
                      onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      {authMode === "login" ? "Yangi hisob yaratish" : "Menda allaqachon hisob bor (Kirish)"}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              const order: Language[] = ['uz', 'ru', 'en']
              const nextIndex = (order.indexOf(lang) + 1) % order.length
              setLang(order[nextIndex])
            }}
            className="font-bold text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 shrink-0"
          >
            {lang.toUpperCase()}
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden glass-pill border-white/10 bg-white/5 hover:bg-white/10 size-10"
              >
                <Menu className="size-5 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="glass-effect border-white/10 text-white backdrop-blur-[40px] bg-white/5 shadow-[0_8px_64px_rgba(0,0,0,0.5)] border-l"
            >
              <SheetHeader>
                <SheetTitle className="text-xl font-black text-primary uppercase italic tracking-tighter liquid-shadow">
                  NEO <span className="text-white">TERRA</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-8 mt-12 text-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-xl font-bold tracking-[0.2em] transition-all duration-300",
                      pathname === link.href
                        ? "text-primary scale-110"
                        : "text-white/40 hover:text-white hover:scale-105",
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
