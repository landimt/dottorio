"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Mail } from "lucide-react";

export function LegalFooter() {
  const t = useTranslations("legal");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre Dottorio */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {t("footer.about.title")}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("footer.about.description")}
            </p>
          </div>

          {/* Links Legais */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {t("footer.legal.title")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t("footer.legal.cookies")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {t("footer.contact.title")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:info@dottorio.it"
                  className="hover:text-gray-900 transition-colors"
                >
                  info@dottorio.it
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:privacy@dottorio.it"
                  className="hover:text-gray-900 transition-colors"
                >
                  privacy@dottorio.it
                </a>
              </li>
              <li className="mt-3">
                <Link
                  href="mailto:privacy@dottorio.it"
                  className="text-blue-600 hover:text-blue-800 underline text-xs"
                >
                  {t("footer.contact.rights")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            © {currentYear} Dottorio. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
