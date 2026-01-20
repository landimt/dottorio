/**
 * Script para gerar ícones PWA placeholder
 * Execute com: npx tsx scripts/generate-pwa-icons.ts
 *
 * Os ícones gerados são placeholders com a letra "D" em fundo teal.
 * Substitua-os pelos ícones reais do app depois.
 */

import { writeFileSync } from "fs";
import { join } from "path";

const THEME_COLOR = "#0D9488"; // teal-600
const TEXT_COLOR = "#FFFFFF";

// Tamanhos necessários para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const appleSizes = [120, 152, 167, 180];
const faviconSizes = [16, 32];

function generateSVG(size: number, maskable: boolean = false): string {
  const padding = maskable ? size * 0.1 : size * 0.15;
  const fontSize = size * 0.6;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${THEME_COLOR}" rx="${maskable ? 0 : size * 0.15}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="${TEXT_COLOR}">D</text>
</svg>`;
}

function generateFaviconSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${THEME_COLOR}" rx="6"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif" font-weight="bold"
        font-size="20" fill="${TEXT_COLOR}">D</text>
</svg>`;
}

const publicDir = join(process.cwd(), "public");
const iconsDir = join(publicDir, "icons");

console.log("Gerando ícones PWA placeholder...\n");

// Gerar ícones principais
for (const size of sizes) {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  writeFileSync(join(iconsDir, filename), svg);
  console.log(`✓ ${filename}`);
}

// Gerar ícones maskable
for (const size of [192, 512]) {
  const svg = generateSVG(size, true);
  const filename = `icon-maskable-${size}x${size}.svg`;
  writeFileSync(join(iconsDir, filename), svg);
  console.log(`✓ ${filename}`);
}

// Gerar apple-touch-icons
for (const size of appleSizes) {
  const svg = generateSVG(size);
  const filename = size === 180
    ? "apple-touch-icon.svg"
    : `apple-touch-icon-${size}x${size}.svg`;
  writeFileSync(join(publicDir, filename), svg);
  console.log(`✓ ${filename}`);
}

// Gerar favicons
for (const size of faviconSizes) {
  const svg = generateSVG(size);
  const filename = `favicon-${size}x${size}.svg`;
  writeFileSync(join(publicDir, filename), svg);
  console.log(`✓ ${filename}`);
}

// Gerar favicon.svg principal
writeFileSync(join(publicDir, "favicon.svg"), generateFaviconSVG());
console.log(`✓ favicon.svg`);

console.log("\n✅ Ícones placeholder gerados com sucesso!");
console.log("\n📝 IMPORTANTE: Estes são placeholders SVG.");
console.log("   Para produção, substitua por PNGs reais nos mesmos tamanhos.");
console.log("   Use ferramentas como https://realfavicongenerator.net/");
