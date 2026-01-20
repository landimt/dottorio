# Plano de Implementação PWA - Dottorio

> **STATUS: IMPLEMENTADO** - O PWA foi configurado com sucesso. Veja a seção "Como Substituir os Ícones" abaixo.

## Visão Geral

Transformar o Dottorio em um Progressive Web App (PWA) instalável em dispositivos móveis e desktop.

**Objetivo:** Permitir que usuários instalem o app diretamente do navegador, com ícone na tela inicial e experiência similar a um app nativo.

---

## Como Substituir os Ícones Placeholder

Os ícones atuais são placeholders SVG com a letra "D" em fundo teal. Para substituir pelos ícones reais:

### Opção 1: Usar RealFaviconGenerator (Recomendado)

1. Acesse https://realfavicongenerator.net/
2. Faça upload de uma imagem quadrada (512x512 ou maior)
3. Configure as opções e gere o pacote
4. Baixe e extraia os arquivos em `public/`
5. Atualize o `manifest.json` para usar os novos arquivos PNG

### Opção 2: Substituir Manualmente

Substitua os seguintes arquivos mantendo os mesmos nomes:

```
public/
├── favicon.svg → favicon.ico (ou manter SVG)
├── favicon-16x16.svg → favicon-16x16.png
├── favicon-32x32.svg → favicon-32x32.png
├── apple-touch-icon.svg → apple-touch-icon.png (180x180)
└── icons/
    ├── icon-72x72.svg → icon-72x72.png
    ├── icon-96x96.svg → icon-96x96.png
    ├── icon-128x128.svg → icon-128x128.png
    ├── icon-144x144.svg → icon-144x144.png
    ├── icon-152x152.svg → icon-152x152.png
    ├── icon-192x192.svg → icon-192x192.png
    ├── icon-384x384.svg → icon-384x384.png
    ├── icon-512x512.svg → icon-512x512.png
    ├── icon-maskable-192x192.svg → icon-maskable-192x192.png
    └── icon-maskable-512x512.svg → icon-maskable-512x512.png
```

**Após substituir por PNGs**, atualize:
- `public/manifest.json` - mude `type: "image/svg+xml"` para `type: "image/png"`
- `src/app/layout.tsx` - mude `type: "image/svg+xml"` para `type: "image/png"`

---

## 1. Ícones Necessários

### Ícones Principais (PNG)

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `icon-72x72.png` | 72x72 | Android (legacy) |
| `icon-96x96.png` | 96x96 | Android (legacy) |
| `icon-128x128.png` | 128x128 | Chrome Web Store |
| `icon-144x144.png` | 144x144 | Android (legacy) |
| `icon-152x152.png` | 152x152 | iPad |
| `icon-192x192.png` | 192x192 | Android (obrigatório) |
| `icon-384x384.png` | 384x384 | Android (alta resolução) |
| `icon-512x512.png` | 512x512 | Android (obrigatório para splash) |

### Ícones Apple (iOS/macOS)

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `apple-touch-icon.png` | 180x180 | iOS (tela inicial) |
| `apple-touch-icon-120x120.png` | 120x120 | iPhone (legacy) |
| `apple-touch-icon-152x152.png` | 152x152 | iPad |
| `apple-touch-icon-167x167.png` | 167x167 | iPad Pro |
| `apple-touch-icon-180x180.png` | 180x180 | iPhone (retina) |

### Favicon

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `favicon.ico` | 16x16, 32x32, 48x48 | Browser tab (multi-size) |
| `favicon-16x16.png` | 16x16 | Browser tab |
| `favicon-32x32.png` | 32x32 | Browser tab (retina) |

### Ícone Maskable (Android Adaptive Icon)

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `icon-maskable-192x192.png` | 192x192 | Android adaptive |
| `icon-maskable-512x512.png` | 512x512 | Android adaptive |

> **Nota:** Ícones maskable precisam ter o conteúdo principal em uma "safe zone" central (círculo de 80% do tamanho total) pois o Android pode recortar as bordas.

### Estrutura de Pastas

```
public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── icon-maskable-192x192.png
│   └── icon-maskable-512x512.png
└── manifest.json
```

### Especificações do Design dos Ícones

- **Cor de fundo:** `#0D9488` (teal-600 - cor primária do Dottorio)
- **Cor do símbolo:** `#FFFFFF` (branco)
- **Formato:** PNG com transparência (exceto maskable que deve ter fundo sólido)
- **Símbolo sugerido:** Letra "D" estilizada ou estetoscópio/símbolo médico
- **Padding interno:** 10-15% do tamanho total

---

## 2. Arquivo Manifest

### Criar: `public/manifest.json`

```json
{
  "name": "Dottorio - Preparati per i tuoi esami",
  "short_name": "Dottorio",
  "description": "La piattaforma per studenti di medicina italiani. Cerca, studia e condividi domande d'esame.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#0D9488",
  "lang": "it",
  "dir": "ltr",
  "categories": ["education", "medical"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Tela inicial do Dottorio"
    },
    {
      "src": "/screenshots/mobile-search.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Busca de questões"
    }
  ],
  "shortcuts": [
    {
      "name": "Cerca Domande",
      "short_name": "Cerca",
      "description": "Cerca domande d'esame",
      "url": "/search",
      "icons": [{ "src": "/icons/icon-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Nuovo Esame",
      "short_name": "Esame",
      "description": "Aggiungi un nuovo esame",
      "url": "/exams/new",
      "icons": [{ "src": "/icons/icon-96x96.png", "sizes": "96x96" }]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

---

## 3. Atualização do Layout

### Modificar: `src/app/layout.tsx`

Adicionar no metadata:

```typescript
export const metadata: Metadata = {
  title: {
    default: "Dottorio - Preparati per i tuoi esami",
    template: "%s | Dottorio",
  },
  description:
    "La piattaforma per studenti di medicina italiani. Cerca, studia e condividi domande d'esame.",
  keywords: ["medicina", "esami", "università", "studenti", "Italia", "domande"],

  // PWA Meta Tags
  manifest: "/manifest.json",
  themeColor: "#0D9488",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dottorio",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};
```

---

## 4. Service Worker e Pacote PWA

### Instalar Dependência

```bash
npm install @ducanh2912/next-pwa
```

### Modificar: `next.config.ts`

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWA from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // ... configurações existentes
};

const pwaConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semana
          },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-font-assets",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semana
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-image-assets",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
          },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
          },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-style-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
          },
        },
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-data",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
          },
        },
      },
      {
        urlPattern: /\/api\/.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "apis",
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "others",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 horas
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

export default pwaConfig(withNextIntl(nextConfig));
```

---

## 5. Página Offline (Opcional)

### Criar: `src/app/offline/page.tsx`

```tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sei offline
        </h1>
        <p className="text-gray-600 mb-8">
          Sembra che tu non sia connesso a Internet.
          Controlla la tua connessione e riprova.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Componente de Instalação PWA (Opcional)

### Criar: `src/components/pwa/install-prompt.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <Download className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Installa Dottorio</h3>
          <p className="text-sm text-gray-600 mt-1">
            Aggiungi Dottorio alla tua schermata home per un accesso rapido.
          </p>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleInstall} size="sm">
              Installa
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm">
              Non ora
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Screenshots para o Manifest (Opcional)

Para uma melhor experiência de instalação no Android, adicionar screenshots:

### Estrutura

```
public/
└── screenshots/
    ├── mobile-home.png      (390x844 ou similar)
    ├── mobile-search.png    (390x844 ou similar)
    ├── desktop-home.png     (1280x720 ou similar)
    └── desktop-search.png   (1280x720 ou similar)
```

---

## 8. Checklist de Implementação

### Fase 1 - Essencial (Obrigatório para PWA funcionar)

- [ ] Criar pasta `public/icons/`
- [ ] Gerar ícones em todos os tamanhos listados
- [ ] Criar `public/manifest.json`
- [ ] Atualizar `src/app/layout.tsx` com metadata PWA
- [ ] Instalar `@ducanh2912/next-pwa`
- [ ] Configurar `next.config.ts` com PWA

### Fase 2 - Melhorias (Recomendado)

- [ ] Criar página offline
- [ ] Adicionar componente de prompt de instalação
- [ ] Criar ícones maskable para Android
- [ ] Adicionar apple-touch-icon

### Fase 3 - Polish (Opcional)

- [ ] Adicionar screenshots ao manifest
- [ ] Configurar shortcuts no manifest
- [ ] Testar com Lighthouse PWA audit
- [ ] Adicionar splash screens para iOS

---

## 9. Teste e Validação

### Lighthouse PWA Audit

1. Abrir Chrome DevTools (F12)
2. Ir para aba "Lighthouse"
3. Selecionar "Progressive Web App"
4. Executar auditoria

### Critérios de Sucesso

- [ ] Installable: App pode ser instalado
- [ ] PWA Optimized: Todas as verificações passam
- [ ] Manifest válido e completo
- [ ] Service Worker registrado
- [ ] HTTPS configurado (produção)
- [ ] Ícones carregando corretamente

### Teste Manual

1. **Desktop Chrome:** Verificar ícone de instalação na barra de endereço
2. **Android Chrome:** Menu > "Adicionar à tela inicial"
3. **iOS Safari:** Compartilhar > "Adicionar à Tela de Início"

---

## 10. Ferramentas Úteis

### Geração de Ícones

- [PWA Asset Generator](https://github.com/nicholasbraun/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)

### Validação

- [PWA Builder](https://www.pwabuilder.com/) - Validação completa
- [Maskable.app](https://maskable.app/) - Teste de ícones maskable
- Chrome DevTools > Application > Manifest

---

## Notas Finais

- O service worker só funciona em **HTTPS** (ou localhost em desenvolvimento)
- Em desenvolvimento, o PWA fica desabilitado para não interferir no hot reload
- Após deploy, pode levar alguns minutos para o service worker atualizar
- Usuários existentes podem precisar limpar cache para ver atualizações
