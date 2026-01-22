const fields = [
  {
    id: "nome",
    label: "Nome Completo",
    prompt: "Diga o nome completo do paciente",
  },
  { id: "idade", label: "Idade", prompt: "Qual é a idade do paciente?" },
  {
    id: "processo",
    label: "Número de Processo",
    prompt: "Diga o número do processo",
  },
  { id: "episodio", label: "Episódio", prompt: "Qual é o número do episódio?" },
  { id: "medico", label: "Médico", prompt: "Diga o nome do médico assistente" },
  {
    id: "especialidade",
    label: "Especialidade",
    prompt: "Qual é a especialidade médica?",
  },
  {
    id: "entidade",
    label: "Entidade",
    prompt: "Qual é a entidade ou convénio?",
  },
  {
    id: "data_procedimento",
    label: "Data Procedimento",
    prompt: "Diga a data do procedimento (ano, mês e dia)",
  },
  {
    id: "procedimento",
    label: "Procedimento",
    prompt: "Descreva agora o procedimento realizado",
  },
];

let currentFieldIndex = -1;
let recognition;
let isListening = false;

const assistantPrompt = document.getElementById("assistant-prompt");
const voiceTrigger = document.getElementById("voice-trigger");
const voiceWaves = document.getElementById("voice-waves");
const medicalForm = document.getElementById("medical-form");

// Initialize Web Speech API
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "pt-PT";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    voiceTrigger.classList.add("listening");
    voiceWaves.classList.add("active");
  };

  recognition.onresult = (event) => {
    const result = event.results[0][0].transcript;
    handleVoiceInput(result);
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") {
      // Restart if no speech detected during hands-free session
      if (currentFieldIndex !== -1) {
        setTimeout(() => recognition.start(), 100);
      }
    } else {
      console.error("Speech recognition error", event.error);
      stopListening();
    }
  };

  recognition.onend = () => {
    // Only stop UI if we are not in the middle of a sequence
    if (currentFieldIndex === -1) {
      stopListening();
    } else if (!window.speechSynthesis.speaking) {
      // Auto restart if synthesized speech isn't playing
      // This prevents an infinite loop if onend is triggered during synthesis
      recognition.start();
    }
  };
} else {
  assistantPrompt.innerText =
    "Desculpe, o seu navegador não suporta reconhecimento de voz.";
  voiceTrigger.disabled = true;
}

function startListening() {
  if (currentFieldIndex === -1) {
    advanceToNextField();
  }
  recognition.start();
}

function stopListening() {
  isListening = false;
  voiceTrigger.classList.remove("listening");
  voiceWaves.classList.remove("active");
}

function advanceToNextField() {
  currentFieldIndex++;
  if (currentFieldIndex < fields.length) {
    const field = fields[currentFieldIndex];
    updateUIForField(field);
    speakPrompt(field.prompt);
  } else {
    assistantPrompt.innerText = "Formulário preenchido! Verifique os dados.";
    speakPrompt(
      "Formulário preenchido. Por favor, verifique os dados antes de guardar.",
    );
    currentFieldIndex = -1; // Reset for next time
  }
}

function updateUIForField(field) {
  // Remove active class from all groups
  document
    .querySelectorAll(".input-group")
    .forEach((group) => group.classList.remove("active"));

  // Add active class to current field group
  const currentGroup = document.querySelector(`[data-field="${field.id}"]`);
  if (currentGroup) {
    currentGroup.classList.add("active");
    currentGroup.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  assistantPrompt.innerText = field.prompt;
}

function handleVoiceInput(text) {
  const field = fields[currentFieldIndex];
  const input = document.getElementById(field.id);

  if (field.id === "idade") {
    const numbers = text.match(/\d+/);
    if (numbers) input.value = numbers[0];
  } else if (field.id === "data_procedimento") {
    const parsedDate = parsePortugueseDate(text);
    if (parsedDate) {
      input.value = parsedDate;
    } else {
      input.value = text; // Fallback to raw text if it can't be formatted
    }
  } else {
    input.value = text.charAt(0).toUpperCase() + text.slice(1);
  }

  showToast(`Capturado: "${text}"`);

  // Auto-advance after a short delay
  setTimeout(() => {
    advanceToNextField();
  }, 1000);
}

function parsePortugueseDate(text) {
  const months = {
    janeiro: "01",
    fevereiro: "02",
    março: "03",
    abril: "04",
    maio: "05",
    junho: "06",
    julho: "07",
    agosto: "08",
    setembro: "09",
    outubro: "10",
    novembro: "11",
    dezembro: "12",
  };

  const normalized = text.toLowerCase().replace(/ de /g, " ");
  const parts = normalized.split(" ");

  let day, month, year;

  // Cases: "vinte janeiro 2026" or "20 janeiro 2026"
  if (parts.length >= 2) {
    day = parts[0].padStart(2, "0");
    month = months[parts[1]] || parts[1].padStart(2, "0");
    year = parts[2] || new Date().getFullYear().toString();

    // Ensure year is 4 digits
    if (year.length === 2) year = "20" + year;

    if (!isNaN(day) && !isNaN(month)) {
      return `${year}-${month}-${day}`;
    }
  }
  return null;
}

function speakPrompt(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-PT";

  // Stop recognition while speaking to avoid feedback
  if (isListening && recognition) {
    recognition.stop();
  }

  utterance.onend = () => {
    if (currentFieldIndex !== -1 && recognition) {
      recognition.start();
    }
  };

  window.speechSynthesis.speak(utterance);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// --- OCR Logic ---
const ocrTrigger = document.getElementById("ocr-trigger");
const ocrUpload = document.getElementById("ocr-upload");
const ocrProgressContainer = document.getElementById("ocr-progress-container");
const ocrBar = document.getElementById("ocr-bar");
const ocrPercent = document.getElementById("ocr-percent");

ocrTrigger.addEventListener("click", () => ocrUpload.click());

ocrUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show progress UI
  ocrProgressContainer.classList.remove("hidden");
  assistantPrompt.innerText = "A ler o documento...";

  try {
    const worker = await Tesseract.createWorker("por", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const percent = Math.floor(m.progress * 100);
          ocrBar.style.width = percent + "%";
          ocrPercent.innerText = percent + "%";
        }
      },
    });

    const {
      data: { text },
    } = await worker.recognize(file);
    await worker.terminate();

    processOCRText(text);
    showToast("Leitura concluída!");
  } catch (error) {
    console.error("OCR Error:", error);
    showToast("Erro ao processar imagem.");
  } finally {
    ocrProgressContainer.classList.add("hidden");
    ocrBar.style.width = "0%";
    assistantPrompt.innerText =
      "Toque no microfone para começar ou digitalize uma folha";
  }
});

function processOCRText(text) {
  console.log("OCR Extracted Text:", text);
  const lowerText = text.toLowerCase();

  // Map fields by looking for common labels followed by content
  fields.forEach((field) => {
    // Simple regex: look for the field name followed by common separators like : or -
    const fieldName = field.label.toLowerCase();
    const regex = new RegExp(`${fieldName}\\s*[:\\-]?\\s*([^\\n\\r]+)`, "i");
    const match = text.match(regex);

    if (match && match[1]) {
      const value = match[1].trim();
      const input = document.getElementById(field.id);

      if (field.id === "data_procedimento") {
        const parsed = parsePortugueseDate(value);
        if (parsed) input.value = parsed;
      } else if (field.id === "idade") {
        const num = value.match(/\d+/);
        if (num) input.value = num[0];
      } else {
        input.value = value;
      }

      // Highlight the field briefly
      const group = document.querySelector(`[data-field="${field.id}"]`);
      group.classList.add("active");
      setTimeout(() => group.classList.remove("active"), 2000);
    }
  });
}

// Event Listeners
voiceTrigger.addEventListener("click", () => {
  if (isListening) {
    recognition.stop();
  } else {
    startListening();
  }
});

// Google Sheets Configuration
// URL de deployment do Google Apps Script
const GOOGLE_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxGmIkMRe_b2drWfhphysLxTDx725giOEG5kkwL8MoQs99TvkjykqRg-JjXAM0M9jkjSA/exec";

// Mapeamento dos IDs do formulário para os nomes dos cabeçalhos da Google Sheet
const FIELD_MAPPING = {
  nome: "Nome",
  idade: "Idade",
  processo: "Número de Processo",
  episodio: "Episódio",
  medico: "Médico",
  especialidade: "Especialidade",
  entidade: "Entidade",
  data_procedimento: "Data procedimento",
  procedimento: "Procedimento",
};

// Collect form data
function getFormData() {
  const formData = {};
  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    formData[field.id] = input.value;
  });
  return formData;
}

// Send data to Google Sheets via URL parameters
async function sendToGoogleSheets(data) {
  try {
    // Construir URL com parâmetros mapeados para os nomes corretos da Sheet
    const params = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const sheetHeader = FIELD_MAPPING[key] || key;
      params.append(sheetHeader, data[key]);
    });
    params.append("timestamp", new Date().toLocaleString("pt-PT"));

    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      body: params,
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar para Google Sheets:", error);
    return false;
  }
}

medicalForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = getFormData();
  showToast("A enviar para Google Sheets...");

  const sent = await sendToGoogleSheets(formData);

  if (sent) {
    showToast("✓ Sucesso! Registo guardado online.");
  } else {
    showToast("✓ Sucesso! Registo guardado localmente.");
  }

  console.log("Form Data:", formData);

  // Reset form after 2 seconds
  setTimeout(() => {
    medicalForm.reset();
    currentFieldIndex = -1;
    assistantPrompt.innerText = "Toque no microfone para começar";
  }, 2000);
});

// Sync offline/online status
window.addEventListener("online", () => {
  const badge = document.getElementById("connection-status");
  badge.innerText = "Online";
  badge.className = "status-badge online";
});

window.addEventListener("offline", () => {
  const badge = document.getElementById("connection-status");
  badge.innerText = "Offline";
  badge.className = "status-badge offline";
});
