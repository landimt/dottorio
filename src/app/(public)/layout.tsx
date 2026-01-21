import { LegalFooter, CookieBanner } from "@/components/legal";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Rome">
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <a href="/" className="text-xl font-bold">🩺 Dottorio</a>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <LegalFooter />
        <CookieBanner />
      </div>
    </NextIntlClientProvider>
  );
}
