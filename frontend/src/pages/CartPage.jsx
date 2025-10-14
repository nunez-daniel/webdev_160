import { useMemo } from "react";
import { useCart } from "@/lib/cartStore";
import CartItemRow from "@/components/CartItemRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, saved, totals, clear, moveToCart } = useCart();
  const t = useMemo(() => totals(), [items]);
  const navigate = useNavigate();

  return (
    <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold">Your Cart</h1>

        <Card>
          <CardHeader>
            <CardTitle>Items ({t.count})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-6 text-muted-foreground">
                Your cart is empty.{" "}
                <Button
                  variant="secondary"
                  onClick={() => navigate("/catalog")}
                >
                  Browse products
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[96px]">Item</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[200px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Subtotal</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <CartItemRow key={it.id} item={it} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <SavedForLater saved={saved} moveToCart={moveToCart} />
      </section>

      <aside className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{t.count}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${t.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fees & taxes (est.)</span>
                <span>${t.fees.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${t.total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full mt-4" disabled={t.count === 0}>
              Checkout
            </Button>
            <Button
              className="w-full mt-4"
              onClick={clear}
              disabled={t.count === 0}
            >
              Clear cart
            </Button>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}

function SavedForLater({ saved, moveToCart }) {
  if (!saved?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved for later ({saved.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {saved.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-18 overflow-hidden rounded bg-muted">
                {/* eslint-disable-next-line */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.brand} • {p.category}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-semibold">${p.price.toFixed(2)}</div>
              <Button variant="outline" onClick={() => moveToCart(p.id)}>
                Move to cart
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
