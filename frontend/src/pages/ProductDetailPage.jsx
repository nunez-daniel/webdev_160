import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`http://localhost:8080/products/${p.id}/image`}
              alt={p.name}
              className="w-full rounded-xl object-cover"
            />
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

            <div className="text-2xl font-bold">${p.price.toFixed(2)}</div>
            <p className="text-muted-foreground leading-relaxed">
              {p.description}
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => alert("Add to cart: wire up later")}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => alert("Buy now: wire up later")}
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
    </main>
  );
}
