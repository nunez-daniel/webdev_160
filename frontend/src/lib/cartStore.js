import { create } from "zustand";
import { getFeeProductId } from "@/lib/config";

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
          throw new Error("User please login");
        } else if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(`Bad request: ${errorText}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      // Defensive: some endpoints redirect to login and return HTML. Detect and handle.
      const ct = response.headers.get("content-type") || "";
      if (response.redirected || ct.includes("text/html")) {
        const html = await response.text();
        // If the server returned HTML (likely login page), surface a clear error.
        throw new Error("Not authenticated (received HTML login page)");
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
      await get().apiFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          productId: Number(product.id),
          quantity: qty,
        }),
      });
    } catch (err) {
      showToast("Failed to Add to Cart", err.message || "An error occurred while adding the item to your cart.");
      throw err;
    }
  },

  remove: async (id) => {
    await get().apiFetch(`/delete/${id}`, { method: "DELETE" });
  },

  updateQty: async (id, qty) => {
    const safeQty = Math.max(1, Math.min(99, qty));

    // remove if 0
    if (qty === 0) {
      return get().remove(id);
    }

    try {
      await get().apiFetch('/changeStock', {
        method: 'PUT',
        body: JSON.stringify({
          productId: Number(id),
          quantity: safeQty,
        }),
      });
    } catch (err) {
      showToast("Failed to Update Quantity", err.message || "An error occurred while updating the item quantity.");
      throw err;
    }
  },

  clear: async () => {
    await get().apiFetch("/clear", { method: "DELETE" });
  },

  // Reset local cart state (use after logout)
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

    try
    {
      const response = await fetch(`${API_BASE_URL}/new-cart`, {
        method : 'GET',
        credentials : 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("User please login");
        }
      }

      const data = await response.json();

      if (data.status === "SUCCESS" && data.sessionUrl)
      {
        window.location.href = data.sessionUrl;
      } else
      {
        throw new Error(data.message);
      }


    }catch (err) {
      showToast("Checkout Failed", err.message || "An error occurred while processing your checkout.");
      throw err;
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

    // page default is add to cart not ATC quantity which I think we prefer
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

  // TODO... to implement the use of Boolean for over 20 or not
  totals: () => {
    const { items, backendTotals } = get();

    const feeProductId = getFeeProductId();

    const fixedFeeItem = items.find((i) => i.id === feeProductId);
    const fixedFeeAmount = fixedFeeItem ? money(fixedFeeItem.price * fixedFeeItem.qty) : 0;
    const count = items.filter(i => i.id !== feeProductId).reduce((n, i) => n + i.qty, 0);

    const rawBackendSubtotal = money(backendTotals.subtotal);
    const displaySubtotal = money(rawBackendSubtotal - fixedFeeAmount);
    const total = money(backendTotals.total);
    const displayFees = money(Math.max(0, total - displaySubtotal));

    return {
      count,
      subtotal: displaySubtotal,
      fees: displayFees,
      total,
      weight: backendTotals.weight,
      under_twenty_lbs: backendTotals.under_twenty_lbs,
    };
  },


  // Get quantity of a specific product in cart
  getProductQuantity: (productId) => {
    const { items } = get();
    const item = items.find(
        (item) =>
            // Some DTOs use `productId`, others embed `product.id`, and some old responses put the
            // product id into `id` as a string — check all variants defensively.
            Number(item?.productId) === Number(productId) ||
            Number(item?.product?.id) === Number(productId) ||
            Number(item?.id) === Number(productId)
    );
    return item ? item.qty : 0;
  },
}));