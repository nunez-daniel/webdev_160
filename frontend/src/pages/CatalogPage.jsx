import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/lib/api";
import ProductGrid, { ProductGridSkeleton } from "@/components/ProductGrid";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

console.log("Mock mode:", import.meta.env.VITE_USE_MOCK);

const PAGE_SIZE = 12;

export default function CatalogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts({ page, limit: PAGE_SIZE, search });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e.message || "Failed loading products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [page, search]);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Browse</h1>

      {error && (
        <div className="rounded-lg border p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? <ProductGridSkeleton /> : <ProductGrid products={items} />}

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
    </main>
  );
}
