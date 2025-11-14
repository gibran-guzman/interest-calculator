// DOM Elements
const unknownVariableSelect = document.getElementById("unknownVariable");
const capitalGroup = document.getElementById("capitalGroup");
const rateGroup = document.getElementById("rateGroup");
const timeGroup = document.getElementById("timeGroup");
const interestGroup = document.getElementById("interestGroup");
const amountGroup = document.getElementById("amountGroup");
const formulaSection = document.getElementById("formulaSection");
const formulaDisplay = document.getElementById("formulaDisplay");
const evaluateBtn = document.getElementById("evaluateBtn");
const resetBtn = document.getElementById("resetBtn");
const calculatorForm = document.getElementById("calculatorForm");
const resultSection = document.getElementById("resultSection");
const resultAlert = document.getElementById("resultAlert");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const resultDetails = document.getElementById("resultDetails");

// Input fields
const capitalInput = document.getElementById("capital");
const interestRateInput = document.getElementById("interestRate");
const timeInput = document.getElementById("time");
const timeUnitSelect = document.getElementById("timeUnit");
const interestInput = document.getElementById("interest");
const amountInput = document.getElementById("amount");
// Formatted preview elements
const capitalFormatted = document.getElementById("capitalFormatted");
const rateFormatted = document.getElementById("rateFormatted");
const timeFormatted = document.getElementById("timeFormatted");
const interestFormatted = document.getElementById("interestFormatted");
const amountFormatted = document.getElementById("amountFormatted");

// Error feedback elements
const capitalError = document.getElementById("capitalError");
const rateError = document.getElementById("rateError");
const timeError = document.getElementById("timeError");
const interestError = document.getElementById("interestError");
const amountError = document.getElementById("amountError");

// State
let currentUnknown = "";
let calculatedAnswer = null;
let currentFormula = "";

// Input groups mapping
const inputGroups = {
  C: capitalGroup,
  i: rateGroup,
  n: timeGroup,
  I: interestGroup,
  M: amountGroup,
};

// Input fields mapping
const inputFields = {
  C: capitalInput,
  i: interestRateInput,
  n: timeInput,
  I: interestInput,
  M: amountInput,
};

// Event Listeners
unknownVariableSelect.addEventListener("change", handleUnknownChange);
resetBtn.addEventListener("click", resetForm);
calculatorForm.addEventListener("submit", handleSubmit);

// Add input event listeners to all input fields to validate form
[
  capitalInput,
  interestRateInput,
  timeInput,
  interestInput,
  amountInput,
].forEach((input) => {
  input.addEventListener("input", validateForm);
  input.addEventListener("input", updateFormulaDisplay);
  input.addEventListener("input", updateFormattedPreviews);
});
if (timeUnitSelect) {
  timeUnitSelect.addEventListener("change", () => {
    updateFormattedPreviews();
    updateFormulaDisplay();
    validateForm();
  });
}

// Handle unknown variable selection
function handleUnknownChange() {
  currentUnknown = unknownVariableSelect.value;
  resultSection.style.display = "none";

  if (!currentUnknown) {
    hideAllInputs();
    formulaSection.style.display = "none";
    evaluateBtn.disabled = true;
    return;
  }

  // Show all input groups first
  Object.values(inputGroups).forEach((group) => {
    group.style.display = "block";
    group.classList.remove("disabled");
  });

  // Disable the selected unknown input
  const unknownGroup = inputGroups[currentUnknown];
  unknownGroup.classList.add("disabled");
  inputFields[currentUnknown].value = "";
  inputFields[currentUnknown].removeAttribute("required");

  // Enable all other inputs
  Object.entries(inputFields).forEach(([key, input]) => {
    if (key !== currentUnknown) {
      input.setAttribute("required", "required");
    }
  });

  // Show formula and answer sections
  formulaSection.style.display = "block";

  updateFormulaDisplay();
  updateFormattedPreviews();
  validateForm();
}

// Hide all input groups
function hideAllInputs() {
  Object.values(inputGroups).forEach((group) => {
    group.style.display = "none";
    group.classList.remove("disabled");
  });
}

// Validate form to enable/disable evaluate button
function validateForm() {
  if (!currentUnknown) {
    evaluateBtn.disabled = true;
    return;
  }

  // Check if all required inputs have values
  let allFilled = true;

  // Check known values (we need at least 3 values depending on the unknown)
  const knownValues = getKnownValues();
  const requiredValues = getRequiredKnownValues(currentUnknown);

  // Check if we have all required known values
  for (const key of requiredValues) {
    if (knownValues[key] === null || knownValues[key] === "") {
      allFilled = false;
      break;
    }
  }

  // Per-field validations: no negatives
  const fieldsToCheck = ["C", "i", "n", "I", "M"];
  for (const k of fieldsToCheck) {
    const input = inputFields[k];
    if (!input || input.disabled || input.closest(".disabled")) continue;
    const raw = input.value;
    const val = raw === "" ? null : parseFloat(raw);
    if (val !== null && val < 0) {
      setFieldError(input, "No se permiten valores negativos");
      allFilled = false;
    } else {
      clearFieldError(input);
    }
  }

  evaluateBtn.disabled = !allFilled;
}

// Get known values from inputs
function getKnownValues() {
  return {
    C: capitalInput.value ? parseFloat(capitalInput.value) : null,
    i: interestRateInput.value
      ? parseFloat(interestRateInput.value) / 100
      : null, // Convert to decimal
    n: getTimeInYears(),
    I: interestInput.value ? parseFloat(interestInput.value) : null,
    M: amountInput.value ? parseFloat(amountInput.value) : null,
  };
}

function getTimeInYears() {
  if (!timeInput.value) return null;
  const v = parseFloat(timeInput.value);
  if (isNaN(v)) return null;
  const unit = timeUnitSelect ? timeUnitSelect.value : "years";
  if (unit === "months") {
    return v / 12; // 12 meses = 1 año
  } else if (unit === "days") {
    return v / 365; // Tiempo real: 365 días = 1 año
  }
  return v;
}

// Helpers to format numbers/years
function formatNumberTrim(value, maxDecimals = 4) {
  if (!isFinite(value)) return String(value);
  const fixed = Number(value).toFixed(maxDecimals);
  return fixed.replace(/\.0+$/, "").replace(/(\.[0-9]*[1-9])0+$/, "$1");
}

function formatYearsDisplay(years, unitVal, originalVal) {
  let isExact = false;
  if (years === null || isNaN(years))
    return { isExact, yearsStr: "", sign: "≈" };
  if (unitVal === "months") {
    isExact = Number.isInteger(originalVal) && originalVal % 12 === 0;
  } else if (unitVal === "days") {
    isExact = Number.isInteger(originalVal) && originalVal % 365 === 0;
  } else if (unitVal === "years") {
    isExact = Math.abs(years - Math.round(years)) < 1e-9;
  }
  const yearsStr = isExact
    ? String(Math.round(years))
    : formatNumberTrim(years, 4);
  const sign = isExact ? "=" : "≈";
  return { isExact, yearsStr, sign };
}

// Get required known values based on unknown variable
function getRequiredKnownValues(unknown) {
  // For each unknown, we need specific values
  switch (unknown) {
    case "C": // To calculate C, we need i, n and either I or M
      return hasValue("I") ? ["i", "n", "I"] : ["i", "n", "M"];
    case "i": // To calculate i, we need C, n and either I or M
      return hasValue("I") ? ["C", "n", "I"] : ["C", "n", "M"];
    case "n": // To calculate n, we need C, i and either I or M
      return hasValue("I") ? ["C", "i", "I"] : ["C", "i", "M"];
    case "I": // To calculate I, we need C, i, n OR M and C
      return hasValue("M") ? ["C", "M"] : ["C", "i", "n"];
    case "M": // To calculate M, we need C and either (i, n) or I
      return hasValue("I") ? ["C", "I"] : ["C", "i", "n"];
    default:
      return [];
  }
}

// Check if a value is entered
function hasValue(key) {
  const input = inputFields[key];
  return input && input.value && input.value.trim() !== "";
}

// Calculate the correct answer based on the unknown variable
function calculateAnswer(unknown, values) {
  try {
    switch (unknown) {
      case "C":
        // C = I / (i * n) or C = M / (1 + i * n)
        if (values.I !== null) {
          return values.I / (values.i * values.n);
        } else if (values.M !== null) {
          return values.M / (1 + values.i * values.n);
        }
        break;

      case "i":
        // i = I / (C * n) or i = (M - C) / (C * n)
        if (values.I !== null) {
          return values.I / (values.C * values.n);
        } else if (values.M !== null) {
          return (values.M - values.C) / (values.C * values.n);
        }
        break;

      case "n":
        // n = I / (C * i) or n = (M - C) / (C * i)
        if (values.I !== null) {
          return values.I / (values.C * values.i);
        } else if (values.M !== null) {
          return (values.M - values.C) / (values.C * values.i);
        }
        break;

      case "I":
        // I = C * i * n or I = M - C
        if (values.C !== null && values.i !== null && values.n !== null) {
          return values.C * values.i * values.n;
        } else if (values.M !== null && values.C !== null) {
          return values.M - values.C;
        }
        break;

      case "M":
        // M = C + I or M = C * (1 + i * n)
        if (values.I !== null) {
          return values.C + values.I;
        } else if (values.i !== null && values.n !== null) {
          return values.C * (1 + values.i * values.n);
        }
        break;
    }

    return null;
  } catch (error) {
    console.error("Error calculating:", error);
    return null;
  }
}

// (Fórmula automática) Ya no se requiere validación de fórmula escrita por el usuario.

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();

  const values = getKnownValues();

  // Validate inputs
  if (!validateInputs(values)) {
    showResult(
      false,
      "Error en los datos ingresados",
      "Por favor, verifica que todos los valores sean positivos y válidos."
    );
    return;
  }

  // Calculate correct answer
  calculatedAnswer = calculateAnswer(currentUnknown, values);

  if (calculatedAnswer === null) {
    showResult(
      false,
      "Error en el cálculo",
      "No se pudo calcular el valor con los datos proporcionados."
    );
    return;
  }

  // Show computed result (no user answer to validate)
  showComputationResult(values);
  // Save to history
  saveToHistory(values);
}

// Validate all inputs are positive and valid
function validateInputs(values) {
  for (const [key, value] of Object.entries(values)) {
    if (key !== currentUnknown && value !== null) {
      if (value < 0 || isNaN(value)) {
        return false;
      }
    }
  }
  return true;
}

// Show result
function showResult(isCorrect, title, message, values = null) {
  resultSection.style.display = "block";
  resultTitle.textContent = title;
  resultMessage.textContent = message;

  if (isCorrect) {
    resultAlert.className = "alert alert-success";
    resultAlert.innerHTML = `
            <h5 class="alert-heading">
                <i class="fas fa-check-circle me-2"></i>${title}
            </h5>
            <hr>
            <p class="mb-0">${message}</p>
            ${generateResultDetails(values, true)}
        `;
  } else {
    resultAlert.className = "alert alert-danger";
    resultAlert.innerHTML = `
            <h5 class="alert-heading">
                <i class="fas fa-times-circle me-2"></i>${title}
            </h5>
            <hr>
            <p class="mb-0">${message}</p>
            ${values ? generateResultDetails(values, false) : ""}
        `;
  }

  // Scroll to result
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Generate result details HTML
function generateResultDetails(values, showAnswer) {
  if (!values) return "";

  let html = '<div id="resultDetails" class="mt-3">';
  if (currentFormula) {
    html += `<p><strong>Fórmula usada:</strong> <span class="badge bg-dark">${currentFormula}</span></p>`;
  }
  html += "<p><strong>Valores ingresados:</strong></p>";

  // Show known values
  if (values.C !== null && currentUnknown !== "C") {
    html += `<p>Capital (C): $${values.C.toFixed(2)}</p>`;
  }
  if (values.i !== null && currentUnknown !== "i") {
    html += `<p>Tasa de interés (i): ${(values.i * 100).toFixed(2)}%</p>`;
  }
  if (values.n !== null && currentUnknown !== "n") {
    const original = timeInput.value ? parseFloat(timeInput.value) : null;
    const unitVal = timeUnitSelect ? timeUnitSelect.value : "years";
    const unitText = timeUnitSelect
      ? timeUnitSelect.options[timeUnitSelect.selectedIndex].text
      : "Años";
    const details = formatYearsDisplay(values.n, unitVal, original ?? values.n);
    const convNote = unitVal === "days" ? " (conv. 365 días = 1 año)" : "";
    const originalStr =
      original !== null && !isNaN(original)
        ? `${original} ${unitText.toLowerCase()} ${details.sign} ${
            details.yearsStr
          } años${convNote}`
        : `${details.yearsStr} años`;
    html += `<p>Tiempo (n): ${details.yearsStr} años <small class="text-light">(${originalStr})</small></p>`;
  }
  if (values.I !== null && currentUnknown !== "I") {
    html += `<p>Interés (I): $${values.I.toFixed(2)}</p>`;
  }
  if (values.M !== null && currentUnknown !== "M") {
    html += `<p>Monto (M): $${values.M.toFixed(2)}</p>`;
  }

  // Show computed result
  if (calculatedAnswer !== null) {
    html += `<hr><p><strong>Resultado calculado (${currentUnknown}):</strong> ${formatAnswer(
      currentUnknown,
      calculatedAnswer
    )}</p>`;
    html += buildDerivation(currentUnknown, values);
  }

  html += "</div>";
  return html;
}

// Format answer based on variable type
function formatAnswer(variable, value) {
  switch (variable) {
    case "i":
      return `${(value * 100).toFixed(2)}%`;
    case "n": {
      const near = Math.round(value);
      const isInt = Math.abs(value - near) < 1e-9;
      return `${isInt ? near : formatNumberTrim(value, 4)} años`;
    }
    case "C":
    case "I":
    case "M":
      return `$${value.toFixed(2)}`;
    default:
      return value.toFixed(2);
  }
}

// Reset form
function resetForm() {
  calculatorForm.reset();
  currentUnknown = "";
  calculatedAnswer = null;
  currentFormula = "";

  hideAllInputs();
  formulaSection.style.display = "none";
  if (formulaDisplay)
    formulaDisplay.textContent =
      "Selecciona una incógnita e ingresa valores para determinar la fórmula.";
  resultSection.style.display = "none";
  evaluateBtn.disabled = true;

  // Remove required attributes
  Object.values(inputFields).forEach((input) => {
    input.removeAttribute("required");
  });
}

// Initialize
resetForm();

// Determine and show formula string based on unknown and available values
function updateFormulaDisplay() {
  if (!currentUnknown) {
    if (formulaDisplay)
      formulaDisplay.textContent =
        "Selecciona una incógnita e ingresa valores para determinar la fórmula.";
    currentFormula = "";
    return;
  }
  const v = getKnownValues();
  let formula = "";
  switch (currentUnknown) {
    case "C":
      // Prefer I if present, else M
      if (hasValue("I")) formula = "C = I / (i × n)";
      else if (hasValue("M")) formula = "C = M / (1 + i × n)";
      else formula = "C = I / (i × n)  ó  C = M / (1 + i × n)";
      break;
    case "i":
      if (hasValue("I")) formula = "i = I / (C × n)";
      else if (hasValue("M")) formula = "i = (M − C) / (C × n)";
      else formula = "i = I / (C × n)  ó  i = (M − C) / (C × n)";
      break;
    case "n":
      if (hasValue("I")) formula = "n = I / (C × i)";
      else if (hasValue("M")) formula = "n = (M − C) / (C × i)";
      else formula = "n = I / (C × i)  ó  n = (M − C) / (C × i)";
      break;
    case "I":
      if (hasValue("M")) formula = "I = M − C";
      else formula = "I = C × i × n";
      break;
    case "M":
      if (hasValue("I")) formula = "M = C + I";
      else formula = "M = C × (1 + i × n)";
      break;
  }
  currentFormula = formula;
  if (formulaDisplay) formulaDisplay.textContent = formula;
}

// Show computation result in an info alert
function showComputationResult(values) {
  resultSection.style.display = "block";
  resultAlert.className = "alert alert-info";
  const title = "Resultado del cálculo";
  const message = "Se calculó el valor de la incógnita seleccionada.";
  resultAlert.innerHTML = `
        <h5 class="alert-heading">
            <i class="fas fa-calculator me-2"></i>${title}
        </h5>
        <hr>
        <p class="mb-0">${message}</p>
        ${generateResultDetails(values, false)}
    `;
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Update formatted previews for inputs
function updateFormattedPreviews() {
  const nfCurrency = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
  const nfPercent = new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (capitalFormatted)
    capitalFormatted.textContent =
      capitalInput.value !== ""
        ? nfCurrency.format(parseFloat(capitalInput.value) || 0)
        : "";
  if (amountFormatted)
    amountFormatted.textContent =
      amountInput.value !== ""
        ? nfCurrency.format(parseFloat(amountInput.value) || 0)
        : "";
  if (interestFormatted)
    interestFormatted.textContent =
      interestInput.value !== ""
        ? nfCurrency.format(parseFloat(interestInput.value) || 0)
        : "";
  if (rateFormatted)
    rateFormatted.textContent =
      interestRateInput.value !== ""
        ? nfPercent.format((parseFloat(interestRateInput.value) || 0) / 100)
        : "";
  if (timeFormatted) {
    const unitVal = timeUnitSelect ? timeUnitSelect.value : "years";
    const unitText = timeUnitSelect
      ? timeUnitSelect.options[timeUnitSelect.selectedIndex].text
      : "Años";
    const original = timeInput.value;
    const years = getTimeInYears();
    const convNote = unitVal === "days" ? " (conv. 365 días = 1 año)" : "";
    if (original !== "") {
      const { yearsStr, sign } = formatYearsDisplay(
        years,
        unitVal,
        parseFloat(original)
      );
      timeFormatted.textContent = `${original} ${unitText.toLowerCase()} ${sign} ${yearsStr} años${convNote}`;
    } else {
      timeFormatted.textContent = "";
    }
  }
}

// Validation helpers
function setFieldError(input, message) {
  input.classList.add("is-invalid");
  const id = input.getAttribute("id");
  const mapping = {
    capital: capitalError,
    interestRate: rateError,
    time: timeError,
    interest: interestError,
    amount: amountError,
  };
  const el = mapping[id];
  if (el) el.textContent = message;
}

function clearFieldError(input) {
  input.classList.remove("is-invalid");
  const id = input.getAttribute("id");
  const mapping = {
    capital: capitalError,
    interestRate: rateError,
    time: timeError,
    interest: interestError,
    amount: amountError,
  };
  const el = mapping[id];
  if (el) el.textContent = "";
}

// Build step-by-step derivation HTML
function buildDerivation(unknown, v) {
  let lines = [];
  const fmtMoney = (x) => `$${x.toFixed(2)}`;
  const fmtPct = (x) => `${(x * 100).toFixed(2)}%`;
  const fmtYears = (x) => {
    const n = Math.round(x);
    const s = Math.abs(x - n) < 1e-9 ? String(n) : formatNumberTrim(x, 4);
    return `${s} años`;
  };

  switch (unknown) {
    case "C":
      if (v.I !== null) {
        lines.push("C = I / (i × n)");
        lines.push(
          `C = ${fmtMoney(v.I)} / (${fmtPct(v.i)} × ${fmtYears(v.n)})`
        );
        lines.push(`C = ${fmtMoney(v.I)} / ${(v.i * v.n).toFixed(6)}`);
        lines.push(`C = ${fmtMoney(v.I / (v.i * v.n))}`);
      } else if (v.M !== null) {
        lines.push("C = M / (1 + i × n)");
        lines.push(
          `C = ${fmtMoney(v.M)} / (1 + ${fmtPct(v.i)} × ${fmtYears(v.n)})`
        );
        lines.push(`C = ${fmtMoney(v.M)} / ${(1 + v.i * v.n).toFixed(6)}`);
        lines.push(`C = ${fmtMoney(v.M / (1 + v.i * v.n))}`);
      }
      break;
    case "i":
      if (v.I !== null) {
        lines.push("i = I / (C × n)");
        lines.push(
          `i = ${fmtMoney(v.I)} / (${fmtMoney(v.C)} × ${fmtYears(v.n)})`
        );
        lines.push(`i = ${(v.I / (v.C * v.n)).toFixed(6)}`);
        lines.push(`i = ${fmtPct(v.I / (v.C * v.n))}`);
      } else if (v.M !== null) {
        lines.push("i = (M − C) / (C × n)");
        lines.push(
          `i = (${fmtMoney(v.M)} − ${fmtMoney(v.C)}) / (${fmtMoney(
            v.C
          )} × ${fmtYears(v.n)})`
        );
        lines.push(`i = ${fmtMoney(v.M - v.C)} / ${fmtMoney(v.C * v.n)}`);
        const val = (v.M - v.C) / (v.C * v.n);
        lines.push(`i = ${val.toFixed(6)} = ${fmtPct(val)}`);
      }
      break;
    case "n":
      if (v.I !== null) {
        lines.push("n = I / (C × i)");
        lines.push(
          `n = ${fmtMoney(v.I)} / (${fmtMoney(v.C)} × ${fmtPct(v.i)})`
        );
        lines.push(`n = ${fmtMoney(v.I)} / ${(v.C * v.i).toFixed(6)}`);
        lines.push(`n = ${fmtYears(v.I / (v.C * v.i))}`);
      } else if (v.M !== null) {
        lines.push("n = (M − C) / (C × i)");
        lines.push(
          `n = (${fmtMoney(v.M)} − ${fmtMoney(v.C)}) / (${fmtMoney(
            v.C
          )} × ${fmtPct(v.i)})`
        );
        lines.push(`n = ${fmtMoney(v.M - v.C)} / ${(v.C * v.i).toFixed(6)}`);
        lines.push(`n = ${fmtYears((v.M - v.C) / (v.C * v.i))}`);
      }
      break;
    case "I":
      if (v.M !== null && v.C !== null) {
        lines.push("I = M − C");
        lines.push(`I = ${fmtMoney(v.M)} − ${fmtMoney(v.C)}`);
        lines.push(`I = ${fmtMoney(v.M - v.C)}`);
      } else if (v.C !== null && v.i !== null && v.n !== null) {
        lines.push("I = C × i × n");
        lines.push(`I = ${fmtMoney(v.C)} × ${fmtPct(v.i)} × ${fmtYears(v.n)}`);
        lines.push(`I = ${fmtMoney(v.C * v.i * v.n)}`);
      }
      break;
    case "M":
      if (v.I !== null) {
        lines.push("M = C + I");
        lines.push(`M = ${fmtMoney(v.C)} + ${fmtMoney(v.I)}`);
        lines.push(`M = ${fmtMoney(v.C + v.I)}`);
      } else if (v.i !== null && v.n !== null) {
        lines.push("M = C × (1 + i × n)");
        lines.push(
          `M = ${fmtMoney(v.C)} × (1 + ${fmtPct(v.i)} × ${fmtYears(v.n)})`
        );
        lines.push(`M = ${fmtMoney(v.C * (1 + v.i * v.n))}`);
      }
      break;
  }
  if (!lines.length) return "";
  const html = [
    '<div class="mt-3">',
    "<p><strong>Desarrollo:</strong></p>",
    '<div class="bg-dark bg-opacity-25 p-3 rounded">',
    ...lines.map((l) => `<div>${l}</div>`),
    "</div>",
    "</div>",
  ].join("");
  return html;
}

// History management
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("ic_history") || "[]");
  } catch {
    return [];
  }
}
function setHistory(arr) {
  localStorage.setItem("ic_history", JSON.stringify(arr));
}

function saveToHistory(values) {
  const item = {
    ts: new Date().toISOString(),
    unknown: currentUnknown,
    formula: currentFormula,
    result: calculatedAnswer,
    values: {
      ...values, // store raw inputs too
      input: {
        C: capitalInput.value,
        iPct: interestRateInput.value,
        nInput: timeInput.value,
        nUnit: timeUnitSelect ? timeUnitSelect.value : "years",
        I: interestInput.value,
        M: amountInput.value,
      },
    },
  };
  const history = getHistory();
  history.unshift(item);
  setHistory(history);
  renderHistory();
}

const historyTableBody = document.querySelector("#historyTable tbody");
const historyCard = document.getElementById("historyCard");
const exportHistoryBtn = document.getElementById("exportHistoryBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

function renderHistory() {
  const history = getHistory();
  if (!historyTableBody || !historyCard) return;
  historyCard.style.display = history.length ? "block" : "none";
  historyTableBody.innerHTML = history
    .map((item) => {
      const date = new Date(item.ts);
      const dateStr = date.toLocaleString();
      const resStr = formatAnswer(item.unknown, item.result);
      const dataStr = `C:${item.values.input.C || "-"}, i:${
        item.values.input.iPct || "-"
      }%, n:${item.values.input.nInput || "-"} ${
        item.values.input.nUnit || ""
      }, I:${item.values.input.I || "-"}, M:${item.values.input.M || "-"}`;
      return `<tr>
            <td>${dateStr}</td>
            <td>${item.unknown}</td>
            <td><small>${item.formula || ""}</small></td>
            <td><strong>${resStr}</strong></td>
            <td><small>${dataStr}</small></td>
        </tr>`;
    })
    .join("");
}

if (exportHistoryBtn) {
  exportHistoryBtn.addEventListener("click", () => {
    const history = getHistory();
    if (!history.length) return;
    const rows = [
      [
        "fecha_hora",
        "incognita",
        "formula",
        "resultado",
        "C",
        "i_pct",
        "n_valor",
        "n_unidad",
        "I",
        "M",
      ],
    ];
    history.forEach((h) => {
      rows.push([
        h.ts,
        h.unknown,
        (h.formula || "").replace(/,/g, ";"),
        h.result,
        h.values.input.C || "",
        h.values.input.iPct || "",
        h.values.input.nInput || "",
        h.values.input.nUnit || "",
        h.values.input.I || "",
        h.values.input.M || "",
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historial_interes_simple.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    if (!confirm("¿Seguro que deseas limpiar el historial?")) return;
    setHistory([]);
    renderHistory();
  });
}

// Initial history render
renderHistory();

// Dynamic main title based on selected tab
const mainTitleEl = document.getElementById("mainTitle");
const titleByTab = {
  "#tab-calculadora": "Calculadora de Interés Simple",
  "#tab-formulas": "Calculadora de Interés Compuesto",
  "#tab-historial": "Simulador de Crédito Bancario",
};

document
  .querySelectorAll('#mainTabs button[data-bs-toggle="tab"]')
  .forEach((btn) => {
    btn.addEventListener("shown.bs.tab", (e) => {
      const target = e.target.getAttribute("data-bs-target");
      if (mainTitleEl && titleByTab[target]) {
        mainTitleEl.innerHTML = `<i class="fas fa-calculator me-2"></i>${titleByTab[target]}`;
      }
    });
  });
