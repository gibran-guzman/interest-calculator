(function () {
  "use strict";
  const unknownVariableSelect = document.getElementById(
    "simple-unknownVariable"
  );
  const capitalGroup = document.getElementById("simple-capitalGroup");
  const rateGroup = document.getElementById("simple-rateGroup");
  const timeGroup = document.getElementById("simple-timeGroup");
  const interestGroup = document.getElementById("simple-interestGroup");
  const amountGroup = document.getElementById("simple-amountGroup");
  const formulaSection = document.getElementById("simple-formulaSection");
  const formulaDisplay = document.getElementById("simple-formulaDisplay");
  const evaluateBtn = document.getElementById("simple-evaluateBtn");
  const resetBtn = document.getElementById("simple-resetBtn");
  const calculatorForm = document.getElementById("simple-calculatorForm");
  const resultSection = document.getElementById("simple-resultSection");
  const resultAlert = document.getElementById("simple-resultAlert");

  const capitalInput = document.getElementById("simple-capital");
  const interestRateInput = document.getElementById("simple-interestRate");
  const timeInput = document.getElementById("simple-time");
  const timeUnitSelect = document.getElementById("simple-timeUnit");
  const interestInput = document.getElementById("simple-interest");
  const amountInput = document.getElementById("simple-amount");

  const capitalFormatted = document.getElementById("simple-capitalFormatted");
  const rateFormatted = document.getElementById("simple-rateFormatted");
  const timeFormatted = document.getElementById("simple-timeFormatted");
  const interestFormatted = document.getElementById("simple-interestFormatted");
  const amountFormatted = document.getElementById("simple-amountFormatted");

  const capitalError = document.getElementById("simple-capitalError");
  const rateError = document.getElementById("simple-rateError");
  const timeError = document.getElementById("simple-timeError");
  const interestError = document.getElementById("simple-interestError");
  const amountError = document.getElementById("simple-amountError");

  let currentUnknown = "";
  let calculatedAnswer = null;
  let currentFormula = "";

  const inputGroups = {
    C: capitalGroup,
    i: rateGroup,
    n: timeGroup,
    I: interestGroup,
    M: amountGroup,
  };

  const inputFields = {
    C: capitalInput,
    i: interestRateInput,
    n: timeInput,
    I: interestInput,
    M: amountInput,
  };

  if (!unknownVariableSelect || !calculatorForm) {
    console.warn("Simple calculator elements not found");
    return;
  }

  unknownVariableSelect.addEventListener("change", handleUnknownChange);
  resetBtn.addEventListener("click", resetForm);
  calculatorForm.addEventListener("submit", handleSubmit);

  [
    capitalInput,
    interestRateInput,
    timeInput,
    interestInput,
    amountInput,
  ].forEach((input) => {
    if (input) {
      input.addEventListener("input", validateForm);
      input.addEventListener("input", updateFormulaDisplay);
      input.addEventListener("input", updateFormattedPreviews);
    }
  });

  if (timeUnitSelect) {
    timeUnitSelect.addEventListener("change", () => {
      updateFormattedPreviews();
      updateFormulaDisplay();
      validateForm();
    });
  }

  function handleUnknownChange() {
    currentUnknown = unknownVariableSelect.value;
    if (resultSection) resultSection.style.display = "none";

    Object.values(inputFields).forEach((inp) => {
      if (inp) {
        inp.disabled = false;
        inp.classList.remove("is-unknown");
      }
    });
    if (timeUnitSelect) timeUnitSelect.disabled = false;

    if (!currentUnknown) {
      hideAllInputs();
      if (formulaSection) formulaSection.style.display = "none";
      if (evaluateBtn) evaluateBtn.disabled = true;
      return;
    }

    Object.values(inputGroups).forEach((group) => {
      if (group) {
        group.style.display = "block";
        group.classList.remove("disabled");
      }
    });

    const unknownGroup = inputGroups[currentUnknown];
    if (unknownGroup) {
      unknownGroup.classList.add("disabled");
      const unknownInput = inputFields[currentUnknown];
      if (unknownInput) {
        unknownInput.value = "";
        unknownInput.disabled = true;
        unknownInput.classList.add("is-unknown");
        unknownInput.removeAttribute("required");
      }
      if (currentUnknown === "n" && timeUnitSelect) {
        timeUnitSelect.disabled = true;
      }
    }

    Object.entries(inputFields).forEach(([key, input]) => {
      if (key !== currentUnknown && input) {
        input.setAttribute("required", "required");
      }
    });

    if (formulaSection) formulaSection.style.display = "block";

    updateFormulaDisplay();
    updateFormattedPreviews();
    validateForm();
  }

  function hideAllInputs() {
    Object.values(inputGroups).forEach((group) => {
      if (group) {
        group.style.display = "none";
        group.classList.remove("disabled");
      }
    });
  }

  function validateForm() {
    if (!currentUnknown) {
      if (evaluateBtn) evaluateBtn.disabled = true;
      return;
    }

    let allFilled = true;
    const knownValues = getKnownValues();
    const requiredValues = getRequiredKnownValues(currentUnknown);

    for (const key of requiredValues) {
      if (knownValues[key] === null || knownValues[key] === "") {
        allFilled = false;
        break;
      }
    }

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

    if (evaluateBtn) evaluateBtn.disabled = !allFilled;
  }

  function getKnownValues() {
    return {
      C:
        capitalInput && capitalInput.value
          ? parseFloat(capitalInput.value)
          : null,
      i:
        interestRateInput && interestRateInput.value
          ? parseFloat(interestRateInput.value) / 100
          : null,
      n: getTimeInYears(),
      I:
        interestInput && interestInput.value
          ? parseFloat(interestInput.value)
          : null,
      M:
        amountInput && amountInput.value ? parseFloat(amountInput.value) : null,
    };
  }

  function getTimeInYears() {
    if (!timeInput || !timeInput.value) return null;
    const v = parseFloat(timeInput.value);
    if (isNaN(v)) return null;
    const unit = timeUnitSelect ? timeUnitSelect.value : "years";
    if (unit === "months") return v / 12;
    if (unit === "days") return v / 365;
    return v;
  }

  function getRequiredKnownValues(unknown) {
    switch (unknown) {
      case "C":
        return hasValue("I") ? ["i", "n", "I"] : ["i", "n", "M"];
      case "i":
        return hasValue("I") ? ["C", "n", "I"] : ["C", "n", "M"];
      case "n":
        return hasValue("I") ? ["C", "i", "I"] : ["C", "i", "M"];
      case "I":
        return hasValue("M") ? ["C", "M"] : ["C", "i", "n"];
      case "M":
        return hasValue("I") ? ["C", "I"] : ["C", "i", "n"];
      default:
        return [];
    }
  }

  function hasValue(key) {
    const input = inputFields[key];
    return input && input.value && input.value.trim() !== "";
  }

  function calculateAnswer(unknown, values) {
    try {
      switch (unknown) {
        case "C":
          if (values.I !== null) return values.I / (values.i * values.n);
          if (values.M !== null) return values.M / (1 + values.i * values.n);
          break;
        case "i":
          if (values.I !== null) return values.I / (values.C * values.n);
          if (values.M !== null)
            return (values.M - values.C) / (values.C * values.n);
          break;
        case "n":
          if (values.I !== null) return values.I / (values.C * values.i);
          if (values.M !== null)
            return (values.M - values.C) / (values.C * values.i);
          break;
        case "I":
          if (values.C !== null && values.i !== null && values.n !== null)
            return values.C * values.i * values.n;
          if (values.M !== null && values.C !== null)
            return values.M - values.C;
          break;
        case "M":
          if (values.I !== null) return values.C + values.I;
          if (values.i !== null && values.n !== null)
            return values.C * (1 + values.i * values.n);
          break;
      }
      return null;
    } catch (error) {
      console.error("Error calculating:", error);
      return null;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const values = getKnownValues();

    if (!validateInputs(values)) {
      showComputationResult(values, "Error en los datos ingresados", false);
      return;
    }

    calculatedAnswer = calculateAnswer(currentUnknown, values);

    if (calculatedAnswer === null) {
      showComputationResult(values, "No se pudo calcular el valor", false);
      return;
    }

    showComputationResult(values, "Resultado del cálculo", true);
    saveToHistory(values);
  }

  function validateInputs(values) {
    for (const [key, value] of Object.entries(values)) {
      if (key !== currentUnknown && value !== null) {
        if (value < 0 || isNaN(value)) return false;
      }
    }
    return true;
  }

  function showComputationResult(values, message, success) {
    if (!resultSection || !resultAlert) return;

    resultSection.style.display = "block";
    resultAlert.className = success ? "alert alert-info" : "alert alert-danger";

    let html = `
						<h5 class="alert-heading">
								<i class="fas fa-calculator me-2"></i>${message}
						</h5>
						<hr>
				`;

    if (success) {
      html += generateResultDetails(values);
    } else {
      html += `<p class="mb-0">Por favor, verifica que todos los valores sean positivos y válidos.</p>`;
    }

    resultAlert.innerHTML = html;
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function generateResultDetails(values) {
    let html = '<div class="mt-3">';

    if (currentFormula) {
      html += `<p><strong>Fórmula usada:</strong> <span class="badge bg-dark">${currentFormula}</span></p>`;
    }

    html += "<p><strong>Valores ingresados:</strong></p>";

    if (values.C !== null && currentUnknown !== "C") {
      html += `<p>Capital (C): $${values.C.toFixed(2)}</p>`;
    }
    if (values.i !== null && currentUnknown !== "i") {
      html += `<p>Tasa de interés (i): ${(values.i * 100).toFixed(2)}%</p>`;
    }
    if (values.n !== null && currentUnknown !== "n") {
      const original = timeInput.value ? parseFloat(timeInput.value) : null;
      const unitText = timeUnitSelect
        ? timeUnitSelect.options[timeUnitSelect.selectedIndex].text
        : "Años";
      const details = formatYearsDisplay(
        values.n,
        timeUnitSelect?.value || "years",
        original ?? values.n
      );
      html += `<p>Tiempo (n): ${
        details.yearsStr
      } años <small class="text-light">(${original} ${unitText.toLowerCase()})</small></p>`;
    }
    if (values.I !== null && currentUnknown !== "I") {
      html += `<p>Interés (I): $${values.I.toFixed(2)}</p>`;
    }
    if (values.M !== null && currentUnknown !== "M") {
      html += `<p>Monto (M): $${values.M.toFixed(2)}</p>`;
    }

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

  function formatAnswer(variable, value) {
    switch (variable) {
      case "i":
        return `${(value * 100).toFixed(2)}%`;
      case "n":
        const near = Math.round(value);
        const isInt = Math.abs(value - near) < 1e-9;
        return `${isInt ? near : formatNumberTrim(value, 4)} años`;
      case "C":
      case "I":
      case "M":
        return `$${value.toFixed(2)}`;
      default:
        return value.toFixed(2);
    }
  }

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
          lines.push(`C = ${fmtMoney(v.I / (v.i * v.n))}`);
        } else if (v.M !== null) {
          lines.push("C = M / (1 + i × n)");
          lines.push(
            `C = ${fmtMoney(v.M)} / (1 + ${fmtPct(v.i)} × ${fmtYears(v.n)})`
          );
          lines.push(`C = ${fmtMoney(v.M / (1 + v.i * v.n))}`);
        }
        break;
      case "i":
        if (v.I !== null) {
          lines.push("i = I / (C × n)");
          lines.push(
            `i = ${fmtMoney(v.I)} / (${fmtMoney(v.C)} × ${fmtYears(v.n)})`
          );
          lines.push(`i = ${fmtPct(v.I / (v.C * v.n))}`);
        } else if (v.M !== null) {
          lines.push("i = (M − C) / (C × n)");
          lines.push(
            `i = (${fmtMoney(v.M)} − ${fmtMoney(v.C)}) / (${fmtMoney(
              v.C
            )} × ${fmtYears(v.n)})`
          );
          lines.push(`i = ${fmtPct((v.M - v.C) / (v.C * v.n))}`);
        }
        break;
      case "n":
        if (v.I !== null) {
          lines.push("n = I / (C × i)");
          lines.push(
            `n = ${fmtMoney(v.I)} / (${fmtMoney(v.C)} × ${fmtPct(v.i)})`
          );
          lines.push(`n = ${fmtYears(v.I / (v.C * v.i))}`);
        } else if (v.M !== null) {
          lines.push("n = (M − C) / (C × i)");
          lines.push(
            `n = (${fmtMoney(v.M)} − ${fmtMoney(v.C)}) / (${fmtMoney(
              v.C
            )} × ${fmtPct(v.i)})`
          );
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
          lines.push(
            `I = ${fmtMoney(v.C)} × ${fmtPct(v.i)} × ${fmtYears(v.n)}`
          );
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
    return (
      '<div class="mt-3"><p><strong>Desarrollo:</strong></p><div class="bg-dark bg-opacity-25 p-3 rounded">' +
      lines.map((l) => `<div>${l}</div>`).join("") +
      "</div></div>"
    );
  }

  function resetForm() {
    if (calculatorForm) calculatorForm.reset();
    currentUnknown = "";
    calculatedAnswer = null;
    currentFormula = "";

    hideAllInputs();
    if (formulaSection) formulaSection.style.display = "none";
    if (formulaDisplay)
      formulaDisplay.textContent =
        "Selecciona una incógnita e ingresa valores para determinar la fórmula.";
    if (resultSection) resultSection.style.display = "none";
    if (evaluateBtn) evaluateBtn.disabled = true;

    Object.values(inputFields).forEach((input) => {
      if (input) {
        input.removeAttribute("required");
        input.disabled = false;
        input.classList.remove("is-unknown");
      }
    });
    if (timeUnitSelect) timeUnitSelect.disabled = false;
  }

  function updateFormulaDisplay() {
    if (!currentUnknown) {
      if (formulaDisplay)
        formulaDisplay.textContent =
          "Selecciona una incógnita e ingresa valores para determinar la fórmula.";
      currentFormula = "";
      return;
    }

    let formula = "";
    switch (currentUnknown) {
      case "C":
        formula = hasValue("I")
          ? "C = I / (i × n)"
          : hasValue("M")
          ? "C = M / (1 + i × n)"
          : "C = I / (i × n)  ó  C = M / (1 + i × n)";
        break;
      case "i":
        formula = hasValue("I")
          ? "i = I / (C × n)"
          : hasValue("M")
          ? "i = (M − C) / (C × n)"
          : "i = I / (C × n)  ó  i = (M − C) / (C × n)";
        break;
      case "n":
        formula = hasValue("I")
          ? "n = I / (C × i)"
          : hasValue("M")
          ? "n = (M − C) / (C × i)"
          : "n = I / (C × i)  ó  n = (M − C) / (C × i)";
        break;
      case "I":
        formula = hasValue("M") ? "I = M − C" : "I = C × i × n";
        break;
      case "M":
        formula = hasValue("I") ? "M = C + I" : "M = C × (1 + i × n)";
        break;
    }

    currentFormula = formula;
    if (formulaDisplay) formulaDisplay.textContent = formula;
  }

  function updateFormattedPreviews() {
    if (capitalFormatted) capitalFormatted.textContent = "";
    if (amountFormatted) amountFormatted.textContent = "";
    if (interestFormatted) interestFormatted.textContent = "";
    if (rateFormatted) rateFormatted.textContent = "";
    if (timeFormatted) timeFormatted.textContent = "";
  }

  function setFieldError(input, message) {
    if (!input) return;
    input.classList.add("is-invalid");
    const id = input.getAttribute("id");
    const mapping = {
      "simple-capital": capitalError,
      "simple-interestRate": rateError,
      "simple-time": timeError,
      "simple-interest": interestError,
      "simple-amount": amountError,
    };
    const el = mapping[id];
    if (el) el.textContent = message;
  }

  function clearFieldError(input) {
    if (!input) return;
    input.classList.remove("is-invalid");
    const id = input.getAttribute("id");
    const mapping = {
      "simple-capital": capitalError,
      "simple-interestRate": rateError,
      "simple-time": timeError,
      "simple-interest": interestError,
      "simple-amount": amountError,
    };
    const el = mapping[id];
    if (el) el.textContent = "";
  }

  function saveToHistory(values) {
    const payload = {
      type: "simple",
      ts: Date.now(),
      unknown: currentUnknown,
      formula: currentFormula,
      result: calculatedAnswer,
      values: {
        input: {
          C: capitalInput?.value ? parseFloat(capitalInput.value) : undefined,
          iPct: interestRateInput?.value
            ? parseFloat(interestRateInput.value)
            : undefined,
          nInput: timeInput?.value ? parseFloat(timeInput.value) : undefined,
          nUnit: timeUnitSelect?.value || "years",
          I: interestInput?.value ? parseFloat(interestInput.value) : undefined,
          M: amountInput?.value ? parseFloat(amountInput.value) : undefined,
        },
      },
    };

    try {
      if (typeof window.parent?.saveCalculationToHistory === "function") {
        window.parent.saveCalculationToHistory(payload);
        return;
      }
      if (typeof window.saveCalculationToHistory === "function") {
        window.saveCalculationToHistory(payload);
        return;
      }
    } catch {}

    try {
      const key = "ic_history";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.unshift(payload);
      if (arr.length > 100) arr.length = 100;
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
  }

  resetForm();
})();
