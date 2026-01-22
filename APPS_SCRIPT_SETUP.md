# Integração com Google Apps Script - ImageScan

## ✅ Seu Apps Script

Você tem o seguinte código no Google Apps Script:

```javascript
// Google Apps Script para ImageScan PWA
// Cole este código no seu Google Apps Script Editor em https://script.google.com

// PASSO 1: Configurar a ID da folha
const SHEET_ID = "1Mlk7cygCdn0UEok5uCxxye-CRmANAAH0pWePsWmAghk";

function doPost(e) {
  try {
    // Obter os parâmetros da requisição
    const params = e.parameter;
    
    Logger.log("📥 Dados recebidos:", JSON.stringify(params));
    
    // Obter a folha de cálculo
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const ws = sheet.getSheetByName("Folha1"); // Ajusta o nome se necessário
    
    if (!ws) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: "Folha não encontrada" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obter cabeçalhos (primeira linha)
    const headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0];
    Logger.log("📋 Headers:", headers);
    
    // Preparar os dados em ordem de colunas
    const row = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = params[header] || "";
      row.push(value);
    }
    
    Logger.log("📝 Linha a inserir:", row);
    
    // Inserir a nova linha na folha
    ws.appendRow(row);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Dados registados com sucesso" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Erro:", error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 📋 Requisitos

Para que o script funcione corretamente, a Google Sheet deve ter:

1. **Cabeçalhos na primeira linha** com os nomes exatos dos campos:
   - `nome`
   - `idade`
   - `processo`
   - `episodio`
   - `medico`
   - `especialidade`
   - `entidade`
   - `data_procedimento`
   - `procedimento`
   - `timestamp` (opcional - data/hora do registo)

2. **Exemplo de headers:**
   ```
   | nome | idade | processo | episodio | medico | especialidade | entidade | data_procedimento | procedimento | timestamp |
   ```

## 🔧 Como Configurar

### Passo 1: Verificar/Criar Cabeçalhos na Google Sheet

Abra a Google Sheet com ID `1Mlk7cygCdn0UEok5uCxxye-CRmANAAH0pWePsWmAghk`:
1. Abra https://docs.google.com/spreadsheets/d/1Mlk7cygCdn0UEok5uCxxye-CRmANAAH0pWePsWmAghk/
2. Verifique se na primeira linha existem os cabeçalhos acima
3. Se não existir, adicione-os manualmente

### Passo 2: Verificar o Apps Script

1. Na Google Sheet, vá a **Extensões → Apps Script**
2. Copie todo o código acima
3. Se já tem um script, **substitua-o completamente**
4. Clique em **Guardar** (ícone de disquete)

### Passo 3: Publicar como Web App

1. Clique no botão **Publicar** (canto superior direito)
2. Se já tem uma deployment anterior, clique em **Gerir Implementações** para atualizar
3. Clique no ícone de engrenagem (⚙️) na deployment existente
4. Clique **Substituir implementação**
5. Tipo: **Web app**
6. Execute como: **[Sua conta Google]**
7. Quem tem acesso: **Qualquer pessoa**
8. Clique **Implementar**

### Passo 4: Copiar URL de Deployment

1. Na pop-up de confirmação, copie a URL (exemplo):
   ```
   https://script.google.com/macros/s/AKfycbw...../useless/exec
   ```
2. **Esta é a URL que você precisa fornecer**

### Passo 5: Atualizar a Aplicação

1. Abra `script.js` do seu projeto
2. Procure por: `const GOOGLE_SHEETS_WEB_APP_URL =`
3. Substitua `YOUR_DEPLOYMENT_ID` pela URL completa do passo anterior
4. Faça commit e push

## 🧪 Testar Integração

1. Abra a aplicação em https://antoniorappleton.github.io/ImageScan/
2. Preencha o formulário
3. Clique em **Guardar Registo**
4. Verifique se os dados aparecem na Google Sheet

## 🔍 Troubleshooting

### Dados não aparecem na Sheet

**Verificar:**
- [ ] A URL de deployment está correta no `script.js`
- [ ] Os cabeçalhos da Google Sheet existem e os nomes são exatos
- [ ] O Apps Script está publicado corretamente
- [ ] Abra a consola (F12) para ver erros

**Debug:**
1. Abra o Apps Script
2. Clique em **Executar** para testar
3. Veja os logs em **Logs** (Ctrl+Enter)

### Erro: "Folha não encontrada"

O Apps Script está procurando por uma aba chamada "Folha1". 

**Solução:** No Apps Script, mude:
```javascript
const ws = sheet.getSheetByName("Folha1");
```

Para o nome correto da sua aba.

### Erro CORS

Pode ignorar! O modo `no-cors` permite enviar dados mesmo sem resposta direta.

## 📝 Campos Que Serão Enviados

A aplicação envia automaticamente:

```javascript
{
  "nome": "João Silva",
  "idade": "45",
  "processo": "12345",
  "episodio": "001",
  "medico": "Dr. Silva",
  "especialidade": "Cardiologia",
  "entidade": "SNS",
  "data_procedimento": "2026-01-22",
  "procedimento": "Descrição do procedimento...",
  "timestamp": "22/01/2026, 14:30:45"
}
```

## 🔐 Segurança

- ✅ Dados enviados por HTTPS
- ✅ Google Apps Script é seguro
- ✅ Apenas POST é aceite (não há exposição de dados GET)
- ⚠️ Para produção: Adicione validação e autenticação

## 📞 Suporte

Se tiver dúvidas:
1. Verifique os logs do Apps Script
2. Teste manualmente enviando uma request
3. Verifique se a Google Sheet tem permissões corretas
