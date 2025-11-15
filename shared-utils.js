(function () {
  "use strict";

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

  window.saveCalculationToHistory = function (item) {
    const history = getHistory();
    history.unshift(item);
    if (history.length > 100) history.length = 100;
    setHistory(history);
    renderHistory();
  };

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
        const typeLabel =
          item.type === "simple"
            ? "Simple"
            : item.type === "compound"
            ? "Compuesto"
            : "Crédito";
        const resStr = formatHistoryResult(item.unknown, item.result);
        const dataStr = formatHistoryData(item);

        return `<tr>
                <td>${dateStr}</td>
                <td><span class="badge bg-secondary">${typeLabel}</span></td>
                <td>${item.unknown}</td>
                <td><small>${item.formula || ""}</small></td>
                <td><strong>${resStr}</strong></td>
                <td><small>${dataStr}</small></td>
            </tr>`;
      })
      .join("");
  }

  function formatHistoryResult(variable, value) {
    if (value === null || value === undefined) return "-";
    switch (variable) {
      case "i":
        return `${(value * 100).toFixed(2)}%`;
      case "n":
        return `${value.toFixed(2)} años`;
      case "C":
      case "I":
      case "M":
        return `$${value.toFixed(2)}`;
      default:
        return value.toFixed(2);
    }
  }

  function formatHistoryData(item) {
    if (item.values && item.values.input) {
      const inp = item.values.input;
      const base = `C:${inp.C ?? "-"}, i:${inp.iPct ?? "-"}%, n:${
        inp.nInput ?? "-"
      } ${inp.nUnit ?? ""}, I:${inp.I ?? "-"}, M:${inp.M ?? "-"}`;
      return base;
    }
    return "-";
  }

  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener("click", () => {
      const history = getHistory();
      if (!history.length) return;

      const rows = [
        ["fecha_hora", "tipo", "incognita", "formula", "resultado", "datos"],
      ];

      history.forEach((h) => {
        rows.push([
          h.ts,
          h.type || "simple",
          h.unknown,
          (h.formula || "").replace(/,/g, ";"),
          h.result,
          formatHistoryData(h).replace(/,/g, ";"),
        ]);
      });

      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "historial_calculadoras.csv";
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

  renderHistory();

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
        try {
          const pane = document.querySelector(target);
          const iframe = pane ? pane.querySelector("iframe") : null;
          if (iframe) autoResizeIframe(iframe);
        } catch {}
      });
    });

  function autoResizeIframe(iframe) {
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
      iframe.style.height = Math.max(400, height + 16) + "px";
    } catch {}
  }

  function setupIframeResizer() {
    const selector =
      "#tab-calculadora iframe, #tab-formulas iframe, #tab-historial iframe";
    const iframes = document.querySelectorAll(selector);
    iframes.forEach((iframe) => {
      iframe.addEventListener("load", () => {
        autoResizeIframe(iframe);
        setTimeout(() => autoResizeIframe(iframe), 50);
        setTimeout(() => autoResizeIframe(iframe), 250);
        setTimeout(() => autoResizeIframe(iframe), 1000);
      });
    });

    window.addEventListener("resize", () => {
      const activePane = document.querySelector(".tab-pane.active");
      const iframe = activePane ? activePane.querySelector("iframe") : null;
      if (iframe) autoResizeIframe(iframe);
    });
  }

  if (document.getElementById("mainTabsContent")) {
    setupIframeResizer();
    const activePane = document.querySelector(".tab-pane.active");
    const iframe = activePane ? activePane.querySelector("iframe") : null;
    if (iframe) {
      setTimeout(() => autoResizeIframe(iframe), 60);
    }
  }
})();
