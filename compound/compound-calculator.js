/**
 * COMPOUND INTEREST CALCULATOR
 * Calculadora de Interés Compuesto con Clean Code y SOLID
 * Fórmula: M = C × (1 + i/m)^(m×n), donde I = M - C
 * @version 2.0.0
 */

(function () {
  "use strict";

  // ============================================
  // CONSTANTES Y CONFIGURACIÓN
  // ============================================
  const ELEMENTS = {
    // Formulario y controles
    unknownSelect: document.getElementById("compound-unknownVariable"),
    form: document.getElementById("compound-calculatorForm"),
    evaluateBtn: document.getElementById("compound-evaluateBtn"),
    resetBtn: document.getElementById("compound-resetBtn"),

    // Grupos de inputs
    capitalizationGroup: document.getElementById(
      "compound-capitalizationGroup"
    ),
    capitalGroup: document.getElementById("compound-capitalGroup"),
    rateGroup: document.getElementById("compound-rateGroup"),
    timeGroup: document.getElementById("compound-timeGroup"),
    interestGroup: document.getElementById("compound-interestGroup"),
    amountGroup: document.getElementById("compound-amountGroup"),

    // Campos de entrada
    capitalizationInput: document.getElementById("compound-capitalization"),
    capitalInput: document.getElementById("compound-capital"),
    rateInput: document.getElementById("compound-interestRate"),
    timeInput: document.getElementById("compound-time"),
    timeUnit: document.getElementById("compound-timeUnit"),
    interestInput: document.getElementById("compound-interest"),
    amountInput: document.getElementById("compound-amount"),

    // Previsualizaciones formateadas
    capitalFormatted: document.getElementById("compound-capitalFormatted"),
    rateFormatted: document.getElementById("compound-rateFormatted"),
    timeFormatted: document.getElementById("compound-timeFormatted"),
    interestFormatted: document.getElementById("compound-interestFormatted"),
    amountFormatted: document.getElementById("compound-amountFormatted"),

    // Resultado
    formulaSection: document.getElementById("compound-formulaSection"),
    formulaDisplay: document.getElementById("compound-formulaDisplay"),
    resultSection: document.getElementById("compound-resultSection"),
    resultAlert: document.getElementById("compound-resultAlert"),
    resultTitle: document.getElementById("compound-resultTitle"),
    resultMessage: document.getElementById("compound-resultMessage"),
    resultDetails: document.getElementById("compound-resultDetails"),
  };

  const CAPITALIZATION_FREQUENCIES = {
    1: "Anual",
    2: "Semestral",
    4: "Trimestral",
    12: "Mensual",
    365: "Diaria",
  };

  const VARIABLE_LABELS = {
    C: "Capital (C)",
    i: "Tasa de Interés (i)",
    n: "Tiempo (n)",
    I: "Interés Compuesto (I)",
    M: "Monto Final (M)",
  };

  // Estado de la calculadora
  let state = {
    unknown: "",
    result: null,
    formula: "",
    details: null,
  };

  // ============================================
  // CLASE: CompoundInterestCalculator
  // Responsabilidad: Cálculos matemáticos
  // ============================================
  class CompoundInterestCalculator {
    /**
     * Calcula el monto final con interés compuesto
     * @param {number} C - Capital
     * @param {number} i - Tasa anual (decimal, 0.05 = 5%)
     * @param {number} n - Tiempo en años
     * @param {number} m - Frecuencia de capitalización anual
     * @returns {number} Monto final
     */
    static calculateAmount(C, i, n, m) {
      const base = 1 + i / m;
      const exponent = m * n;
      const M = C * Math.pow(base, exponent);
      return roundMoney(M);
    }

    /**
     * Calcula el interés compuesto
     * @param {number} C - Capital
     * @param {number} i - Tasa anual (decimal)
     * @param {number} n - Tiempo en años
     * @param {number} m - Frecuencia de capitalización
     * @returns {number} Interés compuesto
     */
    static calculateInterest(C, i, n, m) {
      const M = this.calculateAmount(C, i, n, m);
      return roundMoney(M - C);
    }

    /**
     * Calcula el capital inicial
     * @param {number} M - Monto final
     * @param {number} i - Tasa anual (decimal)
     * @param {number} n - Tiempo en años
     * @param {number} m - Frecuencia de capitalización
     * @returns {number} Capital inicial
     */
    static calculateCapital(M, i, n, m) {
      const base = 1 + i / m;
      const exponent = m * n;
      const C = M / Math.pow(base, exponent);
      return roundMoney(C);
    }

    /**
     * Calcula la tasa de interés
     * @param {number} M - Monto final
     * @param {number} C - Capital
     * @param {number} n - Tiempo en años
     * @param {number} m - Frecuencia de capitalización
     * @returns {number} Tasa anual (decimal)
     */
    static calculateRate(M, C, n, m) {
      if (C === 0 || n === 0 || m === 0) {
        throw new Error(
          "El capital, tiempo y frecuencia deben ser mayores que cero"
        );
      }
      if (M <= C) {
        throw new Error("El monto final debe ser mayor que el capital");
      }

      const exponent = 1 / (m * n);
      const ratio = M / C;
      const i = m * (Math.pow(ratio, exponent) - 1);

      return roundToDecimals(i, 6);
    }

    /**
     * Calcula el tiempo necesario
     * @param {number} M - Monto final
     * @param {number} C - Capital
     * @param {number} i - Tasa anual (decimal)
     * @param {number} m - Frecuencia de capitalización
     * @returns {number} Tiempo en años
     */
    static calculateTime(M, C, i, m) {
      if (C === 0 || i === 0 || m === 0) {
        throw new Error(
          "El capital, tasa y frecuencia deben ser mayores que cero"
        );
      }
      if (M <= C) {
        throw new Error("El monto final debe ser mayor que el capital");
      }

      const ratio = M / C;
      const base = 1 + i / m;
      const n = Math.log(ratio) / (m * Math.log(base));

      return roundToDecimals(n, 4);
    }

    /**
     * Calcula el interés desde el monto
     * @param {number} M - Monto final
     * @param {number} C - Capital
     * @returns {number} Interés
     */
    static calculateInterestFromAmount(M, C) {
      return roundMoney(M - C);
    }

    /**
     * Calcula el capital desde el interés
     * @param {number} I - Interés
     * @param {number} i - Tasa anual (decimal)
     * @param {number} n - Tiempo en años
     * @param {number} m - Frecuencia de capitalización
     * @returns {number} Capital
     */
    static calculateCapitalFromInterest(I, i, n, m) {
      // C + I = C × (1 + i/m)^(mn)
      // I = C × [(1 + i/m)^(mn) - 1]
      // C = I / [(1 + i/m)^(mn) - 1]

      const base = 1 + i / m;
      const exponent = m * n;
      const multiplier = Math.pow(base, exponent) - 1;

      if (multiplier <= 0) {
        throw new Error("Configuración inválida para calcular el capital");
      }

      const C = I / multiplier;
      return roundMoney(C);
    }
  }

  // ============================================
  // CLASE: InputValidator
  // Responsabilidad: Validación de entradas
  // ============================================
  class InputValidator {
    /**
     * Valida los inputs del formulario
     * @param {string} unknown - Variable desconocida
     * @returns {Object} {isValid, values, errors}
     */
    static validateInputs(unknown) {
      const values = {};
      const errors = {};
      let isValid = true;

      try {
        // Frecuencia de capitalización (siempre necesaria)
        values.m = validatePositiveInteger(
          ELEMENTS.capitalizationInput.value,
          "Frecuencia de capitalización"
        );

        // Validar según la variable desconocida
        switch (unknown) {
          case "C":
            values.i =
              validatePercentage(ELEMENTS.rateInput.value, "Tasa de interés") /
              100;
            values.n = convertToYears(
              validatePositiveNumber(ELEMENTS.timeInput.value, "Tiempo"),
              ELEMENTS.timeUnit.value
            );
            values.M = validatePositiveNumber(
              ELEMENTS.amountInput.value,
              "Monto final"
            );
            break;

          case "i":
            values.C = validatePositiveNumber(
              ELEMENTS.capitalInput.value,
              "Capital"
            );
            values.n = convertToYears(
              validatePositiveNumber(ELEMENTS.timeInput.value, "Tiempo"),
              ELEMENTS.timeUnit.value
            );
            values.M = validatePositiveNumber(
              ELEMENTS.amountInput.value,
              "Monto final"
            );
            break;

          case "n":
            values.C = validatePositiveNumber(
              ELEMENTS.capitalInput.value,
              "Capital"
            );
            values.i =
              validatePercentage(ELEMENTS.rateInput.value, "Tasa de interés") /
              100;
            values.M = validatePositiveNumber(
              ELEMENTS.amountInput.value,
              "Monto final"
            );
            break;

          case "I":
            values.C = validatePositiveNumber(
              ELEMENTS.capitalInput.value,
              "Capital"
            );
            values.i =
              validatePercentage(ELEMENTS.rateInput.value, "Tasa de interés") /
              100;
            values.n = convertToYears(
              validatePositiveNumber(ELEMENTS.timeInput.value, "Tiempo"),
              ELEMENTS.timeUnit.value
            );
            break;

          case "M":
            values.C = validatePositiveNumber(
              ELEMENTS.capitalInput.value,
              "Capital"
            );
            values.i =
              validatePercentage(ELEMENTS.rateInput.value, "Tasa de interés") /
              100;
            values.n = convertToYears(
              validatePositiveNumber(ELEMENTS.timeInput.value, "Tiempo"),
              ELEMENTS.timeUnit.value
            );
            break;

          default:
            throw new Error("Debe seleccionar una variable a calcular");
        }
      } catch (error) {
        isValid = false;
        errors.general = error.message;
      }

      return { isValid, values, errors };
    }
  }

  // ============================================
  // CLASE: FormulaGenerator
  // Responsabilidad: Generar fórmulas
  // ============================================
  class FormulaGenerator {
    /**
     * Genera la fórmula correspondiente
     * @param {string} unknown - Variable desconocida
     * @param {Object} values - Valores conocidos
     * @returns {string} Fórmula generada
     */
    static generate(unknown, values) {
      const formulas = {
        C: () => this.generateCapitalFormula(values),
        i: () => this.generateRateFormula(values),
        n: () => this.generateTimeFormula(values),
        I: () => this.generateInterestFormula(values),
        M: () => this.generateAmountFormula(values),
      };

      return formulas[unknown] ? formulas[unknown]() : "";
    }

    static generateCapitalFormula(values) {
      const { M, i, n, m } = values;
      return `C = M / (1 + i/m)<sup>m×n</sup> = ${formatCurrency(
        M
      )} / (1 + ${formatPercentage(i * 100)}/${m})<sup>${m}×${formatNumberTrim(
        n,
        2
      )}</sup>`;
    }

    static generateRateFormula(values) {
      const { M, C, n, m } = values;
      return `i = m × [(M/C)<sup>1/(m×n)</sup> - 1] = ${m} × [(${formatCurrency(
        M
      )}/${formatCurrency(C)})<sup>1/(${m}×${formatNumberTrim(
        n,
        2
      )})</sup> - 1]`;
    }

    static generateTimeFormula(values) {
      const { M, C, i, m } = values;
      return `n = ln(M/C) / [m × ln(1 + i/m)] = ln(${formatCurrency(
        M
      )}/${formatCurrency(C)}) / [${m} × ln(1 + ${formatPercentage(
        i * 100
      )}/${m})]`;
    }

    static generateInterestFormula(values) {
      const { C, i, n, m } = values;
      return `I = C × [(1 + i/m)<sup>m×n</sup> - 1] = ${formatCurrency(
        C
      )} × [(1 + ${formatPercentage(i * 100)}/${m})<sup>${m}×${formatNumberTrim(
        n,
        2
      )}</sup> - 1]`;
    }

    static generateAmountFormula(values) {
      const { C, i, n, m } = values;
      return `M = C × (1 + i/m)<sup>m×n</sup> = ${formatCurrency(
        C
      )} × (1 + ${formatPercentage(i * 100)}/${m})<sup>${m}×${formatNumberTrim(
        n,
        2
      )}</sup>`;
    }
  }

  // ============================================
  // CLASE: UIController
  // Responsabilidad: Control de la interfaz
  // ============================================
  class UIController {
    /**
     * Actualiza la visibilidad de los grupos de inputs
     * @param {string} unknown - Variable desconocida
     */
    static updateInputGroups(unknown) {
      const groups = {
        C: ELEMENTS.capitalGroup,
        i: ELEMENTS.rateGroup,
        n: ELEMENTS.timeGroup,
        I: ELEMENTS.interestGroup,
        M: ELEMENTS.amountGroup,
      };

      // La frecuencia de capitalización siempre está visible
      if (ELEMENTS.capitalizationGroup) {
        ELEMENTS.capitalizationGroup.style.display = "block";
      }

      Object.entries(groups).forEach(([variable, group]) => {
        if (group) {
          const isUnknown = variable === unknown;
          group.style.display = isUnknown ? "none" : "block";
          group.setAttribute("aria-hidden", isUnknown ? "true" : "false");

          if (isUnknown) {
            const inputMap = {
              C: "capitalInput",
              i: "rateInput",
              n: "timeInput",
              I: "interestInput",
              M: "amountInput",
            };
            const input = ELEMENTS[inputMap[variable]];
            if (input) {
              input.value = "";
              clearInputValidation(input);
            }
          }
        }
      });
    }

    /**
     * Muestra el resultado del cálculo
     * @param {string} unknown - Variable calculada
     * @param {number} result - Resultado numérico
     * @param {string} formula - Fórmula usada
     * @param {Object} details - Detalles adicionales
     */
    static showResult(unknown, result, formula, details) {
      const variableName = VARIABLE_LABELS[unknown];
      const formattedResult = this.formatResult(unknown, result);

      toggleElement(ELEMENTS.formulaSection, true);
      toggleElement(ELEMENTS.resultSection, true);

      setElementHTML(ELEMENTS.formulaDisplay, formula);
      setElementText(ELEMENTS.resultTitle, variableName);
      setElementText(ELEMENTS.resultMessage, formattedResult);

      // Mostrar detalles adicionales
      this.showDetails(details);

      ELEMENTS.resultSection.classList.remove("d-none");
      ELEMENTS.resultSection.classList.add("fade-in");

      smoothScrollTo(ELEMENTS.resultSection, "center");
    }

    /**
     * Muestra detalles adicionales del cálculo
     * @param {Object} details - Detalles del cálculo
     */
    static showDetails(details) {
      if (!ELEMENTS.resultDetails) return;

      const html = `
        <p><strong>Capital:</strong> ${formatCurrency(details.C)}</p>
        <p><strong>Tasa de Interés:</strong> ${formatPercentage(
          details.i * 100
        )}</p>
        <p><strong>Tiempo:</strong> ${formatNumberTrim(details.n, 2)} años</p>
        <p><strong>Capitalización:</strong> ${
          CAPITALIZATION_FREQUENCIES[details.m] || details.m + " veces/año"
        }</p>
        <p><strong>Interés Ganado:</strong> ${formatCurrency(details.I)}</p>
        <p><strong>Monto Final:</strong> ${formatCurrency(details.M)}</p>
      `;

      setElementHTML(ELEMENTS.resultDetails, html);
      toggleElement(ELEMENTS.resultDetails, true);
    }

    /**
     * Formatea el resultado según la variable
     * @param {string} variable - Variable calculada
     * @param {number} value - Valor a formatear
     * @returns {string} Valor formateado
     */
    static formatResult(variable, value) {
      switch (variable) {
        case "C":
        case "I":
        case "M":
          return formatCurrency(value);
        case "i":
          return formatPercentage(value * 100);
        case "n":
          return `${formatNumberTrim(value, 4)} años`;
        default:
          return formatNumberTrim(value, 4);
      }
    }

    /**
     * Actualiza las previsualizaciones formateadas
     */
    static updateFormattedPreviews() {
      const previews = [
        {
          input: ELEMENTS.capitalInput,
          preview: ELEMENTS.capitalFormatted,
          formatter: (val) => formatCurrency(parseFloat(val)),
        },
        {
          input: ELEMENTS.rateInput,
          preview: ELEMENTS.rateFormatted,
          formatter: (val) => formatPercentage(parseFloat(val)),
        },
        {
          input: ELEMENTS.timeInput,
          preview: ELEMENTS.timeFormatted,
          formatter: (val) => {
            const unit = ELEMENTS.timeUnit.value;
            const unitLabels = { years: "años", months: "meses", days: "días" };
            return `${formatNumberTrim(parseFloat(val), 2)} ${
              unitLabels[unit] || "años"
            }`;
          },
        },
        {
          input: ELEMENTS.interestInput,
          preview: ELEMENTS.interestFormatted,
          formatter: (val) => formatCurrency(parseFloat(val)),
        },
        {
          input: ELEMENTS.amountInput,
          preview: ELEMENTS.amountFormatted,
          formatter: (val) => formatCurrency(parseFloat(val)),
        },
      ];

      previews.forEach(({ input, preview, formatter }) => {
        if (input && preview && input.value && isPositiveNumber(input.value)) {
          try {
            const formatted = formatter(input.value);
            setElementText(preview, formatted);
            toggleElement(preview, true);
          } catch {
            toggleElement(preview, false);
          }
        } else if (preview) {
          toggleElement(preview, false);
        }
      });
    }

    /**
     * Actualiza la visualización de la fórmula
     */
    static updateFormulaDisplay() {
      if (!state.unknown) {
        toggleElement(ELEMENTS.formulaSection, false);
        this.updateSubmitButton(false);
        return;
      }

      const validation = InputValidator.validateInputs(state.unknown);
      if (!validation.isValid) {
        toggleElement(ELEMENTS.formulaSection, false);
        this.updateSubmitButton(false);
        return;
      }

      const formula = FormulaGenerator.generate(
        state.unknown,
        validation.values
      );
      setElementHTML(ELEMENTS.formulaDisplay, formula);
      toggleElement(ELEMENTS.formulaSection, true);
      this.updateSubmitButton(true);
    }

    /**
     * Habilita o deshabilita el botón de submit
     * @param {boolean} enable - True para habilitar
     */
    static updateSubmitButton(enable) {
      if (ELEMENTS.evaluateBtn) {
        ELEMENTS.evaluateBtn.disabled = !enable;
      }
    }

    /**
     * Oculta la sección de resultados
     */
    static hideResults() {
      toggleElement(ELEMENTS.resultSection, false);
      toggleElement(ELEMENTS.formulaSection, false);
      this.updateSubmitButton(false);
    }
  }

  // ============================================
  // FUNCIONES DE EVENTOS
  // ============================================

  /**
   * Maneja el cambio de variable desconocida
   */
  function handleUnknownChange() {
    state.unknown = ELEMENTS.unknownSelect.value;
    UIController.updateInputGroups(state.unknown);
    UIController.hideResults();
    UIController.updateFormattedPreviews();
    UIController.updateFormulaDisplay();
  }

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento de submit
   */
  function handleSubmit(e) {
    e.preventDefault();

    if (!state.unknown) {
      showError(
        ELEMENTS.resultAlert,
        "Debe seleccionar una variable a calcular"
      );
      return;
    }

    const validation = InputValidator.validateInputs(state.unknown);

    if (!validation.isValid) {
      showError(ELEMENTS.resultAlert, validation.errors.general);
      return;
    }

    try {
      const { result, details } = calculateVariable(
        state.unknown,
        validation.values
      );
      const formula = FormulaGenerator.generate(
        state.unknown,
        validation.values
      );

      state.result = result;
      state.formula = formula;
      state.details = details;

      UIController.showResult(state.unknown, result, formula, details);

      // Guardar en historial
      saveCalculationToHistory({
        type: "compound",
        variable: state.unknown,
        result: result,
        formula: formula,
        values: details,
      });
    } catch (error) {
      showError(ELEMENTS.resultAlert, `Error en el cálculo: ${error.message}`);
    }
  }

  /**
   * Calcula la variable desconocida
   * @param {string} unknown - Variable a calcular
   * @param {Object} values - Valores conocidos
   * @returns {Object} {result, details}
   */
  function calculateVariable(unknown, values) {
    let result;
    const { C, i, n, M, m } = values;
    let details = { ...values };

    switch (unknown) {
      case "C":
        result = CompoundInterestCalculator.calculateCapital(M, i, n, m);
        details.C = result;
        details.I = CompoundInterestCalculator.calculateInterestFromAmount(
          M,
          result
        );
        break;

      case "i":
        result = CompoundInterestCalculator.calculateRate(M, C, n, m);
        details.i = result;
        details.I = CompoundInterestCalculator.calculateInterest(
          C,
          result,
          n,
          m
        );
        break;

      case "n":
        result = CompoundInterestCalculator.calculateTime(M, C, i, m);
        details.n = result;
        details.I = CompoundInterestCalculator.calculateInterest(
          C,
          i,
          result,
          m
        );
        break;

      case "I":
        result = CompoundInterestCalculator.calculateInterest(C, i, n, m);
        details.I = result;
        details.M = CompoundInterestCalculator.calculateAmount(C, i, n, m);
        break;

      case "M":
        result = CompoundInterestCalculator.calculateAmount(C, i, n, m);
        details.M = result;
        details.I = CompoundInterestCalculator.calculateInterestFromAmount(
          result,
          C
        );
        break;

      default:
        throw new Error("Variable desconocida no válida");
    }

    return { result, details };
  }

  /**
   * Resetea el formulario
   */
  function resetForm() {
    ELEMENTS.form.reset();
    state.unknown = "";
    state.result = null;
    state.formula = "";
    state.details = null;

    UIController.hideResults();
    UIController.updateFormattedPreviews();
    UIController.updateSubmitButton(false);

    // Mostrar todos los grupos
    [
      ELEMENTS.capitalizationGroup,
      ELEMENTS.capitalGroup,
      ELEMENTS.rateGroup,
      ELEMENTS.timeGroup,
      ELEMENTS.interestGroup,
      ELEMENTS.amountGroup,
    ].forEach((group) => {
      if (group) {
        group.style.display = "block";
        group.setAttribute("aria-hidden", "false");
      }
    });

    if (ELEMENTS.unknownSelect) {
      ELEMENTS.unknownSelect.focus();
    }
  }

  /**
   * Valida el formulario en tiempo real
   */
  const validateFormDebounced = debounce(() => {
    if (!state.unknown) return;
    UIController.updateFormulaDisplay();
  }, 300);

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  function initialize() {
    if (!ELEMENTS.unknownSelect || !ELEMENTS.form) {
      return;
    }

    // Event listeners principales
    ELEMENTS.unknownSelect.addEventListener("change", handleUnknownChange);
    ELEMENTS.resetBtn?.addEventListener("click", resetForm);
    ELEMENTS.form.addEventListener("submit", handleSubmit);

    // Event listeners para inputs
    const inputs = [
      ELEMENTS.capitalizationInput,
      ELEMENTS.capitalInput,
      ELEMENTS.rateInput,
      ELEMENTS.timeInput,
      ELEMENTS.interestInput,
      ELEMENTS.amountInput,
    ];

    inputs.forEach((input) => {
      if (input) {
        input.addEventListener("input", validateFormDebounced);
        input.addEventListener(
          "input",
          debounce(UIController.updateFormattedPreviews, 200)
        );
      }
    });

    if (ELEMENTS.timeUnit) {
      ELEMENTS.timeUnit.addEventListener("change", () => {
        UIController.updateFormattedPreviews();
        validateFormDebounced();
      });
    }

    // Estado inicial
    UIController.hideResults();
    UIController.updateFormattedPreviews();
    UIController.updateSubmitButton(false);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
