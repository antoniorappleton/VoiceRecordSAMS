#!/usr/bin/env node

/**
 * Script para gerar ícones PNG a partir do SVG
 *
 * Instalação de dependências:
 * npm install sharp
 *
 * Execução:
 * node generate-icons.js
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamanhos a gerar
const sizes = [32, 96, 144, 192, 384, 512];
const assetsDir = path.join(__dirname, "assets");
const svgPath = path.join(assetsDir, "icon.svg");

// Criar pasta assets se não existir
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Verificar se o SVG existe
if (!fs.existsSync(svgPath)) {
  console.error("❌ Erro: icon.svg não encontrado em assets/");
  console.error(`Procure em: ${svgPath}`);
  process.exit(1);
}

console.log("🎨 Iniciando geração de ícones...\n");

// Gerar ícones normais
Promise.all(
  sizes.map((size) =>
    sharp(svgPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 37, g: 99, b: 235, alpha: 1 }, // Cor azul #2563eb
      })
      .png()
      .toFile(path.join(assetsDir, `icon-${size}x${size}.png`))
      .then(() => console.log(`✅ Gerado: icon-${size}x${size}.png`))
      .catch((err) =>
        console.error(
          `❌ Erro ao gerar icon-${size}x${size}.png:`,
          err.message,
        ),
      ),
  ),
)
  .then(() => {
    console.log("\n🎭 Gerando ícones maskable...\n");

    // Gerar ícones maskable (192 e 512)
    return Promise.all([
      sharp(svgPath)
        .resize(192, 192, {
          fit: "contain",
          background: { r: 37, g: 99, b: 235, alpha: 1 },
        })
        .png()
        .toFile(path.join(assetsDir, "icon-maskable-192x192.png"))
        .then(() => console.log("✅ Gerado: icon-maskable-192x192.png"))
        .catch((err) =>
          console.error(
            "❌ Erro ao gerar icon-maskable-192x192.png:",
            err.message,
          ),
        ),

      sharp(svgPath)
        .resize(512, 512, {
          fit: "contain",
          background: { r: 37, g: 99, b: 235, alpha: 1 },
        })
        .png()
        .toFile(path.join(assetsDir, "icon-maskable-512x512.png"))
        .then(() => console.log("✅ Gerado: icon-maskable-512x512.png"))
        .catch((err) =>
          console.error(
            "❌ Erro ao gerar icon-maskable-512x512.png:",
            err.message,
          ),
        ),

      // Apple Touch Icon (180x180)
      sharp(svgPath)
        .resize(180, 180, {
          fit: "contain",
          background: { r: 37, g: 99, b: 235, alpha: 1 },
        })
        .png()
        .toFile(path.join(assetsDir, "icon-180x180.png"))
        .then(() => console.log("✅ Gerado: icon-180x180.png"))
        .catch((err) =>
          console.error("❌ Erro ao gerar icon-180x180.png:", err.message),
        ),
    ]);
  })
  .then(() => {
    console.log("\n✨ Todos os ícones foram gerados com sucesso!");
    console.log("\n📁 Ficheiros criados em: assets/");
    console.log("\n📋 Próximos passos:");
    console.log("1. Verifique os ícones gerados em assets/");
    console.log('2. Rode: git add . && git commit -m "Adicionados ícones PWA"');
    console.log("3. Rode: git push para enviar para GitHub");
    console.log("4. Teste em: https://antoniorappleton.github.io/ImageScan/");
  })
  .catch((err) => {
    console.error("❌ Erro geral:", err.message);
    process.exit(1);
  });
