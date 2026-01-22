// Google Apps Script - Cole este código no Google Apps Script (script.google.com)
// Este script recebe os dados do formulário e envia para a Google Sheet

// Configuração
const SPREADSHEET_ID = "1Mlk7cygCdn0UEok5uCxxye-CRmANAAH0pWePsWmAghk"; // Seu ID
const SHEET_NAME = "Registos"; // Nome da aba

// Função para lidar com POST requests (Uso Pelo Site)
function doPost(e) {
  try {
    // Verifica se e.postData existe (para evitar erro ao rodar manualmente sem querer)
    if (!e || !e.postData) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "error",
          message:
            "Executado sem dados. Use a função testarDoPost para testar no editor.",
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);

    // Obter a spreadsheet e a aba
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Se a aba não existir, criar uma nova
    if (!sheet) {
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      // Adicionar cabeçalhos (Exatamente como pediu)
      const headers = [
        "Nome",
        "Idade",
        "Número de Processo",
        "Episódio",
        "Médico",
        "Especialidade",
        "Entidade",
        "Data procedimento",
        "Procedimento",
      ];
      newSheet.appendRow(headers);
      sheet = newSheet;
    }

    // Preparar dados para inserir (Ordem exata da sua sheet)
    // Timestamp removido pois não está nas suas colunas
    const rowData = [
      data.nome || "",
      data.idade || "",
      data.processo || "",
      data.episodio || "",
      data.medico || "",
      data.especialidade || "",
      data.entidade || "",
      data.data_procedimento || "",
      data.procedimento || "",
    ];

    // Adicionar linha à sheet
    sheet.appendRow(rowData);

    // Retornar sucesso
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Dados guardados com sucesso",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Erro: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// === FUNÇÃO DE TESTE (Execute ESTA função no editor se quiser testar) ===
function testarDoPost() {
  const e = {
    postData: {
      contents: JSON.stringify({
        nome: "Teste Manual",
        idade: "99",
        processo: "12345",
        episodio: "001",
        medico: "Dr. Teste Editor",
        especialidade: "Teste",
        entidade: "SAMS",
        data_procedimento: "2026-01-22",
        procedimento: "Teste manual via editor do Apps Script",
      }),
    },
  };

  Logger.log("A iniciar teste...");
  const resultado = doPost(e);
  Logger.log("Resultado: " + resultado.getContent());
}

// Função para verificar status
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      message: "Apps Script está ativo",
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}
