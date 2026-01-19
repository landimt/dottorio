import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { QueryProvider } from "@/lib/query";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Dottorio - Preparati per i tuoi esami",
    template: "%s | Dottorio",
  },
  description:
    "La piattaforma per studenti di medicina italiani. Cerca, studia e condividi domande d'esame.",
  keywords: ["medicina", "esami", "università", "studenti", "Italia", "domande"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={locale} messages={messages}>
            <QueryProvider>
              {children}
            </QueryProvider>
            <Toaster position="top-center" />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
