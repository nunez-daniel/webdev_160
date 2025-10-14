import { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cartStore";

function CartSummary() {
  const { items, totals } = useCart();
  const t = totals();
  const fees = t.subtotal * 0.08; // est. 8% fees/tax (adjust as needed)
  const total = t.subtotal + fees;
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span className="font-medium">${t.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Fees & taxes (est.)</span>
        <span className="font-medium">${fees.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={() => navigate("/cart")}>
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
  );
}

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const currentQ = params.get("q") || "";

  // show current query in the input when you're on /catalog
  const [value, setValue] = useState(currentQ);
  useEffect(() => {
    if (location.pathname.startsWith("/catalog") || location.pathname === "/") {
      setValue(currentQ);
    }
  }, [currentQ, location.pathname]);

  const goSearch = () => {
    const q = value.trim();
    const url = q ? `/catalog?q=${encodeURIComponent(q)}` : `/catalog`;
    navigate(url);
  };

  // cart state
  const { items, remove, updateQty, totals } = useCart();
  const t = totals();
  const count = t.count;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link to="/catalog" className="text-xl font-bold">
          OFSGrocery
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {/* search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goSearch();
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
          <Button className="md:hidden" onClick={goSearch}>
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
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
                <SheetDescription>
                  Review items and update quantities.
                </SheetDescription>
              </SheetHeader>

              <Separator />

              <div className="flex h-[calc(100%-5rem)] flex-col">
                <div className="flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      Start by adding items from the catalog.
                    </div>
                  ) : (
                    items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3 p-4">
                        <div className="h-16 w-20 overflow-hidden rounded bg-white">
                          <img
                            src={
                              it.imageUrl ||
                              `data:image/svg+xml;utf8,${encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='90'>
          <rect width='100%' height='100%' fill='white'/>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Segoe UI, Arial' font-size='32' fill='black'>✕</text>
        </svg>`
                              )}`
                            }
                            alt={it.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // swap to fallback if the image fails to load
                              const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='90'>
        <rect width='100%' height='100%' fill='white'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          font-family='Segoe UI, Arial' font-size='32' fill='black'>✕</text>
      </svg>`;
                              e.currentTarget.onerror = null; // prevent loop
                              e.currentTarget.src = `data:image/svg+xml;base64,${btoa(
                                svg
                              )}`;
                            }}
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
                              variant="secondary"
                              size="icon"
                              onClick={() => remove(it.id)}
                              aria-label={`Remove ${it.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQty(it.id, Math.max(1, it.qty - 1))
                                } // clamp
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
                                  const n = Math.max(
                                    1,
                                    parseInt(e.target.value || "1", 10) || 1
                                  );
                                  updateQty(it.id, n);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQty(it.id, Math.min(99, it.qty + 1))
                                }
                              >
                                +
                              </Button>
                            </div>

                            <div className="font-semibold">
                              ${(Number(it.price || 0) * it.qty).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                {/* summary */}
                <CartSummary />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
