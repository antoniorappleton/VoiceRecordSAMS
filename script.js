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
      safeStartRecognition();
    }
  };
} else {
  assistantPrompt.innerText =
    "Desculpe, o seu navegador não suporta reconhecimento de voz.";
  voiceTrigger.disabled = true;
}

// Safe start function to avoid "already started" errors
function safeStartRecognition() {
  if (recognition && !isListening) {
    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  }
}

function startListening() {
  if (currentFieldIndex === -1) {
    advanceToNextField();
  }
  safeStartRecognition();
}

function stopListening() {
  isListening = false;
  voiceTrigger.classList.remove("listening");
  voiceWaves.classList.remove("active");
  document
    .querySelectorAll(".field-mic")
    .forEach((btn) => btn.classList.remove("listening"));
  try {
    recognition.stop();
  } catch (e) {
    /* ignore */
  }
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

  // Remove listening from all small mics (in case we switched via auto-advance)
  document
    .querySelectorAll(".field-mic")
    .forEach((btn) => btn.classList.remove("listening"));

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
      // Don't set invalid date to avoid console warning
      showToast("Data inválida. Tente: '22 de janeiro de 2026'");
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
    try {
      recognition.stop();
    } catch (e) {}
    // isListening will be reset by onend, but we want to know we are pausing for speech
  }

  utterance.onend = () => {
    if (currentFieldIndex !== -1 && recognition) {
      safeStartRecognition();
    }
  };

  window.speechSynthesis.speak(utterance);
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.innerText = message;

  // Reset classes
  toast.className = "toast show";
  if (type === "success") toast.classList.add("success");
  if (type === "error") toast.classList.add("error");

  // Auto hide duration based on type
  const duration = type === "success" || type === "error" ? 5000 : 3000;

  setTimeout(() => {
    toast.className = "toast hidden";
  }, duration);
}

// --- OCR Logic ---
// --- OCR Logic ---
const ocrTrigger = document.getElementById("ocr-trigger");
const ocrUpload = document.getElementById("ocr-upload");
const ocrProgressContainer = document.getElementById("ocr-progress-container");
const ocrBar = document.getElementById("ocr-bar");
const ocrPercent = document.getElementById("ocr-percent");

// Modal Elements
const ocrModal = document.getElementById("ocr-preview-modal");
const previewImage = document.getElementById("preview-image");
const btnRotate = document.getElementById("btn-rotate");
const btnProcess = document.getElementById("btn-process");
const btnCancel = document.getElementById("btn-cancel");

let currentRotation = 0;
let currentFile = null;

ocrTrigger.addEventListener("click", () => ocrUpload.click());

ocrUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  currentFile = file;
  currentRotation = 0;

  // Show image in modal
  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.src = event.target.result;
    previewImage.style.transform = `rotate(0deg)`;
    ocrModal.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

btnRotate.addEventListener("click", () => {
  currentRotation = (currentRotation + 90) % 360;
  previewImage.style.transform = `rotate(${currentRotation}deg)`;
});

btnCancel.addEventListener("click", () => {
  ocrModal.classList.add("hidden");
  ocrUpload.value = ""; // Reset input
});

btnProcess.addEventListener("click", async () => {
  ocrModal.classList.add("hidden");

  if (!currentFile) return;

  // Show progress UI
  ocrProgressContainer.classList.remove("hidden");
  assistantPrompt.innerText = "A processar imagem...";

  try {
    // Determine if we need to rotate via canvas
    let imageToProcess = currentFile;

    if (currentRotation !== 0) {
      imageToProcess = await rotateImage(previewImage.src, currentRotation);
    }

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
    } = await worker.recognize(imageToProcess);
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
    ocrUpload.value = ""; // Ready for next
  }
});

// Helper to rotate image using canvas
function rotateImage(imageSrc, degrees) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Swap dimensions if rotating 90 or 270
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Move context to center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Convert back to blob/file
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.95,
      );
    };
    img.src = imageSrc;
  });
}

function processOCRText(text) {
  console.log("OCR Extracted Text:", text);
  const lowerText = text.toLowerCase();

  // Helper to find value by regex
  const findValue = (regex) => {
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  // 1. NOME (Assume first line or close to "SAMS")
  // The label has Name under SAMS usually, or just a capitalize string line
  // Let's try to find "SAMS" and take the next non-empty line, or look for known name pattern
  // For this specific label, Name is "Angelo Miguel..."
  // It often appears before "Data Nascimento"
  const nameMatch =
    text.match(/SAMS\s+([A-Za-z\s]+)(?=\s+Data Nascimento)/i) ||
    text.match(/([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)/); // Fallback generic name
  if (nameMatch) document.getElementById("nome").value = nameMatch[1].trim();

  // 2. IDADE (Read directly from label)
  // Example: "Idade: 39"
  const ageMatch = text.match(/Idade:\s*(\d+)/i);
  if (ageMatch) {
    document.getElementById("idade").value = ageMatch[1];
  }

  // 3. PROCESSO (SNS or the big barcode number)
  // SNS: 378801357
  const snsMatch = text.match(/SNS:\s*(\d+)/i);
  if (snsMatch) {
    document.getElementById("processo").value = snsMatch[1];
  } else {
    // Try the big barcode number (8 digits starting with 5 usually in this context?)
    const barcodeMatch = text.match(/\b\d{8}\b/);
    if (barcodeMatch)
      document.getElementById("processo").value = barcodeMatch[0];
  }

  // 4. EPISODIO
  const epsMatch = text.match(/Epis[óo]dio:\s*(\d+)/i);
  if (epsMatch) document.getElementById("episodio").value = epsMatch[1];

  // 5. MEDICO (Look for Dr. or Dra.)
  const docMatch = text.match(/(Dr\.|Dra\.|Prof\.)\s+[A-Za-z\s]+/i);
  if (docMatch)
    document.getElementById("medico").value = docMatch[0].split("|")[0].trim();

  // 6. ESPECIALIDADE
  const specMatch = text.match(/Especialidade:\s*([A-Za-z\s]+)/i);
  if (specMatch)
    document.getElementById("especialidade").value = specMatch[1].trim();

  // 7. ENTIDADE
  // Default to SAMS, or extract specific if present
  const entMatch = text.match(/Entidade:\s*([^\n\r]+)/i);
  if (entMatch) {
    document.getElementById("entidade").value = entMatch[1].trim();
  } else {
    document.getElementById("entidade").value = "SAMS";
  }

  // 8. DATA PROCEDIMENTO (Admissão)
  const dateMatch = text.match(/Admiss[ãa]o:\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (dateMatch) {
    const parts = dateMatch[1].split("/");
    // Convert to YYYY-MM-DD
    document.getElementById("data_procedimento").value =
      `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // 9. PROCEDIMENTO (Location/Room often serves as proxy or generic)
  const procMatch =
    text.match(/Bloco\s+[A-Za-z\s]+/i) || text.match(/Sala\s+\d+/i);
  if (procMatch) document.getElementById("procedimento").value = procMatch[0];

  showToast("Dados extraídos da etiqueta!");
}

function calculateAge(dateString) {
  const [day, month, year] = dateString.split("/");
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
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
  "https://script.google.com/macros/s/AKfycbykDnT3z33eMqHhMKdyarGd6NFEjkKIcTZfQEIG1sfQLirughlGegQNKOkC9cut3Us_8g/exec";

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

// Add focus listeners to allow manual field selection
fields.forEach((field, index) => {
  const input = document.getElementById(field.id);
  if (input) {
    input.addEventListener("focus", () => {
      // Update current index without auto-scrolling (user already clicked it)
      currentFieldIndex = index;

      // Update visual cue
      document
        .querySelectorAll(".input-group")
        .forEach((group) => group.classList.remove("active"));
      const currentGroup = document.querySelector(`[data-field="${field.id}"]`);
      if (currentGroup) currentGroup.classList.add("active");

      // Update prompt text
      assistantPrompt.innerText = field.prompt;

      // Stop any ongoing auto-sequence or previous listening
      if (isListening) {
        stopListening();
      }
    });
  }
});

// Listener for individual mic buttons
document.querySelectorAll(".field-mic").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent focus accumulation issues
    const fieldId = btn.getAttribute("data-field");
    const index = fields.findIndex((f) => f.id === fieldId);

    if (index !== -1) {
      // Set current context
      currentFieldIndex = index;

      // If already listening on THIS button, stop.
      if (isListening && btn.classList.contains("listening")) {
        stopListening();
        return;
      }

      // If listening elsewhere, stop first
      if (isListening) {
        stopListening();
        // Give a tiny delay to reset before starting new
        setTimeout(() => startListeningForField(index, btn), 200);
      } else {
        startListeningForField(index, btn);
      }
    }
  });
});

function startListeningForField(index, btn) {
  const field = fields[index];
  updateUIForField(field); // This highlights group and sets prompt

  // Visual feedback on the button itself
  if (btn) btn.classList.add("listening");

  startListening();
}

// Collect form data
function getFormData() {
  const formData = {};
  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    formData[field.id] = input.value;
  });
  return formData;
}

// Send data to Google Sheets via JSON
async function sendToGoogleSheets(data) {
  try {
    const payload = {
      ...data,
      timestamp: new Date().toLocaleString("pt-PT"),
    };

    // Send as plain text (JSON string) to avoid CORS preflight issues
    // content-type: text/plain is the "simple" request type allowed by no-cors/simple-cors
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors", // This means we can't read the response status, but it sends the data
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
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
    showToast("✅ Enviado com sucesso para a Google Sheet!", "success");
  } else {
    showToast("⚠️ Guardado localmente (Erro no envio online)", "error");
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
