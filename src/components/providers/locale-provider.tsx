"use client";

import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { ReactNode } from "react";

interface LocaleProviderProps {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
