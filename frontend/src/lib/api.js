// UNCOMMENT WHEN REAL API LINKED

 const BASE = "http://localhost:8080";

 /** @param {{page?:number, limit?:number, search?:string}} params */
 export async function fetchProducts(params = {}) {
   //const { page = 1, limit = 12, search = "" } = params;
   const url = new URL(`${BASE}/products`, window.location.origin);
   const { page = 1, limit = 12, search = "" } = params;

   url.searchParams.set("page", page);
   url.searchParams.set("limit", limit);
   if (search) url.searchParams.set("search", search);

   const res = await fetch(url.toString(), {
     headers: { Accept: "application/json" },
   });

   const productArray = await res.json();

   const transformedArray = productArray.map(p => ({
     // Map Spring names to our Frontend names
     id: p.product_id,
     name: p.product_name,
     price: p.product_cost,
     stock: p.product_stock,
     weight: p.product_weight,

   }));

   if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
   return /** @type {{items: any[], total: number}} */ ({
       items: transformedArray,
       total: transformedArray.length
   });
 }






 /** @param {string} id */
 export async function fetchProductById(id) {
   const res = await fetch(`${BASE}/products/${id}`, {
     headers: { Accept: "application/json" },
   });
   if (!res.ok) throw new Error(`Product not found`);
   const springBootProduct = await res.json();

    return {

       id: springBootProduct.product_id,
       name: springBootProduct.product_name,
       price: springBootProduct.product_cost,
       stock: springBootProduct.product_stock,
       inStock: springBootProduct.product_stock > 0,
       weight: springBootProduct.product_weight,

   };
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
