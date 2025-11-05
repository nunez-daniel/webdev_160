// UNCOMMENT WHEN REAL API LINKED

const BASE = "http://localhost:8080";

/** @param {{page?:number, limit?:number, search?:string}} params */
export async function fetchProducts(params = {}) {
  const url = new URL(`${BASE}/products`, window.location.origin); // you already build it this way :contentReference[oaicite:5]{index=5}
  const { page = 1, limit = 12, search = "" } = params;

  url.searchParams.set("page", page);
  url.searchParams.set("limit", limit);
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);

  // NEW: server returns { items, total, corrected }
  const data = await res.json();
  return /** @type {{ items:any[], total:number, corrected?:string }} */ (data);
}

/** For typeahead suggestions (ids & names) */
export async function fetchSuggestions(q) {
  if (!q?.trim()) return [];
  const res = await fetch(
    `${BASE}/products/suggest?q=${encodeURIComponent(q)}`,
    {
      headers: { Accept: "application/json" },
    }
  );
  if (!res.ok) return [];
  return /** @type {{id:string, name:string}[]} */ (await res.json());
}

/** @param {string} id */
export async function fetchProductById(id) {
  const res = await fetch(`${BASE}/products/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Product not found`);
  const product = await res.json();

  return {
    ...product,
    inStock: product.stock > 0,
  };
}

/** @param {string} email
 * @param {string} password */
export async function authenticateUser({ email, password }) {
  const url = `${BASE}/login`;

  const body = new URLSearchParams();
  body.append("username", email); // note usernames -> email
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
    console.log("bag login attempt");
    return false;
  }

  if (response.ok && !responseText.includes("Invalid credentials")) {
    console.log("good login attempt");
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
