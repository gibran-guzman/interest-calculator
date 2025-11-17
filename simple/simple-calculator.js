/**
 * SIMPLE INTEREST CALCULATOR
 * Calculadora de Interés Simple con Clean Code y SOLID
 * Fórmula: I = C × i × n, donde M = C + I
 * @version 2.0.0
 */

(function () {
  "use strict";

  // ============================================
  // CONSTANTES Y CONFIGURACIÓN
  // ============================================
  const ELEMENTS = {
    // Formulario y controles
    unknownSelect: document.getElementById("simple-unknownVariable"),
    form: document.getElementById("simple-calculatorForm"),
    evaluateBtn: document.getElementById("simple-evaluateBtn"),
    resetBtn: document.getElementById("simple-resetBtn"),

    // Grupos de inputs
    capitalGroup: document.getElementById("simple-capitalGroup"),
    rateGroup: document.getElementById("simple-rateGroup"),
    timeGroup: document.getElementById("simple-timeGroup"),
    interestGroup: document.getElementById("simple-interestGroup"),
    amountGroup: document.getElementById("simple-amountGroup"),

    // Campos de entrada
    capitalInput: document.getElementById("simple-capital"),
    rateInput: document.getElementById("simple-interestRate"),
    timeInput: document.getElementById("simple-time"),
    timeUnit: document.getElementById("simple-timeUnit"),
    interestInput: document.getElementById("simple-interest"),
    amountInput: document.getElementById("simple-amount"),

    // Previsualizaciones formateadas
    capitalFormatted: document.getElementById("simple-capitalFormatted"),
    rateFormatted: document.getElementById("simple-rateFormatted"),
    timeFormatted: document.getElementById("simple-timeFormatted"),
    interestFormatted: document.getElementById("simple-interestFormatted"),
    amountFormatted: document.getElementById("simple-amountFormatted"),

    // Mensajes de error
    capitalError: document.getElementById("simple-capitalError"),
    rateError: document.getElementById("simple-rateError"),
    timeError: document.getElementById("simple-timeError"),
    interestError: document.getElementById("simple-interestError"),
    amountError: document.getElementById("simple-amountError"),

    // Resultado
    formulaSection: document.getElementById("simple-formulaSection"),
    formulaDisplay: document.getElementById("simple-formulaDisplay"),
    resultSection: document.getElementById("simple-resultSection"),
    resultAlert: document.getElementById("simple-resultAlert"),
  };

  const VARIABLE_LABELS = {
    C: "Capital (C)",
    i: "Tasa de Interés (i)",
    n: "Tiempo (n)",
    I: "Interés (I)",
    M: "Monto Final (M)",
  };

  // Estado de la calculadora
  let state = {
    unknown: "",
    result: null,
    formula: "",
  };

  // ============================================
  // CLASE: SimpleInterestCalculator
  // Responsabilidad: Cálculos matemáticos
  // ============================================
  class SimpleInterestCalculator {
    /**
     * Calcula el interés simple
     * @param {number} C - Capital
     * @param {number} i - Tasa (decimal, 0.05 = 5%)
     * @param {number} n - Tiempo en años
     * @returns {number} Interés calculado
     */
    static calculateInterest(C, i, n) {
      return roundMoney(C * i * n);
    }

    /**
     * Calcula el monto final
     * @param {number} C - Capital
     * @param {number} I - Interés
     * @returns {number} Monto final
     */
    static calculateAmount(C, I) {
      return roundMoney(C + I);
    }

    /**
     * Calcula el capital desde el interés
     * @param {number} I - Interés
     * @param {number} i - Tasa (decimal)
     * @param {number} n - Tiempo en años
     * @returns {number} Capital calculado
     */
    static calculateCapitalFromInterest(I, i, n) {
      if (i === 0 || n === 0) {
        throw new Error("La tasa y el tiempo deben ser mayores que cero");
      }
      return roundMoney(I / (i * n));
    }

    /**
     * Calcula el capital desde el monto
     * @param {number} M - Monto final
     * @param {number} I - Interés
     * @returns {number} Capital calculado
     */
    static calculateCapitalFromAmount(M, I) {
      return roundMoney(M - I);
    }

    /**
     * Calcula la tasa de interés
     * @param {number} I - Interés
     * @param {number} C - Capital
     * @param {number} n - Tiempo en años
     * @returns {number} Tasa (decimal)
     */
    static calculateRate(I, C, n) {
      if (C === 0 || n === 0) {
        throw new Error("El capital y el tiempo deben ser mayores que cero");
      }
      return roundToDecimals(I / (C * n), 6);
    }

    /**
     * Calcula el tiempo
     * @param {number} I - Interés
     * @param {number} C - Capital
     * @param {number} i - Tasa (decimal)
     * @returns {number} Tiempo en años
     */
    static calculateTime(I, C, i) {
      if (C === 0 || i === 0) {
        throw new Error("El capital y la tasa deben ser mayores que cero");
      }
      return roundToDecimals(I / (C * i), 4);
    }

    /**
     * Calcula el interés desde el monto
     * @param {number} M - Monto final
     * @param {number} C - Capital
     * @returns {number} Interés calculado
     */
    static calculateInterestFromAmount(M, C) {
      return roundMoney(M - C);
    }

    /**
     * Calcula el monto desde la fórmula completa
     * @param {number} C - Capital
     * @param {number} i - Tasa (decimal)
     * @param {number} n - Tiempo en años
     * @returns {number} Monto final
     */
    static calculateAmountComplete(C, i, n) {
      const I = this.calculateInterest(C, i, n);
      return this.calculateAmount(C, I);
    }
  }

  // ============================================
  // CLASE: InputValidator
  // Responsabilidad: Validación de entradas
  // ============================================
  class InputValidator {
    /**
     * Valida los inputs del formulario según la variable desconocida
     * @param {string} unknown - Variable desconocida
     * @returns {Object} {isValid, values, errors}
     */
    static validateInputs(unknown) {
      const values = {};
      const errors = {};
      let isValid = true;

      try {
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
            values.I = validatePositiveNumber(
              ELEMENTS.interestInput.value,
              "Interés"
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
            values.I = validatePositiveNumber(
              ELEMENTS.interestInput.value,
              "Interés"
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
            values.I = validatePositiveNumber(
              ELEMENTS.interestInput.value,
              "Interés"
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

    /**
     * Valida un campo individual y muestra el error
     * @param {HTMLElement} input - Campo de entrada
     * @param {HTMLElement} errorElement - Elemento de error
     * @param {Function} validator - Función validadora
     * @param {string} fieldName - Nombre del campo
     * @returns {boolean} True si es válido
     */
    static validateField(input, errorElement, validator, fieldName) {
      if (!input || !input.value.trim()) {
        return true; // Puede estar vacío si es la incógnita
      }

      try {
        validator(input.value, fieldName);
        clearError(errorElement);
        setInputValidation(input, true);
        return true;
      } catch (error) {
        showError(errorElement, error.message, 0);
        setInputValidation(input, false, error.message);
        return false;
      }
    }
  }

  // ============================================
  // CLASE: FormulaGenerator
  // Responsabilidad: Generar fórmulas matemáticas
  // ============================================
  class FormulaGenerator {
    /**
     * Genera la fórmula correspondiente a la variable desconocida
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
      const { I, i, n } = values;
      return `C = I / (i × n) = ${formatCurrency(I)} / (${formatPercentage(
        i * 100
      )} × ${formatNumberTrim(n, 2)})`;
    }

    static generateRateFormula(values) {
      const { I, C, n } = values;
      return `i = I / (C × n) = ${formatCurrency(I)} / (${formatCurrency(
        C
      )} × ${formatNumberTrim(n, 2)})`;
    }

    static generateTimeFormula(values) {
      const { I, C, i } = values;
      return `n = I / (C × i) = ${formatCurrency(I)} / (${formatCurrency(
        C
      )} × ${formatPercentage(i * 100)})`;
    }

    static generateInterestFormula(values) {
      const { C, i, n } = values;
      return `I = C × i × n = ${formatCurrency(C)} × ${formatPercentage(
        i * 100
      )} × ${formatNumberTrim(n, 2)}`;
    }

    static generateAmountFormula(values) {
      const { C, i, n } = values;
      return `M = C(1 + in) = ${formatCurrency(C)} × (1 + ${formatPercentage(
        i * 100
      )} × ${formatNumberTrim(n, 2)})`;
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

      Object.entries(groups).forEach(([variable, group]) => {
        if (group) {
          const isUnknown = variable === unknown;
          group.style.display = isUnknown ? "none" : "block";
          group.setAttribute("aria-hidden", isUnknown ? "true" : "false");

          // Limpiar input si es la incógnita
          if (isUnknown) {
            const input =
              ELEMENTS[
                `${
                  variable === "C"
                    ? "capital"
                    : variable === "i"
                    ? "rate"
                    : variable === "n"
                    ? "time"
                    : variable === "I"
                    ? "interest"
                    : "amount"
                }Input`
              ];
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
     */
    static showResult(unknown, result, formula) {
      const variableName = VARIABLE_LABELS[unknown];
      const formattedResult = this.formatResult(unknown, result);

      toggleElement(ELEMENTS.formulaSection, true);
      toggleElement(ELEMENTS.resultSection, true);

      setElementHTML(ELEMENTS.formulaDisplay, `<code>${formula}</code>`);

      setElementHTML(
        ELEMENTS.resultAlert,
        `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${variableName}:</strong>
            <span class="ms-2">${formattedResult}</span>
          </div>
          <i class="fas fa-check-circle fa-2x text-success"></i>
        </div>
        `
      );

      ELEMENTS.resultSection.classList.remove("d-none");
      ELEMENTS.resultSection.classList.add("fade-in");

      smoothScrollTo(ELEMENTS.resultSection, "center");
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
     * Limpia los mensajes de error
     */
    static clearErrors() {
      [
        ELEMENTS.capitalError,
        ELEMENTS.rateError,
        ELEMENTS.timeError,
        ELEMENTS.interestError,
        ELEMENTS.amountError,
      ].forEach((el) => clearError(el));
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
    UIController.clearErrors();
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
    UIController.clearErrors();

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
      const result = calculateVariable(state.unknown, validation.values);
      const formula = FormulaGenerator.generate(
        state.unknown,
        validation.values
      );

      state.result = result;
      state.formula = formula;

      UIController.showResult(state.unknown, result, formula);

      // Guardar en historial
      saveCalculationToHistory({
        type: "simple",
        variable: state.unknown,
        result: result,
        formula: formula,
        values: validation.values,
      });
    } catch (error) {
      showError(ELEMENTS.resultAlert, `Error en el cálculo: ${error.message}`);
    }
  }

  /**
   * Calcula la variable desconocida
   * @param {string} unknown - Variable a calcular
   * @param {Object} values - Valores conocidos
   * @returns {number} Resultado calculado
   */
  function calculateVariable(unknown, values) {
    const { C, i, n, I, M } = values;

    switch (unknown) {
      case "C":
        return I !== undefined
          ? SimpleInterestCalculator.calculateCapitalFromInterest(I, i, n)
          : SimpleInterestCalculator.calculateCapitalFromAmount(M, I);

      case "i":
        return SimpleInterestCalculator.calculateRate(I, C, n);

      case "n":
        return SimpleInterestCalculator.calculateTime(I, C, i);

      case "I":
        return SimpleInterestCalculator.calculateInterest(C, i, n);

      case "M":
        return SimpleInterestCalculator.calculateAmountComplete(C, i, n);

      default:
        throw new Error("Variable desconocida no válida");
    }
  }

  /**
   * Resetea el formulario
   */
  function resetForm() {
    ELEMENTS.form.reset();
    state.unknown = "";
    state.result = null;
    state.formula = "";

    UIController.clearErrors();
    UIController.hideResults();
    UIController.updateFormattedPreviews();
    UIController.updateSubmitButton(false);

    // Mostrar todos los grupos
    Object.values({
      C: ELEMENTS.capitalGroup,
      i: ELEMENTS.rateGroup,
      n: ELEMENTS.timeGroup,
      I: ELEMENTS.interestGroup,
      M: ELEMENTS.amountGroup,
    }).forEach((group) => {
      if (group) {
        group.style.display = "block";
        group.setAttribute("aria-hidden", "false");
      }
    });

    // Enfocar el selector de variable
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
    // Verificar que existan los elementos esenciales
    if (!ELEMENTS.unknownSelect || !ELEMENTS.form) {
      return;
    }

    // Event listeners principales
    ELEMENTS.unknownSelect.addEventListener("change", handleUnknownChange);
    ELEMENTS.resetBtn?.addEventListener("click", resetForm);
    ELEMENTS.form.addEventListener("submit", handleSubmit);

    // Event listeners para inputs
    const inputs = [
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

    // Event listener para cambio de unidad de tiempo
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
