import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import ProductGrid, { ProductGridSkeleton } from "@/components/ProductGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 12;

export default function CatalogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawSearch = searchParams.get("q") || "";
  const [notice, setNotice] = useState("");
  const updatedOnceRef = useRef(false);
  const search = searchParams.get("q") || "";

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts({
        page,
        limit: PAGE_SIZE,
        search: rawSearch,
      });
      setItems(data.items);
      setTotal(Number(data.total || 0));

      if (data.corrected && !updatedOnceRef.current) {
        setNotice(
          `Showing results for “${data.corrected}” (corrected from “${rawSearch}”).`
        );
        updatedOnceRef.current = true;
      } else {
        setNotice("");
      }
    } catch (e) {
      setError(e.message || "Failed loading products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    load();
  }, [page, search]);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  return (
    <div className="space-y-8">
      <div className="text-center py-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Fresh Groceries Delivered
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover organic, sustainable products for a healthier lifestyle
        </p>
        {notice && <div className="text-sm text-green-600 mt-2">{notice}</div>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {search ? `Search results for "${search}"` : "All Products"}
          </h2>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {items.length} items
          </Badge>
        </div>

        <div className="md:hidden w-full">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => navigate(`/catalog?q=${e.target.value}`)}
            className="w-full"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? <ProductGridSkeleton /> : <ProductGrid products={items} />}

      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or browse all categories
          </p>
        </div>
      )}

      {pages > 1 && (
        <div className="pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>

              {Array.from({ length: pages })
                .slice(0, 5)
                .map((_, i) => {
                  const n = i + 1;
                  return (
                    <PaginationItem key={n}>
                      <PaginationLink
                        isActive={n === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(n);
                        }}
                      >
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(pages, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
