const SUPABASE_URL = "https://wivxsdwbimfhttpoikpu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RTCeRrOEQU6nLLQdR_HDMA_0o2UtP3G";
const SESSION_KEY = "adega_auth_token";
const SIDEBAR_STATE_KEY = "adega_sidebar_collapsed";
const EXPIRY_ALERT_DAYS = 30;

const ROLE_LABELS = {
  admin: "Admin",
  manager: "Gerente",
  attendant: "Atendente",
};

const ROLE_PERMISSIONS = {
  admin: {
    views: ["overview", "sales", "products", "suppliers", "movements", "reports", "users"],
    productWrite: true,
    supplierManage: true,
    movementWrite: true,
    cashOpen: true,
    cashManage: true,
    saleWrite: true,
    reportExport: true,
    reportSupabase: true,
    userManage: true,
  },
  manager: {
    views: ["overview", "sales", "products", "suppliers", "movements", "reports"],
    productWrite: true,
    supplierManage: true,
    movementWrite: true,
    cashOpen: true,
    cashManage: true,
    saleWrite: true,
    reportExport: true,
    reportSupabase: false,
    userManage: false,
  },
  attendant: {
    views: ["overview", "sales", "reports"],
    productWrite: false,
    supplierManage: false,
    movementWrite: false,
    cashOpen: true,
    cashManage: false,
    saleWrite: true,
    reportExport: true,
    reportSupabase: false,
    userManage: false,
  },
};

const state = {
  isRegisterMode: false,
  currentView: "overview",
  token: localStorage.getItem(SESSION_KEY) || "",
  sidebarCollapsed: localStorage.getItem(SIDEBAR_STATE_KEY) === "1",
  sidebarOpen: false,
  currentUser: null,
  dashboard: null,
  reports: null,
  cash: { current: null, history: [] },
  products: [],
  suppliers: [],
  purchaseInvoices: [],
  supplierReturns: [],
  movements: [],
  sales: [],
  users: [],
  saleCart: [],
  invoiceItems: [],
  supplierReturnItems: [],
  filters: {
    search: "",
    supplierId: "",
    status: "todos",
    supplierSearch: "",
    userSearch: "",
  },
  reportFilters: {
    startDate: "",
    endDate: "",
    paymentMethod: "",
    saleChannel: "",
  },
};

const elements = {
  authPanel: document.querySelector("#authPanel"),
  dashboard: document.querySelector("#dashboard"),
  sidebar: document.querySelector(".sidebar"),
  sidebarToggleBtn: document.querySelector("#sidebarToggleBtn"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
  authTitle: document.querySelector("#authTitle"),
  authSubtitle: document.querySelector("#authSubtitle"),
  authForm: document.querySelector("#authForm"),
  authSubmit: document.querySelector("#authSubmit"),
  authToggle: document.querySelector("#authToggle"),
  authFeedback: document.querySelector("#authFeedback"),
  nameField: document.querySelector("#nameField"),
  nameInput: document.querySelector("#nameInput"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  currentUserName: document.querySelector("#currentUserName"),
  currentUserRole: document.querySelector("#currentUserRole"),
  heroDescription: document.querySelector("#heroDescription"),
  navLinks: document.querySelectorAll(".nav-link"),
  suppliersNavBtn: document.querySelector("#suppliersNavBtn"),
  usersNavBtn: document.querySelector("#usersNavBtn"),
  views: {
    overview: document.querySelector("#overviewView"),
    sales: document.querySelector("#salesView"),
    products: document.querySelector("#productsView"),
    suppliers: document.querySelector("#suppliersView"),
    movements: document.querySelector("#movementsView"),
    reports: document.querySelector("#reportsView"),
    users: document.querySelector("#usersView"),
  },
  statsGrid: document.querySelector("#statsGrid"),
  lowStockList: document.querySelector("#lowStockList"),
  expiryAlertList: document.querySelector("#expiryAlertList"),
  recentMovements: document.querySelector("#recentMovements"),
  searchInput: document.querySelector("#searchInput"),
  productSupplierFilter: document.querySelector("#productSupplierFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  productsTableBody: document.querySelector("#productsTableBody"),
  productForm: document.querySelector("#productForm"),
  productIdInput: document.querySelector("#productIdInput"),
  productNameInput: document.querySelector("#productNameInput"),
  productCategoryInput: document.querySelector("#productCategoryInput"),
  productBrandInput: document.querySelector("#productBrandInput"),
  productSupplierInput: document.querySelector("#productSupplierInput"),
  productPriceInput: document.querySelector("#productPriceInput"),
  productCostInput: document.querySelector("#productCostInput"),
  productQuantityInput: document.querySelector("#productQuantityInput"),
  productMinimumInput: document.querySelector("#productMinimumInput"),
  productExpiryInput: document.querySelector("#productExpiryInput"),
  productNcmInput: document.querySelector("#productNcmInput"),
  productCfopInput: document.querySelector("#productCfopInput"),
  productTaxCodeInput: document.querySelector("#productTaxCodeInput"),
  productTaxRateInput: document.querySelector("#productTaxRateInput"),
  productStatusInput: document.querySelector("#productStatusInput"),
  productSubmitBtn: document.querySelector("#productSubmitBtn"),
  clearProductBtn: document.querySelector("#clearProductBtn"),
  supplierForm: document.querySelector("#supplierForm"),
  supplierIdInput: document.querySelector("#supplierIdInput"),
  supplierNameInput: document.querySelector("#supplierNameInput"),
  supplierDocumentInput: document.querySelector("#supplierDocumentInput"),
  supplierContactInput: document.querySelector("#supplierContactInput"),
  supplierPhoneInput: document.querySelector("#supplierPhoneInput"),
  supplierEmailInput: document.querySelector("#supplierEmailInput"),
  supplierStatusInput: document.querySelector("#supplierStatusInput"),
  supplierNotesInput: document.querySelector("#supplierNotesInput"),
  supplierSubmitBtn: document.querySelector("#supplierSubmitBtn"),
  clearSupplierBtn: document.querySelector("#clearSupplierBtn"),
  supplierSearchInput: document.querySelector("#supplierSearchInput"),
  exportSuppliersCsvBtn: document.querySelector("#exportSuppliersCsvBtn"),
  suppliersTableBody: document.querySelector("#suppliersTableBody"),
  movementForm: document.querySelector("#movementForm"),
  movementProductInput: document.querySelector("#movementProductInput"),
  movementTypeInput: document.querySelector("#movementTypeInput"),
  movementQuantityInput: document.querySelector("#movementQuantityInput"),
  movementNoteInput: document.querySelector("#movementNoteInput"),
  movementsHistory: document.querySelector("#movementsHistory"),
  invoiceForm: document.querySelector("#invoiceForm"),
  invoiceSupplierInput: document.querySelector("#invoiceSupplierInput"),
  invoiceNumberInput: document.querySelector("#invoiceNumberInput"),
  invoiceIssuedAtInput: document.querySelector("#invoiceIssuedAtInput"),
  invoiceNotesInput: document.querySelector("#invoiceNotesInput"),
  invoiceItemForm: document.querySelector("#invoiceItemForm"),
  invoiceProductInput: document.querySelector("#invoiceProductInput"),
  invoiceQuantityInput: document.querySelector("#invoiceQuantityInput"),
  invoiceUnitCostInput: document.querySelector("#invoiceUnitCostInput"),
  invoiceItemsList: document.querySelector("#invoiceItemsList"),
  invoiceTotals: document.querySelector("#invoiceTotals"),
  submitInvoiceBtn: document.querySelector("#submitInvoiceBtn"),
  clearInvoiceBtn: document.querySelector("#clearInvoiceBtn"),
  purchaseInvoicesHistory: document.querySelector("#purchaseInvoicesHistory"),
  supplierReturnForm: document.querySelector("#supplierReturnForm"),
  supplierReturnSupplierInput: document.querySelector("#supplierReturnSupplierInput"),
  supplierReturnReferenceInput: document.querySelector("#supplierReturnReferenceInput"),
  supplierReturnDateInput: document.querySelector("#supplierReturnDateInput"),
  supplierReturnNotesInput: document.querySelector("#supplierReturnNotesInput"),
  supplierReturnItemForm: document.querySelector("#supplierReturnItemForm"),
  supplierReturnProductInput: document.querySelector("#supplierReturnProductInput"),
  supplierReturnQuantityInput: document.querySelector("#supplierReturnQuantityInput"),
  supplierReturnUnitCostInput: document.querySelector("#supplierReturnUnitCostInput"),
  supplierReturnItemsList: document.querySelector("#supplierReturnItemsList"),
  supplierReturnTotals: document.querySelector("#supplierReturnTotals"),
  submitSupplierReturnBtn: document.querySelector("#submitSupplierReturnBtn"),
  clearSupplierReturnBtn: document.querySelector("#clearSupplierReturnBtn"),
  supplierReturnsHistory: document.querySelector("#supplierReturnsHistory"),
  logoutBtn: document.querySelector("#logoutBtn"),
  cashStatusBadge: document.querySelector("#cashStatusBadge"),
  cashSummaryCard: document.querySelector("#cashSummaryCard"),
  cashOpenForm: document.querySelector("#cashOpenForm"),
  cashCloseForm: document.querySelector("#cashCloseForm"),
  cashOpeningInput: document.querySelector("#cashOpeningInput"),
  cashProfilePasswordInput: document.querySelector("#cashProfilePasswordInput"),
  cashOpenNoteInput: document.querySelector("#cashOpenNoteInput"),
  cashClosingInput: document.querySelector("#cashClosingInput"),
  cashCloseNoteInput: document.querySelector("#cashCloseNoteInput"),
  cashHistory: document.querySelector("#cashHistory"),
  saleItemForm: document.querySelector("#saleItemForm"),
  saleProductInput: document.querySelector("#saleProductInput"),
  saleQuantityInput: document.querySelector("#saleQuantityInput"),
  saleCartList: document.querySelector("#saleCartList"),
  saleFinalizeForm: document.querySelector("#saleFinalizeForm"),
  saleChannelInput: document.querySelector("#saleChannelInput"),
  salePaymentInput: document.querySelector("#salePaymentInput"),
  saleDeliveryFields: document.querySelector("#saleDeliveryFields"),
  saleCustomerInput: document.querySelector("#saleCustomerInput"),
  saleDeliveryAddressInput: document.querySelector("#saleDeliveryAddressInput"),
  saleDeliveryFeeInput: document.querySelector("#saleDeliveryFeeInput"),
  saleDiscountInput: document.querySelector("#saleDiscountInput"),
  saleNoteInput: document.querySelector("#saleNoteInput"),
  saleTotals: document.querySelector("#saleTotals"),
  clearSaleBtn: document.querySelector("#clearSaleBtn"),
  salesHistory: document.querySelector("#salesHistory"),
  reportSummary: document.querySelector("#reportSummary"),
  topProductsList: document.querySelector("#topProductsList"),
  paymentMethodsList: document.querySelector("#paymentMethodsList"),
  reportRecentSales: document.querySelector("#reportRecentSales"),
  stockSnapshotList: document.querySelector("#stockSnapshotList"),
  reportFiltersForm: document.querySelector("#reportFiltersForm"),
  reportStartDateInput: document.querySelector("#reportStartDateInput"),
  reportEndDateInput: document.querySelector("#reportEndDateInput"),
  reportPaymentFilter: document.querySelector("#reportPaymentFilter"),
  reportSaleChannelFilter: document.querySelector("#reportSaleChannelFilter"),
  reportFilterSummary: document.querySelector("#reportFilterSummary"),
  resetReportFiltersBtn: document.querySelector("#resetReportFiltersBtn"),
  exportExcelBtn: document.querySelector("#exportExcelBtn"),
  exportPdfBtn: document.querySelector("#exportPdfBtn"),
  exportSupabaseBtn: document.querySelector("#exportSupabaseBtn"),
  salesChannelsList: document.querySelector("#salesChannelsList"),
  userForm: document.querySelector("#userForm"),
  userIdInput: document.querySelector("#userIdInput"),
  userNameInput: document.querySelector("#userNameInput"),
  userEmailInput: document.querySelector("#userEmailInput"),
  userRoleInput: document.querySelector("#userRoleInput"),
  userStatusInput: document.querySelector("#userStatusInput"),
  userPasswordInput: document.querySelector("#userPasswordInput"),
  userPasswordConfirmInput: document.querySelector("#userPasswordConfirmInput"),
  userFormHint: document.querySelector("#userFormHint"),
  userSubmitBtn: document.querySelector("#userSubmitBtn"),
  clearUserBtn: document.querySelector("#clearUserBtn"),
  userSearchInput: document.querySelector("#userSearchInput"),
  usersTableBody: document.querySelector("#usersTableBody"),
};

function bootstrap() {
  bindEvents();
  syncSaleChannelFields();
  syncAuthUI();
  initializeSession();
}

function bindEvents() {
  elements.authToggle.addEventListener("click", toggleAuthMode);
  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.logoutBtn.addEventListener("click", handleLogout);
  elements.sidebarToggleBtn.addEventListener("click", toggleSidebar);
  elements.sidebarBackdrop.addEventListener("click", closeSidebar);

  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderProducts();
  });

  elements.productSupplierFilter.addEventListener("change", (event) => {
    state.filters.supplierId = event.target.value;
    renderProducts();
  });

  elements.supplierSearchInput.addEventListener("input", (event) => {
    state.filters.supplierSearch = event.target.value.trim().toLowerCase();
    renderSuppliers();
  });

  elements.userSearchInput.addEventListener("input", (event) => {
    state.filters.userSearch = event.target.value.trim().toLowerCase();
    renderUsers();
  });

  elements.productForm.addEventListener("submit", handleProductSubmit);
  elements.productForm.addEventListener("invalid", handleProductFormInvalid, true);
  elements.clearProductBtn.addEventListener("click", resetProductForm);
  elements.supplierForm.addEventListener("submit", handleSupplierSubmit);
  elements.clearSupplierBtn.addEventListener("click", resetSupplierForm);
  elements.exportSuppliersCsvBtn.addEventListener("click", handleExportSuppliersCsv);
  elements.movementForm.addEventListener("submit", handleMovementSubmit);
  elements.invoiceItemForm.addEventListener("submit", handleInvoiceAddItem);
  elements.submitInvoiceBtn.addEventListener("click", handleInvoiceSubmit);
  elements.clearInvoiceBtn.addEventListener("click", clearInvoiceDraft);
  elements.supplierReturnItemForm.addEventListener("submit", handleSupplierReturnAddItem);
  elements.submitSupplierReturnBtn.addEventListener("click", handleSupplierReturnSubmit);
  elements.clearSupplierReturnBtn.addEventListener("click", clearSupplierReturnDraft);
  elements.cashOpenForm.addEventListener("submit", handleCashOpen);
  elements.cashCloseForm.addEventListener("submit", handleCashClose);
  elements.saleItemForm.addEventListener("submit", handleSaleAddItem);
  elements.saleFinalizeForm.addEventListener("submit", handleSaleFinalize);
  elements.clearSaleBtn.addEventListener("click", clearSaleCart);
  elements.saleChannelInput.addEventListener("change", syncSaleChannelFields);
  elements.saleDeliveryFeeInput.addEventListener("input", renderSaleCart);
  elements.saleDiscountInput.addEventListener("input", renderSaleCart);
  elements.reportFiltersForm.addEventListener("submit", handleReportFilterSubmit);
  elements.resetReportFiltersBtn.addEventListener("click", resetReportFilters);
  elements.exportExcelBtn.addEventListener("click", handleExportExcel);
  elements.exportPdfBtn.addEventListener("click", handleExportPdf);
  elements.exportSupabaseBtn.addEventListener("click", handleExportSupabase);
  elements.userForm.addEventListener("submit", handleUserSubmit);
  elements.clearUserBtn.addEventListener("click", resetUserForm);

  elements.navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      switchView(button.dataset.view);
      if (window.innerWidth <= 1080) closeSidebar();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) {
      state.sidebarOpen = false;
      applyPermissionsToLayout();
    }
  });
}

async function initializeSession() {
  if (!state.token) {
    render();
    return;
  }

  try {
    state.currentUser = await getUserById(state.token);
    if (!state.currentUser || state.currentUser.status !== "ativo") {
      throw new Error("Sessao invalida");
    }
    await hydrateApp();
    render();
  } catch {
    clearSession();
    render();
  }
}

function toggleAuthMode() {
  state.isRegisterMode = !state.isRegisterMode;
  elements.authForm.reset();
  setFeedback("", "");
  syncAuthUI();
}

function toggleSidebar() {
  if (window.innerWidth <= 1080) {
    state.sidebarOpen = !state.sidebarOpen;
  } else {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    localStorage.setItem(SIDEBAR_STATE_KEY, state.sidebarCollapsed ? "1" : "0");
  }
  applyPermissionsToLayout();
}

function closeSidebar() {
  state.sidebarOpen = false;
  applyPermissionsToLayout();
}

function syncAuthUI() {
  elements.nameField.classList.toggle("hidden", !state.isRegisterMode);
  elements.authTitle.textContent = state.isRegisterMode ? "Criar acesso" : "Bem-vindo de volta";
  elements.authSubtitle.textContent = state.isRegisterMode
    ? "Cadastre um novo usuario para comecar a usar o gerenciador."
    : "Entre para acompanhar o estoque, registrar vendas e controlar o caixa da loja.";
  elements.authSubmit.textContent = state.isRegisterMode ? "Cadastrar" : "Entrar";
  elements.authToggle.textContent = state.isRegisterMode ? "Ja tem conta? Entrar" : "Nao tem conta? Cadastre-se";
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const payload = {
    name: elements.nameInput.value.trim(),
    email: elements.emailInput.value.trim().toLowerCase(),
    password: elements.passwordInput.value.trim(),
  };

  try {
    const route = state.isRegisterMode ? "/auth/register" : "/auth/login";
    const response = await apiRequest(route, {
      method: "POST",
      auth: false,
      data: payload,
    });

    state.token = response.token;
    state.currentUser = response.user;
    localStorage.setItem(SESSION_KEY, state.token);
    elements.authForm.reset();
    state.isRegisterMode = false;
    syncAuthUI();
    try {
      await hydrateApp();
    } catch (error) {
      throw new Error(`Login realizado, mas houve falha ao carregar o painel: ${error.message}`);
    }
    render();
    setFeedback(response.message || "", response.message ? "success" : "");
  } catch (error) {
    setFeedback(error.message, "error");
  }
}

async function handleLogout() {
  clearSession();
  state.isRegisterMode = false;
  syncAuthUI();
  render();
}

function clearSession() {
  state.token = "";
  state.currentUser = null;
  state.dashboard = null;
  state.reports = null;
  state.cash = { current: null, history: [] };
  state.products = [];
  state.suppliers = [];
  state.purchaseInvoices = [];
  state.supplierReturns = [];
  state.movements = [];
  state.sales = [];
  state.users = [];
  state.saleCart = [];
  state.invoiceItems = [];
  state.supplierReturnItems = [];
  localStorage.removeItem(SESSION_KEY);
}

function switchView(viewName) {
  if (!hasViewAccess(viewName)) viewName = "overview";
  state.currentView = viewName;

  elements.navLinks.forEach((button) => {
    const allowed = hasViewAccess(button.dataset.view);
    button.classList.toggle("hidden", !allowed);
    button.classList.toggle("active", button.dataset.view === viewName && allowed);
  });

  Object.entries(elements.views).forEach(([name, node]) => {
    node.classList.toggle("active", name === viewName);
  });
}

async function hydrateApp() {
  const requests = [
    apiRequest("/dashboard"),
    apiRequest("/products"),
    can("supplierManage") ? apiRequest("/suppliers") : Promise.resolve({ items: [] }),
    can("movementWrite") ? apiRequest("/purchase-invoices") : Promise.resolve({ items: [] }),
    can("movementWrite") ? apiRequest("/supplier-returns") : Promise.resolve({ items: [] }),
    apiRequest("/movements"),
    apiRequest("/sales"),
    apiRequest("/cash/current"),
    apiRequest(`/reports${buildReportQueryString()}`),
  ];

  if (can("userManage")) {
    requests.push(apiRequest("/users"));
  } else {
    requests.push(Promise.resolve({ items: [] }));
  }

  const [dashboard, products, suppliers, purchaseInvoices, supplierReturns, movements, sales, cash, reports, users] = await Promise.all(requests);
  state.dashboard = dashboard;
  state.products = products.items;
  state.suppliers = suppliers.items || [];
  state.purchaseInvoices = purchaseInvoices.items || [];
  state.supplierReturns = supplierReturns.items || [];
  state.movements = movements.items;
  state.sales = sales.items;
  state.cash = cash;
  state.reports = reports;
  state.users = users.items || [];
}

async function refreshAppData() {
  await hydrateApp();
  render();
}

function render() {
  const isLogged = Boolean(state.token && state.currentUser);
  elements.authPanel.classList.toggle("hidden", isLogged);
  elements.dashboard.classList.toggle("hidden", !isLogged);
  if (!isLogged) return;

  elements.currentUserName.textContent = state.currentUser.name || "Administrador";
  elements.currentUserRole.textContent = ROLE_LABELS[state.currentUser.role] || "Usuario";
  elements.heroDescription.textContent = getRoleHeroText();

  applyPermissionsToLayout();
  if (!hasViewAccess(state.currentView)) {
    state.currentView = getDefaultView();
  }

  switchView(state.currentView);
  renderOverview();
  renderProducts();
  renderProductSupplierOptions();
  renderProductSupplierFilterOptions();
  renderSuppliers();
  renderMovementProductOptions();
  renderInvoiceOptions();
  renderInvoiceDraft();
  renderMovementHistory();
  renderSalesView();
  renderReports();
  renderUsers();
}

function applyPermissionsToLayout() {
  elements.dashboard.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && window.innerWidth > 1080);
  elements.dashboard.classList.toggle("sidebar-open", state.sidebarOpen && window.innerWidth <= 1080);
  elements.sidebarBackdrop.classList.toggle("hidden", !(state.sidebarOpen && window.innerWidth <= 1080));
  elements.suppliersNavBtn.classList.toggle("hidden", !hasViewAccess("suppliers"));
  elements.usersNavBtn.classList.toggle("hidden", !hasViewAccess("users"));
  toggleDisabled(elements.exportSupabaseBtn, !can("reportSupabase"));
  toggleDisabled(elements.exportExcelBtn, !can("reportExport"));
  toggleDisabled(elements.exportPdfBtn, !can("reportExport"));
  toggleSectionPermission(elements.productForm, can("productWrite"));
  toggleDisabled(elements.productSubmitBtn, !can("productWrite"));
  toggleDisabled(elements.clearProductBtn, !can("productWrite"));
  toggleSectionPermission(elements.supplierForm, can("supplierManage"));
  toggleDisabled(elements.supplierSubmitBtn, !can("supplierManage"));
  toggleDisabled(elements.clearSupplierBtn, !can("supplierManage"));
  toggleDisabled(elements.supplierSearchInput, !can("supplierManage"));
  toggleDisabled(elements.exportSuppliersCsvBtn, !can("supplierManage"));
  toggleSectionPermission(elements.movementForm, can("movementWrite"));
  toggleSectionPermission(elements.cashOpenForm, can("cashOpen"));
  toggleSectionPermission(elements.cashCloseForm, can("cashManage"));
  toggleDisabled(elements.clearSaleBtn, !can("saleWrite"));
  toggleDisabled(elements.saleFinalizeForm.querySelector('button[type="submit"]'), !can("saleWrite"));
  toggleDisabled(elements.saleItemForm.querySelector('button[type="submit"]'), !can("saleWrite"));
  toggleSectionPermission(elements.userForm, can("userManage"));
  toggleDisabled(elements.userSubmitBtn, !can("userManage"));
  toggleDisabled(elements.clearUserBtn, !can("userManage"));
  toggleDisabled(elements.userSearchInput, !can("userManage"));
}

function renderOverview() {
  const stats = state.dashboard?.stats || [];
  const lowStockProducts = state.dashboard?.lowStock || [];
  const expiringProducts = state.dashboard?.expiringProducts || [];
  const recent = state.dashboard?.recentMovements || [];

  elements.statsGrid.innerHTML = stats.length
    ? stats.map((item) => `
      <article class="stat-card">
        <small>${escapeHtml(item.label)}</small>
        <strong>${escapeHtml(item.value)}</strong>
      </article>`).join("")
    : "";

  elements.lowStockList.innerHTML = lowStockProducts.length
    ? lowStockProducts.map((product) => `
      <div class="list-item">
        <strong>${escapeHtml(product.name)}</strong>
        <small>${escapeHtml(product.category)} • Minimo ${escapeHtml(product.minimum)}</small>
        <span class="status-badge low">Restam ${escapeHtml(product.quantity)} unidades</span>
      </div>`).join("")
    : emptyState("Nenhum alerta agora", "Todos os produtos ativos estao acima do estoque minimo.");

  if (elements.expiryAlertList) {
    elements.expiryAlertList.innerHTML = expiringProducts.length
    ? expiringProducts.map((product) => {
      const expiryStatus = getExpiryStatus(product.expiryDate);
      const badgeClass = expiryStatus === "expired" ? "inactive" : "low";
      const badgeLabel = expiryStatus === "expired"
        ? `Vencido em ${formatShortDate(product.expiryDate)}`
        : `Vence em ${getDaysUntilExpiry(product.expiryDate)} dia(s)`;
      return `
      <div class="list-item">
        <strong>${escapeHtml(product.name)}</strong>
        <small>${escapeHtml(product.category)} • ${escapeHtml(product.brand)}</small>
        <span class="status-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
      </div>`;
    }).join("")
    : emptyState("Sem vencimentos proximos", `Nenhum produto vence nos proximos ${EXPIRY_ALERT_DAYS} dias.`);
  }

  elements.recentMovements.innerHTML = recent.length
    ? recent.map((movement) => `
      <div class="list-item">
        <strong>${escapeHtml(movement.productName)}</strong>
        <small>${escapeHtml(formatDate(movement.createdAt))}</small>
        <span class="status-badge ${movement.type === "saida" ? "low" : "active"}">${escapeHtml(capitalize(movement.type))} de ${escapeHtml(movement.quantity)}</span>
      </div>`).join("")
    : emptyState("Nenhuma movimentacao", "As acoes de estoque aparecerao aqui.");
}

function renderProducts() {
  const filtered = state.products.filter((product) => {
    const searchValue = state.filters.search;
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.brand.toLowerCase().includes(searchValue);
    if (!matchesSearch) return false;
    if (state.filters.supplierId && product.supplierId !== state.filters.supplierId) return false;
    if (state.filters.status === "todos") return true;
    if (state.filters.status === "baixo") return product.status === "ativo" && Number(product.quantity) <= Number(product.minimum);
    if (state.filters.status === "vencendo") return isExpiringSoon(product.expiryDate);
    if (state.filters.status === "vencido") return getExpiryStatus(product.expiryDate) === "expired";
    return product.status === state.filters.status;
  });

  elements.productsTableBody.innerHTML = filtered.length
    ? filtered.map((product) => {
      const expiryStatus = getExpiryStatus(product.expiryDate);
      let badgeClass = "active";
      let badgeLabel = "Ativo";

      if (product.status === "inativo") {
        badgeClass = "inactive";
        badgeLabel = "Inativo";
      } else if (expiryStatus === "expired") {
        badgeClass = "inactive";
        badgeLabel = "Vencido";
      } else if (expiryStatus === "warning") {
        badgeClass = "low";
        badgeLabel = "Vence em breve";
      } else if (Number(product.quantity) <= Number(product.minimum)) {
        badgeClass = "low";
        badgeLabel = "Estoque baixo";
      }

      const expiryLabel = product.expiryDate ? formatShortDate(product.expiryDate) : "Nao informado";
      const supplier = state.suppliers.find((item) => item.id === product.supplierId);
      const fiscalSummary = [product.ncm ? `NCM ${product.ncm}` : "", product.taxCode ? `CST ${product.taxCode}` : ""]
        .filter(Boolean)
        .join(" • ");
      return `
        <tr>
          <td><strong>${escapeHtml(product.name)}</strong><br /><small>${escapeHtml(product.brand)}${supplier ? ` • ${escapeHtml(supplier.name)}` : ""}${fiscalSummary ? ` • ${escapeHtml(fiscalSummary)}` : ""}</small></td>
          <td>${escapeHtml(supplier?.name || "Nao vinculado")}</td>
          <td>${escapeHtml(product.category)}</td>
          <td>${escapeHtml(product.quantity)} un.</td>
          <td>${escapeHtml(expiryLabel)}</td>
          <td>${escapeHtml(formatCurrency(product.price))}</td>
          <td><span class="status-badge ${badgeClass}">${badgeLabel}</span></td>
          <td>
            <div class="action-row">
              <button class="tiny-btn" data-action="edit" data-id="${product.id}" ${can("productWrite") ? "" : "disabled"}>Editar</button>
              <button class="tiny-btn danger" data-action="delete" data-id="${product.id}" ${can("productWrite") ? "" : "disabled"}>Excluir</button>
            </div>
          </td>
        </tr>`;
    }).join("")
    : '<tr><td colspan="8">Nenhum produto encontrado com os filtros atuais.</td></tr>';

  elements.productsTableBody.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("productWrite")) return;
      const product = state.products.find((item) => item.id === button.dataset.id);
      if (button.dataset.action === "edit" && product) {
        populateProductForm(product);
        switchView("products");
      }
      if (button.dataset.action === "delete") handleDeleteProduct(button.dataset.id);
    });
  });
}

function populateProductForm(product) {
  elements.productIdInput.value = product.id;
  elements.productNameInput.value = product.name;
  elements.productCategoryInput.value = product.category;
  elements.productBrandInput.value = product.brand;
  elements.productSupplierInput.value = product.supplierId || "";
  elements.productPriceInput.value = product.price;
  elements.productCostInput.value = product.cost;
  elements.productQuantityInput.value = product.quantity;
  elements.productMinimumInput.value = product.minimum;
  if (elements.productExpiryInput) {
    elements.productExpiryInput.value = product.expiryDate || "";
  }
  elements.productNcmInput.value = product.ncm || "";
  elements.productCfopInput.value = product.cfop || "";
  elements.productTaxCodeInput.value = product.taxCode || "";
  elements.productTaxRateInput.value = Number(product.taxRate || 0);
  elements.productStatusInput.value = product.status;
  elements.productSubmitBtn.textContent = "Atualizar produto";
}

function handleProductFormInvalid(event) {
  const field = event.target;
  if (!(field instanceof HTMLElement)) return;

  const label = field.closest("label");
  const fieldName = label?.querySelector("span")?.textContent?.trim() || "campo";
  window.alert(`Preencha corretamente o campo "${fieldName}".`);
  if (typeof field.focus === "function") field.focus();
}

function normalizeExpiryDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  return null;
}

async function handleProductSubmit(event) {
  event.preventDefault();
  if (!can("productWrite")) {
    window.alert("Seu perfil nao pode cadastrar ou editar produtos.");
    return;
  }

  const product = {
    name: elements.productNameInput.value.trim(),
    category: elements.productCategoryInput.value,
    brand: elements.productBrandInput.value.trim(),
    supplierId: elements.productSupplierInput.value || null,
    ncm: elements.productNcmInput.value.trim(),
    cfop: elements.productCfopInput.value.trim(),
    taxCode: elements.productTaxCodeInput.value.trim(),
    taxRate: Number(elements.productTaxRateInput.value || 0),
    price: Number(elements.productPriceInput.value),
    cost: Number(elements.productCostInput.value),
    quantity: Number(elements.productQuantityInput.value),
    minimum: Number(elements.productMinimumInput.value),
    expiryDate: normalizeExpiryDate(elements.productExpiryInput?.value),
    status: elements.productStatusInput.value,
  };

  const productId = elements.productIdInput.value;
  const route = productId ? `/products/${productId}` : "/products";
  const method = productId ? "PUT" : "POST";

  try {
    await apiRequest(route, {
      method,
      data: product,
    });
    resetProductForm();
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

function resetProductForm() {
  elements.productForm.reset();
  elements.productIdInput.value = "";
  elements.productSupplierInput.value = "";
  elements.productTaxRateInput.value = 0;
  elements.productSubmitBtn.textContent = "Salvar produto";
}

function renderProductSupplierOptions() {
  const currentValue = elements.productSupplierInput.value;
  const options = ['<option value="">Sem fornecedor vinculado</option>']
    .concat(
      state.suppliers
        .filter((supplier) => supplier.status === "ativo")
        .map((supplier) => `<option value="${supplier.id}">${escapeHtml(supplier.name)}</option>`)
    )
    .join("");
  elements.productSupplierInput.innerHTML = options;
  elements.productSupplierInput.value = currentValue;
}

function renderProductSupplierFilterOptions() {
  const currentValue = state.filters.supplierId;
  const options = ['<option value="">Todos os fornecedores</option>']
    .concat(
      state.suppliers.map((supplier) => `<option value="${supplier.id}">${escapeHtml(supplier.name)}</option>`)
    )
    .join("");
  elements.productSupplierFilter.innerHTML = options;
  elements.productSupplierFilter.value = currentValue;
}

function renderSuppliers() {
  if (!hasViewAccess("suppliers")) return;

  const filtered = state.suppliers.filter((supplier) => {
    const search = state.filters.supplierSearch;
    return (
      !search ||
      supplier.name.toLowerCase().includes(search) ||
      (supplier.document || "").toLowerCase().includes(search) ||
      (supplier.contactName || "").toLowerCase().includes(search) ||
      (supplier.email || "").toLowerCase().includes(search)
    );
  });

  elements.suppliersTableBody.innerHTML = filtered.length
    ? filtered.map((supplier) => `
      <tr>
        <td>
          <strong>${escapeHtml(supplier.name)}</strong><br />
          <small>${escapeHtml(supplier.email || "Sem e-mail")}</small>
        </td>
        <td>
          <strong>${escapeHtml(supplier.contactName || "Nao informado")}</strong><br />
          <small>${escapeHtml(supplier.phone || "Sem telefone")}</small>
        </td>
        <td>${escapeHtml(supplier.document || "Nao informado")}</td>
        <td>${escapeHtml(String(state.products.filter((product) => product.supplierId === supplier.id).length))}</td>
        <td><span class="status-badge ${supplier.status === "ativo" ? "active" : "inactive"}">${escapeHtml(capitalize(supplier.status))}</span></td>
        <td>${escapeHtml(formatDate(supplier.createdAt))}</td>
        <td>
          <div class="action-row">
            <button class="tiny-btn" data-edit-supplier="${supplier.id}" ${can("supplierManage") ? "" : "disabled"}>Editar</button>
            <button class="tiny-btn ${supplier.status === "ativo" ? "danger" : ""}" data-toggle-supplier="${supplier.id}" ${can("supplierManage") ? "" : "disabled"}>
              ${supplier.status === "ativo" ? "Desativar" : "Reativar"}
            </button>
          </div>
        </td>
      </tr>`).join("")
    : '<tr><td colspan="7">Nenhum fornecedor encontrado.</td></tr>';

  elements.suppliersTableBody.querySelectorAll("[data-edit-supplier]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("supplierManage")) return;
      const supplier = state.suppliers.find((item) => item.id === button.dataset.editSupplier);
      if (supplier) populateSupplierForm(supplier);
    });
  });

  elements.suppliersTableBody.querySelectorAll("[data-toggle-supplier]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("supplierManage")) return;
      handleToggleSupplierStatus(button.dataset.toggleSupplier);
    });
  });
}

function populateSupplierForm(supplier) {
  elements.supplierIdInput.value = supplier.id;
  elements.supplierNameInput.value = supplier.name;
  elements.supplierDocumentInput.value = supplier.document || "";
  elements.supplierContactInput.value = supplier.contactName || "";
  elements.supplierPhoneInput.value = supplier.phone || "";
  elements.supplierEmailInput.value = supplier.email || "";
  elements.supplierStatusInput.value = supplier.status;
  elements.supplierNotesInput.value = supplier.notes || "";
  elements.supplierSubmitBtn.textContent = "Atualizar fornecedor";
}

function resetSupplierForm() {
  elements.supplierForm.reset();
  elements.supplierIdInput.value = "";
  elements.supplierStatusInput.value = "ativo";
  elements.supplierSubmitBtn.textContent = "Salvar fornecedor";
}

async function handleSupplierSubmit(event) {
  event.preventDefault();
  if (!can("supplierManage")) {
    window.alert("Seu perfil nao pode gerenciar fornecedores.");
    return;
  }

  const supplierId = elements.supplierIdInput.value;
  const payload = {
    name: elements.supplierNameInput.value.trim(),
    document: elements.supplierDocumentInput.value.trim(),
    contactName: elements.supplierContactInput.value.trim(),
    phone: elements.supplierPhoneInput.value.trim(),
    email: elements.supplierEmailInput.value.trim().toLowerCase(),
    status: elements.supplierStatusInput.value,
    notes: elements.supplierNotesInput.value.trim(),
  };

  const route = supplierId ? `/suppliers/${supplierId}` : "/suppliers";
  const method = supplierId ? "PUT" : "POST";

  try {
    await apiRequest(route, { method, data: payload });
    resetSupplierForm();
    await refreshAppData();
    switchView("suppliers");
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleToggleSupplierStatus(supplierId) {
  const supplier = state.suppliers.find((item) => item.id === supplierId);
  if (!supplier) return;

  const nextStatus = supplier.status === "ativo" ? "inativo" : "ativo";
  const actionLabel = nextStatus === "ativo" ? "reativar" : "desativar";
  if (!window.confirm(`Deseja ${actionLabel} o fornecedor "${supplier.name}"?`)) return;

  try {
    await apiRequest(`/suppliers/${supplierId}`, {
      method: "PUT",
      data: {
        name: supplier.name,
        document: supplier.document,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        status: nextStatus,
        notes: supplier.notes,
      },
    });
    await refreshAppData();
    switchView("suppliers");
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleDeleteProduct(productId) {
  if (!can("productWrite")) return;
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  if (!window.confirm(`Deseja remover o produto "${product.name}" do cadastro?`)) return;

  try {
    await apiRequest(`/products/${productId}`, { method: "DELETE" });
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

function renderMovementProductOptions() {
  const activeProducts = state.products.filter((item) => item.status === "ativo");
  const options = activeProducts
    .map((product) => `<option value="${product.id}">${escapeHtml(product.name)} (${escapeHtml(product.quantity)} un.)</option>`)
    .join("");
  const emptyOption = '<option value="">Cadastre um produto ativo primeiro</option>';
  elements.movementProductInput.innerHTML = options || emptyOption;
  elements.saleProductInput.innerHTML = options || emptyOption;
}

function renderInvoiceOptions() {
  const supplierOptions = ['<option value="">Selecione um fornecedor</option>']
    .concat(
      state.suppliers
        .filter((supplier) => supplier.status === "ativo")
        .map((supplier) => `<option value="${supplier.id}">${escapeHtml(supplier.name)}</option>`)
    )
    .join("");
  elements.invoiceSupplierInput.innerHTML = supplierOptions;

  const productOptions = state.products
    .filter((product) => product.status === "ativo")
    .map((product) => `<option value="${product.id}">${escapeHtml(product.name)}</option>`)
    .join("");
  elements.invoiceProductInput.innerHTML = productOptions || '<option value="">Cadastre um produto ativo primeiro</option>';
  elements.supplierReturnSupplierInput.innerHTML = supplierOptions;
  elements.supplierReturnProductInput.innerHTML = productOptions || '<option value="">Cadastre um produto ativo primeiro</option>';
}

function getInvoiceTotals() {
  const total = state.invoiceItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const itemCount = state.invoiceItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return { total, itemCount };
}

function renderInvoiceDraft() {
  const totals = getInvoiceTotals();

  elements.invoiceItemsList.innerHTML = state.invoiceItems.length
    ? state.invoiceItems.map((item) => `
      <div class="list-item horizontal-item">
        <div>
          <strong>${escapeHtml(item.productName)}</strong>
          <small>${escapeHtml(item.quantity)} x ${escapeHtml(formatCurrency(item.unitCost))}</small>
        </div>
        <div class="action-row">
          <span class="status-badge active">${escapeHtml(formatCurrency(item.lineTotal))}</span>
          <button class="tiny-btn danger" data-remove-invoice-item="${item.productId}" ${can("movementWrite") ? "" : "disabled"}>Remover</button>
        </div>
      </div>`).join("")
    : emptyState("Sem itens na nota", "Adicione os produtos recebidos do fornecedor.");

  elements.invoiceTotals.innerHTML = `
    <strong>Total da nota</strong>
    <small>Itens ${escapeHtml(String(totals.itemCount))}</small>
    <small>Valor total ${escapeHtml(formatCurrency(totals.total))}</small>
  `;

  elements.invoiceItemsList.querySelectorAll("[data-remove-invoice-item]").forEach((button) => {
    button.addEventListener("click", () => {
      state.invoiceItems = state.invoiceItems.filter((item) => item.productId !== button.dataset.removeInvoiceItem);
      renderInvoiceDraft();
    });
  });

  renderPurchaseInvoicesHistory();
  renderSupplierReturnsHistory();
}

function renderPurchaseInvoicesHistory() {
  elements.purchaseInvoicesHistory.innerHTML = state.purchaseInvoices.length
    ? state.purchaseInvoices.slice(0, 8).map((invoice) => `
      <div class="list-item">
        <strong>NF ${escapeHtml(invoice.invoiceNumber)} • ${escapeHtml(invoice.supplierName)}</strong>
        <small>${escapeHtml(formatShortDate(invoice.issuedAt))} • ${escapeHtml(invoice.itemCount)} itens</small>
        <span class="pill-line">Total ${escapeHtml(formatCurrency(invoice.totalAmount))}</span>
        <small>${escapeHtml(invoice.notes || "Sem observacao.")}</small>
      </div>`).join("")
    : emptyState("Nenhuma nota lancada", "As entradas por nota fiscal aparecerao aqui.");
}

function getSupplierReturnTotals() {
  const total = state.supplierReturnItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const itemCount = state.supplierReturnItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return { total, itemCount };
}

function renderSupplierReturnDraft() {
  const totals = getSupplierReturnTotals();

  elements.supplierReturnItemsList.innerHTML = state.supplierReturnItems.length
    ? state.supplierReturnItems.map((item) => `
      <div class="list-item horizontal-item">
        <div>
          <strong>${escapeHtml(item.productName)}</strong>
          <small>${escapeHtml(item.quantity)} x ${escapeHtml(formatCurrency(item.unitCost))}</small>
        </div>
        <div class="action-row">
          <span class="status-badge low">${escapeHtml(formatCurrency(item.lineTotal))}</span>
          <button class="tiny-btn danger" data-remove-return-item="${item.productId}" ${can("movementWrite") ? "" : "disabled"}>Remover</button>
        </div>
      </div>`).join("")
    : emptyState("Sem itens na devolucao", "Adicione os produtos que serao devolvidos.");

  elements.supplierReturnTotals.innerHTML = `
    <strong>Total da devolucao</strong>
    <small>Itens ${escapeHtml(String(totals.itemCount))}</small>
    <small>Valor total ${escapeHtml(formatCurrency(totals.total))}</small>
  `;

  elements.supplierReturnItemsList.querySelectorAll("[data-remove-return-item]").forEach((button) => {
    button.addEventListener("click", () => {
      state.supplierReturnItems = state.supplierReturnItems.filter((item) => item.productId !== button.dataset.removeReturnItem);
      renderSupplierReturnDraft();
    });
  });
}

function renderSupplierReturnsHistory() {
  elements.supplierReturnsHistory.innerHTML = state.supplierReturns.length
    ? state.supplierReturns.slice(0, 8).map((entry) => `
      <div class="list-item">
        <strong>${escapeHtml(entry.referenceNumber)} • ${escapeHtml(entry.supplierName)}</strong>
        <small>${escapeHtml(formatShortDate(entry.returnedAt))} • ${escapeHtml(entry.itemCount)} itens</small>
        <span class="pill-line">Total ${escapeHtml(formatCurrency(entry.totalAmount))}</span>
        <small>${escapeHtml(entry.notes || "Sem observacao.")}</small>
      </div>`).join("")
    : emptyState("Nenhuma devolucao lancada", "As devolucoes ao fornecedor aparecerao aqui.");
}

function renderMovementHistory() {
  elements.movementsHistory.innerHTML = state.movements.length
    ? state.movements.map((movement) => `
      <div class="list-item">
        <strong>${escapeHtml(movement.productName)}</strong>
        <small>${escapeHtml(formatDate(movement.createdAt))}</small>
        <span class="status-badge ${movement.type === "saida" ? "low" : "active"}">${escapeHtml(capitalize(movement.type))} • ${escapeHtml(movement.quantity)} un.</span>
        <small>${escapeHtml(movement.note || "Sem observacao.")}</small>
      </div>`).join("")
    : emptyState("Historico vazio", "Registre uma movimentacao para comecar.");
}

async function handleMovementSubmit(event) {
  event.preventDefault();
  if (!can("movementWrite")) {
    window.alert("Seu perfil nao pode registrar movimentacoes.");
    return;
  }

  try {
    await apiRequest("/movements", {
      method: "POST",
      data: {
        productId: elements.movementProductInput.value,
        type: elements.movementTypeInput.value,
        quantity: Number(elements.movementQuantityInput.value),
        note: elements.movementNoteInput.value.trim(),
      },
    });
    elements.movementForm.reset();
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

function handleInvoiceAddItem(event) {
  event.preventDefault();
  if (!can("movementWrite")) {
    window.alert("Seu perfil nao pode registrar notas de entrada.");
    return;
  }

  const productId = elements.invoiceProductInput.value;
  const quantity = Number(elements.invoiceQuantityInput.value || 0);
  const unitCost = Number(elements.invoiceUnitCostInput.value || 0);
  const product = state.products.find((item) => item.id === productId);
  if (!product || quantity <= 0) {
    window.alert("Selecione um produto e informe uma quantidade valida.");
    return;
  }

  const existing = state.invoiceItems.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.unitCost = unitCost;
    existing.lineTotal = existing.quantity * existing.unitCost;
  } else {
    state.invoiceItems.push({
      productId,
      productName: product.name,
      quantity,
      unitCost,
      lineTotal: quantity * unitCost,
    });
  }

  elements.invoiceItemForm.reset();
  elements.invoiceQuantityInput.value = 1;
  elements.invoiceUnitCostInput.value = 0;
  renderInvoiceDraft();
}

function clearInvoiceDraft() {
  state.invoiceItems = [];
  elements.invoiceForm.reset();
  elements.invoiceItemForm.reset();
  elements.invoiceQuantityInput.value = 1;
  elements.invoiceUnitCostInput.value = 0;
  renderInvoiceDraft();
}

function handleSupplierReturnAddItem(event) {
  event.preventDefault();
  if (!can("movementWrite")) {
    window.alert("Seu perfil nao pode registrar devolucoes.");
    return;
  }

  const productId = elements.supplierReturnProductInput.value;
  const quantity = Number(elements.supplierReturnQuantityInput.value || 0);
  const unitCost = Number(elements.supplierReturnUnitCostInput.value || 0);
  const product = state.products.find((item) => item.id === productId);
  if (!product || quantity <= 0) {
    window.alert("Selecione um produto e informe uma quantidade valida.");
    return;
  }

  const reserved = state.supplierReturnItems
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
  if (reserved + quantity > Number(product.quantity || 0)) {
    window.alert("A devolucao nao pode ser maior do que o estoque atual.");
    return;
  }

  const existing = state.supplierReturnItems.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.unitCost = unitCost;
    existing.lineTotal = existing.quantity * existing.unitCost;
  } else {
    state.supplierReturnItems.push({
      productId,
      productName: product.name,
      quantity,
      unitCost,
      lineTotal: quantity * unitCost,
    });
  }

  elements.supplierReturnItemForm.reset();
  elements.supplierReturnQuantityInput.value = 1;
  elements.supplierReturnUnitCostInput.value = 0;
  renderSupplierReturnDraft();
}

function clearSupplierReturnDraft() {
  state.supplierReturnItems = [];
  elements.supplierReturnForm.reset();
  elements.supplierReturnItemForm.reset();
  elements.supplierReturnQuantityInput.value = 1;
  elements.supplierReturnUnitCostInput.value = 0;
  renderSupplierReturnDraft();
}

async function handleSupplierReturnSubmit() {
  if (!can("movementWrite")) {
    window.alert("Seu perfil nao pode registrar devolucoes.");
    return;
  }
  if (!elements.supplierReturnSupplierInput.value) {
    window.alert("Selecione um fornecedor.");
    return;
  }
  if (!elements.supplierReturnReferenceInput.value.trim()) {
    window.alert("Informe a referencia da devolucao.");
    return;
  }
  if (!elements.supplierReturnDateInput.value) {
    window.alert("Informe a data da devolucao.");
    return;
  }
  if (!state.supplierReturnItems.length) {
    window.alert("Adicione pelo menos um item na devolucao.");
    return;
  }

  try {
    await apiRequest("/supplier-returns", {
      method: "POST",
      data: {
        supplierId: elements.supplierReturnSupplierInput.value,
        referenceNumber: elements.supplierReturnReferenceInput.value.trim(),
        returnedAt: elements.supplierReturnDateInput.value,
        notes: elements.supplierReturnNotesInput.value.trim(),
        items: state.supplierReturnItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      },
    });
    clearSupplierReturnDraft();
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleInvoiceSubmit() {
  if (!can("movementWrite")) {
    window.alert("Seu perfil nao pode registrar notas de entrada.");
    return;
  }
  if (!elements.invoiceSupplierInput.value) {
    window.alert("Selecione um fornecedor.");
    return;
  }
  if (!elements.invoiceNumberInput.value.trim()) {
    window.alert("Informe o numero da nota.");
    return;
  }
  if (!elements.invoiceIssuedAtInput.value) {
    window.alert("Informe a data de emissao.");
    return;
  }
  if (!state.invoiceItems.length) {
    window.alert("Adicione pelo menos um item na nota.");
    return;
  }

  try {
    await apiRequest("/purchase-invoices", {
      method: "POST",
      data: {
        supplierId: elements.invoiceSupplierInput.value,
        invoiceNumber: elements.invoiceNumberInput.value.trim(),
        issuedAt: elements.invoiceIssuedAtInput.value,
        notes: elements.invoiceNotesInput.value.trim(),
        items: state.invoiceItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      },
    });
    clearInvoiceDraft();
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

function renderSalesView() {
  renderCashSection();
  renderSaleCart();
  renderSalesHistory();
}

function renderCashSection() {
  const current = state.cash.current;
  elements.cashStatusBadge.textContent = current ? "Caixa aberto" : "Caixa fechado";
  elements.cashStatusBadge.className = `status-badge ${current ? "active" : "inactive"}`;
  elements.cashOpenForm.classList.toggle("hidden", Boolean(current));
  elements.cashCloseForm.classList.toggle("hidden", !current);

  elements.cashSummaryCard.innerHTML = current
    ? `
      <strong>Caixa aberto por ${escapeHtml(current.openedBy)}</strong>
      <small>Abertura: ${escapeHtml(formatDate(current.openedAt))}</small>
      <span class="pill-line">Abertura ${escapeHtml(formatCurrency(current.openingAmount))}</span>
      <span class="pill-line">Vendas ${escapeHtml(formatCurrency(current.salesTotal))}</span>
      <span class="pill-line">Esperado ${escapeHtml(formatCurrency(current.expectedBalance))}</span>
    `
    : `
      <strong>Nenhum caixa aberto no momento</strong>
      <small>Abra o caixa para comecar a registrar vendas no balcao.</small>
    `;

  elements.cashHistory.innerHTML = state.cash.history?.length
    ? state.cash.history.map((session) => `
      <div class="list-item">
        <strong>${session.closedAt ? "Caixa fechado" : "Caixa em aberto"}</strong>
        <small>${escapeHtml(formatDate(session.openedAt))}</small>
        <span class="pill-line">Abertura ${escapeHtml(formatCurrency(session.openingAmount))}</span>
        <span class="pill-line">Vendas ${escapeHtml(formatCurrency(session.salesTotal))}</span>
        <span class="pill-line">${session.closedAt ? `Fechamento ${escapeHtml(formatCurrency(session.actualClosingAmount || 0))}` : "Ainda aberto"}</span>
      </div>`).join("")
    : emptyState("Nenhum caixa registrado", "As ultimas aberturas e fechamentos aparecerao aqui.");
}

async function handleCashOpen(event) {
  event.preventDefault();
  if (!can("cashOpen")) {
    window.alert("Seu perfil nao pode abrir o caixa.");
    return;
  }

  const profilePassword = elements.cashProfilePasswordInput.value.trim();
  if (!profilePassword) {
    window.alert("Informe a senha do seu perfil para abrir o caixa.");
    elements.cashProfilePasswordInput.focus();
    return;
  }

  try {
    await apiRequest("/cash/open", {
      method: "POST",
      data: {
        openingAmount: Number(elements.cashOpeningInput.value || 0),
        profilePassword,
        note: elements.cashOpenNoteInput.value.trim(),
      },
    });
    elements.cashOpenForm.reset();
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleCashClose(event) {
  event.preventDefault();
  if (!can("cashManage")) {
    window.alert("Seu perfil nao pode fechar o caixa.");
    return;
  }

  try {
    await apiRequest("/cash/close", {
      method: "POST",
      data: {
        closingAmount: Number(elements.cashClosingInput.value || 0),
        note: elements.cashCloseNoteInput.value.trim(),
      },
    });
    elements.cashCloseForm.reset();
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

function handleSaleAddItem(event) {
  event.preventDefault();
  if (!can("saleWrite")) {
    window.alert("Seu perfil nao pode registrar vendas.");
    return;
  }

  const productId = elements.saleProductInput.value;
  const quantity = Number(elements.saleQuantityInput.value);
  const product = state.products.find((item) => item.id === productId);
  if (!product || quantity <= 0) return;

  const existing = state.saleCart.find((item) => item.productId === productId);
  const reserved = state.saleCart
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);

  if (reserved + quantity > Number(product.quantity)) {
    window.alert("Quantidade maior do que o estoque disponivel.");
    return;
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.saleCart.push({
      productId,
      productName: product.name,
      quantity,
      unitPrice: Number(product.price),
      unitCost: Number(product.cost),
    });
  }

  elements.saleItemForm.reset();
  renderSaleCart();
}

function syncSaleChannelFields() {
  const isDelivery = elements.saleChannelInput.value === "entrega";
  elements.saleDeliveryFields.classList.toggle("hidden", !isDelivery);
  elements.saleCustomerInput.required = isDelivery;
  elements.saleDeliveryAddressInput.required = isDelivery;
  if (!isDelivery) {
    elements.saleCustomerInput.value = "";
    elements.saleDeliveryAddressInput.value = "";
    elements.saleDeliveryFeeInput.value = 0;
  }
  renderSaleCart();
}

async function handleSaleFinalize(event) {
  event.preventDefault();
  if (!can("saleWrite")) {
    window.alert("Seu perfil nao pode finalizar vendas.");
    return;
  }
  if (!state.cash.current) {
    window.alert("Abra o caixa antes de finalizar uma venda.");
    return;
  }
  if (!state.saleCart.length) {
    window.alert("Adicione itens a venda.");
    return;
  }
  if (elements.saleChannelInput.value === "entrega") {
    if (!elements.saleCustomerInput.value.trim()) {
      window.alert("Informe o nome do cliente para a entrega.");
      return;
    }
    if (!elements.saleDeliveryAddressInput.value.trim()) {
      window.alert("Informe o endereco da entrega.");
      return;
    }
  }

  try {
    await apiRequest("/sales", {
      method: "POST",
      data: {
        items: state.saleCart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        saleChannel: elements.saleChannelInput.value,
        paymentMethod: elements.salePaymentInput.value,
        customerName: elements.saleCustomerInput.value.trim(),
        deliveryAddress: elements.saleDeliveryAddressInput.value.trim(),
        deliveryFee: Number(elements.saleDeliveryFeeInput.value || 0),
        discount: Number(elements.saleDiscountInput.value || 0),
        note: elements.saleNoteInput.value.trim(),
      },
    });
    clearSaleCart();
    elements.saleFinalizeForm.reset();
    elements.saleDiscountInput.value = 0;
    elements.saleDeliveryFeeInput.value = 0;
    elements.saleChannelInput.value = "fisica";
    syncSaleChannelFields();
    await refreshAppData();
  } catch (error) {
    window.alert(error.message);
  }
}

function clearSaleCart() {
  state.saleCart = [];
  renderSaleCart();
}

function removeSaleItem(productId) {
  state.saleCart = state.saleCart.filter((item) => item.productId !== productId);
  renderSaleCart();
}

function getSaleTotals() {
  const subtotal = state.saleCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cost = state.saleCart.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const discount = Number(elements.saleDiscountInput.value || 0);
  const deliveryFee = elements.saleChannelInput.value === "entrega" ? Number(elements.saleDeliveryFeeInput.value || 0) : 0;
  const total = Math.max(subtotal - discount + deliveryFee, 0);
  const profit = total - cost;
  return { subtotal, discount, deliveryFee, total, profit };
}

function renderSaleCart() {
  const totals = getSaleTotals();

  elements.saleCartList.innerHTML = state.saleCart.length
    ? state.saleCart.map((item) => `
      <div class="list-item horizontal-item">
        <div>
          <strong>${escapeHtml(item.productName)}</strong>
          <small>${escapeHtml(item.quantity)} x ${escapeHtml(formatCurrency(item.unitPrice))}</small>
        </div>
        <div class="action-row">
          <span class="status-badge active">${escapeHtml(formatCurrency(item.unitPrice * item.quantity))}</span>
          <button class="tiny-btn danger" data-remove-sale="${item.productId}" ${can("saleWrite") ? "" : "disabled"}>Remover</button>
        </div>
      </div>`).join("")
    : emptyState("Carrinho vazio", "Adicione produtos para montar a venda.");

  elements.saleTotals.innerHTML = `
    <strong>Total da venda</strong>
    <small>Subtotal ${escapeHtml(formatCurrency(totals.subtotal))}</small>
    <small>Desconto ${escapeHtml(formatCurrency(totals.discount))}</small>
    <small>Taxa de entrega ${escapeHtml(formatCurrency(totals.deliveryFee))}</small>
    <small class="sale-total-emphasis">Total ${escapeHtml(formatCurrency(totals.total))}</small>
    <small>Lucro estimado ${escapeHtml(formatCurrency(totals.profit))}</small>
  `;

  elements.saleCartList.querySelectorAll("[data-remove-sale]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("saleWrite")) return;
      removeSaleItem(button.dataset.removeSale);
    });
  });
}

function renderSalesHistory() {
  elements.salesHistory.innerHTML = state.sales.length
    ? state.sales.slice(0, 8).map((sale) => `
      <div class="list-item">
        <strong>${escapeHtml(formatCurrency(sale.total))} • ${escapeHtml(capitalize(sale.paymentMethod))}</strong>
        <small>${escapeHtml(formatDate(sale.createdAt))} • ${escapeHtml(sale.itemCount)} itens</small>
        <span class="pill-line">Lucro ${escapeHtml(formatCurrency(sale.profit))}</span>
        <small>${escapeHtml(sale.note || "Sem observacao.")}</small>
      </div>`).join("")
    : emptyState("Nenhuma venda registrada", "As vendas finalizadas aparecerao aqui.");
}

function renderReports() {
  const summary = state.reports?.summary || [];
  elements.reportSummary.innerHTML = summary.map((item) => `
    <article class="stat-card">
      <small>${escapeHtml(item.label)}</small>
      <strong>${escapeHtml(item.value)}</strong>
    </article>`).join("");

  renderList(elements.topProductsList, state.reports?.topProducts, (item) => `
    <div class="list-item">
      <strong>${escapeHtml(item.productName)}</strong>
      <small>${escapeHtml(item.quantity)} unidades vendidas</small>
      <span class="pill-line">Receita ${escapeHtml(formatCurrency(item.revenue))}</span>
    </div>`, "Nenhum destaque ainda", "As vendas precisam acontecer para gerar ranking.");

  renderList(elements.paymentMethodsList, state.reports?.salesByPayment, (item) => `
    <div class="list-item">
      <strong>${escapeHtml(capitalize(item.method))}</strong>
      <span class="pill-line">${escapeHtml(formatCurrency(item.total))}</span>
    </div>`, "Sem pagamentos", "As formas de pagamento aparecem apos as vendas.");

  renderList(elements.reportRecentSales, state.reports?.recentSales, (sale) => `
    <div class="list-item">
      <strong>${escapeHtml(formatCurrency(sale.total))}</strong>
      <small>${escapeHtml(formatDate(sale.createdAt))} • ${escapeHtml(capitalize(sale.paymentMethod))}</small>
      <span class="pill-line">${escapeHtml(sale.itemCount)} itens</span>
      <small>Lucro ${escapeHtml(formatCurrency(sale.profit))}</small>
    </div>`, "Sem vendas recentes", "O resumo das ultimas vendas ficara aqui.");

  renderList(elements.stockSnapshotList, state.reports?.stockSnapshot, (item) => `
    <div class="list-item">
      <strong>${escapeHtml(item.name)}</strong>
      <small>${escapeHtml(item.category)}</small>
      <span class="pill-line">${escapeHtml(item.quantity)} unidades</span>
      <small>Minimo recomendado ${escapeHtml(item.minimum)}${item.expiryDate ? ` • Validade ${escapeHtml(formatShortDate(item.expiryDate))}` : ""}${item.ncm ? ` • NCM ${escapeHtml(item.ncm)}` : ""}</small>
    </div>`, "Sem itens", "O estoque precisa de produtos cadastrados.");

  elements.reportStartDateInput.value = state.reportFilters.startDate;
  elements.reportEndDateInput.value = state.reportFilters.endDate;
  elements.reportPaymentFilter.value = state.reportFilters.paymentMethod;
  elements.reportFilterSummary.textContent = buildReportFilterSummary();
}

async function handleReportFilterSubmit(event) {
  event.preventDefault();
  state.reportFilters.startDate = elements.reportStartDateInput.value;
  state.reportFilters.endDate = elements.reportEndDateInput.value;
  state.reportFilters.paymentMethod = elements.reportPaymentFilter.value;
  state.reportFilters.saleChannel = elements.reportSaleChannelFilter.value;

  try {
    state.reports = await apiRequest(`/reports${buildReportQueryString()}`);
    renderReports();
  } catch (error) {
    window.alert(error.message);
  }
}

async function resetReportFilters() {
  state.reportFilters = { startDate: "", endDate: "", paymentMethod: "", saleChannel: "" };
  elements.reportFiltersForm.reset();
  try {
    state.reports = await apiRequest("/reports");
    renderReports();
  } catch (error) {
    window.alert(error.message);
  }
}

function renderUsers() {
  if (!hasViewAccess("users")) return;

  const filtered = state.users.filter((user) => {
    const search = state.filters.userSearch;
    return !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
  });

  elements.usersTableBody.innerHTML = filtered.length
    ? filtered.map((user) => `
      <tr>
        <td>
          <strong>${escapeHtml(user.name)}</strong><br />
          <small>${escapeHtml(user.email)}</small>
        </td>
        <td>${escapeHtml(ROLE_LABELS[user.role] || user.role)}</td>
        <td><span class="status-badge ${user.status === "ativo" ? "active" : "inactive"}">${escapeHtml(capitalize(user.status))}</span></td>
        <td>${escapeHtml(formatDate(user.createdAt))}</td>
        <td>
          <div class="action-row">
            <button class="tiny-btn" data-edit-user="${user.id}" ${can("userManage") ? "" : "disabled"}>Editar</button>
            <button class="tiny-btn ${user.status === "ativo" ? "danger" : ""}" data-toggle-user="${user.id}" ${can("userManage") ? "" : "disabled"}>
              ${user.status === "ativo" ? "Desativar" : "Reativar"}
            </button>
          </div>
        </td>
      </tr>`).join("")
    : '<tr><td colspan="5">Nenhum usuario encontrado.</td></tr>';

  elements.usersTableBody.querySelectorAll("[data-edit-user]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("userManage")) return;
      const user = state.users.find((item) => item.id === button.dataset.editUser);
      if (user) populateUserForm(user);
    });
  });

  elements.usersTableBody.querySelectorAll("[data-toggle-user]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("userManage")) return;
      handleToggleUserStatus(button.dataset.toggleUser);
    });
  });
}

function populateUserForm(user) {
  elements.userIdInput.value = user.id;
  elements.userNameInput.value = user.name;
  elements.userEmailInput.value = user.email;
  elements.userRoleInput.value = user.role;
  elements.userStatusInput.value = user.status;
  elements.userPasswordInput.value = "";
  elements.userPasswordConfirmInput.value = "";
  elements.userSubmitBtn.textContent = "Atualizar usuario";
  elements.userFormHint.textContent = "Para editar sem trocar a senha, deixe os campos de senha em branco.";
}

function resetUserForm() {
  elements.userForm.reset();
  elements.userIdInput.value = "";
  elements.userRoleInput.value = "admin";
  elements.userStatusInput.value = "ativo";
  elements.userSubmitBtn.textContent = "Salvar usuario";
  elements.userPasswordConfirmInput.value = "";
  elements.userFormHint.textContent = "Para editar sem trocar a senha, deixe os campos de senha em branco.";
}

async function handleUserSubmit(event) {
  event.preventDefault();
  if (!can("userManage")) {
    window.alert("Seu perfil nao pode gerenciar usuarios.");
    return;
  }

  const userId = elements.userIdInput.value;
  const password = elements.userPasswordInput.value.trim();
  const passwordConfirm = elements.userPasswordConfirmInput.value.trim();

  if ((password || passwordConfirm) && password !== passwordConfirm) {
    window.alert("Senha e confirmacao de senha precisam ser iguais.");
    return;
  }

  const payload = {
    name: elements.userNameInput.value.trim(),
    email: elements.userEmailInput.value.trim().toLowerCase(),
    role: elements.userRoleInput.value,
    status: elements.userStatusInput.value,
    password,
  };

  const route = userId ? `/users/${userId}` : "/users";
  const method = userId ? "PUT" : "POST";

  try {
    await apiRequest(route, {
      method,
      data: payload,
    });
    resetUserForm();
    await refreshAppData();
    switchView("users");
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleToggleUserStatus(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;

  const nextStatus = user.status === "ativo" ? "inativo" : "ativo";
  const actionLabel = nextStatus === "ativo" ? "reativar" : "desativar";
  if (!window.confirm(`Deseja ${actionLabel} o usuario "${user.name}"?`)) return;

  try {
    await apiRequest(`/users/${userId}`, {
      method: "PUT",
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: nextStatus,
      },
    });
    await refreshAppData();
    switchView("users");
  } catch (error) {
    window.alert(error.message);
  }
}

function renderList(target, items, template, emptyTitle, emptyText) {
  target.innerHTML = items?.length ? items.map(template).join("") : emptyState(emptyTitle, emptyText);
}

async function handleExportExcel() {
  if (!can("reportExport")) {
    window.alert("Seu perfil nao pode exportar relatorios.");
    return;
  }

  try {
    const csv = await getReportsCsv(state.reportFilters);
    downloadTextFile(csv, "relatorio-adega.csv", "text/csv;charset=utf-8");
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleExportSupabase() {
  if (!can("reportSupabase")) {
    window.alert("Somente admins podem baixar o SQL do Supabase.");
    return;
  }

  try {
    const sql = await getSupabaseSqlExport();
    downloadTextFile(sql, "supabase-import.sql", "application/sql;charset=utf-8");
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleExportSuppliersCsv() {
  if (!can("supplierManage")) {
    window.alert("Seu perfil nao pode exportar fornecedores.");
    return;
  }

  try {
    const csv = await getSuppliersCsv();
    downloadTextFile(csv, "fornecedores-adega.csv", "text/csv;charset=utf-8");
  } catch (error) {
    window.alert(error.message);
  }
}

function handleExportPdf() {
  if (!can("reportExport")) {
    window.alert("Seu perfil nao pode exportar relatorios.");
    return;
  }
  if (!state.reports) {
    window.alert("Carregue os relatorios antes de exportar.");
    return;
  }

  const win = window.open("", "_blank", "width=960,height=720");
  if (!win) {
    window.alert("Nao foi possivel abrir a janela de impressao. Verifique se o navegador bloqueou pop-ups.");
    return;
  }

  const summary = (state.reports.summary || []).map((item) => `
      <tr>
        <td>${escapeHtml(item.label)}</td>
        <td>${escapeHtml(item.value)}</td>
      </tr>`).join("");
  const topProducts = (state.reports.topProducts || []).map((item) => `
      <tr>
        <td>${escapeHtml(item.productName)}</td>
        <td>${escapeHtml(String(item.quantity))}</td>
        <td>${escapeHtml(formatCurrency(item.revenue))}</td>
      </tr>`).join("");
  const payments = (state.reports.salesByPayment || []).map((item) => `
      <tr>
        <td>${escapeHtml(capitalize(item.method))}</td>
        <td>${escapeHtml(formatCurrency(item.total))}</td>
      </tr>`).join("");
  const channels = (state.reports.salesByChannel || []).map((item) => `
      <tr>
        <td>${escapeHtml(getSaleChannelLabel(item.channel))}</td>
        <td>${escapeHtml(String(item.count))}</td>
        <td>${escapeHtml(formatCurrency(item.total))}</td>
      </tr>`).join("");
  const recentSales = (state.reports.recentSales || []).map((sale) => `
      <tr>
        <td>${escapeHtml(formatDate(sale.createdAt))}</td>
        <td>${escapeHtml(capitalize(sale.paymentMethod))}</td>
        <td>${escapeHtml(getSaleChannelLabel(sale.saleChannel))}</td>
        <td>${escapeHtml(String(sale.itemCount))}</td>
        <td>${escapeHtml(formatCurrency(sale.total))}</td>
        <td>${escapeHtml(formatCurrency(sale.profit))}</td>
      </tr>`).join("");
  const stock = (state.reports.stockSnapshot || []).map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(String(item.quantity))}</td>
        <td>${escapeHtml(String(item.minimum))}</td>
      </tr>`).join("");

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Relatorio Style Narguille</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; color: #1f1f1f; }
      h1, h2 { margin-bottom: 8px; }
      p { color: #555; }
      section { margin-top: 28px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #d8d8d8; padding: 10px; text-align: left; font-size: 14px; }
      th { background: #f3f3f3; }
      .meta { margin-top: 0; }
    </style>
  </head>
  <body>
    <h1>Relatorio Style Narguille</h1>
    <p class="meta">${escapeHtml(buildReportFilterSummary())}</p>
    <p class="meta">Gerado em ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>
    <section><h2>Resumo</h2><table><thead><tr><th>Indicador</th><th>Valor</th></tr></thead><tbody>${summary || '<tr><td colspan="2">Sem dados.</td></tr>'}</tbody></table></section>
    <section><h2>Produtos mais vendidos</h2><table><thead><tr><th>Produto</th><th>Quantidade</th><th>Receita</th></tr></thead><tbody>${topProducts || '<tr><td colspan="3">Sem dados.</td></tr>'}</tbody></table></section>
    <section><h2>Vendas por pagamento</h2><table><thead><tr><th>Forma</th><th>Total</th></tr></thead><tbody>${payments || '<tr><td colspan="2">Sem dados.</td></tr>'}</tbody></table></section>
    <section><h2>Vendas por canal</h2><table><thead><tr><th>Canal</th><th>Quantidade</th><th>Total</th></tr></thead><tbody>${channels || '<tr><td colspan="3">Sem dados.</td></tr>'}</tbody></table></section>
    <section><h2>Vendas recentes</h2><table><thead><tr><th>Data</th><th>Pagamento</th><th>Canal</th><th>Itens</th><th>Total</th><th>Lucro</th></tr></thead><tbody>${recentSales || '<tr><td colspan="6">Sem dados.</td></tr>'}</tbody></table></section>
    <section><h2>Estoque</h2><table><thead><tr><th>Produto</th><th>Categoria</th><th>Quantidade</th><th>Minimo</th></tr></thead><tbody>${stock || '<tr><td colspan="4">Sem dados.</td></tr>'}</tbody></table></section>
    <script>window.onload = () => window.print();</script>
  </body>
</html>`);
  win.document.close();
}

function emptyState(title, text) {
  return `<div class="list-item"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(text)}</small></div>`;
}

function setFeedback(message, status) {
  elements.authFeedback.textContent = message;
  elements.authFeedback.className = status ? `feedback ${status}` : "feedback";
}

async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const url = new URL(path, "https://app.local");
  const route = url.pathname.split("/").filter(Boolean);
  const [resource = "", resourceId = "", third = ""] = route;
  const auth = options.auth === false ? null : await requireSession();
  const payload = options.data ?? parseRequestBody(options.body);

  if (resource === "auth" && resourceId === "login" && method === "POST") return handleAuthLogin(payload);
  if (resource === "auth" && resourceId === "register" && method === "POST") return handleAuthRegister(payload);
  if (resource === "auth" && resourceId === "logout" && method === "POST") return { ok: true };

  if (resource === "me" && method === "GET") return { user: publicUser(auth.user) };
  if (resource === "dashboard" && method === "GET") return getDashboardPayload();
  if (resource === "users" && method === "GET") {
    ensurePermission(auth, "userManage");
    return { items: (await loadUsers()).map(publicUser) };
  }
  if (resource === "users" && method === "POST") {
    ensurePermission(auth, "userManage");
    return handleUsersPost(payload);
  }
  if (resource === "users" && resourceId && method === "PUT") {
    ensurePermission(auth, "userManage");
    return handleUsersPut(payload, auth, resourceId);
  }
  if (resource === "products" && method === "GET") return { items: await loadProducts() };
  if (resource === "products" && method === "POST") {
    ensurePermission(auth, "productWrite");
    return handleProductsPost(payload);
  }
  if (resource === "products" && resourceId && method === "PUT") {
    ensurePermission(auth, "productWrite");
    return handleProductsPut(payload, resourceId);
  }
  if (resource === "products" && resourceId && method === "DELETE") {
    ensurePermission(auth, "productWrite");
    return handleProductsDelete(resourceId);
  }
  if (resource === "suppliers" && method === "GET") return { items: await loadSuppliers() };
  if (resource === "suppliers" && method === "POST") {
    ensurePermission(auth, "supplierManage");
    return handleSuppliersPost(payload);
  }
  if (resource === "suppliers" && resourceId && method === "PUT") {
    ensurePermission(auth, "supplierManage");
    return handleSuppliersPut(payload, resourceId);
  }
  if (resource === "purchase-invoices" && method === "GET") return { items: await loadPurchaseInvoices() };
  if (resource === "purchase-invoices" && method === "POST") {
    ensurePermission(auth, "movementWrite");
    return handlePurchaseInvoicesPost(payload);
  }
  if (resource === "supplier-returns" && method === "GET") return { items: await loadSupplierReturns() };
  if (resource === "supplier-returns" && method === "POST") {
    ensurePermission(auth, "movementWrite");
    return handleSupplierReturnsPost(payload);
  }
  if (resource === "movements" && method === "GET") return { items: await loadMovements() };
  if (resource === "movements" && method === "POST") {
    ensurePermission(auth, "movementWrite");
    return handleMovementsPost(payload);
  }
  if (resource === "sales" && method === "GET") return { items: await loadSales() };
  if (resource === "sales" && method === "POST") {
    ensurePermission(auth, "saleWrite");
    return handleSalesPost(payload, auth);
  }
  if (resource === "cash" && resourceId === "current" && method === "GET") {
    return { current: await getOpenCashSession(), history: (await loadCashSessions()).slice(0, 8) };
  }
  if (resource === "cash" && resourceId === "open" && method === "POST") {
    ensurePermission(auth, "cashOpen");
    return handleCashOpenRequest(payload, auth);
  }
  if (resource === "cash" && resourceId === "close" && method === "POST") {
    ensurePermission(auth, "cashManage");
    return handleCashCloseRequest(payload, auth);
  }
  if (resource === "reports" && method === "GET") return getReportsPayload(Object.fromEntries(url.searchParams.entries()));
  if (resource === "database" && resourceId === "export" && third === "supabase-sql" && method === "GET") {
    ensurePermission(auth, "reportSupabase");
    return { sql: await getSupabaseSqlExport() };
  }

  throw new Error("Rota nao encontrada.");
}

function downloadTextFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseRequestBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

async function requireSession() {
  if (!state.token) throw new Error("Sessao invalida. Faca login novamente.");
  const user = await getUserById(state.token);
  if (!user) throw new Error("Usuario nao encontrado.");
  if ((user.status || "ativo") !== "ativo") {
    throw new Error("Usuario inativo. Procure um administrador.");
  }
  return { user };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || "ativo",
    createdAt: user.createdAt,
  };
}

function ensurePermission(auth, permission) {
  if (!auth || !can(permission)) {
    throw new Error("Seu perfil nao tem permissao para esta acao.");
  }
}

async function supabaseRequest(method, resource, { query = {}, body, prefer } = {}) {
  const queryString = new URLSearchParams(query).toString();
  const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${resource}${queryString ? `?${queryString}` : ""}`;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };

  if (prefer) headers.Prefer = prefer;
  if (body !== undefined) headers["Content-Type"] = "application/json; charset=utf-8";

  const response = await fetch(endpoint, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    let message = `Falha ao acessar o Supabase (${method} ${resource}).`;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error_description || parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function getRows(table, query = {}, select = "*") {
  const result = await supabaseRequest("GET", table, { query: { select, ...query } });
  return Array.isArray(result) ? result : result ? [result] : [];
}

async function deleteRows(table, query) {
  await supabaseRequest("DELETE", table, { query });
}

async function upsertRows(table, rows) {
  if (!rows?.length) return;
  await supabaseRequest("POST", table, {
    query: { on_conflict: "id" },
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}

async function updateRows(table, query, body) {
  await supabaseRequest("PATCH", table, {
    query,
    body,
    prefer: "return=representation",
  });
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role || "admin",
    status: row.status || "ativo",
    createdAt: row.created_at,
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    supplierId: row.supplier_id || null,
    ncm: row.ncm || "",
    cfop: row.cfop || "",
    taxCode: row.tax_code || "",
    taxRate: Number(row.tax_rate || 0),
    price: Number(row.price || 0),
    cost: Number(row.cost || 0),
    quantity: Number(row.quantity || 0),
    minimum: Number(row.minimum_quantity || 0),
    expiryDate: row.expiry_date || null,
    status: row.status || "ativo",
    createdAt: row.created_at,
  };
}

function mapSupplier(row) {
  return {
    id: row.id,
    name: row.name,
    document: row.document || "",
    contactName: row.contact_name || "",
    phone: row.phone || "",
    email: row.email || "",
    status: row.status || "ativo",
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

function mapMovement(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    type: row.type,
    quantity: Number(row.quantity || 0),
    note: row.note || "",
    createdAt: row.created_at,
  };
}

function mapCashSession(row) {
  return {
    id: row.id,
    openingAmount: Number(row.opening_amount || 0),
    salesTotal: Number(row.sales_total || 0),
    salesCount: Number(row.sales_count || 0),
    expectedBalance: Number(row.expected_balance || 0),
    actualClosingAmount: row.actual_closing_amount == null ? null : Number(row.actual_closing_amount),
    difference: row.difference == null ? null : Number(row.difference),
    note: row.note || "",
    closeNote: row.close_note || null,
    openedBy: row.opened_by || "",
    openedAt: row.opened_at,
    closedAt: row.closed_at || null,
    closedBy: row.closed_by || null,
  };
}

function mapPurchaseInvoice(row) {
  return {
    id: row.id,
    supplierId: row.supplier_id || null,
    supplierName: row.supplier_name,
    invoiceNumber: row.invoice_number,
    issuedAt: row.issued_at,
    itemCount: Number(row.item_count || 0),
    totalAmount: Number(row.total_amount || 0),
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

function mapPurchaseInvoiceItem(row) {
  return {
    id: row.id,
    purchaseInvoiceId: row.purchase_invoice_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: Number(row.quantity || 0),
    unitCost: Number(row.unit_cost || 0),
    lineTotal: Number(row.line_total || 0),
  };
}

function mapSupplierReturn(row) {
  return {
    id: row.id,
    supplierId: row.supplier_id || null,
    supplierName: row.supplier_name,
    referenceNumber: row.reference_number,
    returnedAt: row.returned_at,
    itemCount: Number(row.item_count || 0),
    totalAmount: Number(row.total_amount || 0),
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

function mapSupplierReturnItem(row) {
  return {
    id: row.id,
    supplierReturnId: row.supplier_return_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: Number(row.quantity || 0),
    unitCost: Number(row.unit_cost || 0),
    lineTotal: Number(row.line_total || 0),
  };
}

function toUserRow(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role,
    status: user.status,
    created_at: user.createdAt,
  };
}

function toProductRow(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    supplier_id: product.supplierId || null,
    ncm: product.ncm || "",
    cfop: product.cfop || "",
    tax_code: product.taxCode || "",
    tax_rate: Number(product.taxRate || 0),
    price: Number(product.price || 0),
    cost: Number(product.cost || 0),
    quantity: Number(product.quantity || 0),
    minimum_quantity: Number(product.minimum || 0),
    expiry_date: product.expiryDate || null,
    status: product.status,
    created_at: product.createdAt,
  };
}

function toMovementRow(movement) {
  return {
    id: movement.id,
    product_id: movement.productId,
    product_name: movement.productName,
    type: movement.type,
    quantity: Number(movement.quantity || 0),
    note: movement.note || "",
    created_at: movement.createdAt,
  };
}

function toSupplierRow(supplier) {
  return {
    id: supplier.id,
    name: supplier.name,
    document: supplier.document || "",
    contact_name: supplier.contactName || "",
    phone: supplier.phone || "",
    email: supplier.email || "",
    status: supplier.status || "ativo",
    notes: supplier.notes || "",
    created_at: supplier.createdAt,
  };
}

function toCashSessionRow(session) {
  return {
    id: session.id,
    opening_amount: Number(session.openingAmount || 0),
    sales_total: Number(session.salesTotal || 0),
    sales_count: Number(session.salesCount || 0),
    expected_balance: Number(session.expectedBalance || 0),
    actual_closing_amount: session.actualClosingAmount == null ? null : Number(session.actualClosingAmount),
    difference: session.difference == null ? null : Number(session.difference),
    note: session.note || "",
    close_note: session.closeNote || null,
    opened_by: session.openedBy || "",
    opened_at: session.openedAt,
    closed_at: session.closedAt || null,
    closed_by: session.closedBy || null,
  };
}

function toPurchaseInvoiceRow(invoice) {
  return {
    id: invoice.id,
    supplier_id: invoice.supplierId || null,
    supplier_name: invoice.supplierName,
    invoice_number: invoice.invoiceNumber,
    issued_at: invoice.issuedAt,
    item_count: Number(invoice.itemCount || 0),
    total_amount: Number(invoice.totalAmount || 0),
    notes: invoice.notes || "",
    created_at: invoice.createdAt,
  };
}

function toPurchaseInvoiceItemRow(invoiceId, item) {
  return {
    id: item.id || createId(),
    purchase_invoice_id: invoiceId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: Number(item.quantity || 0),
    unit_cost: Number(item.unitCost || 0),
    line_total: Number(item.lineTotal || 0),
  };
}

function toSupplierReturnRow(entry) {
  return {
    id: entry.id,
    supplier_id: entry.supplierId || null,
    supplier_name: entry.supplierName,
    reference_number: entry.referenceNumber,
    returned_at: entry.returnedAt,
    item_count: Number(entry.itemCount || 0),
    total_amount: Number(entry.totalAmount || 0),
    notes: entry.notes || "",
    created_at: entry.createdAt,
  };
}

function toSupplierReturnItemRow(returnId, item) {
  return {
    id: item.id || createId(),
    supplier_return_id: returnId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: Number(item.quantity || 0),
    unit_cost: Number(item.unitCost || 0),
    line_total: Number(item.lineTotal || 0),
  };
}

function toSaleRow(sale) {
  return {
    id: sale.id,
    item_count: Number(sale.itemCount || 0),
    subtotal: Number(sale.subtotal || 0),
    discount: Number(sale.discount || 0),
    total: Number(sale.total || 0),
    cost_total: Number(sale.costTotal || 0),
    profit: Number(sale.profit || 0),
    sale_channel: sale.saleChannel || "fisica",
    payment_method: sale.paymentMethod,
    customer_name: sale.customerName || "",
    delivery_address: sale.deliveryAddress || "",
    delivery_fee: Number(sale.deliveryFee || 0),
    note: sale.note || "",
    seller_name: sale.sellerName || "",
    cash_session_id: sale.cashSessionId || null,
    created_at: sale.createdAt,
  };
}

function toSaleItemRow(saleId, item) {
  return {
    id: item.id || createId(),
    sale_id: saleId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: Number(item.quantity || 0),
    unit_price: Number(item.unitPrice || 0),
    unit_cost: Number(item.unitCost || 0),
    line_total: Number(item.lineTotal || 0),
    line_cost: Number(item.lineCost || 0),
  };
}

async function loadUsers() {
  return (await getRows("app_users", { order: "name.asc" })).map(mapUser);
}

async function loadProducts() {
  return (await getRows("products", { order: "name.asc" })).map(mapProduct);
}

async function loadSuppliers() {
  try {
    return (await getRows("suppliers", { order: "name.asc" })).map(mapSupplier);
  } catch (error) {
    if (String(error.message || "").includes("public.suppliers")) {
      return [];
    }
    throw error;
  }
}

async function loadMovements() {
  return (await getRows("stock_movements", { order: "created_at.desc" })).map(mapMovement);
}

async function loadCashSessions() {
  return (await getRows("cash_sessions", { order: "opened_at.desc" })).map(mapCashSession);
}

async function loadPurchaseInvoices() {
  return (await getRows("purchase_invoices", { order: "created_at.desc" })).map(mapPurchaseInvoice);
}

async function loadPurchaseInvoiceItems() {
  return (await getRows("purchase_invoice_items", { order: "purchase_invoice_id.asc" })).map(mapPurchaseInvoiceItem);
}

async function loadSupplierReturns() {
  return (await getRows("supplier_returns", { order: "created_at.desc" })).map(mapSupplierReturn);
}

async function loadSupplierReturnItems() {
  return (await getRows("supplier_return_items", { order: "supplier_return_id.asc" })).map(mapSupplierReturnItem);
}

async function loadSales() {
  const salesRows = await getRows("sales", { order: "created_at.desc" });
  if (!salesRows.length) return [];

  const saleIds = salesRows.map((row) => row.id).join(",");
  const itemRows = await getRows("sale_items", { sale_id: `in.(${saleIds})`, order: "sale_id.asc" });
  const itemsMap = new Map();

  for (const item of itemRows) {
    if (!itemsMap.has(item.sale_id)) itemsMap.set(item.sale_id, []);
    itemsMap.get(item.sale_id).push({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unit_price || 0),
      unitCost: Number(item.unit_cost || 0),
      lineTotal: Number(item.line_total || 0),
      lineCost: Number(item.line_cost || 0),
    });
  }

  return salesRows.map((row) => ({
    id: row.id,
    items: itemsMap.get(row.id) || [],
    itemCount: Number(row.item_count || 0),
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    costTotal: Number(row.cost_total || 0),
    profit: Number(row.profit || 0),
    saleChannel: row.sale_channel || "fisica",
    paymentMethod: row.payment_method,
    customerName: row.customer_name || "",
    deliveryAddress: row.delivery_address || "",
    deliveryFee: Number(row.delivery_fee || 0),
    note: row.note || "",
    sellerName: row.seller_name || "",
    cashSessionId: row.cash_session_id || null,
    createdAt: row.created_at,
  }));
}

async function getUserById(userId) {
  const rows = await getRows("app_users", { id: `eq.${userId}`, limit: "1" });
  return rows[0] ? mapUser(rows[0]) : null;
}

async function getUserByEmail(email) {
  const rows = await getRows("app_users", { email: `eq.${email}`, limit: "1" });
  return rows[0] ? mapUser(rows[0]) : null;
}

async function getProductById(productId) {
  const rows = await getRows("products", { id: `eq.${productId}`, limit: "1" });
  return rows[0] ? mapProduct(rows[0]) : null;
}

async function getOpenCashSession() {
  const rows = await getRows("cash_sessions", {
    closed_at: "is.null",
    order: "opened_at.desc",
    limit: "1",
  });
  return rows[0] ? mapCashSession(rows[0]) : null;
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(String(password || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, "0")).join("");
}

function createId() {
  return crypto.randomUUID();
}

function getNowIso() {
  return new Date().toISOString();
}

function parseDateStart(value) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function parseDateEnd(value) {
  return value ? new Date(`${value}T23:59:59.999Z`) : null;
}

function filterSalesByQuery(sales, query) {
  const startDate = parseDateStart(query.startDate);
  const endDate = parseDateEnd(query.endDate);
  const paymentMethod = query.paymentMethod;
  const saleChannel = query.saleChannel;

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    if (startDate && saleDate < startDate) return false;
    if (endDate && saleDate > endDate) return false;
    if (paymentMethod && sale.paymentMethod !== paymentMethod) return false;
    if (saleChannel && sale.saleChannel !== saleChannel) return false;
    return true;
  });
}

async function getDashboardPayload() {
  const [products, movements, sales] = await Promise.all([loadProducts(), loadMovements(), loadSales()]);
  const lowStock = products.filter((item) => item.status === "ativo" && Number(item.quantity) <= Number(item.minimum));
  const expiringProducts = products
    .filter((item) => item.status === "ativo" && ["warning", "expired"].includes(getExpiryStatus(item.expiryDate)))
    .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate))
    .slice(0, 5);
  const todayKey = new Date().toISOString().slice(0, 10);
  let todayRevenue = 0;
  let todayProfit = 0;

  for (const sale of sales) {
    if (String(sale.createdAt).slice(0, 10) === todayKey) {
      todayRevenue += Number(sale.total || 0);
      todayProfit += Number(sale.profit || 0);
    }
  }

  return {
    stats: [
      { label: "Produtos cadastrados", value: products.length },
      { label: "Estoque baixo", value: lowStock.length },
      { label: "Validade proxima", value: expiringProducts.length },
      { label: "Vendas de hoje", value: formatCurrency(todayRevenue) },
      { label: "Lucro de hoje", value: formatCurrency(todayProfit) },
    ],
    lowStock,
    expiringProducts,
    recentMovements: movements.slice(0, 5),
  };
}

async function getReportsPayload(query = {}) {
  const [salesRaw, products] = await Promise.all([loadSales(), loadProducts()]);
  const sales = filterSalesByQuery(salesRaw, query);
  let revenue = 0;
  let profit = 0;
  let itemsSold = 0;
  const paymentMap = new Map();
  const channelMap = new Map();
  const productMap = new Map();

  for (const sale of sales) {
    revenue += Number(sale.total || 0);
    profit += Number(sale.profit || 0);
    paymentMap.set(sale.paymentMethod, (paymentMap.get(sale.paymentMethod) || 0) + Number(sale.total || 0));
    const channelEntry = channelMap.get(sale.saleChannel) || { channel: sale.saleChannel, total: 0, count: 0 };
    channelEntry.total += Number(sale.total || 0);
    channelEntry.count += 1;
    channelMap.set(sale.saleChannel, channelEntry);

    for (const item of sale.items || []) {
      itemsSold += Number(item.quantity || 0);
      if (!productMap.has(item.productName)) {
        productMap.set(item.productName, { productName: item.productName, quantity: 0, revenue: 0 });
      }
      const current = productMap.get(item.productName);
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.lineTotal || 0);
    }
  }

  const avgTicket = sales.length ? revenue / sales.length : 0;
  return {
    summary: [
      { label: "Faturamento total", value: formatCurrency(revenue) },
      { label: "Lucro total", value: formatCurrency(profit) },
      { label: "Ticket medio", value: formatCurrency(avgTicket) },
      { label: "Itens vendidos", value: itemsSold },
    ],
    salesByPayment: Array.from(paymentMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([method, total]) => ({ method, total })),
    salesByChannel: Array.from(channelMap.values()).sort((a, b) => a.channel.localeCompare(b.channel)),
    topProducts: Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    recentSales: sales.slice(0, 6),
    stockSnapshot: [...products].sort((a, b) => a.quantity - b.quantity).slice(0, 6),
  };
}

function csvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

async function getReportsCsv(query = {}) {
  const reports = await getReportsPayload(query);
  const rows = ["secao;campo;valor1;valor2;valor3"];

  for (const item of reports.summary) {
    rows.push([csvValue("Resumo"), csvValue(item.label), csvValue(item.value), csvValue(""), csvValue("")].join(";"));
  }
  for (const item of reports.topProducts) {
    rows.push([csvValue("Produtos mais vendidos"), csvValue(item.productName), csvValue(item.quantity), csvValue(Number(item.revenue || 0).toFixed(2).replace(".", ",")), csvValue("")].join(";"));
  }
  for (const item of reports.salesByPayment) {
    rows.push([csvValue("Vendas por pagamento"), csvValue(item.method), csvValue(Number(item.total || 0).toFixed(2).replace(".", ",")), csvValue(""), csvValue("")].join(";"));
  }
  for (const item of reports.salesByChannel || []) {
    rows.push([csvValue("Vendas por canal"), csvValue(getSaleChannelLabel(item.channel)), csvValue(item.count), csvValue(Number(item.total || 0).toFixed(2).replace(".", ",")), csvValue("")].join(";"));
  }
  for (const sale of reports.recentSales) {
    rows.push([csvValue("Vendas recentes"), csvValue(sale.createdAt), csvValue(`${sale.paymentMethod} / ${getSaleChannelLabel(sale.saleChannel)}`), csvValue(sale.itemCount), csvValue(Number(sale.total || 0).toFixed(2).replace(".", ","))].join(";"));
  }
  for (const item of reports.stockSnapshot) {
    rows.push([csvValue("Estoque"), csvValue(item.name), csvValue(item.category), csvValue(item.quantity), csvValue(item.minimum)].join(";"));
  }
  return `\uFEFF${rows.join("\r\n")}`;
}

async function getSuppliersCsv() {
  const suppliers = await loadSuppliers();
  const rows = [
    ["nome", "documento", "contato", "telefone", "email", "status", "observacao", "cadastro"].join(";"),
  ];

  for (const supplier of suppliers) {
    rows.push([
      csvValue(supplier.name),
      csvValue(supplier.document),
      csvValue(supplier.contactName),
      csvValue(supplier.phone),
      csvValue(supplier.email),
      csvValue(supplier.status),
      csvValue(supplier.notes),
      csvValue(supplier.createdAt),
    ].join(";"));
  }

  return `\uFEFF${rows.join("\r\n")}`;
}

function toSqlLiteral(value) {
  if (value == null) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insertStatement(table, columns, values) {
  return `insert into public.${table} (${columns.join(", ")}) values (${values.map(toSqlLiteral).join(", ")}) on conflict (id) do nothing;`;
}

async function getSupabaseSqlExport() {
  const [users, products, suppliers, purchaseInvoices, purchaseInvoiceItems, supplierReturns, supplierReturnItems, movements, sales, cashSessions] = await Promise.all([
    loadUsers(),
    loadProducts(),
    loadSuppliers(),
    loadPurchaseInvoices(),
    loadPurchaseInvoiceItems(),
    loadSupplierReturns(),
    loadSupplierReturnItems(),
    loadMovements(),
    loadSales(),
    loadCashSessions(),
  ]);

  const lines = [
    "-- Exportacao gerada no navegador.",
    "create extension if not exists pgcrypto;",
    "",
    "create table if not exists public.app_users (id uuid primary key, name text not null, email text not null unique, password_hash text not null, role text not null default 'admin', status text not null default 'ativo', created_at timestamptz not null default now());",
    "create table if not exists public.suppliers (id uuid primary key, name text not null, document text, contact_name text, phone text, email text, status text not null default 'ativo', notes text, created_at timestamptz not null default now());",
    "create table if not exists public.products (id uuid primary key, name text not null, category text not null, brand text not null, supplier_id uuid references public.suppliers(id), ncm text, cfop text, tax_code text, tax_rate numeric(6,2) not null default 0, price numeric(12,2) not null default 0, cost numeric(12,2) not null default 0, quantity integer not null default 0, minimum_quantity integer not null default 0, expiry_date date, status text not null default 'ativo', created_at timestamptz not null default now());",
    "create table if not exists public.purchase_invoices (id uuid primary key, supplier_id uuid references public.suppliers(id), supplier_name text not null, invoice_number text not null, issued_at date not null, item_count integer not null default 0, total_amount numeric(12,2) not null default 0, notes text, created_at timestamptz not null default now());",
    "create table if not exists public.purchase_invoice_items (id uuid primary key default gen_random_uuid(), purchase_invoice_id uuid not null references public.purchase_invoices(id) on delete cascade, product_id uuid references public.products(id), product_name text not null, quantity integer not null default 0, unit_cost numeric(12,2) not null default 0, line_total numeric(12,2) not null default 0);",
    "create table if not exists public.supplier_returns (id uuid primary key, supplier_id uuid references public.suppliers(id), supplier_name text not null, reference_number text not null, returned_at date not null, item_count integer not null default 0, total_amount numeric(12,2) not null default 0, notes text, created_at timestamptz not null default now());",
    "create table if not exists public.supplier_return_items (id uuid primary key default gen_random_uuid(), supplier_return_id uuid not null references public.supplier_returns(id) on delete cascade, product_id uuid references public.products(id), product_name text not null, quantity integer not null default 0, unit_cost numeric(12,2) not null default 0, line_total numeric(12,2) not null default 0);",
    "create table if not exists public.cash_sessions (id uuid primary key, opening_amount numeric(12,2) not null default 0, sales_total numeric(12,2) not null default 0, sales_count integer not null default 0, expected_balance numeric(12,2) not null default 0, actual_closing_amount numeric(12,2), difference numeric(12,2), note text, close_note text, opened_by text, opened_at timestamptz not null default now(), closed_at timestamptz, closed_by text);",
    "create table if not exists public.sales (id uuid primary key, item_count integer not null default 0, subtotal numeric(12,2) not null default 0, discount numeric(12,2) not null default 0, total numeric(12,2) not null default 0, cost_total numeric(12,2) not null default 0, profit numeric(12,2) not null default 0, sale_channel text not null default 'fisica', payment_method text not null, customer_name text, delivery_address text, delivery_fee numeric(12,2) not null default 0, note text, seller_name text, cash_session_id uuid references public.cash_sessions(id), created_at timestamptz not null default now());",
    "create table if not exists public.sale_items (id uuid primary key default gen_random_uuid(), sale_id uuid not null references public.sales(id) on delete cascade, product_id uuid references public.products(id), product_name text not null, quantity integer not null default 0, unit_price numeric(12,2) not null default 0, unit_cost numeric(12,2) not null default 0, line_total numeric(12,2) not null default 0, line_cost numeric(12,2) not null default 0);",
    "create table if not exists public.stock_movements (id uuid primary key, product_id uuid references public.products(id) on delete set null, product_name text not null, type text not null, quantity integer not null default 0, note text, created_at timestamptz not null default now());",
    "",
    "begin;",
  ];

  for (const user of users) {
    lines.push(insertStatement("app_users", ["id", "name", "email", "password_hash", "role", "status", "created_at"], [user.id, user.name, user.email, user.passwordHash, user.role, user.status, user.createdAt]));
  }
  for (const product of products) {
    lines.push(insertStatement("products", ["id", "name", "category", "brand", "supplier_id", "ncm", "cfop", "tax_code", "tax_rate", "price", "cost", "quantity", "minimum_quantity", "expiry_date", "status", "created_at"], [product.id, product.name, product.category, product.brand, product.supplierId, product.ncm, product.cfop, product.taxCode, product.taxRate, product.price, product.cost, product.quantity, product.minimum, product.expiryDate, product.status, product.createdAt]));
  }
  for (const supplier of suppliers) {
    lines.push(insertStatement("suppliers", ["id", "name", "document", "contact_name", "phone", "email", "status", "notes", "created_at"], [supplier.id, supplier.name, supplier.document, supplier.contactName, supplier.phone, supplier.email, supplier.status, supplier.notes, supplier.createdAt]));
  }
  for (const invoice of purchaseInvoices) {
    lines.push(insertStatement("purchase_invoices", ["id", "supplier_id", "supplier_name", "invoice_number", "issued_at", "item_count", "total_amount", "notes", "created_at"], [invoice.id, invoice.supplierId, invoice.supplierName, invoice.invoiceNumber, invoice.issuedAt, invoice.itemCount, invoice.totalAmount, invoice.notes, invoice.createdAt]));
  }
  for (const item of purchaseInvoiceItems) {
    lines.push(insertStatement("purchase_invoice_items", ["id", "purchase_invoice_id", "product_id", "product_name", "quantity", "unit_cost", "line_total"], [item.id, item.purchaseInvoiceId, item.productId, item.productName, item.quantity, item.unitCost, item.lineTotal]));
  }
  for (const entry of supplierReturns) {
    lines.push(insertStatement("supplier_returns", ["id", "supplier_id", "supplier_name", "reference_number", "returned_at", "item_count", "total_amount", "notes", "created_at"], [entry.id, entry.supplierId, entry.supplierName, entry.referenceNumber, entry.returnedAt, entry.itemCount, entry.totalAmount, entry.notes, entry.createdAt]));
  }
  for (const item of supplierReturnItems) {
    lines.push(insertStatement("supplier_return_items", ["id", "supplier_return_id", "product_id", "product_name", "quantity", "unit_cost", "line_total"], [item.id, item.supplierReturnId, item.productId, item.productName, item.quantity, item.unitCost, item.lineTotal]));
  }
  for (const session of cashSessions) {
    lines.push(insertStatement("cash_sessions", ["id", "opening_amount", "sales_total", "sales_count", "expected_balance", "actual_closing_amount", "difference", "note", "close_note", "opened_by", "opened_at", "closed_at", "closed_by"], [session.id, session.openingAmount, session.salesTotal, session.salesCount, session.expectedBalance, session.actualClosingAmount, session.difference, session.note, session.closeNote, session.openedBy, session.openedAt, session.closedAt, session.closedBy]));
  }
  for (const sale of sales) {
    lines.push(insertStatement("sales", ["id", "item_count", "subtotal", "discount", "total", "cost_total", "profit", "sale_channel", "payment_method", "customer_name", "delivery_address", "delivery_fee", "note", "seller_name", "cash_session_id", "created_at"], [sale.id, sale.itemCount, sale.subtotal, sale.discount, sale.total, sale.costTotal, sale.profit, sale.saleChannel, sale.paymentMethod, sale.customerName, sale.deliveryAddress, sale.deliveryFee, sale.note, sale.sellerName, sale.cashSessionId, sale.createdAt]));
    for (const item of sale.items || []) {
      lines.push(insertStatement("sale_items", ["id", "sale_id", "product_id", "product_name", "quantity", "unit_price", "unit_cost", "line_total", "line_cost"], [item.id || createId(), sale.id, item.productId, item.productName, item.quantity, item.unitPrice, item.unitCost, item.lineTotal, item.lineCost]));
    }
  }
  for (const movement of movements) {
    lines.push(insertStatement("stock_movements", ["id", "product_id", "product_name", "type", "quantity", "note", "created_at"], [movement.id, movement.productId, movement.productName, movement.type, movement.quantity, movement.note, movement.createdAt]));
  }

  lines.push("commit;");
  return lines.join("\r\n");
}

async function handleAuthLogin(body) {
  const user = await getUserByEmail(String(body.email || "").trim().toLowerCase());
  const passwordHash = await hashPassword(body.password || "");
  if (!user || user.passwordHash !== passwordHash) {
    throw new Error("E-mail ou senha invalidos.");
  }
  if ((user.status || "ativo") !== "ativo") {
    throw new Error("Usuario inativo. Procure um administrador.");
  }
  return { token: user.id, user: publicUser(user) };
}

async function handleAuthRegister(body) {
  if (!body.name || !body.email || !body.password) {
    throw new Error("Nome, e-mail e senha sao obrigatorios.");
  }

  const email = String(body.email).trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Este e-mail ja esta cadastrado.");
  }

  const users = await loadUsers();
  const role = users.length === 0 ? "admin" : "attendant";
  const user = {
    id: createId(),
    name: body.name.trim(),
    email,
    passwordHash: await hashPassword(body.password),
    role,
    status: "ativo",
    createdAt: getNowIso(),
  };

  await upsertRows("app_users", [toUserRow(user)]);
  return {
    token: user.id,
    user: publicUser(user),
    message: role === "admin" ? "Cadastro inicial realizado com sucesso." : "Conta criada com perfil atendente.",
  };
}

async function handleUsersPost(body) {
  if (!body.name || !body.email || !body.password) {
    throw new Error("Nome, e-mail e senha sao obrigatorios.");
  }

  const email = String(body.email).trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Ja existe um usuario com este e-mail.");
  }

  const user = {
    id: createId(),
    name: body.name.trim(),
    email,
    passwordHash: await hashPassword(body.password),
    role: body.role || "attendant",
    status: body.status || "ativo",
    createdAt: getNowIso(),
  };

  await upsertRows("app_users", [toUserRow(user)]);
  return { item: publicUser(user) };
}

async function handleUsersPut(body, auth, userId) {
  const users = await loadUsers();
  const target = users.find((item) => item.id === userId);
  if (!target) {
    throw new Error("Usuario nao encontrado.");
  }

  const email = String(body.email || target.email).trim().toLowerCase();
  const sameEmail = users.find((item) => item.email === email && item.id !== userId);
  if (sameEmail) {
    throw new Error("Ja existe um usuario com este e-mail.");
  }

  const updated = {
    ...target,
    name: body.name?.trim() || target.name,
    email,
    role: body.role || target.role,
    status: body.status || target.status,
  };

  if (auth.user.id === userId && auth.user.role === "admin") {
    if (updated.role !== "admin") {
      throw new Error("Voce nao pode remover seu proprio perfil de admin.");
    }
    if (updated.status !== "ativo") {
      throw new Error("Voce nao pode desativar seu proprio usuario admin.");
    }
  }

  if (body.password) {
    updated.passwordHash = await hashPassword(body.password);
  }

  const activeAdmins = users.reduce((count, item) => {
    const candidate = item.id === userId ? updated : item;
    return count + (candidate.role === "admin" && (candidate.status || "ativo") === "ativo" ? 1 : 0);
  }, 0);
  if (activeAdmins === 0) {
    throw new Error("O sistema precisa manter pelo menos um admin ativo.");
  }

  await upsertRows("app_users", [toUserRow(updated)]);
  return { item: publicUser(updated) };
}

async function handleProductsPost(body) {
  const product = {
    id: createId(),
    name: body.name?.trim(),
    category: body.category,
    brand: body.brand?.trim(),
    supplierId: body.supplierId || null,
    ncm: body.ncm || "",
    cfop: body.cfop || "",
    taxCode: body.taxCode || "",
    taxRate: Number(body.taxRate || 0),
    price: Number(body.price || 0),
    cost: Number(body.cost || 0),
    quantity: Number(body.quantity || 0),
    minimum: Number(body.minimum || 0),
    expiryDate: body.expiryDate || null,
    status: body.status || "ativo",
    createdAt: getNowIso(),
  };

  await upsertRows("products", [toProductRow(product)]);
  return { item: product };
}

async function handleProductsPut(body, productId) {
  const target = await getProductById(productId);
  if (!target) {
    throw new Error("Produto nao encontrado.");
  }

  const updated = {
    ...target,
    name: body.name?.trim() || target.name,
    category: body.category || target.category,
    brand: body.brand?.trim() || target.brand,
    supplierId: body.supplierId || null,
    ncm: body.ncm ?? target.ncm,
    cfop: body.cfop ?? target.cfop,
    taxCode: body.taxCode ?? target.taxCode,
    taxRate: Number(body.taxRate ?? target.taxRate),
    price: Number(body.price ?? target.price),
    cost: Number(body.cost ?? target.cost),
    quantity: Number(body.quantity ?? target.quantity),
    minimum: Number(body.minimum ?? target.minimum),
    expiryDate: body.expiryDate || null,
    status: body.status || target.status,
  };

  await updateRows("products", { id: `eq.${productId}` }, toProductRow(updated));
  return { item: updated };
}

async function handleProductsDelete(productId) {
  const target = await getProductById(productId);
  if (!target) {
    throw new Error("Produto nao encontrado.");
  }

  await deleteRows("stock_movements", { product_id: `eq.${productId}` });
  await deleteRows("products", { id: `eq.${productId}` });
  return { ok: true };
}

async function handleSuppliersPost(body) {
  if (!body.name) {
    throw new Error("Nome do fornecedor e obrigatorio.");
  }

  const supplier = {
    id: createId(),
    name: body.name.trim(),
    document: body.document || "",
    contactName: body.contactName || "",
    phone: body.phone || "",
    email: body.email || "",
    status: body.status || "ativo",
    notes: body.notes || "",
    createdAt: getNowIso(),
  };

  await upsertRows("suppliers", [toSupplierRow(supplier)]);
  return { item: supplier };
}

async function handleSuppliersPut(body, supplierId) {
  const suppliers = await loadSuppliers();
  const target = suppliers.find((item) => item.id === supplierId);
  if (!target) {
    throw new Error("Fornecedor nao encontrado.");
  }

  const updated = {
    ...target,
    name: body.name?.trim() || target.name,
    document: body.document ?? target.document,
    contactName: body.contactName ?? target.contactName,
    phone: body.phone ?? target.phone,
    email: body.email ?? target.email,
    status: body.status || target.status,
    notes: body.notes ?? target.notes,
  };

  await updateRows("suppliers", { id: `eq.${supplierId}` }, toSupplierRow(updated));
  return { item: updated };
}

async function handlePurchaseInvoicesPost(body) {
  const supplier = state.suppliers.find((item) => item.id === body.supplierId) || (await loadSuppliers()).find((item) => item.id === body.supplierId);
  if (!supplier) {
    throw new Error("Fornecedor nao encontrado.");
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    throw new Error("Adicione pelo menos um item na nota.");
  }

  const products = await loadProducts();
  const productMap = new Map(products.map((item) => [item.id, { ...item }]));
  const invoiceItems = [];
  const movementRows = [];
  let totalAmount = 0;

  for (const rawItem of items) {
    const product = productMap.get(rawItem.productId);
    if (!product) {
      throw new Error("Um dos produtos da nota nao foi encontrado.");
    }

    const quantity = Number(rawItem.quantity || 0);
    const unitCost = Number(rawItem.unitCost || 0);
    if (quantity <= 0) {
      throw new Error("Quantidade invalida na nota.");
    }

    product.quantity += quantity;
    product.cost = unitCost;
    if (!product.supplierId) product.supplierId = supplier.id;

    const lineTotal = quantity * unitCost;
    totalAmount += lineTotal;

    invoiceItems.push({
      productId: product.id,
      productName: product.name,
      quantity,
      unitCost,
      lineTotal,
    });

    movementRows.push(newMovementRecord(product.id, product.name, "entrada_nf", quantity, `Nota fiscal ${body.invoiceNumber}`));
  }

  const invoice = {
    id: createId(),
    supplierId: supplier.id,
    supplierName: supplier.name,
    invoiceNumber: body.invoiceNumber,
    issuedAt: body.issuedAt,
    itemCount: invoiceItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    totalAmount,
    notes: body.notes || "",
    createdAt: getNowIso(),
  };

  await upsertRows("products", Array.from(productMap.values()).map(toProductRow));
  await upsertRows("purchase_invoices", [toPurchaseInvoiceRow(invoice)]);
  await upsertRows("purchase_invoice_items", invoiceItems.map((item) => toPurchaseInvoiceItemRow(invoice.id, item)));
  await upsertRows("stock_movements", movementRows.map(toMovementRow));
  return { item: invoice };
}

async function handleSupplierReturnsPost(body) {
  const supplier = state.suppliers.find((item) => item.id === body.supplierId) || (await loadSuppliers()).find((item) => item.id === body.supplierId);
  if (!supplier) {
    throw new Error("Fornecedor nao encontrado.");
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    throw new Error("Adicione pelo menos um item na devolucao.");
  }

  const products = await loadProducts();
  const productMap = new Map(products.map((item) => [item.id, { ...item }]));
  const returnItems = [];
  const movementRows = [];
  let totalAmount = 0;

  for (const rawItem of items) {
    const product = productMap.get(rawItem.productId);
    if (!product) {
      throw new Error("Um dos produtos da devolucao nao foi encontrado.");
    }

    const quantity = Number(rawItem.quantity || 0);
    const unitCost = Number(rawItem.unitCost || 0);
    if (quantity <= 0) {
      throw new Error("Quantidade invalida na devolucao.");
    }
    if (Number(product.quantity || 0) < quantity) {
      throw new Error(`Estoque insuficiente para devolver ${product.name}.`);
    }

    product.quantity -= quantity;
    const lineTotal = quantity * unitCost;
    totalAmount += lineTotal;

    returnItems.push({
      productId: product.id,
      productName: product.name,
      quantity,
      unitCost,
      lineTotal,
    });

    movementRows.push(newMovementRecord(product.id, product.name, "devolucao_fornecedor", quantity, `Devolucao ${body.referenceNumber}`));
  }

  const entry = {
    id: createId(),
    supplierId: supplier.id,
    supplierName: supplier.name,
    referenceNumber: body.referenceNumber,
    returnedAt: body.returnedAt,
    itemCount: returnItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    totalAmount,
    notes: body.notes || "",
    createdAt: getNowIso(),
  };

  await upsertRows("products", Array.from(productMap.values()).map(toProductRow));
  await upsertRows("supplier_returns", [toSupplierReturnRow(entry)]);
  await upsertRows("supplier_return_items", returnItems.map((item) => toSupplierReturnItemRow(entry.id, item)));
  await upsertRows("stock_movements", movementRows.map(toMovementRow));
  return { item: entry };
}

function newMovementRecord(productId, productName, type, quantity, note) {
  return {
    id: createId(),
    productId,
    productName,
    type,
    quantity: Number(quantity || 0),
    note: note || "",
    createdAt: getNowIso(),
  };
}

async function handleMovementsPost(body) {
  const product = await getProductById(body.productId);
  if (!product) {
    throw new Error("Produto nao encontrado.");
  }

  const quantity = Number(body.quantity || 0);
  if (quantity <= 0) {
    throw new Error("A quantidade precisa ser maior do que zero.");
  }
  if (body.type === "saida" && Number(product.quantity) < quantity) {
    throw new Error("A saida nao pode ser maior do que o estoque atual.");
  }

  const updated = { ...product };
  if (body.type === "entrada") updated.quantity += quantity;
  else if (body.type === "saida") updated.quantity -= quantity;
  else updated.quantity = quantity;

  const movement = newMovementRecord(updated.id, updated.name, body.type, quantity, body.note);
  await upsertRows("products", [toProductRow(updated)]);
  await upsertRows("stock_movements", [toMovementRow(movement)]);
  return { item: movement };
}

async function handleSalesPost(body, auth) {
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    throw new Error("Adicione pelo menos um item a venda.");
  }

  const cashSession = await getOpenCashSession();
  if (!cashSession) {
    throw new Error("Abra o caixa antes de registrar uma venda.");
  }

  const products = await loadProducts();
  const productMap = new Map(products.map((item) => [item.id, { ...item }]));
  const saleItems = [];
  const movementRows = [];
  let subtotal = 0;
  let costTotal = 0;

  for (const rawItem of items) {
    const product = productMap.get(rawItem.productId);
    if (!product) {
      throw new Error("Um dos produtos da venda nao foi encontrado.");
    }

    const quantity = Number(rawItem.quantity || 0);
    if (quantity <= 0) {
      throw new Error("Quantidade invalida na venda.");
    }
    if (Number(product.quantity) < quantity) {
      throw new Error(`Estoque insuficiente para ${product.name}.`);
    }

    product.quantity -= quantity;
    const lineTotal = Number(product.price) * quantity;
    const lineCost = Number(product.cost) * quantity;
    subtotal += lineTotal;
    costTotal += lineCost;

    saleItems.push({
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: Number(product.price),
      unitCost: Number(product.cost),
      lineTotal,
      lineCost,
    });

    movementRows.push(newMovementRecord(product.id, product.name, "saida", quantity, "Venda registrada"));
  }

  const discount = Number(body.discount || 0);
  if (discount < 0 || discount > subtotal) {
    throw new Error("Desconto invalido para a venda.");
  }
  const saleChannel = body.saleChannel === "entrega" ? "entrega" : "fisica";
  const deliveryFee = saleChannel === "entrega" ? Number(body.deliveryFee || 0) : 0;
  if (deliveryFee < 0) {
    throw new Error("Taxa de entrega invalida.");
  }
  if (saleChannel === "entrega" && !String(body.customerName || "").trim()) {
    throw new Error("Informe o cliente da entrega.");
  }
  if (saleChannel === "entrega" && !String(body.deliveryAddress || "").trim()) {
    throw new Error("Informe o endereco da entrega.");
  }

  const total = subtotal - discount + deliveryFee;
  const sale = {
    id: createId(),
    items: saleItems,
    itemCount: saleItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    subtotal,
    discount,
    total,
    costTotal,
    profit: total - costTotal,
    saleChannel,
    paymentMethod: body.paymentMethod || "dinheiro",
    customerName: String(body.customerName || "").trim(),
    deliveryAddress: String(body.deliveryAddress || "").trim(),
    deliveryFee,
    note: body.note || "",
    sellerName: auth.user.name,
    cashSessionId: cashSession.id,
    createdAt: getNowIso(),
  };

  const updatedCash = {
    ...cashSession,
    salesCount: Number(cashSession.salesCount || 0) + 1,
    salesTotal: Number(cashSession.salesTotal || 0) + total,
  };
  updatedCash.expectedBalance = Number(updatedCash.openingAmount || 0) + Number(updatedCash.salesTotal || 0);

  await upsertRows("products", Array.from(productMap.values()).map(toProductRow));
  await upsertRows("cash_sessions", [toCashSessionRow(updatedCash)]);
  await upsertRows("sales", [toSaleRow(sale)]);
  await upsertRows("sale_items", sale.items.map((item) => toSaleItemRow(sale.id, item)));
  await upsertRows("stock_movements", movementRows.map(toMovementRow));
  return { item: sale };
}

async function handleCashOpenRequest(body, auth) {
  const openSession = await getOpenCashSession();
  if (openSession) {
    throw new Error("Ja existe um caixa aberto.");
  }

  const profilePassword = String(body.profilePassword || "");
  if (!profilePassword) {
    throw new Error("Informe a senha do perfil para abrir o caixa.");
  }
  if (auth.user.passwordHash !== await hashPassword(profilePassword)) {
    throw new Error("Senha do perfil invalida para abrir o caixa.");
  }

  const openingAmount = Number(body.openingAmount || 0);
  if (openingAmount < 0) {
    throw new Error("Valor de abertura invalido.");
  }

  const session = {
    id: createId(),
    openingAmount,
    salesTotal: 0,
    salesCount: 0,
    expectedBalance: openingAmount,
    actualClosingAmount: null,
    difference: null,
    note: body.note || "",
    closeNote: null,
    openedBy: auth.user.name,
    openedAt: getNowIso(),
    closedAt: null,
    closedBy: null,
  };

  await upsertRows("cash_sessions", [toCashSessionRow(session)]);
  return { current: session };
}

async function handleCashCloseRequest(body, auth) {
  const session = await getOpenCashSession();
  if (!session) {
    throw new Error("Nao ha caixa aberto para fechar.");
  }

  const actual = Number(body.closingAmount || 0);
  const closed = {
    ...session,
    actualClosingAmount: actual,
    difference: actual - Number(session.expectedBalance || 0),
    closeNote: body.note || "",
    closedAt: getNowIso(),
    closedBy: auth.user.name,
  };

  await upsertRows("cash_sessions", [toCashSessionRow(closed)]);
  return { current: null, closed };
}

function can(permission) {
  const role = state.currentUser?.role || "attendant";
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}

function hasViewAccess(viewName) {
  const role = state.currentUser?.role || "attendant";
  return (ROLE_PERMISSIONS[role]?.views || []).includes(viewName);
}

function getDefaultView() {
  return ROLE_PERMISSIONS[state.currentUser?.role || "attendant"]?.views?.[0] || "overview";
}

function toggleDisabled(element, disabled) {
  if (!element) return;
  element.disabled = disabled;
  element.classList.toggle("permission-lock", disabled);
}

function toggleSectionPermission(element, allowed) {
  if (!element) return;
  element.classList.toggle("permission-lock", !allowed);
  element.querySelectorAll("input, select, textarea, button").forEach((node) => {
    node.disabled = !allowed;
  });
}

function buildReportQueryString() {
  const params = new URLSearchParams();
  if (state.reportFilters.startDate) params.set("startDate", state.reportFilters.startDate);
  if (state.reportFilters.endDate) params.set("endDate", state.reportFilters.endDate);
  if (state.reportFilters.paymentMethod) params.set("paymentMethod", state.reportFilters.paymentMethod);
  if (state.reportFilters.saleChannel) params.set("saleChannel", state.reportFilters.saleChannel);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildReportFilterSummary() {
  const parts = [];
  if (state.reportFilters.startDate) parts.push(`de ${formatShortDate(state.reportFilters.startDate)}`);
  if (state.reportFilters.endDate) parts.push(`ate ${formatShortDate(state.reportFilters.endDate)}`);
  if (state.reportFilters.paymentMethod) parts.push(`pagamento ${capitalize(state.reportFilters.paymentMethod)}`);
  if (state.reportFilters.saleChannel) parts.push(`canal ${getSaleChannelLabel(state.reportFilters.saleChannel)}`);
  return parts.length ? `Filtro aplicado: ${parts.join(" | ")}.` : "Visualizando todos os dados disponiveis para faturamento, lucro e vendas.";
}

function getSaleChannelLabel(value) {
  return value === "entrega" ? "Entrega" : "Fisica";
}

function renderSalesHistory() {
  elements.salesHistory.innerHTML = state.sales.length
    ? state.sales.slice(0, 8).map((sale) => `
      <div class="list-item">
        <strong>${escapeHtml(formatCurrency(sale.total))} | ${escapeHtml(capitalize(sale.paymentMethod))}</strong>
        <small>${escapeHtml(formatDate(sale.createdAt))} | ${escapeHtml(getSaleChannelLabel(sale.saleChannel))} | ${escapeHtml(sale.itemCount)} itens</small>
        <span class="pill-line">Lucro ${escapeHtml(formatCurrency(sale.profit))}</span>
        <small>${escapeHtml(sale.customerName ? `Cliente ${sale.customerName}` : sale.note || "Sem observacao.")}</small>
      </div>`).join("")
    : emptyState("Nenhuma venda registrada", "As vendas finalizadas aparecerao aqui.");
}

function renderReports() {
  const summary = state.reports?.summary || [];
  elements.reportSummary.innerHTML = summary.map((item) => `
    <article class="stat-card">
      <small>${escapeHtml(item.label)}</small>
      <strong>${escapeHtml(item.value)}</strong>
    </article>`).join("");

  renderList(elements.topProductsList, state.reports?.topProducts, (item) => `
    <div class="list-item">
      <strong>${escapeHtml(item.productName)}</strong>
      <small>${escapeHtml(item.quantity)} unidades vendidas</small>
      <span class="pill-line">Receita ${escapeHtml(formatCurrency(item.revenue))}</span>
    </div>`, "Nenhum destaque ainda", "As vendas precisam acontecer para gerar ranking.");

  renderList(elements.paymentMethodsList, state.reports?.salesByPayment, (item) => `
    <div class="list-item">
      <strong>${escapeHtml(capitalize(item.method))}</strong>
      <span class="pill-line">${escapeHtml(formatCurrency(item.total))}</span>
    </div>`, "Sem pagamentos", "As formas de pagamento aparecem apos as vendas.");

  renderList(elements.salesChannelsList, state.reports?.salesByChannel, (item) => `
    <div class="list-item">
      <strong>${escapeHtml(getSaleChannelLabel(item.channel))}</strong>
      <small>${escapeHtml(item.count)} vendas</small>
      <span class="pill-line">${escapeHtml(formatCurrency(item.total))}</span>
    </div>`, "Sem canais", "Os canais aparecem depois das primeiras vendas.");

  renderList(elements.reportRecentSales, state.reports?.recentSales, (sale) => `
    <div class="list-item">
      <strong>${escapeHtml(formatCurrency(sale.total))}</strong>
      <small>${escapeHtml(formatDate(sale.createdAt))} | ${escapeHtml(capitalize(sale.paymentMethod))} | ${escapeHtml(getSaleChannelLabel(sale.saleChannel))}</small>
      <span class="pill-line">${escapeHtml(sale.itemCount)} itens</span>
      <small>Lucro ${escapeHtml(formatCurrency(sale.profit))}${sale.customerName ? ` | ${escapeHtml(sale.customerName)}` : ""}</small>
    </div>`, "Sem vendas recentes", "O resumo das ultimas vendas ficara aqui.");

  renderList(elements.stockSnapshotList, state.reports?.stockSnapshot, (item) => `
    <div class="list-item">
      <strong>${escapeHtml(item.name)}</strong>
      <small>${escapeHtml(item.category)}</small>
      <span class="pill-line">${escapeHtml(item.quantity)} unidades</span>
      <small>Minimo recomendado ${escapeHtml(item.minimum)}${item.expiryDate ? ` | Validade ${escapeHtml(formatShortDate(item.expiryDate))}` : ""}${item.ncm ? ` | NCM ${escapeHtml(item.ncm)}` : ""}</small>
    </div>`, "Sem itens", "O estoque precisa de produtos cadastrados.");

  elements.reportStartDateInput.value = state.reportFilters.startDate;
  elements.reportEndDateInput.value = state.reportFilters.endDate;
  elements.reportPaymentFilter.value = state.reportFilters.paymentMethod;
  elements.reportSaleChannelFilter.value = state.reportFilters.saleChannel;
  elements.reportFilterSummary.textContent = buildReportFilterSummary();
}

function getRoleHeroText() {
  const role = state.currentUser?.role;
  if (role === "admin") return "Voce controla operacao, cadastro da equipe, relatorios e exportacoes do sistema.";
  if (role === "manager") return "Voce acompanha vendas, caixa, estoque e relatorios operacionais da loja.";
  return "Voce tem acesso agil ao balcao, vendas e consulta dos relatorios essenciais da operacao.";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`));
}

function getDaysUntilExpiry(value) {
  if (!value) return null;
  const target = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function getExpiryStatus(value) {
  if (!value) return "none";
  const days = getDaysUntilExpiry(value);
  if (days < 0) return "expired";
  if (days <= EXPIRY_ALERT_DAYS) return "warning";
  return "ok";
}

function isExpiringSoon(value) {
  return getExpiryStatus(value) === "warning";
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

bootstrap();
