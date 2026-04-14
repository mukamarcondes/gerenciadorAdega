const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rootDir = path.resolve(__dirname, "..", "..");
const dataDir = path.join(rootDir, "data");
const EXPIRY_ALERT_DAYS = 30;

const ROLE_ACCESS = {
  admin: {
    manageUsers: true,
    manageProducts: true,
    manageMovements: true,
    openCash: true,
    manageCash: true,
    manageSales: true,
    viewReports: true,
    exportReports: true,
    exportSupabase: true,
  },
  manager: {
    manageUsers: false,
    manageProducts: true,
    manageMovements: true,
    openCash: true,
    manageCash: true,
    manageSales: true,
    viewReports: true,
    exportReports: true,
    exportSupabase: false,
  },
  attendant: {
    manageUsers: false,
    manageProducts: false,
    manageMovements: false,
    openCash: true,
    manageCash: false,
    manageSales: true,
    viewReports: true,
    exportReports: true,
    exportSupabase: false,
  },
};

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getSupabaseConfig() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw createHttpError(500, "Supabase nao configurado na Vercel.");
  }
  return { url, serviceRoleKey };
}

function getAuthSecret() {
  return getEnv("AUTH_SECRET", getEnv("SUPABASE_SERVICE_ROLE_KEY", "adega-auth-secret"));
}

function createId() {
  return crypto.randomUUID();
}

function getNowIso() {
  return new Date().toISOString();
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password), "utf8").digest("hex");
}

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function createToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") {
    throw createHttpError(401, "Sessao invalida. Faca login novamente.");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw createHttpError(401, "Sessao invalida. Faca login novamente.");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expected = crypto
    .createHmac("sha256", getAuthSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  if (signature !== expected) {
    throw createHttpError(401, "Sessao invalida. Faca login novamente.");
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw createHttpError(401, "Sessao invalida. Faca login novamente.");
  }

  if (!payload.exp || payload.exp * 1000 < Date.now()) {
    throw createHttpError(401, "Sessao expirada. Faca login novamente.");
  }

  return payload;
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

function getRoleAccess(role) {
  return ROLE_ACCESS[role] || ROLE_ACCESS.attendant;
}

function parseDateStart(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function parseDateEnd(value) {
  if (!value) return null;
  return new Date(`${value}T23:59:59.999Z`);
}

function parseDateOnly(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function getDaysUntilExpiry(value) {
  if (!value) return null;
  const target = parseDateOnly(value);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
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

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

async function supabaseRequest(method, resource, { query = {}, body, prefer } = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const queryString = new URLSearchParams(query).toString();
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/${resource}${queryString ? `?${queryString}` : ""}`;

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  if (prefer) headers.Prefer = prefer;

  const response = await fetch(endpoint, {
    method,
    headers: {
      ...headers,
      ...(body !== undefined ? { "Content-Type": "application/json; charset=utf-8" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    let message = `Falha ao acessar o Supabase (${method} ${resource}).`;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw createHttpError(response.status, message);
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
  if (!rows || !rows.length) return;
  await supabaseRequest("POST", table, {
    query: { on_conflict: "id" },
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation",
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
    price: Number(row.price || 0),
    cost: Number(row.cost || 0),
    quantity: Number(row.quantity || 0),
    minimum: Number(row.minimum_quantity || 0),
    expiryDate: row.expiry_date || null,
    status: row.status || "ativo",
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
  const row = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: Number(product.price || 0),
    cost: Number(product.cost || 0),
    quantity: Number(product.quantity || 0),
    minimum_quantity: Number(product.minimum || 0),
    status: product.status,
    created_at: product.createdAt,
  };
  if (product.expiryDate) {
    row.expiry_date = product.expiryDate;
  }
  return row;
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

function toSaleRow(sale) {
  return {
    id: sale.id,
    item_count: Number(sale.itemCount || 0),
    subtotal: Number(sale.subtotal || 0),
    discount: Number(sale.discount || 0),
    total: Number(sale.total || 0),
    cost_total: Number(sale.costTotal || 0),
    profit: Number(sale.profit || 0),
    payment_method: sale.paymentMethod,
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

async function loadMovements() {
  return (await getRows("stock_movements", { order: "created_at.desc" })).map(mapMovement);
}

async function loadCashSessions() {
  return (await getRows("cash_sessions", { order: "opened_at.desc" })).map(mapCashSession);
}

async function loadSales() {
  const salesRows = await getRows("sales", { order: "created_at.desc" });
  if (!salesRows.length) return [];

  const saleIds = salesRows.map((row) => `"${row.id}"`).join(",");
  const itemRows = await getRows("sale_items", { sale_id: `in.(${saleIds})`, order: "sale_id.asc" });
  const itemsMap = new Map();

  for (const item of itemRows) {
    if (!itemsMap.has(item.sale_id)) itemsMap.set(item.sale_id, []);
    itemsMap.get(item.sale_id).push({
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
    paymentMethod: row.payment_method,
    note: row.note || "",
    sellerName: row.seller_name || "",
    cashSessionId: row.cash_session_id || null,
    createdAt: row.created_at,
  }));
}

function readSeedFile(name, fallback) {
  const filePath = path.join(dataDir, name);
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf8");
  const normalized = String(raw)
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .trim();

  if (!normalized) return fallback;

  try {
    return JSON.parse(normalized);
  } catch {
    return fallback;
  }
}

async function ensureSeeded() {
  const users = await getRows("app_users", { limit: "1" });
  if (users.length) return;

  const seedUsers = readSeedFile("users.json", []).map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    password_hash: item.passwordHash,
    role: item.role || "admin",
    status: item.status || "ativo",
    created_at: item.createdAt || getNowIso(),
  }));
  const seedProducts = readSeedFile("products.json", []).map((item) => {
    const row = {
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand,
      price: Number(item.price || 0),
      cost: Number(item.cost || 0),
      quantity: Number(item.quantity || 0),
      minimum_quantity: Number(item.minimum || 0),
      status: item.status || "ativo",
      created_at: item.createdAt || getNowIso(),
    };
    if (item.expiryDate) {
      row.expiry_date = item.expiryDate;
    }
    return row;
  });
  const cashStore = readSeedFile("cash.json", { sessions: [] });
  const seedCash = (cashStore.sessions || []).map((item) => toCashSessionRow(item));
  const rawSales = readSeedFile("sales.json", []);
  const seedSales = (Array.isArray(rawSales) ? rawSales : [rawSales]).filter(Boolean);
  const saleRows = seedSales.map((item) => toSaleRow(item));
  const saleItemRows = seedSales.flatMap((sale) => (sale.items || []).map((item) => toSaleItemRow(sale.id, item)));
  const seedMovements = readSeedFile("movements.json", []).map((item) => toMovementRow(item));

  await upsertRows("app_users", seedUsers);
  await upsertRows("products", seedProducts);
  await upsertRows("cash_sessions", seedCash);
  await upsertRows("sales", saleRows);
  if (saleItemRows.length) {
    await supabaseRequest("POST", "sale_items", {
      query: { on_conflict: "id" },
      body: saleItemRows,
      prefer: "resolution=merge-duplicates,return=representation",
    });
  }
  await upsertRows("stock_movements", seedMovements);
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

async function requireAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token);
  const user = await getUserById(payload.sub);

  if (!user) {
    throw createHttpError(401, "Usuario nao encontrado.");
  }
  if ((user.status || "ativo") !== "ativo") {
    throw createHttpError(403, "Usuario inativo. Procure um administrador.");
  }

  return {
    token,
    user,
    access: getRoleAccess(user.role),
  };
}

function ensurePermission(auth, permission) {
  if (!auth.access[permission]) {
    throw createHttpError(403, "Seu perfil nao tem permissao para esta acao.");
  }
}

function filterSalesByQuery(sales, query) {
  const startDate = parseDateStart(query.startDate);
  const endDate = parseDateEnd(query.endDate);
  const paymentMethod = query.paymentMethod;

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    if (startDate && saleDate < startDate) return false;
    if (endDate && saleDate > endDate) return false;
    if (paymentMethod && sale.paymentMethod !== paymentMethod) return false;
    return true;
  });
}

async function getDashboardPayload() {
  const [products, movements, sales] = await Promise.all([loadProducts(), loadMovements(), loadSales()]);
  const lowStock = products.filter((item) => item.status === "ativo" && Number(item.quantity) <= Number(item.minimum));
  const expiringProducts = products
    .filter((item) => item.status === "ativo" && (isExpiringSoon(item.expiryDate) || getExpiryStatus(item.expiryDate) === "expired"))
    .sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return a.expiryDate.localeCompare(b.expiryDate);
    })
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
      { label: "Vendas de hoje", value: `R$ ${todayRevenue.toFixed(2).replace(".", ",")}` },
      { label: "Lucro de hoje", value: `R$ ${todayProfit.toFixed(2).replace(".", ",")}` },
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
  const productMap = new Map();

  for (const sale of sales) {
    revenue += Number(sale.total || 0);
    profit += Number(sale.profit || 0);
    paymentMap.set(sale.paymentMethod, (paymentMap.get(sale.paymentMethod) || 0) + Number(sale.total || 0));

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
      { label: "Faturamento total", value: `R$ ${revenue.toFixed(2).replace(".", ",")}` },
      { label: "Lucro total", value: `R$ ${profit.toFixed(2).replace(".", ",")}` },
      { label: "Ticket medio", value: `R$ ${avgTicket.toFixed(2).replace(".", ",")}` },
      { label: "Itens vendidos", value: itemsSold },
    ],
    salesByPayment: Array.from(paymentMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([method, total]) => ({ method, total })),
    topProducts: Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    recentSales: sales.slice(0, 6),
    stockSnapshot: [...products].sort((a, b) => a.quantity - b.quantity).slice(0, 6),
  };
}

function csvValue(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
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
  for (const sale of reports.recentSales) {
    rows.push([csvValue("Vendas recentes"), csvValue(sale.createdAt), csvValue(sale.paymentMethod), csvValue(sale.itemCount), csvValue(Number(sale.total || 0).toFixed(2).replace(".", ","))].join(";"));
  }
  for (const item of reports.stockSnapshot) {
    rows.push([csvValue("Estoque"), csvValue(item.name), csvValue(item.category), csvValue(item.quantity), csvValue(item.minimum)].join(";"));
  }

  return rows.join("\r\n");
}

function toSqlLiteral(value) {
  if (value == null) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insertStatement(table, columns, values) {
  return `insert into public.${table} (${columns.join(", ")}) values (${values.map(toSqlLiteral).join(", ")}) on conflict (id) do nothing;`;
}

async function getSupabaseSqlExport() {
  const [users, products, movements, sales, cashSessions] = await Promise.all([
    loadUsers(),
    loadProducts(),
    loadMovements(),
    loadSales(),
    loadCashSessions(),
  ]);

  const lines = [];
  lines.push("-- Importe este arquivo no SQL Editor do Supabase.");
  lines.push("begin;");
  lines.push("");
  lines.push("create extension if not exists pgcrypto;");
  lines.push("");
  lines.push(fs.readFileSync(path.join(rootDir, "supabase", "schema.sql"), "utf8").trim());
  lines.push("");

  for (const user of users) {
    lines.push(insertStatement("app_users", ["id", "name", "email", "password_hash", "role", "status", "created_at"], [user.id, user.name, user.email, user.passwordHash, user.role, user.status, user.createdAt]));
  }
  for (const product of products) {
    lines.push(insertStatement("products", ["id", "name", "category", "brand", "price", "cost", "quantity", "minimum_quantity", "expiry_date", "status", "created_at"], [product.id, product.name, product.category, product.brand, product.price, product.cost, product.quantity, product.minimum, product.expiryDate, product.status, product.createdAt]));
  }
  for (const session of cashSessions) {
    lines.push(insertStatement("cash_sessions", ["id", "opening_amount", "sales_total", "sales_count", "expected_balance", "actual_closing_amount", "difference", "note", "close_note", "opened_by", "opened_at", "closed_at", "closed_by"], [session.id, session.openingAmount, session.salesTotal, session.salesCount, session.expectedBalance, session.actualClosingAmount, session.difference, session.note, session.closeNote, session.openedBy, session.openedAt, session.closedAt, session.closedBy]));
  }
  for (const sale of sales) {
    lines.push(insertStatement("sales", ["id", "item_count", "subtotal", "discount", "total", "cost_total", "profit", "payment_method", "note", "seller_name", "cash_session_id", "created_at"], [sale.id, sale.itemCount, sale.subtotal, sale.discount, sale.total, sale.costTotal, sale.profit, sale.paymentMethod, sale.note, sale.sellerName, sale.cashSessionId, sale.createdAt]));
    for (const item of sale.items || []) {
      lines.push(`insert into public.sale_items (sale_id, product_id, product_name, quantity, unit_price, unit_cost, line_total, line_cost) values (${[toSqlLiteral(sale.id), toSqlLiteral(item.productId), toSqlLiteral(item.productName), toSqlLiteral(item.quantity), toSqlLiteral(item.unitPrice), toSqlLiteral(item.unitCost), toSqlLiteral(item.lineTotal), toSqlLiteral(item.lineCost)].join(", ")});`);
    }
  }
  for (const movement of movements) {
    lines.push(insertStatement("stock_movements", ["id", "product_id", "product_name", "type", "quantity", "note", "created_at"], [movement.id, movement.productId, movement.productName, movement.type, movement.quantity, movement.note, movement.createdAt]));
  }

  lines.push("");
  lines.push("commit;");
  return lines.join("\r\n");
}

async function handleAuthLogin(req) {
  const body = getBody(req);
  const user = await getUserByEmail(body.email);
  if (!user || user.passwordHash !== hashPassword(body.password || "")) {
    throw createHttpError(401, "E-mail ou senha invalidos.");
  }
  if ((user.status || "ativo") !== "ativo") {
    throw createHttpError(403, "Usuario inativo. Procure um administrador.");
  }

  const token = createToken({
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });

  return { status: 200, json: { token, user: publicUser(user) } };
}

async function handleAuthRegister(req) {
  const body = getBody(req);
  if (!body.name || !body.email || !body.password) {
    throw createHttpError(400, "Nome, e-mail e senha sao obrigatorios.");
  }
  const existing = await getUserByEmail(body.email);
  if (existing) {
    throw createHttpError(409, "Este e-mail ja esta cadastrado.");
  }

  const users = await loadUsers();
  const role = users.length === 0 ? "admin" : "attendant";
  const user = {
    id: createId(),
    name: body.name,
    email: body.email,
    passwordHash: hashPassword(body.password),
    role,
    status: "ativo",
    createdAt: getNowIso(),
  };

  await upsertRows("app_users", [toUserRow(user)]);
  const token = createToken({
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });

  return {
    status: 201,
    json: {
      token,
      user: publicUser(user),
      message: role === "admin" ? "Cadastro inicial realizado com sucesso." : "Conta criada com perfil atendente.",
    },
  };
}

async function handleUsersPost(req) {
  const body = getBody(req);
  if (!body.name || !body.email || !body.password) {
    throw createHttpError(400, "Nome, e-mail e senha sao obrigatorios.");
  }
  const existing = await getUserByEmail(body.email);
  if (existing) {
    throw createHttpError(409, "Ja existe um usuario com este e-mail.");
  }

  const user = {
    id: createId(),
    name: body.name,
    email: body.email,
    passwordHash: hashPassword(body.password),
    role: body.role || "attendant",
    status: body.status || "ativo",
    createdAt: getNowIso(),
  };
  await upsertRows("app_users", [toUserRow(user)]);
  return { status: 201, json: { item: publicUser(user) } };
}

async function handleUsersPut(req, auth, userId) {
  const body = getBody(req);
  const users = await loadUsers();
  const target = users.find((item) => item.id === userId);
  if (!target) {
    throw createHttpError(404, "Usuario nao encontrado.");
  }

  if (body.email) {
    const sameEmail = users.find((item) => item.email === body.email && item.id !== userId);
    if (sameEmail) {
      throw createHttpError(409, "Ja existe um usuario com este e-mail.");
    }
  }

  const updated = {
    ...target,
    name: body.name || target.name,
    email: body.email || target.email,
    role: body.role || target.role,
    status: body.status || target.status,
  };

  if (auth.user.id === userId && auth.user.role === "admin") {
    if (updated.role !== "admin") {
      throw createHttpError(400, "Voce nao pode remover seu proprio perfil de admin.");
    }
    if (updated.status !== "ativo") {
      throw createHttpError(400, "Voce nao pode desativar seu proprio usuario admin.");
    }
  }

  if (body.password) {
    updated.passwordHash = hashPassword(body.password);
  }

  const activeAdmins = users.reduce((count, item) => {
    const candidate = item.id === userId ? updated : item;
    return count + (candidate.role === "admin" && (candidate.status || "ativo") === "ativo" ? 1 : 0);
  }, 0);
  if (activeAdmins === 0) {
    throw createHttpError(400, "O sistema precisa manter pelo menos um admin ativo.");
  }

  await upsertRows("app_users", [toUserRow(updated)]);
  return { status: 200, json: { item: publicUser(updated) } };
}

async function handleProductsPost(req) {
  const body = getBody(req);
  const product = {
    id: createId(),
    name: body.name,
    category: body.category,
    brand: body.brand,
    price: Number(body.price || 0),
    cost: Number(body.cost || 0),
    quantity: Number(body.quantity || 0),
    minimum: Number(body.minimum || 0),
    expiryDate: body.expiryDate || null,
    status: body.status || "ativo",
    createdAt: getNowIso(),
  };

  await upsertRows("products", [toProductRow(product)]);
  return { status: 201, json: { item: product } };
}

async function handleProductsPut(req, productId) {
  const body = getBody(req);
  const target = await getProductById(productId);
  if (!target) {
    throw createHttpError(404, "Produto nao encontrado.");
  }

  const updated = {
    ...target,
    name: body.name,
    category: body.category,
    brand: body.brand,
    price: Number(body.price || 0),
    cost: Number(body.cost || 0),
    quantity: Number(body.quantity || 0),
    minimum: Number(body.minimum || 0),
    expiryDate: body.expiryDate || null,
    status: body.status,
  };

  await upsertRows("products", [toProductRow(updated)]);
  return { status: 200, json: { item: updated } };
}

async function handleProductsDelete(productId) {
  const target = await getProductById(productId);
  if (!target) {
    throw createHttpError(404, "Produto nao encontrado.");
  }

  await deleteRows("stock_movements", { product_id: `eq.${productId}` });
  await deleteRows("products", { id: `eq.${productId}` });
  return { status: 200, json: { ok: true } };
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

async function handleMovementsPost(req) {
  const body = getBody(req);
  const product = await getProductById(body.productId);
  if (!product) {
    throw createHttpError(404, "Produto nao encontrado.");
  }

  const quantity = Number(body.quantity || 0);
  if (quantity <= 0) {
    throw createHttpError(400, "A quantidade precisa ser maior do que zero.");
  }
  if (body.type === "saida" && Number(product.quantity) < quantity) {
    throw createHttpError(400, "A saida nao pode ser maior do que o estoque atual.");
  }

  const updated = { ...product };
  if (body.type === "entrada") updated.quantity += quantity;
  else if (body.type === "saida") updated.quantity -= quantity;
  else updated.quantity = quantity;

  const movement = newMovementRecord(updated.id, updated.name, body.type, quantity, body.note);
  await upsertRows("products", [toProductRow(updated)]);
  await upsertRows("stock_movements", [toMovementRow(movement)]);
  return { status: 201, json: { item: movement } };
}

async function handleSalesPost(req, auth) {
  const body = getBody(req);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    throw createHttpError(400, "Adicione pelo menos um item a venda.");
  }

  const cashSession = await getOpenCashSession();
  if (!cashSession) {
    throw createHttpError(400, "Abra o caixa antes de registrar uma venda.");
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
      throw createHttpError(404, "Um dos produtos da venda nao foi encontrado.");
    }

    const quantity = Number(rawItem.quantity || 0);
    if (quantity <= 0) {
      throw createHttpError(400, "Quantidade invalida na venda.");
    }
    if (Number(product.quantity) < quantity) {
      throw createHttpError(400, `Estoque insuficiente para ${product.name}.`);
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
    throw createHttpError(400, "Desconto invalido para a venda.");
  }

  const total = subtotal - discount;
  const sale = {
    id: createId(),
    items: saleItems,
    itemCount: saleItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    subtotal,
    discount,
    total,
    costTotal,
    profit: total - costTotal,
    paymentMethod: body.paymentMethod || "dinheiro",
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
  await supabaseRequest("POST", "sale_items", {
    query: { on_conflict: "id" },
    body: sale.items.map((item) => toSaleItemRow(sale.id, item)),
    prefer: "resolution=merge-duplicates,return=representation",
  });
  await upsertRows("stock_movements", movementRows.map(toMovementRow));

  return { status: 201, json: { item: sale } };
}

async function handleCashOpen(req, auth) {
  const openSession = await getOpenCashSession();
  if (openSession) {
    throw createHttpError(409, "Ja existe um caixa aberto.");
  }

  const body = getBody(req);
  const profilePassword = String(body.profilePassword || "");
  if (!profilePassword) {
    throw createHttpError(400, "Informe a senha do perfil para abrir o caixa.");
  }
  if (auth.user.passwordHash !== hashPassword(profilePassword)) {
    throw createHttpError(403, "Senha do perfil invalida para abrir o caixa.");
  }

  const openingAmount = Number(body.openingAmount || 0);
  if (openingAmount < 0) {
    throw createHttpError(400, "Valor de abertura invalido.");
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
  return { status: 201, json: { current: session } };
}

async function handleCashClose(req, auth) {
  const session = await getOpenCashSession();
  if (!session) {
    throw createHttpError(400, "Nao ha caixa aberto para fechar.");
  }

  const body = getBody(req);
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
  return { status: 200, json: { current: null, closed } };
}

async function routeRequest(req) {
  await ensureSeeded();

  let route = Array.isArray(req.query.route) ? req.query.route : [req.query.route].filter(Boolean);
  if (!route.length && req.url) {
    const pathname = new URL(req.url, "http://localhost").pathname;
    route = pathname
      .split("/")
      .filter(Boolean)
      .slice(1);
  }
  const [resource = "", resourceId = "", third = ""] = route;
  const method = req.method.toUpperCase();

  if (resource === "auth" && resourceId === "login" && method === "POST") return handleAuthLogin(req);
  if (resource === "auth" && resourceId === "register" && method === "POST") return handleAuthRegister(req);
  if (resource === "auth" && resourceId === "logout" && method === "POST") return { status: 200, json: { ok: true } };

  const auth = await requireAuth(req);

  if (resource === "me" && method === "GET") return { status: 200, json: { user: publicUser(auth.user) } };
  if (resource === "dashboard" && method === "GET") return { status: 200, json: await getDashboardPayload() };
  if (resource === "users" && method === "GET") {
    ensurePermission(auth, "manageUsers");
    return { status: 200, json: { items: (await loadUsers()).map(publicUser) } };
  }
  if (resource === "users" && method === "POST") {
    ensurePermission(auth, "manageUsers");
    return handleUsersPost(req);
  }
  if (resource === "users" && resourceId && method === "PUT") {
    ensurePermission(auth, "manageUsers");
    return handleUsersPut(req, auth, resourceId);
  }
  if (resource === "products" && method === "GET") return { status: 200, json: { items: await loadProducts() } };
  if (resource === "products" && method === "POST") {
    ensurePermission(auth, "manageProducts");
    return handleProductsPost(req);
  }
  if (resource === "products" && resourceId && method === "PUT") {
    ensurePermission(auth, "manageProducts");
    return handleProductsPut(req, resourceId);
  }
  if (resource === "products" && resourceId && method === "DELETE") {
    ensurePermission(auth, "manageProducts");
    return handleProductsDelete(resourceId);
  }
  if (resource === "movements" && method === "GET") return { status: 200, json: { items: await loadMovements() } };
  if (resource === "movements" && method === "POST") {
    ensurePermission(auth, "manageMovements");
    return handleMovementsPost(req);
  }
  if (resource === "sales" && method === "GET") return { status: 200, json: { items: await loadSales() } };
  if (resource === "sales" && method === "POST") {
    ensurePermission(auth, "manageSales");
    return handleSalesPost(req, auth);
  }
  if (resource === "cash" && resourceId === "current" && method === "GET") {
    return { status: 200, json: { current: await getOpenCashSession(), history: (await loadCashSessions()).slice(0, 8) } };
  }
  if (resource === "cash" && resourceId === "open" && method === "POST") {
    ensurePermission(auth, "openCash");
    return handleCashOpen(req, auth);
  }
  if (resource === "cash" && resourceId === "close" && method === "POST") {
    ensurePermission(auth, "manageCash");
    return handleCashClose(req, auth);
  }
  if (resource === "reports" && resourceId === "export" && third === "excel" && method === "GET") {
    ensurePermission(auth, "exportReports");
    const csv = await getReportsCsv(req.query);
    return { status: 200, body: Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(csv, "utf8")]), contentType: "text/csv; charset=utf-8", headers: { "Content-Disposition": 'attachment; filename="relatorio-adega.csv"' } };
  }
  if (resource === "reports" && method === "GET") {
    ensurePermission(auth, "viewReports");
    return { status: 200, json: await getReportsPayload(req.query) };
  }
  if (resource === "database" && resourceId === "export" && third === "supabase-sql" && method === "GET") {
    ensurePermission(auth, "exportSupabase");
    return { status: 200, body: Buffer.from(await getSupabaseSqlExport(), "utf8"), contentType: "application/sql; charset=utf-8", headers: { "Content-Disposition": 'attachment; filename="supabase-import.sql"' } };
  }

  throw createHttpError(404, "Rota nao encontrada.");
}

module.exports = {
  routeRequest,
  createHttpError,
};
