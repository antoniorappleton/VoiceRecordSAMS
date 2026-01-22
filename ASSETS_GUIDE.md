# Guia de Assets e Ícones PWA

## 📱 Ícones Necessários

A aplicação requer ícones em múltiplos tamanhos para diferentes dispositivos:

### Tamanhos Padrão
- **32x32** - Favicon do navegador
- **96x96** - Android DP 48
- **144x144** - Android DP 72
- **192x192** - Android DP 96 (o mais importante)
- **384x384** - Android DP 192
- **512x512** - Ícone completo (descarga na Google Play)

### Ícones Maskable (recomendado para Android)
- **192x192 maskable** - Apatações para icons com máscara
- **512x512 maskable** - Versão completa maskable

### Apple
- **180x180** - Apple Touch Icon (home screen iPhone/iPad)

## 🎨 Como Gerar os Ícones

### Opção 1: Usar o Gerador Online (Recomendado)

1. Abra `assets/icon-generator.html` no navegador
2. Clique em **"Gerar e Descarregar"**
3. Os ícones serão descarregados automaticamente
4. Coloque todos os ficheiros PNG na pasta `assets/`

### Opção 2: Usar um Serviço Online

1. Aceda a [realfavicongenerator.net](https://realfavicongenerator.net)
2. Faça upload do `assets/icon.svg`
3. Selecione todos os tamanhos necessários
4. Descarregue o ficheiro ZIP
5. Extraia os ficheiros para a pasta `assets/`

### Opção 3: Usar ImageMagick (terminal)

```bash
# Instalar ImageMagick primeiro
# Mac: brew install imagemagick
# Windows: choco install imagemagick
# Linux: apt-get install imagemagick

# Gerar ícones
convert assets/icon.svg -define icon:auto-resize=32,96,144,192,384,512 assets/icon.ico

# Ou gerar PNGs individuais
for size in 32 96 144 192 384 512; do
    convert assets/icon.svg -resize ${size}x${size} assets/icon-${size}x${size}.png
done
```

### Opção 4: Usar Node.js

```bash
# Instalar dependências
npm install sharp

# Criar script generate-icons.js e rodar
node generate-icons.js
```

## 📋 Estrutura de Ficheiros

```
ImageScan/
├── index.html
├── manifest.json
├── script.js
├── style.css
├── sw.js
└── assets/
    ├── icon.svg (ficheiro original)
    ├── icon-32x32.png
    ├── icon-96x96.png
    ├── icon-144x144.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-maskable-192x192.png
    ├── icon-maskable-512x512.png
    ├── icon-180x180.png (Apple)
    ├── screenshot-540x720.png (opcional)
    ├── screenshot-1280x720.png (opcional)
    └── icon-generator.html
```

## ✅ Checklist de Implementação

- [ ] Gerar todos os ícones PNG
- [ ] Colocar ficheiros na pasta `assets/`
- [ ] Verificar se o `manifest.json` está correto
- [ ] Testar a instalação no Android (Chrome DevTools)
- [ ] Testar em iPhone com Safari
- [ ] Validar PWA com Lighthouse
- [ ] Fazer commit e push para GitHub

## 🧪 Testar PWA

### Chrome DevTools (Android Simulator)
1. F12 → Application → Manifest
2. Verifique se todos os ícones estão listados
3. Clique em "Add to home screen"

### iPhone Real
1. Abra em Safari
2. Clique em Share → Add to Home Screen
3. Verifique se o ícone aparece corretamente

### Lighthouse
1. F12 → Lighthouse
2. Selecione "Progressive Web App"
3. Rode o teste
4. Deve ter score 90+

## 🎯 Recomendações

- Use o arquivo SVG `icon.svg` como base editável
- Ícones maskable têm espaço de "safe zone" no centro (80% da imagem)
- Mantenha cores consistentes com o tema (#2563eb azul)
- Teste em múltiplos dispositivos

## 📝 Referências

- [Web App Manifest MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Adaptive Icons Android](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Apple PWA Guidelines](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
