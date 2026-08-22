/* ============================================
   Ledger & Line — Expense & Budget Visualizer
   Vanilla JS · Local Storage · Chart.js
   ============================================ */

(function () {
  "use strict";

  // ---------- Storage keys ----------
  const STORAGE_KEY = "ledgerline:transactions";
  const THEME_KEY = "ledgerline:theme";
  const LIMIT_KEY = "ledgerline:limit";
  const SORT_KEY = "ledgerline:sort";

  // ---------- Category colors (kept in sync with CSS tokens) ----------
  const CATEGORY_META = {
    Food: { light: "#6b8f71", dark: "#8fbf95", tagClass: "tx-tag--food" },
    Transport: { light: "#3e6e8e", dark: "#7fb3d5", tagClass: "tx-tag--transport" },
    Fun: { light: "#8e5572", dark: "#c08aa6", tagClass: "tx-tag--fun" },
  };
  const CATEGORY_ORDER = ["Food", "Transport", "Fun"];

  // ---------- DOM references ----------
  const form = document.getElementById("transaction-form");
  const nameInput = document.getElementById("item-name");
  const amountInput = document.getElementById("item-amount");
  const categorySelect = document.getElementById("item-category");

  const nameError = document.getElementById("item-name-error");
  const amountError = document.getElementById("item-amount-error");
  const categoryError = document.getElementById("item-category-error");

  const listEl = document.getElementById("transaction-list");
  const emptyStateEl = document.getElementById("empty-state");
  const balanceAmountEl = document.getElementById("balance-amount");
  const stampCardEl = document.querySelector(".stamp-card");

  const limitInput = document.getElementById("limit-input");
  const limitStatusEl = document.getElementById("limit-status");

  const sortSelect = document.getElementById("sort-select");

  const chartCanvas = document.getElementById("category-chart");
  const chartEmptyEl = document.getElementById("chart-empty");
  const chartLegendEl = document.getElementById("chart-legend");

  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeToggleLabel = themeToggleBtn.querySelector(".theme-toggle-label");

  // ---------- State ----------
  let transactions = loadTransactions();
  let sortMode = localStorage.getItem(SORT_KEY) || "date-desc";
  let chartInstance = null;

  // ============================================
  // Init
  // ============================================
  function init() {
    initTheme();

    sortSelect.value = sortMode;
    const savedLimit = localStorage.getItem(LIMIT_KEY);
    if (savedLimit !== null && savedLimit !== "") {
      limitInput.value = savedLimit;
    }

    form.addEventListener("submit", handleFormSubmit);
    sortSelect.addEventListener("change", handleSortChange);
    limitInput.addEventListener("input", handleLimitChange);
    themeToggleBtn.addEventListener("click", toggleTheme);

    renderAll();
  }

  // ============================================
  // Local storage helpers
  // ============================================
  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Could not read saved transactions:", err);
      return [];
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (err) {
      console.error("Could not save transactions:", err);
    }
  }

  // ============================================
  // Theme (dark / light mode toggle — optional challenge)
  // ============================================
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggleLabel.textContent = "Day ledger";
      themeToggleBtn.setAttribute("aria-pressed", "true");
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeToggleLabel.textContent = "Night ledger";
      themeToggleBtn.setAttribute("aria-pressed", "false");
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(isDark ? "light" : "dark");
    // Re-render chart so its colors match the new theme
    renderChart();
  }

  function isDarkTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  // ============================================
  // Form handling & validation
  // ============================================
  function handleFormSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const amountRaw = amountInput.value.trim();
    const amount = parseFloat(amountRaw);
    const category = categorySelect.value;

    let isValid = true;
    clearFieldErrors();

    if (!name) {
      setFieldError("item-name", nameError, "Please enter an item name.");
      isValid = false;
    }
    if (!amountRaw || isNaN(amount) || amount <= 0) {
      setFieldError("item-amount", amountError, "Enter an amount greater than 0.");
      isValid = false;
    }
    if (!category) {
      setFieldError("item-category", categoryError, "Please choose a category.");
      isValid = false;
    }

    if (!isValid) return;

    const transaction = {
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
      name,
      amount: Math.round(amount * 100) / 100,
      category,
      createdAt: Date.now(),
    };

    transactions.push(transaction);
    saveTransactions();
    form.reset();
    renderAll();
    nameInput.focus();
  }

  function setFieldError(fieldId, errorEl, message) {
    document.getElementById(fieldId).closest(".field")?.classList.add("has-error");
    errorEl.textContent = message;
  }

  function clearFieldErrors() {
    [nameError, amountError, categoryError].forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".field.has-error").forEach((el) => el.classList.remove("has-error"));
  }

  function handleDelete(id) {
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions();
    renderAll();
  }

  // ============================================
  // Sorting (optional challenge)
  // ============================================
  function handleSortChange() {
    sortMode = sortSelect.value;
    localStorage.setItem(SORT_KEY, sortMode);
    renderList();
  }

  function getSortedTransactions() {
    const list = [...transactions];
    switch (sortMode) {
      case "amount-desc":
        return list.sort((a, b) => b.amount - a.amount);
      case "amount-asc":
        return list.sort((a, b) => a.amount - b.amount);
      case "category":
        return list.sort((a, b) => a.category.localeCompare(b.category) || b.createdAt - a.createdAt);
      case "date-desc":
      default:
        return list.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  // ============================================
  // Spending limit (optional challenge)
  // ============================================
  function handleLimitChange() {
    const val = limitInput.value;
    if (val === "") {
      localStorage.removeItem(LIMIT_KEY);
    } else {
      localStorage.setItem(LIMIT_KEY, val);
    }
    renderBalance();
  }

  function getLimit() {
    const val = parseFloat(limitInput.value);
    return isNaN(val) || val <= 0 ? null : val;
  }

  // ============================================
  // Rendering
  // ============================================
  function renderAll() {
    renderBalance();
    renderList();
    renderChart();
  }

  function getTotal() {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  function renderBalance() {
    const total = getTotal();
    balanceAmountEl.textContent = formatCurrency(total);

    const limit = getLimit();
    if (limit === null) {
      limitStatusEl.textContent = "Set a limit to get an over-budget warning.";
      limitStatusEl.classList.remove("is-over");
      stampCardEl.classList.remove("is-over");
      return;
    }

    if (total > limit) {
      const over = total - limit;
      limitStatusEl.textContent = `Over budget by ${formatCurrency(over)}.`;
      limitStatusEl.classList.add("is-over");
      stampCardEl.classList.add("is-over");
    } else {
      const remaining = limit - total;
      limitStatusEl.textContent = `${formatCurrency(remaining)} left before you hit your limit.`;
      limitStatusEl.classList.remove("is-over");
      stampCardEl.classList.remove("is-over");
    }
  }

  function renderList() {
    listEl.innerHTML = "";

    if (transactions.length === 0) {
      emptyStateEl.classList.add("is-visible");
      return;
    }
    emptyStateEl.classList.remove("is-visible");

    const sorted = getSortedTransactions();

    sorted.forEach((t) => {
      const li = document.createElement("li");
      li.className = "transaction-row";
      li.dataset.id = t.id;

      const meta = CATEGORY_META[t.category] || CATEGORY_META.Food;

      li.innerHTML = `
        <div class="tx-main">
          <span class="tx-name"></span>
          <span class="tx-tag ${meta.tagClass}"></span>
        </div>
        <div class="tx-side">
          <span class="tx-amount"></span>
          <button type="button" class="tx-delete" aria-label="Delete transaction">&times;</button>
        </div>
      `;

      li.querySelector(".tx-name").textContent = t.name;
      li.querySelector(".tx-tag").textContent = t.category;
      li.querySelector(".tx-amount").textContent = formatCurrency(t.amount);
      li.querySelector(".tx-delete").addEventListener("click", () => handleDelete(t.id));

      listEl.appendChild(li);
    });
  }

  function getCategoryTotals() {
    const totals = { Food: 0, Transport: 0, Fun: 0 };
    transactions.forEach((t) => {
      if (totals[t.category] === undefined) totals[t.category] = 0;
      totals[t.category] += t.amount;
    });
    return totals;
  }

  function renderChart() {
    const totals = getCategoryTotals();
    const hasData = transactions.length > 0;

    chartEmptyEl.classList.toggle("is-visible", !hasData);
    chartCanvas.style.display = hasData ? "block" : "none";

    // Always rebuild the legend so it reflects current totals
    renderLegend(totals);

    if (!hasData) {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      return;
    }

    const dark = isDarkTheme();
    const labels = CATEGORY_ORDER.filter((cat) => totals[cat] > 0);
    const data = labels.map((cat) => totals[cat]);
    const colors = labels.map((cat) => (dark ? CATEGORY_META[cat].dark : CATEGORY_META[cat].light));
    const borderColor = dark ? "#1d2225" : "#ffffff";

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
            },
          },
        },
      },
    });
  }

  function renderLegend(totals) {
    chartLegendEl.innerHTML = "";
    const dark = isDarkTheme();

    CATEGORY_ORDER.forEach((cat) => {
      const amount = totals[cat] || 0;
      const color = dark ? CATEGORY_META[cat].dark : CATEGORY_META[cat].light;

      const li = document.createElement("li");
      li.innerHTML = `
        <span class="legend-label">
          <span class="legend-swatch" style="background:${color}"></span>
          <span>${cat}</span>
        </span>
        <span class="legend-amount"></span>
      `;
      li.querySelector(".legend-amount").textContent = formatCurrency(amount);
      chartLegendEl.appendChild(li);
    });
  }

  // ============================================
  // Utilities
  // ============================================
  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", init);
})();
