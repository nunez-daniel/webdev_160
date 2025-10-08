// UNCOMMENT WHEN REAL API LINKED

// const BASE = "/api";

// /** @param {{page?:number, limit?:number, search?:string}} params */
// export async function fetchProducts(params = {}) {
//   const { page = 1, limit = 12, search = "" } = params;
//   const url = new URL(`${BASE}/products`, window.location.origin);
//   url.searchParams.set("page", page);
//   url.searchParams.set("limit", limit);
//   if (search) url.searchParams.set("search", search);

//   const res = await fetch(url.toString(), {
//     headers: { Accept: "application/json" },
//   });
//   if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
//   return /** @type {{items: any[], total: number}} */ (await res.json());
// }

// /** @param {string} id */
// export async function fetchProductById(id) {
//   const res = await fetch(`${BASE}/products/${id}`, {
//     headers: { Accept: "application/json" },
//   });
//   if (!res.ok) throw new Error(`Product not found`);
//   return /** @type {any} */ (await res.json());
// }

// MOCK IMPLEMENTATIONS

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
  return /** @type {{items:any[], total:number}} */ (await res.json());
}

export async function fetchProductById(id) {
  if (USE_MOCK) return fetchProductByIdMock(id);

  const res = await fetch(`${BASE}/products/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Product not found");
  return /** @type {any} */ (await res.json());
}
