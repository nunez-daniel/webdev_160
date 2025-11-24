import { create } from "zustand";

const API_BASE_URL = "http://localhost:8080";

function money(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

let toastFunction = null;

export const setToastFunction = (fn) => {
  toastFunction = fn;
};

const showToast = (title, description, variant = "destructive") => {
  if (toastFunction) {
    toastFunction({
      title,
      description,
      variant,
    });
  }
};

export const useCart = create((set, get) => ({
  items: [],
  saved: [],

  isLoading: false,
  error: null,

  backendTotals: {
    subtotal: 0,
    total: 0,
    weight: 0,
    under_twenty_lbs: false,
  },

  apiFetch: async (endpoint, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("You are not logged in. Please log in to continue.");
        } else if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(`Bad request: ${errorText}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      const ct = response.headers.get("content-type") || "";
      if (response.redirected || ct.includes("text/html")) {
        await response.text();
        throw new Error("You are not logged in. Please log in to continue.");
      }

      const data = await response.json();
      get().setItemsFromBackend(data);

      return data;
    } catch (err) {
      console.error("Cart API Error:", err);
      set({ error: err.message, isLoading: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  initializeCart: async () => {
    await get().apiFetch("/cart", { method: "GET" });
  },

  setItemsFromBackend: (perfectlyMappedCartDTO) => {
    const safeDTO = perfectlyMappedCartDTO || {};

    set({
      items: safeDTO.items || [],

      backendTotals: {
        subtotal: safeDTO.subtotal || 0,
        total: safeDTO.total || safeDTO.subtotal || 0,
        weight: safeDTO.weight || 0,
        under_twenty_lbs: safeDTO.under_twenty_lbs || false,
        imageUrl: safeDTO.imageUrl,
      },
    });
  },

  add: async (product, qty = 1) => {
    try {
      await get().apiFetch("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(product.id),
          quantity: qty,
        }),
      });
    } catch (err) {
      const userMessage = err.message.includes("not logged in")
        ? err.message
        : "Unable to add item to cart. Please try again.";
      showToast("Failed to Add to Cart", userMessage);
      throw err;
    }
  },

  remove: async (id) => {
    await get().apiFetch(`/delete/${id}`, { method: "DELETE" });
  },

  updateQty: async (id, qty) => {
    const safeQty = Math.max(1, Math.min(99, qty));

    if (qty === 0) {
      return get().remove(id);
    }

    await get().apiFetch("/changeStock", {
      method: "PUT",
      body: JSON.stringify({
        productId: Number(id),
        quantity: safeQty,
      }),
    });
  },

  clear: async () => {
    await get().apiFetch("/clear", { method: "DELETE" });
  },

  reset: () =>
    set({
      items: [],
      saved: [],
      backendTotals: {
        subtotal: 0,
        total: 0,
        weight: 0,
        under_twenty_lbs: false,
      },
      error: null,
      isLoading: false,
    }),

  checkoutLink: async () => {
    const { totals } = get();
    if (totals().count === 0) return;

    try {
      set({ isLoading: true, error: null });

      const response = await fetch(`${API_BASE_URL}/new-cart`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        showToast("Not Logged In", "Please log in to complete your checkout.");
        set({ error: "You must be logged in to checkout", isLoading: false });
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        showToast(
          "Checkout Failed",
          "Unable to process your checkout. Please try again."
        );
        set({
          error: `Checkout failed: ${response.status} ${response.statusText} - ${text}`,
          isLoading: false,
        });
        return;
      }

      const ct = response.headers.get("content-type") || "";
      if (response.redirected || ct.includes("text/html")) {
        await response.text();
        showToast("Not Logged In", "Please log in to complete your checkout.");
        set({
          error: "You are not logged in",
          isLoading: false,
        });
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch {
        const txt = await response.text();
        showToast("Checkout Error", "Something went wrong. Please try again.");
        set({
          error: `Invalid response from server: ${txt}`,
          isLoading: false,
        });
        return;
      }

      if (data && data.status === "SUCCESS" && data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }

      const msg =
        (data && (data.message || data.error)) ||
        "Something went wrong with your checkout";
      showToast("Checkout Failed", msg);
      set({ error: `Checkout failed: ${msg}`, isLoading: false });
      return;
    } catch (err) {
      console.error("Checkout error:", err);
    }
  },

  saveForLater: (id) =>
    set((s) => {
      const item = s.items.find((i) => i.id === id);
      if (!item) return {};
      return {
        items: s.items.filter((i) => i.id !== id),
        saved: [{ ...item }, ...s.saved],
      };
    }),

  moveToCart: (id) => {
    const prod = get().saved.find((x) => x.id === id);
    if (!prod) return {};

    get()
      .add(prod, 1)
      .then(() => {
        set((s) => ({
          saved: s.saved.filter((x) => x.id !== id),
        }));
      })
      .catch(() => {
        console.error("Error adding to cart");
      });
  },

  totals: () => {
    const { items, backendTotals } = get();
    const count = items.reduce((n, i) => n + i.qty, 0);

    const subtotal = money(backendTotals.subtotal);
    const total = money(backendTotals.total);
    const fees = money(Math.max(0, total - subtotal));

    return {
      count,
      subtotal,
      fees,
      total,
      weight: backendTotals.weight,
      under_twenty_lbs: backendTotals.under_twenty_lbs,
    };
  },

  getProductQuantity: (productId) => {
    const { items } = get();
    const item = items.find(
      (item) =>
        Number(item?.productId) === Number(productId) ||
        Number(item?.product?.id) === Number(productId) ||
        Number(item?.id) === Number(productId)
    );
    return item ? item.qty : 0;
  },
}));
