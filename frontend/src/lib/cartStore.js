// A tiny cart store with "saved for later" support.
// npm i zustand
import { create } from "zustand";

function money(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export const useCart = create((set, get) => ({
  items:
    /** @type {Array<{id:string,name:string,price:number,imageUrl:string,qty:number,brand?:string,category?:string}>} */ ([]),
  saved:
    /** @type {Array<{id:string,name:string,price:number,imageUrl:string,brand?:string,category?:string}>} */ ([]),

  add: (product, qty = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: Math.min(99, i.qty + qty) } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, qty }] };
    });
  },

  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  updateQty: (id, qty) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i
      ),
    })),
  clear: () => set({ items: [] }),

  saveForLater: (id) =>
    set((s) => {
      const item = s.items.find((i) => i.id === id);
      if (!item) return {};
      return {
        items: s.items.filter((i) => i.id !== id),
        saved: [{ ...item }, ...s.saved],
      };
    }),

  moveToCart: (id) =>
    set((s) => {
      const prod = s.saved.find((x) => x.id === id);
      if (!prod) return {};
      const already = s.items.find((i) => i.id === id);
      return {
        saved: s.saved.filter((x) => x.id !== id),
        items: already
          ? s.items.map((i) =>
              i.id === id ? { ...i, qty: Math.min(99, i.qty + 1) } : i
            )
          : [{ ...prod, qty: 1 }, ...s.items],
      };
    }),

  totals: () => {
    const items = get().items;
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = money(items.reduce((n, i) => n + i.price * i.qty, 0));
    const fees = money(subtotal * 0.05); // sample service + taxes (5%)
    const total = money(subtotal + fees);
    return { count, subtotal, fees, total };
  },
}));
