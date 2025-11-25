import { toast } from "@/lib/use-toast.js"
export const BASE = "http://localhost:8080";

export async function fetchProducts(params = {}) {
  const url = new URL(`${BASE}/products`, window.location.origin);
  const { page = 1, limit = 12, search = "" } = params;

  url.searchParams.set("page", page);
  url.searchParams.set("limit", limit);
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url.toString(), {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Unable to load products. Please try again.");
  }

  const ct = res.headers.get("content-type") || "";
  if (res.redirected || ct.includes("text/html")) {
    await res.text();
    throw new Error("You are not logged in. Please log in to continue.");
  }

  const productArray = await res.json();

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
    throw new Error("You are not logged in. Please log in to continue.");
  }

  if (!res.ok) throw new Error("Product not found. It may have been removed.");
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
    throw new Error("Unable to create product. Please try again.");
  }

  return await res.text();
}

export async function updateProduct(id, updates) {
  const payload = { ...updates, id };
  const res = await fetch(`${BASE}/product-manager-access`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Unable to update product. Please try again.");
  }

  return await res.text();
}

export async function archiveProduct(id) {
  const res = await fetch(`${BASE}/product-manager-access/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Unable to delete product. Please try again.");
  }

  return true;
}

export async function fetchActiveProducts() {
  const res = await fetch(`${BASE}/product-manager-access/active`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Unable to load products. Please try again.");
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

  if (
    res.status === 401 ||
    res.status === 403 ||
    contentType.includes("text/html")
  ) {
    throw new Error(
      "You don't have permission to access this. Please log in as an admin."
    );
  }

  if (!res.ok) {
    throw new Error("Unable to load archived products. Please try again.");
  }

  return res.json();
}

export async function restoreProduct(id) {
  const response = await fetch(`${BASE}/product-manager-access/restore/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await response.text();
    throw new Error("Unable to restore product. Please try again.");
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

  throw new Error("Login failed. Please check your credentials and try again.");
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
    toast({
      title: "Success!",
      description: "Registration successful. You can now log in.",
      variant: "success", // Assuming you have a 'success' variant for styling
    });
    return true;
  }

  if (response.status === 409) {
    throw new Error(
      "This email address is already registered. Please use a different email or try logging in."
    );
  }

  throw new Error("Unable to create account. Please try again.");
}

export async function fetchAllOrders() {
  const res = await fetch(`${BASE}/orders-all`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Unable to load orders. Please try again.");
  const text = await res.text();
  if (!text || text.trim() === "") return [];
  return JSON.parse(text);
}

export async function fetchOrdersByStatus(status = "PAID") {
  const res = await fetch(`${BASE}/orders-all-status?status=${status}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Unable to load orders. Please try again.");
  const text = await res.text();
  if (!text || text.trim() === "") return [];
  return JSON.parse(text);
}

export async function fetchOrdersInCar(carId) {
  const res = await fetch(`${BASE}/loaded/${carId}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok)
    throw new Error("Unable to load delivery orders. Please try again.");
  const text = await res.text();
  if (!text || text.trim() === "") return [];
  return JSON.parse(text);
}
