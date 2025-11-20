import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, fetchProducts } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cartStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import ProductGrid, { ProductGridSkeleton } from "@/components/ProductGrid";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [p, setP] = useState(null);
  const { add } = useCart();
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const getProductQuantity = useCart((s) => s.getProductQuantity);
  const items = useCart((s) => s.items);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedPage, setRelatedPage] = useState(1);
  const RELATED_PAGE_SIZE = 15;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProductById(id)
      .then((data) => {
        if (mounted) setP(data);
      })
      .catch((e) => setError(e.message || "Failed"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  // local qty + optimistic UI for detail page
  const [localQty, setLocalQty] = useState(0);
  const [optimisticAdded, setOptimisticAdded] = useState(false);
  const inputRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    if (!p) return;
    const q = getProductQuantity(p.id) || 0;
    setLocalQty(q);
    setOptimisticAdded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, items]);

  // fetch other products to show below the detail page (exclude current product)
  // helper: fetch a related page and return filtered items (excluding current id)
  async function fetchRelatedPage(page) {
    // Some backends / mocks return the full list or paged results that may
    // include the current product on arbitrary pages. To keep the "related"
    // pagination simple and stable we fetch a larger window client-side,
    // remove the current product, then slice into pages of RELATED_PAGE_SIZE.
    // This is acceptable for small catalogs; if you have thousands of items
    // we should switch to server-side related endpoints.
    const fetchLimit = RELATED_PAGE_SIZE * 5; // fetch a few pages worth
    const res = await fetchProducts({ page: 1, limit: fetchLimit });
    const all = Array.isArray(res?.items) ? res.items : [];
    const filtered = all.filter((it) => String(it.id) !== String(id));

    const start = (page - 1) * RELATED_PAGE_SIZE;
    return filtered.slice(start, start + RELATED_PAGE_SIZE);
  }

  useEffect(() => {
    let mounted = true;
    setRelatedLoading(true);
    fetchRelatedPage(relatedPage)
      .then((items) => {
        if (!mounted) return;
        setRelated(items);
        // if fetched less than a full page, assume no more after this page
        setHasMore(items.length === RELATED_PAGE_SIZE);
      })
      .catch(() => {
        if (!mounted) return;
        setRelated([]);
        setHasMore(false);
      })
      .finally(() => setRelatedLoading(false));

    return () => {
      mounted = false;
    };
  }, [id, relatedPage]);

  // navigate to previous page (always allowed when >1)
  async function handlePrev() {
    if (relatedPage <= 1) return;
    const target = relatedPage - 1;
    setRelatedPage(target);
  }

  // navigate to next page only if next page actually has items
  async function handleNext() {
    const target = relatedPage + 1;
    setRelatedLoading(true);
    try {
      const items = await fetchRelatedPage(target);
      if (items && items.length > 0) {
        setRelated(items);
        setRelatedPage(target);
        setHasMore(items.length === RELATED_PAGE_SIZE);
      } else {
        // no more items; mark hasMore false so UI disables Next
        setHasMore(false);
      }
    } catch (e) {
      setHasMore(false);
    } finally {
      setRelatedLoading(false);
    }
  }

  return (
    <main className="w-full px-4 py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/catalog");
              }}
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {loading && <DetailSkeleton />}
      {error && (
        <div className="rounded-lg border p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {p && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="w-full">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full rounded-xl object-cover"
              />
            ) : (
              <div className="w-full rounded-xl bg-gray-50 flex items-center justify-center h-80">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-3xl font-semibold">{p.name}</h1>
              {
                (() => {
                  // compute availability from product stock and quantity in cart
                  const stock = Math.max(0, Number(p?.stock ?? (p?.inStock ? 9999 : 0)));
                  const qtyInCart = getProductQuantity(p.id) || 0;
                  const available = Math.max(0, stock - qtyInCart);
                  return available > 0 ? (
                    <Badge>In stock</Badge>
                  ) : (
                    <Badge variant="secondary">Out</Badge>
                  );
                })()
              }
            </div>

            {/* Dialog for backend messages (stock errors) */}
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

            <p className="text-sm text-muted-foreground">
              {p.brand} • {p.category}
            </p>
            <div className="text-2xl font-bold">${p.cost.toFixed(2)}</div>
            <p className="text-muted-foreground leading-relaxed">
              {p.description}
            </p>

            <div className="flex gap-3 pt-2">
              {/** Compute cart / stock visibility once so we can hide Buy Now when control is shown */}
              {(() => {
                const quantityInCart = p ? getProductQuantity(p.id) || 0 : 0;
                const stock = Math.max(0, Number(p?.stock ?? (p?.inStock ? 9999 : 0)));
                const available = Math.max(0, stock - (quantityInCart + (optimisticAdded ? 1 : 0)));
                const showControl = quantityInCart > 0 || optimisticAdded;

                if (!showControl) {
                  return (
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={available === 0}
                      onClick={async () => {
                        try {
                          setOptimisticAdded(true);
                          setLocalQty(1);
                          await add(p, 1);
                        } catch (error) {
                          setOptimisticAdded(false);
                          console.error("Add failed:", error);
                          const msg = (error && error.message) || "Failed to add to cart";
                          if (msg.toLowerCase().includes("login") || msg.includes("401") || msg.includes("403")) {
                            alert("Please log in to add items to your cart");
                          } else if (msg.toLowerCase().includes("bad request") || msg.toLowerCase().includes("not enough stock")) {
                            const text = msg.replace(/^Bad request:\s*/i, "");
                            setDialogMessage(text || "Not enough stock");
                            setDialogOpen(true);
                            setLocalQty(0);
                          } else {
                            alert("Failed to add item. Please try again.");
                          }
                        }
                      }}
                    >
                      {available === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  );
                }

                // show quantity control
                return (
                  <div className="flex items-center gap-2">
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={async () => {
                        const newQty = Math.max(0, localQty - 1);
                        setLocalQty(newQty);
                        try {
                          if (newQty === 0) {
                            await remove(p.id);
                          } else {
                            await updateQty(p.id, newQty);
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
                      className="w-20 text-center border rounded px-2 py-1 text-sm"
                      value={localQty}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^\d*$/.test(v)) setLocalQty(v === "" ? 0 : Number(v));
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const parsed = parseInt(e.target.value, 10);
                          if (Number.isNaN(parsed)) {
                            setLocalQty(quantityInCart);
                            return;
                          }
                          const clamped = Math.max(0, Math.min(stock, parsed));
                          setLocalQty(clamped);
                          try {
                            if (clamped === 0) {
                              await remove(p.id);
                            } else if (clamped !== quantityInCart) {
                              await updateQty(p.id, clamped);
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
                      size="lg"
                      variant="ghost"
                      onClick={async () => {
                        const newQty = Math.min(stock, localQty + 1);
                        setLocalQty(newQty);
                        try {
                          await updateQty(p.id, newQty);
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
                );
              })()}

              {/* Only show Buy Now when control is NOT shown */}
              {(() => {
                const quantityInCart = p ? getProductQuantity(p.id) || 0 : 0;
                const showControl = quantityInCart > 0 || optimisticAdded;
                if (showControl) return null;
                return (
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={async () => {
                      try {
                        await add(p, 1);
                        navigate("/cart");
                      } catch (err) {
                        console.error("Buy now add failed:", err);
                        const msg = (err && err.message) || "";
                        if (msg.toLowerCase().includes("bad request") || msg.toLowerCase().includes("not enough stock")) {
                          const text = msg.replace(/^Bad request:\s*/i, "");
                          setDialogMessage(text || "Not enough stock");
                          setDialogOpen(true);
                        } else if (msg.toLowerCase().includes("login") || msg.includes("401") || msg.includes("403")) {
                          alert("Please log in to buy");
                        } else {
                          alert("Failed to add item. Please try again.");
                        }
                      }
                    }}
                  >
                    Buy Now
                  </Button>
                );
              })()}
            </div>

            <p className="text-sm text-muted-foreground pt-2">
              {p.rating}★ average rating • {p.reviewsCount} reviews
            </p>
          </div>
        </div>
      )}

      {/* Related / browse section */}
      <section className="pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            More products you might like
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/catalog")}
              className="text-green-600"
            >
              View all
            </Button>
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={relatedPage <= 1 || relatedLoading}
                className="px-2"
              >
                <ChevronLeft className="h-4 w-4 text-green-600" />
              </Button>
              <div className="px-3 text-sm">Page {relatedPage}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={!hasMore || relatedLoading}
                className="px-2"
              >
                <ChevronRight className="h-4 w-4 text-green-600" />
              </Button>
            </div>
          </div>
        </div>

        {relatedLoading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid products={related} />
        )}
      </section>
    </main>
  );
}
