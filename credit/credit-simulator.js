/**
 * SIMULADOR DE CRÉDITO BANCARIO
 * Soporta Tabla Francesa y Tabla Alemana
 * Refactorizado con utilidades compartidas y clean code
 */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ============================================
  // REFERENCIAS AL DOM
  // ============================================
  const form = document.getElementById("creditForm");
  const resultsSection = document.getElementById("resultsSection");
  const errorAlert = document.getElementById("errorAlert");
  const clearBtn = document.getElementById("clearBtn");

  // ============================================
  // EVENT LISTENERS
  // ============================================
  form.addEventListener("submit", handleSubmit);
  if (clearBtn) {
    clearBtn.addEventListener("click", clearForm);
  }

  // ============================================
  // FUNCIONES PRINCIPALES
  // ============================================

  /**
   * Maneja el submit del formulario
   */
  function handleSubmit(e) {
    e.preventDefault();
    calculateCredit();
  }

  /**
   * Función principal de cálculo
   */
  function calculateCredit() {
    // Ocultar resultados y errores previos
    toggleElement(resultsSection, false);
    hideError();

    // Obtener y validar valores
    const inputs = getFormInputs();
    const validation = validateInputs(inputs);

    if (!validation.isValid) {
      showError(validation.message);
      return;
    }

    // Calcular según el tipo de tabla
    const amortizationData =
      inputs.tableType === "french"
        ? calculateFrenchTable(inputs)
        : calculateGermanTable(inputs);

    // Mostrar resultados
    displayResults(amortizationData, inputs.tableType);
  }

  /**
   * Limpia el formulario y reinicia el estado
   */
  function clearForm() {
    if (form) form.reset();

    hideError();
    toggleElement(resultsSection, false);

    // Vaciar tabla
    const tbody = document.getElementById("amortizationTableBody");
    if (tbody) tbody.innerHTML = "";

    // Reiniciar resumen usando utilidad compartida
    const zero = formatCurrency(0);
    setElementText("summaryAmount", zero);
    setElementText("summaryInterests", zero);
    setElementText("summaryTotal", zero);
    setElementText("summaryPayments", "0");
    setElementText("tableTypeTitle", "");

    // Enfocar primer campo
    const firstField = document.getElementById("creditAmount");
    if (firstField) firstField.focus();
  }

  // ============================================
  // OBTENCIÓN Y VALIDACIÓN DE DATOS
  // ============================================

  /**
   * Obtiene los valores del formulario
   * @returns {Object} Objeto con todos los inputs
   */
  function getFormInputs() {
    return {
      creditAmount: parseFloat(document.getElementById("creditAmount").value),
      interestRate: parseFloat(document.getElementById("interestRate").value),
      timeYears: parseFloat(document.getElementById("timeYears").value),
      paymentsPerYear: parseInt(
        document.getElementById("paymentsPerYear").value
      ),
      tableType: document.querySelector('input[name="tableType"]:checked')
        .value,
    };
  }

  /**
   * Valida las entradas del usuario usando utilidad compartida
   * @param {Object} inputs - Inputs del formulario
   * @returns {Object} {isValid, message}
   */
  function validateInputs(inputs) {
    const { creditAmount, interestRate, timeYears, paymentsPerYear } = inputs;

    if (!isPositiveNumber(creditAmount)) {
      return {
        isValid: false,
        message: "Por favor, ingresa un monto de crédito válido y positivo.",
      };
    }

    if (!isPositiveNumber(interestRate)) {
      return {
        isValid: false,
        message: "Por favor, ingresa una tasa de interés válida y positiva.",
      };
    }

    if (!isPositiveNumber(timeYears)) {
      return {
        isValid: false,
        message: "Por favor, ingresa un tiempo válido y positivo.",
      };
    }

    if (!isPositiveNumber(paymentsPerYear)) {
      return {
        isValid: false,
        message: "Por favor, selecciona un número de pagos por año válido.",
      };
    }

    return { isValid: true };
  }

  // ============================================
  // CÁLCULOS DE AMORTIZACIÓN
  // ============================================

  /**
   * Calcula tabla francesa (cuotas constantes)
   * Fórmula: A = C * [i(1+i)^n] / [(1+i)^n - 1]
   * @param {Object} inputs - Datos del crédito
   * @returns {Object} Datos de amortización
   */
  function calculateFrenchTable(inputs) {
    const {
      creditAmount: C,
      interestRate,
      timeYears,
      paymentsPerYear: m,
    } = inputs;
    const n = timeYears * m; // Número total de pagos
    const i = interestRate / 100 / m; // Tasa por período

    // Calcular cuota usando fórmula francesa
    const numerator = i * Math.pow(1 + i, n);
    const denominator = Math.pow(1 + i, n) - 1;
    const payment = C * (numerator / denominator);

    // Construir tabla de amortización
    const table = buildAmortizationTable(C, n, i, payment, "french");

    return {
      table,
      totalPayments: n,
      totalInterest: table.reduce((sum, row) => sum + row.interest, 0),
      totalPaid: roundMoney(payment * n),
      creditAmount: C,
    };
  }

  /**
   * Calcula tabla alemana (capital constante)
   * @param {Object} inputs - Datos del crédito
   * @returns {Object} Datos de amortización
   */
  function calculateGermanTable(inputs) {
    const {
      creditAmount: C,
      interestRate,
      timeYears,
      paymentsPerYear: m,
    } = inputs;
    const n = timeYears * m; // Número total de pagos
    const i = interestRate / 100 / m; // Tasa por período
    const capitalPerPayment = C / n; // Capital constante por cuota

    // Construir tabla de amortización
    const table = buildAmortizationTable(
      C,
      n,
      i,
      null,
      "german",
      capitalPerPayment
    );

    return {
      table,
      totalPayments: n,
      totalInterest: table.reduce((sum, row) => sum + row.interest, 0),
      totalPaid: table.reduce((sum, row) => sum + row.payment, 0),
      creditAmount: C,
    };
  }

  /**
   * Construye la tabla de amortización según el tipo
   * @param {number} capital - Capital inicial
   * @param {number} periods - Número de períodos
   * @param {number} rate - Tasa por período
   * @param {number} fixedPayment - Cuota fija (para francesa)
   * @param {string} type - 'french' o 'german'
   * @param {number} fixedCapital - Capital fijo (para alemana)
   * @returns {Array} Tabla de amortización
   */
  function buildAmortizationTable(
    capital,
    periods,
    rate,
    fixedPayment = null,
    type = "french",
    fixedCapital = null
  ) {
    const table = [];
    let balance = capital;

    for (let period = 1; period <= periods; period++) {
      const interest = roundMoney(balance * rate);
      let capitalPayment, payment;

      if (type === "french") {
        capitalPayment = roundMoney(fixedPayment - interest);
        payment = fixedPayment;
      } else {
        // german
        capitalPayment = fixedCapital;
        payment = roundMoney(fixedCapital + interest);
      }

      balance = roundMoney(balance - capitalPayment);

      // Evitar saldos negativos por errores de redondeo
      if (balance < 0.01) balance = 0;

      table.push({
        period,
        payment: roundMoney(payment),
        capital: roundMoney(capitalPayment),
        interest,
        balance,
      });
    }

    return table;
  }

  // ============================================
  // VISUALIZACIÓN DE RESULTADOS
  // ============================================

  /**
   * Muestra los resultados en la interfaz
   * @param {Object} data - Datos de amortización
   * @param {string} tableType - Tipo de tabla
   */
  function displayResults(data, tableType) {
    // Actualizar resumen usando utilidades compartidas
    setElementText("summaryAmount", formatCurrency(data.creditAmount));
    setElementText("summaryInterests", formatCurrency(data.totalInterest));
    setElementText("summaryTotal", formatCurrency(data.totalPaid));
    setElementText("summaryPayments", String(data.totalPayments));

    // Actualizar título de la tabla
    const tableTitle = tableType === "french" ? "Francesa" : "Alemana";
    setElementText("tableTypeTitle", `(${tableTitle})`);

    // Llenar tabla de amortización
    renderAmortizationTable(data.table);

    // Mostrar sección de resultados y hacer scroll
    toggleElement(resultsSection, true);
    smoothScrollTo(resultsSection, "start");
  }

  /**
   * Renderiza la tabla de amortización
   * @param {Array} table - Datos de la tabla
   */
  function renderAmortizationTable(table) {
    const tbody = document.getElementById("amortizationTableBody");
    if (!tbody) return;

    tbody.innerHTML = table
      .map(
        (row) => `
      <tr>
        <td>${row.period}</td>
        <td>${formatCurrency(row.payment)}</td>
        <td>${formatCurrency(row.capital)}</td>
        <td>${formatCurrency(row.interest)}</td>
        <td>${formatCurrency(row.balance)}</td>
      </tr>
    `
      )
      .join("");
  }

  // ============================================
  // MANEJO DE ERRORES
  // ============================================

  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje a mostrar
   */
  function showError(message) {
    setElementText("errorMessage", message);
    errorAlert.style.display = "block";
    errorAlert.classList.add("show");
    smoothScrollTo(errorAlert, "center");
  }

  /**
   * Oculta el mensaje de error
   */
  function hideError() {
    errorAlert.style.display = "none";
    errorAlert.classList.remove("show");
  }
});
