// Google Apps Script - Cole este código no Google Apps Script (script.google.com)
// Este script recebe os dados do formulário e envia para a Google Sheet

// Configuração
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // Cole aqui o ID da sua Google Sheet
const SHEET_NAME = "Registos"; // Nome da aba (crie uma aba com este nome)

// Função para lidar com POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Obter a spreadsheet e a aba
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Se a aba não existir, criar uma nova
    if (!sheet) {
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      // Adicionar cabeçalhos
      const headers = [
        "Data/Hora",
        "Nome Completo",
        "Idade",
        "Número de Processo",
        "Episódio",
        "Médico",
        "Especialidade",
        "Entidade",
        "Data Procedimento",
        "Procedimento",
      ];
      newSheet.appendRow(headers);
      sheet = newSheet;
    }

    // Preparar dados para inserir
    const timestamp = data.timestamp || new Date().toLocaleString("pt-PT");
    const rowData = [
      timestamp,
      data.data.nome || "",
      data.data.idade || "",
      data.data.processo || "",
      data.data.episodio || "",
      data.data.medico || "",
      data.data.especialidade || "",
      data.data.entidade || "",
      data.data.data_procedimento || "",
      data.data.procedimento || "",
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

// Função para testar
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      message: "Apps Script está ativo",
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}
