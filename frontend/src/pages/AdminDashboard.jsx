import { useEffect, useState, useCallback } from "react";
import ProductGrid from "@/components/ProductGrid";
import ProductRow from "@/components/admin/ProductRow";
import ProductForm from "@/components/admin/ProductForm";
import {
  fetchActiveProducts,
  fetchArchivedProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [masterActiveProducts, setMasterActiveProducts] = useState([]);
  const [masterArchivedProducts, setMasterArchivedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const sourceProducts =
    viewMode === "active" ? masterActiveProducts : masterArchivedProducts;

  const filteredProducts = sourceProducts.filter((p) =>
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const productsToDisplay = filteredProducts;
  const totalProductsInView = filteredProducts.length;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const activeRes = await fetchActiveProducts();
      setMasterActiveProducts(activeRes.items || activeRes);

      const archivedRes = await fetchArchivedProducts();
      setMasterArchivedProducts(archivedRes.items || archivedRes);
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCreate = async (data) => {
    const created = await createProduct(data);
    await refresh();
    return created;
  };

  const onUpdate = async (id, updates) => {
    const updated = await updateProduct(id, updates);
    await refresh();
    return updated;
  };

  const onArchive = async (id) => {
    if (confirm("Are you sure you want to archive this product?")) {
      await archiveProduct(id);
      await refresh();
    }
  };

  const onRestore = async (id) => {
    if (
      confirm("Restore this product? It will appear in the active catalog.")
    ) {
      try {
        await restoreProduct(id);
        window.location.reload();
      } catch (error) {
        console.error("Restore failed:", error);
        // alert("Failed to restore product. See console for details.");
      }
    }
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    setPage(1);
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="py-12 text-center text-gray-500">
          Loading products...
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Button onClick={() => setCreateOpen(true)}>New Product</Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={() => {
            setViewMode("active");
            setPage(1);
            setSearchQuery("");
          }}
          variant={viewMode === "active" ? "default" : "outline"}
        >
          Active Products ({masterActiveProducts.length})
        </Button>
        <Button
          onClick={() => {
            setViewMode("archived");
            setPage(1);
            setSearchQuery("");
          }}
          variant={viewMode === "archived" ? "default" : "outline"}
        >
          Archived Products ({masterArchivedProducts.length})
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder={`Search products in ${viewMode} view`}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div>
        {/* List view using table-like rows for admin editing (paginated) */}
        <div className="overflow-x-auto bg-white rounded shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsToDisplay
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                .map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEdit={() => setEditing(p)}
                    onDelete={onArchive}
                    onRestore={onRestore}
                  />
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls for list view */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {Math.min(totalProductsInView, (page - 1) * PAGE_SIZE + 1)}{" "}
            - {Math.min(totalProductsInView, page * PAGE_SIZE)} of{" "}
            {totalProductsInView}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <span className="text-sm">
              Page {page} of{" "}
              {Math.max(1, Math.ceil(totalProductsInView / PAGE_SIZE))}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    Math.max(1, Math.ceil(totalProductsInView / PAGE_SIZE)),
                    p + 1
                  )
                )
              }
              disabled={
                page === Math.max(1, Math.ceil(totalProductsInView / PAGE_SIZE))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3">Grid Preview</h2>
        <ProductGrid
          products={productsToDisplay.slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE
          )}
        />
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => setCreateOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>
              Fill in details to add a new product.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            layout="stack"
            onSubmit={async (vals) => {
              await onCreate(vals);
              setCreateOpen(false);
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update fields and save changes.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <ProductForm
              layout="stack"
              initial={editing}
              onSubmit={async (vals) => {
                await onUpdate(editing.id, vals);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
