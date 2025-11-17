/**
 * SHARED UTILITIES - Interest Calculator
 * Módulo centralizado de utilidades compartidas
 * Implementa SOLID, DRY, Clean Code y mejores prácticas
 * @version 2.0.0
 */

(function () {
  "use strict";

  // ============================================
  // CONSTANTES Y CONFIGURACIÓN
  // ============================================
  const CONFIG = {
    STORAGE_KEY: "ic_history",
    MAX_HISTORY_ITEMS: 100,
    LOCALE: "es-EC",
    CURRENCY: "USD",
    ERROR_TIMEOUT: 5000,
    DEBOUNCE_DELAY: 300,
  };

  // ============================================
  // UTILIDADES DE VALIDACIÓN
  // ============================================

  /**
   * Valida y parsea un número positivo
   * @param {*} value - Valor a validar
   * @param {string} fieldName - Nombre del campo (para mensajes de error)
   * @returns {number} Número parseado
   * @throws {Error} Si el valor no es válido
   */
  window.validatePositiveNumber = function (value, fieldName = "Valor") {
    const num = parseFloat(value);

    if (isNaN(num)) {
      throw new Error(`${fieldName} debe ser un número válido`);
    }

    if (!isFinite(num)) {
      throw new Error(`${fieldName} debe ser un número finito`);
    }

    if (num <= 0) {
      throw new Error(`${fieldName} debe ser mayor que cero`);
    }

    return num;
  };

  /**
   * Valida y parsea un número no negativo
   * @param {*} value - Valor a validar
   * @param {string} fieldName - Nombre del campo
   * @returns {number} Número parseado
   * @throws {Error} Si el valor no es válido
   */
  window.validateNonNegativeNumber = function (value, fieldName = "Valor") {
    const num = parseFloat(value);

    if (isNaN(num)) {
      throw new Error(`${fieldName} debe ser un número válido`);
    }

    if (!isFinite(num)) {
      throw new Error(`${fieldName} debe ser un número finito`);
    }

    if (num < 0) {
      throw new Error(`${fieldName} no puede ser negativo`);
    }

    return num;
  };

  /**
   * Valida que un porcentaje esté en rango válido
   * @param {*} value - Valor a validar
   * @param {string} fieldName - Nombre del campo
   * @param {number} max - Valor máximo permitido (default: 100)
   * @returns {number} Porcentaje parseado
   * @throws {Error} Si el valor no es válido
   */
  window.validatePercentage = function (
    value,
    fieldName = "Porcentaje",
    max = 100
  ) {
    const num = validatePositiveNumber(value, fieldName);

    if (num > max) {
      throw new Error(`${fieldName} no puede exceder ${max}%`);
    }

    return num;
  };

  /**
   * Valida un entero positivo
   * @param {*} value - Valor a validar
   * @param {string} fieldName - Nombre del campo
   * @returns {number} Entero parseado
   * @throws {Error} Si el valor no es válido
   */
  window.validatePositiveInteger = function (value, fieldName = "Valor") {
    const num = validatePositiveNumber(value, fieldName);

    if (!Number.isInteger(num)) {
      throw new Error(`${fieldName} debe ser un número entero`);
    }

    return num;
  };

  /**
   * Verifica si un valor es un número positivo (sin lanzar error)
   * @param {*} value - Valor a verificar
   * @returns {boolean} True si es válido
   */
  window.isPositiveNumber = function (value) {
    const num = parseFloat(value);
    return isFinite(num) && num > 0;
  };

  /**
   * Verifica si un valor es un número no negativo (sin lanzar error)
   * @param {*} value - Valor a verificar
   * @returns {boolean} True si es válido
   */
  window.isNonNegativeNumber = function (value) {
    const num = parseFloat(value);
    return isFinite(num) && num >= 0;
  };

  // ============================================
  // UTILIDADES DE FORMATO
  // ============================================

  /**
   * Formatea un número como moneda
   * @param {number} value - Valor a formatear
   * @param {string} locale - Locale (default: es-EC)
   * @param {string} currency - Moneda (default: USD)
   * @returns {string} Valor formateado
   */
  window.formatCurrency = function (
    value,
    locale = CONFIG.LOCALE,
    currency = CONFIG.CURRENCY
  ) {
    if (!Number.isFinite(value)) return "—";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      return `$${value.toFixed(2)}`;
    }
  };

  /**
   * Formatea un número como porcentaje
   * @param {number} value - Valor a formatear (5 = 5%, 0.05 se asume decimal)
   * @param {number} decimals - Decimales a mostrar
   * @param {boolean} isDecimal - Si el valor ya está como decimal (0.05 = 5%)
   * @returns {string} Valor formateado
   */
  window.formatPercentage = function (value, decimals = 2, isDecimal = false) {
    if (!Number.isFinite(value)) return "—";

    const displayValue = isDecimal ? value * 100 : value;
    return `${displayValue.toFixed(decimals)}%`;
  };

  /**
   * Formatea un número eliminando ceros innecesarios
   * @param {number} value - Valor a formatear
   * @param {number} maxDecimals - Máximo de decimales
   * @returns {string} Valor formateado
   */
  window.formatNumberTrim = function (value, maxDecimals = 4) {
    if (!Number.isFinite(value)) return String(value);

    const fixed = Number(value).toFixed(maxDecimals);
    return fixed.replace(/\.0+$/, "").replace(/(\.[0-9]*[1-9])0+$/, "$1");
  };

  /**
   * Redondea un valor monetario a 2 decimales
   * Evita errores de punto flotante
   * @param {number} value - Valor a redondear
   * @returns {number} Valor redondeado
   */
  window.roundMoney = function (value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  };

  /**
   * Redondea un valor a N decimales
   * @param {number} value - Valor a redondear
   * @param {number} decimals - Número de decimales
   * @returns {number} Valor redondeado
   */
  window.roundToDecimals = function (value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  };

  // ============================================
  // UTILIDADES DE CONVERSIÓN DE TIEMPO
  // ============================================

  /**
   * Convierte tiempo a años según la unidad
   * @param {number} value - Valor del tiempo
   * @param {string} unit - Unidad (years, months, days)
   * @returns {number} Tiempo en años
   * @throws {Error} Si el valor o unidad no son válidos
   */
  window.convertToYears = function (value, unit = "years") {
    const num = validateNonNegativeNumber(value, "Tiempo");

    const conversions = {
      years: 1,
      months: 1 / 12,
      days: 1 / 365,
    };

    if (!(unit in conversions)) {
      throw new Error(
        `Unidad de tiempo no válida: ${unit}. Use: years, months, days`
      );
    }

    return num * conversions[unit];
  };

  /**
   * Formatea años con su unidad original
   * @param {number} years - Años
   * @param {string} originalUnit - Unidad original
   * @param {number} originalValue - Valor original
   * @returns {Object} {displayValue, unit, isExact}
   */
  window.formatTimeDisplay = function (
    years,
    originalUnit = "years",
    originalValue = null
  ) {
    if (!Number.isFinite(years)) {
      return { displayValue: "0", unit: "años", isExact: false };
    }

    let displayValue = formatNumberTrim(years, 2);
    let unit = "años";
    let isExact = Math.abs(years - Math.round(years)) < 1e-9;

    if (originalUnit === "months" && originalValue !== null) {
      isExact = Number.isInteger(originalValue) && originalValue % 12 === 0;
    } else if (originalUnit === "days" && originalValue !== null) {
      isExact = Number.isInteger(originalValue) && originalValue % 365 === 0;
    }

    return { displayValue, unit, isExact };
  };

  // ============================================
  // UTILIDADES DE DOM Y UI
  // ============================================

  /**
   * Obtiene un elemento del DOM de forma segura
   * @param {string|HTMLElement} selector - Selector CSS, ID o elemento
   * @returns {HTMLElement|null} Elemento encontrado o null
   */
  function getElement(selector) {
    if (selector instanceof HTMLElement) {
      return selector;
    }
    if (typeof selector === "string") {
      // Si no empieza con #, ., [, o :, asumimos que es un ID
      if (!/^[#.\[:>~+\s]/.test(selector)) {
        return document.getElementById(selector);
      }
      return document.querySelector(selector);
    }
    return null;
  }

  /**
   * Muestra/oculta un elemento del DOM
   * @param {string|HTMLElement} selector - Selector o elemento
   * @param {boolean} show - True para mostrar, false para ocultar
   */
  window.toggleElement = function (selector, show) {
    const el = getElement(selector);
    if (el) {
      el.style.display = show ? "block" : "none";
      el.setAttribute("aria-hidden", show ? "false" : "true");
    }
  };

  /**
   * Establece el texto de un elemento
   * @param {string|HTMLElement} selector - Selector o elemento
   * @param {string} text - Texto a establecer
   */
  window.setElementText = function (selector, text) {
    const el = getElement(selector);
    if (el) {
      el.textContent = text;
    }
  };

  /**
   * Establece el HTML de un elemento de forma segura
   * @param {string|HTMLElement} selector - Selector o elemento
   * @param {string} html - HTML a establecer
   */
  window.setElementHTML = function (selector, html) {
    const el = getElement(selector);
    if (el) {
      el.innerHTML = html;
    }
  };

  /**
   * Hace scroll suave a un elemento
   * @param {string|HTMLElement} selector - Selector o elemento
   * @param {string} block - Posición (start, center, end, nearest)
   */
  window.smoothScrollTo = function (selector, block = "start") {
    const el = getElement(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block, inline: "nearest" });
    }
  };

  /**
   * Muestra un mensaje de error en un elemento
   * @param {string|HTMLElement} selector - Selector o elemento
   * @param {string} message - Mensaje de error
   * @param {number} timeout - Tiempo en ms para auto-ocultar (0 = no auto-ocultar)
   */
  window.showError = function (
    selector,
    message,
    timeout = CONFIG.ERROR_TIMEOUT
  ) {
    const el = getElement(selector);
    if (!el) return;

    el.textContent = message;
    el.classList.add("error-message", "show");
    el.setAttribute("role", "alert");
    el.setAttribute("aria-live", "assertive");
    toggleElement(el, true);

    if (timeout > 0) {
      setTimeout(() => {
        clearError(selector);
      }, timeout);
    }
  };

  /**
   * Limpia un mensaje de error
   * @param {string|HTMLElement} selector - Selector o elemento
   */
  window.clearError = function (selector) {
    const el = getElement(selector);
    if (!el) return;

    el.textContent = "";
    el.classList.remove("error-message", "show");
    el.removeAttribute("role");
    el.removeAttribute("aria-live");
    toggleElement(el, false);
  };

  /**
   * Añade/remueve clase de validación en un input
   * @param {HTMLElement} input - Campo de entrada
   * @param {boolean} isValid - Si es válido o no
   * @param {string} message - Mensaje de error (opcional)
   */
  window.setInputValidation = function (input, isValid, message = "") {
    if (!input) return;

    if (isValid) {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      input.setCustomValidity("");
    } else {
      input.classList.remove("is-valid");
      input.classList.add("is-invalid");
      input.setCustomValidity(message);
    }

    const feedbackEl = input.nextElementSibling;
    if (feedbackEl && feedbackEl.classList.contains("invalid-feedback")) {
      feedbackEl.textContent = message;
    }
  };

  /**
   * Limpia la validación de un input
   * @param {HTMLElement} input - Campo de entrada
   */
  window.clearInputValidation = function (input) {
    if (!input) return;

    input.classList.remove("is-valid", "is-invalid");
    input.setCustomValidity("");

    const feedbackEl = input.nextElementSibling;
    if (feedbackEl && feedbackEl.classList.contains("invalid-feedback")) {
      feedbackEl.textContent = "";
    }
  };

  // ============================================
  // UTILIDADES DE PERFORMANCE
  // ============================================

  /**
   * Crea una función debounced
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} Función debounced
   */
  window.debounce = function (func, wait = CONFIG.DEBOUNCE_DELAY) {
    let timeout;

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * Crea una función throttled
   * @param {Function} func - Función a ejecutar
   * @param {number} limit - Límite de tiempo en ms
   * @returns {Function} Función throttled
   */
  window.throttle = function (func, limit = CONFIG.DEBOUNCE_DELAY) {
    let inThrottle;

    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  // ============================================
  // GESTIÓN DE HISTORIAL
  // ============================================

  function getHistory() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function setHistory(arr) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // Silently fail on localStorage errors
    }
  }

  /**
   * Guarda un cálculo en el historial
   * @param {Object} item - Item a guardar
   */
  window.saveCalculationToHistory = function (item) {
    const history = getHistory();
    history.unshift({
      ...item,
      timestamp: item.timestamp || Date.now(),
      id:
        item.id ||
        `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    if (history.length > CONFIG.MAX_HISTORY_ITEMS) {
      history.length = CONFIG.MAX_HISTORY_ITEMS;
    }

    setHistory(history);
    if (typeof renderHistory === "function") {
      renderHistory();
    }
  };

  /**
   * Limpia el historial completo
   */
  window.clearHistory = function () {
    setHistory([]);
    if (typeof renderHistory === "function") {
      renderHistory();
    }
  };

  /**
   * Obtiene el historial
   * @returns {Array} Array de cálculos
   */
  window.getCalculationHistory = function () {
    return getHistory();
  };

  /**
   * Exporta el historial a CSV
   */
  window.exportHistoryToCSV = function () {
    const history = getHistory();

    if (!history.length) {
      alert("No hay historial para exportar");
      return;
    }

    const headers = ["ID", "Fecha", "Tipo", "Variable", "Resultado", "Datos"];
    const rows = [headers];

    history.forEach((item) => {
      const date = new Date(item.timestamp);
      const dateStr = date.toLocaleString(CONFIG.LOCALE);
      const typeStr = item.type || "simple";
      const resultStr = item.result || "—";
      const dataStr = JSON.stringify(item.values || {}).replace(/"/g, '""');

      rows.push([
        item.id,
        dateStr,
        typeStr,
        item.variable || "—",
        resultStr,
        dataStr,
      ]);
    });

    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `historial_calculadoras_${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // ============================================
  // RENDERIZADO DE HISTORIAL (UI)
  // ============================================

  function formatHistoryResult(variable, value) {
    if (value === null || value === undefined) return "—";

    switch (variable) {
      case "i":
      case "rate":
        return formatPercentage(value);
      case "n":
      case "time":
        return `${formatNumberTrim(value, 2)} años`;
      case "C":
      case "P":
      case "principal":
      case "I":
      case "interest":
      case "M":
      case "amount":
        return formatCurrency(value);
      default:
        return formatNumberTrim(value, 2);
    }
  }

  function renderHistory() {
    const history = getHistory();
    const historyTableBody = document.querySelector("#historyTable tbody");
    const historyCard = document.getElementById("historyCard");

    if (!historyTableBody || !historyCard) return;

    historyCard.style.display = history.length ? "block" : "none";

    if (!history.length) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            <i class="fas fa-inbox fa-2x mb-2"></i>
            <p>No hay cálculos en el historial</p>
          </td>
        </tr>
      `;
      return;
    }

    historyTableBody.innerHTML = history
      .map((item) => {
        const date = new Date(item.timestamp);
        const dateStr = date.toLocaleString(CONFIG.LOCALE);

        const typeLabels = {
          simple: "Simple",
          compound: "Compuesto",
          credit: "Crédito",
        };
        const typeLabel = typeLabels[item.type] || "Desconocido";

        const resultStr = formatHistoryResult(item.variable, item.result);

        return `
          <tr>
            <td><small>${dateStr}</small></td>
            <td><span class="badge bg-primary">${typeLabel}</span></td>
            <td><code>${item.variable || "—"}</code></td>
            <td><small class="text-muted">${item.formula || "—"}</small></td>
            <td><strong>${resultStr}</strong></td>
            <td><small class="text-muted">${item.id}</small></td>
          </tr>
        `;
      })
      .join("");
  }

  // ============================================
  // GESTIÓN DE TABS Y UI PRINCIPAL
  // ============================================

  const titleByTab = {
    "#tab-calculadora": "Calculadora de Interés Simple",
    "#tab-formulas": "Calculadora de Interés Compuesto",
    "#tab-historial": "Simulador de Crédito Bancario",
  };

  function setupTabManagement() {
    const mainTitleEl = document.getElementById("mainTitle");
    const tabButtons = document.querySelectorAll(
      '#mainTabs button[data-bs-toggle="tab"]'
    );

    tabButtons.forEach((btn) => {
      btn.addEventListener("shown.bs.tab", (e) => {
        const target = e.target.getAttribute("data-bs-target");

        if (mainTitleEl && titleByTab[target]) {
          mainTitleEl.innerHTML = `<i class="fas fa-calculator me-2"></i>${titleByTab[target]}`;
        }

        try {
          const pane = document.querySelector(target);
          const iframe = pane ? pane.querySelector("iframe") : null;
          if (iframe) autoResizeIframe(iframe);
        } catch (error) {
          // Silently handle iframe errors
        }
      });
    });
  }

  // ============================================
  // GESTIÓN DE IFRAMES
  // ============================================

  function autoResizeIframe(iframe) {
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const body = doc.body;
      const html = doc.documentElement;

      const height = Math.max(
        body?.scrollHeight || 0,
        body?.offsetHeight || 0,
        html?.clientHeight || 0,
        html?.scrollHeight || 0,
        html?.offsetHeight || 0
      );

      iframe.style.height = Math.max(400, height + 20) + "px";
    } catch (error) {
      // Cross-origin iframes will fail silently
    }
  }

  function setupIframeResizer() {
    const iframes = document.querySelectorAll(
      "#tab-calculadora iframe, #tab-formulas iframe, #tab-historial iframe"
    );

    iframes.forEach((iframe) => {
      iframe.addEventListener("load", () => {
        autoResizeIframe(iframe);

        // Múltiples intentos para asegurar resize correcto
        [50, 250, 500, 1000].forEach((delay) => {
          setTimeout(() => autoResizeIframe(iframe), delay);
        });
      });
    });

    // Resize al cambiar tamaño de ventana
    const debouncedResize = debounce(() => {
      const activePane = document.querySelector(".tab-pane.active");
      const iframe = activePane?.querySelector("iframe");
      if (iframe) autoResizeIframe(iframe);
    }, 200);

    window.addEventListener("resize", debouncedResize);
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  function initialize() {
    // Event listeners para botones de historial
    const exportBtn = document.getElementById("exportHistoryBtn");
    const clearBtn = document.getElementById("clearHistoryBtn");

    if (exportBtn) {
      exportBtn.addEventListener("click", exportHistoryToCSV);
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (
          confirm(
            "¿Estás seguro de que deseas eliminar todo el historial? Esta acción no se puede deshacer."
          )
        ) {
          clearHistory();
        }
      });
    }

    // Renderizar historial inicial
    renderHistory();

    // Setup de tabs y iframes si estamos en la página principal
    if (document.getElementById("mainTabsContent")) {
      setupTabManagement();
      setupIframeResizer();

      // Resize inicial del iframe activo
      const activePane = document.querySelector(".tab-pane.active");
      const iframe = activePane?.querySelector("iframe");
      if (iframe) {
        setTimeout(() => autoResizeIframe(iframe), 100);
      }
    }
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Exponer configuración para debugging (solo en desarrollo)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    window.IC_CONFIG = CONFIG;
  }
})();
