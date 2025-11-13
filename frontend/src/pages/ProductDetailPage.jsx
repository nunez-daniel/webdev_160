import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, fetchProducts } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cartStore";
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
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedPage, setRelatedPage] = useState(1);
  const RELATED_PAGE_SIZE = 8;
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

  // fetch other products to show below the detail page (exclude current product)
  // helper: fetch a related page and return filtered items (excluding current id)
  async function fetchRelatedPage(page) {
    const res = await fetchProducts({ page, limit: RELATED_PAGE_SIZE });
    const items = Array.isArray(res?.items) ? res.items : [];
    const filtered = items.filter((it) => String(it.id) !== String(id));
    return filtered.slice(0, RELATED_PAGE_SIZE);
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
              {p.inStock ? (
                <Badge>In stock</Badge>
              ) : (
                <Badge variant="secondary">Out</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {p.brand} • {p.category}
            </p>
            <div className="text-2xl font-bold">${p.cost.toFixed(2)}</div>
            <p className="text-muted-foreground leading-relaxed">
              {p.description}
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => add(p, 1)} // add product with quantity 1
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => {
                  add(p, 1);
                  // navigate to cart page right after
                  navigate("/cart");
                }}
              >
                Buy Now
              </Button>
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
