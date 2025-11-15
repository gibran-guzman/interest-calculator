(function () {
  "use strict";

  const unknownSelect = document.getElementById("compound-unknownVariable");
  const form = document.getElementById("compound-calculatorForm");
  const evaluateBtn = document.getElementById("compound-evaluateBtn");
  const resetBtn = document.getElementById("compound-resetBtn");

  const capitalizationGroup = document.getElementById(
    "compound-capitalizationGroup"
  );
  const capitalGroup = document.getElementById("compound-capitalGroup");
  const rateGroup = document.getElementById("compound-rateGroup");
  const timeGroup = document.getElementById("compound-timeGroup");
  const interestGroup = document.getElementById("compound-interestGroup");
  const amountGroup = document.getElementById("compound-amountGroup");

  const capitalizationInput = document.getElementById(
    "compound-capitalization"
  );
  const capitalInput = document.getElementById("compound-capital");
  const rateInput = document.getElementById("compound-interestRate");
  const timeInput = document.getElementById("compound-time");
  const timeUnitSelect = document.getElementById("compound-timeUnit");
  const interestInput = document.getElementById("compound-interest");
  const amountInput = document.getElementById("compound-amount");

  const capitalFormatted = document.getElementById("compound-capitalFormatted");
  const rateFormatted = document.getElementById("compound-rateFormatted");
  const timeFormatted = document.getElementById("compound-timeFormatted");
  const interestFormatted = document.getElementById(
    "compound-interestFormatted"
  );
  const amountFormatted = document.getElementById("compound-amountFormatted");

  const formulaSection = document.getElementById("compound-formulaSection");
  const formulaDisplay = document.getElementById("compound-formulaDisplay");

  const resultSection = document.getElementById("compound-resultSection");
  const resultAlert = document.getElementById("compound-resultAlert");
  const resultTitle = document.getElementById("compound-resultTitle");
  const resultMessage = document.getElementById("compound-resultMessage");
  const resultDetails = document.getElementById("compound-resultDetails");

  const currencyFmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  });
  const percentFmt = new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  let currentUnknown = "";
  let lastResult = null;
  let lastFormula = "";

  function toYears(v, unit) {
    const x = parseFloat(v);
    if (!isFinite(x) || x < 0) return null;
    if (unit === "months") return x / 12;
    if (unit === "days") return x / 365;
    return x;
  }

  function updateFormatted() {
    if (capitalFormatted) capitalFormatted.textContent = "";
    if (rateFormatted) rateFormatted.textContent = "";
    if (timeFormatted) timeFormatted.textContent = "";
    const capFmt = document.getElementById("compound-capitalizationFormatted");
    if (capFmt) capFmt.textContent = "";
    if (interestFormatted) interestFormatted.textContent = "";
    if (amountFormatted) amountFormatted.textContent = "";
  }

  function setDisabledForUnknown(unk) {
    [
      capitalInput,
      rateInput,
      timeInput,
      interestInput,
      amountInput,
      capitalizationInput,
    ].forEach((el) => {
      if (el) {
        el.disabled = false;
        el.classList.remove("is-unknown");
      }
    });
    if (timeUnitSelect) timeUnitSelect.disabled = false;
    [
      capitalGroup,
      rateGroup,
      timeGroup,
      interestGroup,
      amountGroup,
      capitalizationGroup,
    ].forEach((g) => g && g.classList.remove("disabled"));

    if (!unk) return;

    const disableField = (group, input, alsoDisableUnit = false) => {
      if (group) group.classList.add("disabled");
      if (input) {
        input.value = "";
        input.disabled = true;
        input.classList.add("is-unknown");
      }
      if (alsoDisableUnit && timeUnitSelect) timeUnitSelect.disabled = true;
    };

    switch (unk) {
      case "C":
        disableField(capitalGroup, capitalInput);
        break;
      case "i":
        disableField(rateGroup, rateInput);
        break;
      case "n":
        disableField(timeGroup, timeInput, true);
        break;
      case "I":
        disableField(interestGroup, interestInput);
        break;
      case "M":
        disableField(amountGroup, amountInput);
        break;
      case "m":
        disableField(capitalizationGroup, capitalizationInput);
        break;
    }
  }

  function have(v) {
    return isFinite(v) && v !== null;
  }

  function compute() {
    const unk = currentUnknown;
    const C = parseFloat(capitalInput.value);
    const iPct = parseFloat(rateInput.value);
    const i = isFinite(iPct) ? iPct / 100 : NaN;
    const nRaw = parseFloat(timeInput.value);
    const n = toYears(nRaw, timeUnitSelect.value);
    const m = parseInt(capitalizationInput.value);
    const I = parseFloat(interestInput.value);
    const M = parseFloat(amountInput.value);

    let result = null;
    let formula = "";
    let derivation = "";

    // Fórmulas generales con m
    // M = C * (1 + i/m)^(m*n)
    // I = C * [ (1 + i/m)^(m*n) - 1 ]
    if (unk === "M") {
      if (have(C) && have(i) && have(n) && have(m) && m > 0) {
        const val = C * Math.pow(1 + i / m, m * n);
        result = val;
        formula = "M = C · (1 + i/m)^(m·n)";
        derivation = `M = ${C} × (1 + ${i.toFixed(6)}/${m})^(${m}×${n.toFixed(
          4
        )}) = ${val.toFixed(6)}`;
      }
    } else if (unk === "C") {
      if (have(M) && have(i) && have(n) && have(m) && m > 0) {
        const denom = Math.pow(1 + i / m, m * n);
        const val = M / denom;
        result = val;
        formula = "C = M / (1 + i/m)^(m·n)";
        derivation = `C = ${M} / (1 + ${i.toFixed(6)}/${m})^(${m}×${n.toFixed(
          4
        )}) = ${val.toFixed(6)}`;
      }
    } else if (unk === "i") {
      if (
        have(M) &&
        have(C) &&
        have(n) &&
        have(m) &&
        C > 0 &&
        M > 0 &&
        n > 0 &&
        m > 0
      ) {
        const base = M / C;
        if (base > 0) {
          const val = m * (Math.pow(base, 1 / (m * n)) - 1);
          result = val;
          formula = "i = m · [ (M/C)^(1/(m·n)) - 1 ]";
          derivation = `i = ${m} × [ (${M}/${C})^(1/(${m}×${n.toFixed(
            4
          )})) - 1 ] = ${val.toFixed(6)}`;
        }
      }
    } else if (unk === "n") {
      if (
        have(M) &&
        have(C) &&
        have(i) &&
        have(m) &&
        C > 0 &&
        i > -1 &&
        m > 0
      ) {
        const base = M / C;
        if (base > 0 && base !== 1 && 1 + i / m !== 1) {
          const val = Math.log(base) / (m * Math.log(1 + i / m));
          result = val;
          formula = "n = ln(M/C) / [m · ln(1 + i/m)]";
          derivation = `n = ln(${M}/${C}) / [${m} × ln(1 + ${i.toFixed(
            6
          )}/${m})] = ${val.toFixed(6)} años`;
        }
      }
    } else if (unk === "I") {
      if (have(M) && have(C)) {
        const val = M - C;
        result = val;
        formula = "I = M - C";
        derivation = `I = ${M} - ${C} = ${val.toFixed(6)}`;
      } else if (have(C) && have(i) && have(n) && have(m) && m > 0) {
        const Mcalc = C * Math.pow(1 + i / m, m * n);
        const val = Mcalc - C;
        result = val;
        formula = "I = C · [ (1 + i/m)^(m·n) - 1 ]";
        derivation = `I = ${C} × [ (1 + ${i.toFixed(6)}/${m})^(${m}×${n.toFixed(
          4
        )}) - 1 ] = ${val.toFixed(6)}`;
      }
    }

    return {
      result,
      formula,
      derivation,
      inputs: { C, i, iPct, n, nRaw, nUnit: timeUnitSelect.value, m, I, M },
    };
  }

  function canEvaluate() {
    const unk = currentUnknown;
    const C = parseFloat(capitalInput.value);
    const iPct = parseFloat(rateInput.value);
    const i = isFinite(iPct) ? iPct / 100 : NaN;
    const n = toYears(parseFloat(timeInput.value), timeUnitSelect.value);
    const m = parseInt(capitalizationInput.value);
    const I = parseFloat(interestInput.value);
    const M = parseFloat(amountInput.value);

    if (!unk) return false;
    switch (unk) {
      case "M":
        return (
          isFinite(C) && isFinite(i) && isFinite(n) && isFinite(m) && m > 0
        );
      case "C":
        return (
          isFinite(M) && isFinite(i) && isFinite(n) && isFinite(m) && m > 0
        );
      case "i":
        return (
          isFinite(M) &&
          isFinite(C) &&
          isFinite(n) &&
          isFinite(m) &&
          C > 0 &&
          M > 0 &&
          n > 0 &&
          m > 0
        );
      case "n":
        return (
          isFinite(M) &&
          isFinite(C) &&
          isFinite(i) &&
          isFinite(m) &&
          C > 0 &&
          m > 0
        );
      case "I":
        return (
          (isFinite(M) && isFinite(C)) ||
          (isFinite(C) && isFinite(i) && isFinite(n) && isFinite(m) && m > 0)
        );
    }
    return false;
  }

  function updateFormulaPreview() {
    const unk = currentUnknown;
    if (!unk) {
      formulaSection.style.display = "none";
      return;
    }
    formulaSection.style.display = "block";
    let txt = "";
    switch (unk) {
      case "M":
        txt = "M = C · (1 + i/m)^(m·n)";
        break;
      case "C":
        txt = "C = M / (1 + i/m)^(m·n)";
        break;
      case "i":
        txt = "i = m · [ (M/C)^(1/(m·n)) - 1 ]";
        break;
      case "n":
        txt = "n = ln(M/C) / [m · ln(1 + i/m)]";
        break;
      case "I":
        txt = "I = M - C = C · [ (1 + i/m)^(m·n) - 1 ]";
        break;
    }
    formulaDisplay.textContent = txt + " (frecuencia de capitalización m)";
  }

  function saveHistory(payload) {
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

  function showResult(obj) {
    const { result, formula, derivation, inputs } = obj;
    if (!isFinite(result)) return;
    lastResult = result;
    lastFormula = formula;

    resultSection.style.display = "block";
    resultAlert.className = "alert alert-success";

    const unk = currentUnknown;
    let title = "";
    let message = "";
    if (unk === "i") {
      title = "Resultado: Tasa de interés (i)";
      message = `i = ${percentFmt.format(result)} (${(result * 100).toFixed(
        4
      )}%)`;
    } else if (unk === "n") {
      title = "Resultado: Tiempo (n)";
      message = `n = ${result.toFixed(6)} años`;
    } else if (unk === "C") {
      title = "Resultado: Capital (C)";
      message = `C = ${currencyFmt.format(result)}`;
    } else if (unk === "M") {
      title = "Resultado: Monto (M)";
      message = `M = ${currencyFmt.format(result)}`;
    } else if (unk === "I") {
      title = "Resultado: Interés (I)";
      message = `I = ${currencyFmt.format(result)}`;
    }

    resultTitle.textContent = title;
    resultMessage.textContent = message;
    resultDetails.innerHTML = `
      <ul class="mb-2">
        <li>Fórmula: <code>${formula}</code></li>
        <li>Derivación: ${derivation}</li>
      </ul>
    `;

    const payload = {
      ts: Date.now(),
      type: "compound",
      unknown: currentUnknown,
      formula,
      result,
      values: {
        input: {
          C: isFinite(inputs.C) ? inputs.C : undefined,
          iPct: isFinite(inputs.iPct) ? inputs.iPct : undefined,
          nInput: isFinite(inputs.nRaw) ? inputs.nRaw : undefined,
          nUnit: inputs.nUnit,
          I: isFinite(inputs.I) ? inputs.I : undefined,
          M: isFinite(inputs.M) ? inputs.M : undefined,
        },
      },
    };
    saveHistory(payload);
  }

  function onEvaluate(e) {
    e.preventDefault();
    if (!canEvaluate()) return;
    const out = compute();
    if (isFinite(out.result)) {
      showResult(out);
    }
  }

  function onReset() {
    [
      capitalInput,
      rateInput,
      timeInput,
      interestInput,
      amountInput,
      capitalizationInput,
    ].forEach((el) => {
      el.value = "";
      el.disabled = false;
      el.classList.remove("is-unknown");
    });
    [
      capitalGroup,
      rateGroup,
      timeGroup,
      interestGroup,
      amountGroup,
      capitalizationGroup,
    ].forEach((g) => g && g.classList.remove("disabled"));
    timeUnitSelect.value = "years";
    timeUnitSelect.disabled = false;
    resultSection.style.display = "none";
    formulaSection.style.display = "none";
    lastResult = null;
    lastFormula = "";
    updateFormatted();
    updateEvaluateState();
  }

  function updateEvaluateState() {
    updateFormatted();
    updateFormulaPreview();
    evaluateBtn.disabled = !canEvaluate();
  }

  function init() {
    if (!form) return;
    unknownSelect.addEventListener("change", () => {
      currentUnknown = unknownSelect.value;
      setDisabledForUnknown(currentUnknown);
      updateEvaluateState();
    });

    [
      capitalInput,
      rateInput,
      timeInput,
      timeUnitSelect,
      interestInput,
      amountInput,
      capitalizationInput,
    ].forEach((el) => {
      el && el.addEventListener("input", updateEvaluateState);
      if (el && el.tagName === "SELECT") {
        el.addEventListener("change", updateEvaluateState);
      }
    });

    form.addEventListener("submit", onEvaluate);
    resetBtn.addEventListener("click", onReset);

    currentUnknown = unknownSelect.value || "";
    setDisabledForUnknown(currentUnknown);
    updateEvaluateState();
  }

  init();
})();
