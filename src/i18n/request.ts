import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, type Locale, locales } from "./config";

async function getLocaleFromRequest(): Promise<Locale> {
  // 1. Check cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
  
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie;
  }

  // 2. Check Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  
  if (acceptLanguage) {
    const browserLocales = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2));
    
    for (const browserLocale of browserLocales) {
      if (locales.includes(browserLocale as Locale)) {
        return browserLocale as Locale;
      }
    }
  }

  // 3. Default to Italian
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getLocaleFromRequest();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: "Europe/Rome",
    now: new Date(),
  };
});
