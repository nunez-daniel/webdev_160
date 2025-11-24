import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/cartStore";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  // subscribe to items so component updates when cart changes
  const items = useCart((s) => s.items);

  const goToDetail = () => navigate(`/products/${product.id}`);
  const price = Number(product.cost ?? 0);

  // items from backend (VirtualCartDTO) use `id` (string) and `qty`
  const quantityInCart =
      items.find((it) =>
          Number(it?.id) === Number(product.id) ||
          Number(it?.productId) === Number(product.id) ||
          Number(it?.product?.id) === Number(product.id)
      )?.qty || 0;

  // compute stock defensively (treat missing/negative as 0)
  const stock = Math.max(0, Number(product.stock ?? 0));

  const [localQty, setLocalQty] = useState(quantityInCart);
  const inputRef = useRef(null);
  const [optimisticAdded, setOptimisticAdded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    setLocalQty(quantityInCart);
    // clear optimistic flag once cart state is authoritative
    setOptimisticAdded(false);
  }, [quantityInCart]);

  // react to external stock changes: clamp local qty and update cart if needed
  // available stock for purchase (accounts for reserved qty in cart)
  const available = Math.max(0, stock - (quantityInCart + (optimisticAdded ? 1 : 0)));

  // react to external stock changes: clamp local qty and update cart if needed
  useEffect(() => {
    // If backend stock decreased below the qty we have in cart / local control
    if (stock < localQty) {
      const clamped = Math.max(0, stock);
      setLocalQty(clamped);
      if (clamped === 0) {
        if (quantityInCart > 0) remove(product.id).catch(() => {});
      } else {
        updateQty(product.id, clamped).catch(() => {});
      }
    }
    // If stock becomes 0, ensure cart is cleared
    if (stock === 0 && quantityInCart > 0) {
      remove(product.id).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock, quantityInCart]);

  return (
      <Card
          className="group hover:shadow-lg hover:shadow-green-100 transition-all duration-200 border-0 shadow-sm bg-white overflow-hidden cursor-pointer"
          onClick={goToDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToDetail();
          }}
      >
        <div className="p-4">
          {/* Product Image */}
          <div className="relative mb-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
              {product.imageUrl ? (
                  <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                  />
              ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <span className="text-sm">No image</span>
                  </div>
              )}
            </div>
            {available > 0 ? (
                <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white border-0">
                  In Stock
                </Badge>
            ) : (
                <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-gray-100 text-gray-600"
                >
                  Out of Stock
                </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div className="min-h-[2.5rem]">
              <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                {product.name}
              </h3>
            </div>

            <div className="text-xs text-gray-500">
              <span>{product.brand || "Store Brand"}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="text-yellow-400">★</span>
              <span>{(product.rating ?? 4.2).toFixed(1)}</span>
              <span>({product.reviewsCount ?? 127})</span>
            </div>

            {/* Description snippet if available */}
            {product.description && (
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
            )}

            {/* Nutrition highlights */}
            <div className="flex flex-wrap gap-1">
              {product.organic && (
                  <Badge
                      variant="outline"
                      className="text-xs px-2 py-0 border-green-200 text-green-700 bg-green-50"
                  >
                    Organic
                  </Badge>
              )}
              {product.glutenFree && (
                  <Badge
                      variant="outline"
                      className="text-xs px-2 py-0 border-blue-200 text-blue-700 bg-blue-50"
                  >
                    Gluten-Free
                  </Badge>
              )}
              {product.vegan && (
                  <Badge
                      variant="outline"
                      className="text-xs px-2 py-0 border-purple-200 text-purple-700 bg-purple-50"
                  >
                    Vegan
                  </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Price and Add to Cart */}
        <div className="px-4 pb-4">
          <Separator className="mb-4 border-gray-100" />
          <div className="flex items-center justify-between mb-3">
            <div>
            <span className="text-lg font-semibold text-gray-900">
              ${price.toFixed(2)}
            </span>
              {product.originalPrice && product.originalPrice > price && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
              )}
            </div>
            {product.unit && (
                <span className="text-xs text-gray-500">{product.unit}</span>
            )}
          </div>

          {quantityInCart === 0 && !optimisticAdded ? (
              <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg py-2.5 font-medium transition-colors"
                  disabled={available === 0}
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      // optimistic UI: show qty control immediately
                      setOptimisticAdded(true);
                      setLocalQty(1);
                      await add(product, 1);
                    } catch (error) {
                      setOptimisticAdded(false);
                      const msg = (error && error.message) || "Failed to add to cart";
                      if (
                          msg.toLowerCase().includes("login") ||
                          msg.includes("401") ||
                          msg.includes("403")
                      ) {
                        alert("Please log in to add items to your cart");
                      } else if (msg.toLowerCase().includes("bad request") || msg.toLowerCase().includes("not enough stock")) {
                        const text = msg.replace(/^Bad request:\s*/i, "");
                        setDialogMessage(text || `Failed to add ${product.name} to cart.`);
                        setDialogOpen(true);
                        setLocalQty(0);
                      } else {
                        alert(
                            `Failed to add ${product.name} to cart. Please try again.`
                        );
                      }
                    }
                  }}
              >
                {available === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
          ) : (quantityInCart > 0 || optimisticAdded) ? (
              <div
                  className="mt-3 flex items-center justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
              >
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newQty = Math.max(0, localQty - 1);
                      setLocalQty(newQty);
                      try {
                        if (newQty === 0) {
                          await remove(product.id);
                        } else {
                          await updateQty(product.id, newQty);
                        }
                      } catch (err) {
                        console.error(err);
                        const msg = (err && err.message) || "";
                        if (msg.toLowerCase().includes("bad request") || msg.toLowerCase().includes("not enough stock")) {
                          const text = msg.replace(/^Bad request:\s*/i, "");
                          setDialogMessage(text || "Not enough stock");
                          setDialogOpen(true);
                          setLocalQty(quantityInCart);
                        }
                      }
                    }}
                    disabled={localQty <= 0}
                >
                  -
                </Button>

                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    className="w-16 text-center border rounded px-2 py-1 text-sm"
                    value={localQty}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*$/.test(v)) {
                        setLocalQty(v === "" ? 0 : Number(v));
                      }
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        const parsed = parseInt(e.target.value, 10);
                        if (Number.isNaN(parsed)) {
                          setLocalQty(quantityInCart);
                          return;
                        }
                        const clamped = Math.max(0, Math.min(stock, parsed));
                        setLocalQty(clamped);
                        try {
                          if (clamped === 0) {
                            await remove(product.id);
                          } else if (clamped !== quantityInCart) {
                            await updateQty(product.id, clamped);
                          }
                        } catch (err) {
                          console.error(err);
                          const msg = (err && err.message) || "";
                          if (msg.toLowerCase().includes("bad request") || msg.toLowerCase().includes("not enough stock")) {
                            const text = msg.replace(/^Bad request:\s*/i, "");
                            setDialogMessage(text || "Not enough stock");
                            setDialogOpen(true);
                            setLocalQty(quantityInCart);
                          }
                        }
                      }
                    }}
                />

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newQty = Math.min(stock, localQty + 1);
                      setLocalQty(newQty);
                      try {
                        await updateQty(product.id, newQty);
                      } catch (err) {
                        console.error(err);
                        const msg = (err && err.message) || "";
                        if (msg.toLowerCase().includes("bad request") || msg.toLowerCase().includes("not enough stock")) {
                          const text = msg.replace(/^Bad request:\s*/i, "");
                          setDialogMessage(text || "Not enough stock");
                          setDialogOpen(true);
                          setLocalQty(quantityInCart);
                        }
                      }
                    }}
                    disabled={localQty >= stock}
                >
                  +
                </Button>
              </div>
          ) : null}
        </div>

        {/* Dialog for showing backend messages (e.g., out of stock) */}
        <Dialog open={dialogOpen} onOpenChange={(v) => setDialogOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notice</DialogTitle>
              <DialogDescription>{dialogMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={() => setDialogOpen(false)}>OK</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </Card>
  );
}