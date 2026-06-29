import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NeoTerra",
  description: "NeoTerra Privacy Policy and Data Protection",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-zinc-950 text-zinc-100 selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
            PRIVACY <span className="text-purple-500">POLICY</span>
          </h1>
          <p className="text-zinc-500 text-sm">Last updated: June 2026</p>
          <div className="h-1 w-20 bg-purple-500 mx-auto mt-6 rounded-full" />
        </header>

        <div className="space-y-12 text-zinc-300 leading-relaxed font-medium">
          {/* UZBEK VERSION */}
          <section className="border-b border-white/5 pb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20 font-black">UZ</span>
              Maxfiylik Siyosati
            </h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>
                NeoTerra loyihasi foydalanuvchilarning maxfiyligini hurmat qiladi. Ushbu Maxfiylik Siyosati saytimiz va ilovamiz orqali qanday ma'lumotlar to'planishi va ulardan qanday foydalanilishini tushuntiradi.
              </p>
              <div>
                <h3 className="font-bold text-zinc-200 mt-2">1. To'planadigan ma'lumotlar</h3>
                <p>Biz faqatgina quyidagi ma'lumotlarni to'plashimiz mumkin:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Minecraft o'yin nikneymi (do'kon va jamoa ro'yxati uchun).</li>
                  <li>Saytdagi xaridlar tarixi va to'lov holati.</li>
                  <li>Texnik ma'lumotlar (IP-manzil, brauzer turi, qurilma turi) faqat xavfsizlik va optimallashtirish maqsadida.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 mt-2">2. Ma'lumotlardan foydalanish</h3>
                <p>To'plangan ma'lumotlar quyidagi maqsadlarda ishlatiladi:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Ilova va server xizmatlarini taqdim etish.</li>
                  <li>Sotib olingan donatlarni o'yinga yetkazib berish.</li>
                  <li>Server xavfsizligini ta'minlash va firgarlikka qarshi kurashish.</li>
                </ul>
              </div>
              <p>
                Biz sizning shaxsiy ma'lumotlaringizni hech qachon uchinchi shaxslarga sotmaymiz yoki bermaymiz.
              </p>
            </div>
          </section>

          {/* RUSSIAN VERSION */}
          <section className="border-b border-white/5 pb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20 font-black">RU</span>
              Политика конфиденциальности
            </h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>
                Проект NeoTerra уважает конфиденциальность своих пользователей. Настоящая Политика объясняет, как мы собираем, используем и защищаем вашу информацию.
              </p>
              <div>
                <h3 className="font-bold text-zinc-200 mt-2">1. Сбор информации</h3>
                <p>Мы можем собирать следующие данные:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Игровой никнейм Minecraft (для выдачи доната и списков команды).</li>
                  <li>История покупок на сайте и статус транзакций.</li>
                  <li>Технические данные (IP-адрес, тип браузера) исключительно для безопасности и аналитики.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 mt-2">2. Использование данных</h3>
                <p>Собранные данные используются для:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Предоставления услуг сервера и поддержки работоспособности приложения.</li>
                  <li>Выдачи приобретенных донат-услуг в игре.</li>
                  <li>Обеспечения безопасности проекта и предотвращения мошенничества.</li>
                </ul>
              </div>
              <p>
                Мы гарантируем, что ваши личные данные не будут переданы или проданы третьим лицам.
              </p>
            </div>
          </section>

          {/* ENGLISH VERSION */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20 font-black">EN</span>
              Privacy Policy
            </h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>
                NeoTerra Project respects user privacy. This Privacy Policy details the types of information we collect and how we utilize it.
              </p>
              <div>
                <h3 className="font-bold text-zinc-200 mt-2">1. Information Collection</h3>
                <p>We may collect:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Minecraft username (for delivery of shop purchases).</li>
                  <li>Transaction history and purchase statuses.</li>
                  <li>Technical information (IP address, device type) for system security.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-zinc-200 mt-2">2. Use of Information</h3>
                <p>We use the collected data to:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Deliver server services and maintain application stability.</li>
                  <li>Process and credit server store purchases.</li>
                  <li>Prevent fraud and guarantee security of our network.</li>
                </ul>
              </div>
              <p>
                We do not sell, trade, or transfer your personal data to outside parties.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
