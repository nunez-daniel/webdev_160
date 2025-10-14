import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useCart } from "@/lib/cartStore";

export default function TopNav({ search, onSearch }) {
  const [value, setValue] = useState(search ?? "");
  const navigate = useNavigate();

  // cart state
  const { items, remove, updateQty, totals } = useCart();
  const t = totals();
  const count = t.count;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <a href="/catalog" className="text-xl font-bold">
          OFSGrocery
        </a>

        <div className="ml-auto flex items-center gap-3">
          {/* search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch?.(value);
            }}
            className="hidden md:block"
          >
            <Input
              placeholder="Search products…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-[320px]"
            />
          </form>
          <Button className="md:hidden" onClick={() => onSearch?.(value)}>
            Search
          </Button>

          {/* CART SHEET */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart
                {count > 0 && (
                  <span className="absolute -right-2 -top-2">
                    <Badge className="rounded-full px-2">{count}</Badge>
                  </span>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
              <div className="flex h-full flex-col">
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Your Cart</h3>
                  <p className="text-sm text-muted-foreground">
                    {count === 0
                      ? "No items yet."
                      : `${count} item${count > 1 ? "s" : ""}`}
                  </p>
                </div>
                <Separator />

                {/* items list */}
                <div className="flex-1 overflow-y-auto">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 p-4">
                      <div className="h-16 w-20 overflow-hidden rounded bg-muted">
                        {/* eslint-disable-next-line */}
                        <img
                          src={it.imageUrl}
                          alt={it.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate">
                            <div className="font-medium truncate">
                              {it.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {it.brand || "Food"} • {it.category || "Item"}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(it.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQty(it.id, it.qty - 1)}
                            >
                              -
                            </Button>
                            <Input
                              className="w-14 text-center"
                              type="number"
                              min={1}
                              max={99}
                              value={it.qty}
                              onChange={(e) => {
                                const n = parseInt(e.target.value || "1", 10);
                                updateQty(it.id, isNaN(n) ? 1 : n);
                              }}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQty(it.id, it.qty + 1)}
                            >
                              +
                            </Button>
                          </div>

                          <div className="font-semibold">
                            ${(it.price * it.qty).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">
                      Start by adding items from the catalog.
                    </div>
                  )}
                </div>

                <Separator />
                {/* footer summary */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      ${t.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fees & taxes (est.)</span>
                    <span className="font-medium">${t.fees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>${t.total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      disabled={items.length === 0}
                      onClick={() => navigate("/cart")}
                    >
                      View Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={items.length === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
