export const BASE = "http://localhost:8080";

export async function fetchProducts(params = {}) {
  const url = new URL(`${BASE}/products`, window.location.origin);
  const { page = 1, limit = 12, search = "" } = params;

  url.searchParams.set("page", page);
  url.searchParams.set("limit", limit);
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  // detect HTML (login page) or redirects which return HTML instead of JSON
  const ct = res.headers.get("content-type") || "";
  if (res.redirected || ct.includes("text/html")) {
    const text = await res.text();
    throw new Error(
        `Not authenticated or unexpected HTML response when fetching products`
    );
  }

  const productArray = await res.json();

  if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);

  // Apply server-side search filter client-side as a fallback (some backends
  // return full list). Then apply pagination (page/limit) here so the
  // catalog page receives only the requested slice.
  let filteredProducts = productArray;
  if (search && search.trim()) {
    const searchTerm = search.trim().toLowerCase();
    filteredProducts = productArray.filter(
        (product) =>
            product.name?.toLowerCase().includes(searchTerm) ||
            product.brand?.toLowerCase().includes(searchTerm) ||
            product.category?.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
    );
  }

  const total = filteredProducts.length;
  const start = (Number(page) - 1) * Number(limit);
  const items = filteredProducts.slice(start, start + Number(limit));

  return {
    items,
    total,
  };
}

export async function fetchSuggestions(q) {
  if (!q?.trim()) return [];
  const res = await fetch(
      `${BASE}/products2/suggest?q=${encodeURIComponent(q)}`,
      {
        headers: { Accept: "application/json" },
      }
  );
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE}/products/${id}`, {
    headers: { Accept: "application/json" },
  });
  const ct = res.headers.get("content-type") || "";
  if (res.redirected || ct.includes("text/html")) {
    throw new Error(
        "Not authenticated or unexpected HTML response when fetching product"
    );
  }

  if (!res.ok) throw new Error(`Product not found`);
  const product = await res.json();

  return {
    ...product,
    inStock: product.stock > 0,
  };
}

export async function createProduct(product) {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error(`Create product failed (${res.status})`);
  }

  return await res.text();
}

export async function updateProduct(id, updates) {
  // Backend expects full product on /product-manager-access PUT or /products/{id} style.
  const payload = { ...updates, id };
  const res = await fetch(`${BASE}/product-manager-access`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Update product failed (${res.status})`);
  }

  return await res.text();
}

export async function archiveProduct(id) {
  const res = await fetch(`${BASE}/product-manager-access/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Delete product failed (${res.status})`);
  }

  return true;
}

export async function fetchActiveProducts() {
  const res = await fetch(`${BASE}/product-manager-access/active`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error('Failed to fetch active products');
  }
  return res.json();
}

export async function fetchArchivedProducts() {
  const url = `${BASE}/product-manager-access/archived`;

  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const contentType = res.headers.get("content-type") || "";

  if (res.status === 401 || res.status === 403 || contentType.includes("text/html")) {
    console.error(`Authentication/Authorization failed accessing: ${url}. Status: ${res.status}`);
    throw new Error(`Authentication/Authorization failed for archived products. Status: ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch archived products (${res.status})`);
  }

  return res.json();
}

export async function restoreProduct(id) {
  const response = await fetch(`${BASE}/product-manager-access/restore/${id}`, {
    method: 'PUT',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to restore product: ${response.status} - ${errorText}`);
  }

  return response.text();
}


export async function authenticateUser({ email, password }) {
  const url = `${BASE}/login`;

  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: body.toString(),
    credentials: "include",
  });

  const responseText = await response.text();

  if (
      responseText.includes("Invalid credentials") ||
      responseText.includes('<form class="login-form"')
  ) {
    return false;
  }

  if (response.ok && !responseText.includes("Invalid credentials")) {
    return true;
  }

  throw new Error(`Login Request failed with status: ${response.status}`);
}

export async function registerUser({ full_name, email, password }) {
  const url = `${BASE}/signup`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      full_name: full_name,
      email: email,
      password: password,
    }),
  });

  if (response.ok) {
    return true;
  }

  // TODO... email taken etc
  if (response.status === 409) {
    throw new Error(
        "Registration Failed: Email address is already registered."
    );
  }

  throw new Error(
      `Registration Request failed with status: ${response.status}`
  );
}

export async function fetchAllOrders() {
  const res = await fetch(`${BASE}/orders-all`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
  const text = await res.text();
  if (!text || text.trim() === "") return [];
  return JSON.parse(text);
}

export async function fetchOrdersByStatus(status = "PAID") {
  const res = await fetch(`${BASE}/orders-all-status?status=${status}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
  const text = await res.text();
  if (!text || text.trim() === "") return [];
  return JSON.parse(text);
}

export async function fetchOrdersInCar(carId) {
  const res = await fetch(`${BASE}/loaded/${carId}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch car orders (${res.status})`);
  const text = await res.text();
  if (!text || text.trim() === "") return [];
  return JSON.parse(text);
}



// MOCK IMPLEMENTATIONS
/*

import { fetchProductsMock, fetchProductByIdMock } from "./mock";

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK) === "true";
const BASE = "/api";

export async function fetchProducts(params = {}) {
  if (USE_MOCK) return fetchProductsMock(params);

  const { page = 1, limit = 12, search = "" } = params;
  const url = new URL(`${BASE}/products`, window.location.origin);
  url.searchParams.set("page", page);
  url.searchParams.set("limit", limit);
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
  return /!** @type {{items:any[], total:number}} *!/ (await res.json());
}

export async function fetchProductById(id) {
  if (USE_MOCK) return fetchProductByIdMock(id);

  const res = await fetch(`${BASE}/products/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Product not found");
  return /!** @type {any} *!/ (await res.json());
}
*/