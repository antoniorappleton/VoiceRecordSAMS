# Guia de Integração com Google Sheets

## Passo 1: Criar uma Google Sheet

1. Aceda a [Google Sheets](https://sheets.google.com)
2. Crie uma nova folha de cálculo
3. Copie o ID da folha (está na URL: `https://docs.google.com/spreadsheets/d/AQUI_ESTA_O_ID/edit`)
4. Guarde este ID num local seguro

## Passo 2: Criar um Google Apps Script

1. Abra a sua Google Sheet
2. Clique em **Extensões** → **Apps Script**
3. **Apague todo o código padrão**
4. **Cole o código do ficheiro `GOOGLE_APPS_SCRIPT.gs`** deste projeto
5. Substitua `'YOUR_SPREADSHEET_ID'` pelo ID real da sua Google Sheet (linha 4)
6. Clique em **Guardar** (ícone de disquete)

## Passo 3: Publicar como Web App

1. Clique no botão **Publicar** (canto superior direito)
2. Selecione **Novo Implementação** (+)
3. Em "Tipo de implementação", selecione **Web App**
4. Configure:
   - **Executar como**: Sua conta Google
   - **Quem tem acesso**: Qualquer pessoa
5. Clique em **Implementar**
6. Na pop-up de autorização, clique em **Autorizar**
7. **Copie a URL de implementação** (vai parecer assim):
   ```
   https://script.google.com/macros/d/AKfycbxxxxxxxxxxxxxxxxxx/useless/exec
   ```

## Passo 4: Atualizar a aplicação

1. Abra o ficheiro `script.js` no seu editor
2. Procure por: `const GOOGLE_SHEETS_WEB_APP_URL = '...'`
3. **Substitua a URL** pela que copiou no passo anterior
4. Guarde o ficheiro

## Passo 5: Testar

1. Abra a aplicação `index.html` no navegador
2. Preencha o formulário
3. Clique em **Guardar Registo**
4. Verifique se os dados aparecem na sua Google Sheet

## Troubleshooting

### Os dados não aparecem na Sheet
- Certifique-se que copiou a URL correta do Apps Script
- Verifique se a aba "Registos" existe na Google Sheet
- Abra a consola do navegador (F12) para ver erros

### Erro de CORS
- É normal! Usamos `mode: 'no-cors'` para contornar isso
- Os dados estão a ser enviados mesmo que não veja resposta

### Dados aparecem vazios
- Certifique-se que o ID da Google Sheet está correto no Apps Script
- Verifique as permissões da Google Sheet (deve estar acessível)

## Segurança

⚠️ **Importante**: Os dados são enviados por HTTPS e o Google Apps Script está público apenas para POST.
Para maior segurança em produção:
- Use autenticação OAuth2
- Implemente rate limiting
- Use chaves de API secretas
