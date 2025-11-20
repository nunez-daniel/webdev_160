import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import ProductRow from "@/components/admin/ProductRow";
import ProductForm from "@/components/admin/ProductForm";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchProducts({ page: 1, limit: 200 });
        // store full product list; we'll paginate client-side for the list view
        setProducts(res.items || res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  const onDelete = async (id) => {
    await deleteProduct(id);
    await refresh();
  };

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetchProducts({ page: 1, limit: 200 });
      setProducts(res.items || res);
    } finally {
      setLoading(false);
    }
  }

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

        <div className="mb-4">
          <Input
              placeholder="Search products (client-side)"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                if (!q) return refresh();
                setProducts((prev) =>
                    prev.filter((p) => (p.name || "").toLowerCase().includes(q))
                );
              }}
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
              {products
                  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                  .map((p) => (
                      <ProductRow
                          key={p.id}
                          product={p}
                          onEdit={() => setEditing(p)}
                          onDelete={() => onDelete(p.id)}
                      />
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls for list view */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {Math.min(products.length, (page - 1) * PAGE_SIZE + 1)} -{" "}
              {Math.min(products.length, page * PAGE_SIZE)} of {products.length}
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
                {Math.max(1, Math.ceil(products.length / PAGE_SIZE))}
            </span>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                      setPage((p) =>
                          Math.min(
                              Math.max(1, Math.ceil(products.length / PAGE_SIZE)),
                              p + 1
                          )
                      )
                  }
                  disabled={
                      page === Math.max(1, Math.ceil(products.length / PAGE_SIZE))
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
              products={products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
          />
        </div>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={(o) => setCreateOpen(o)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
              <DialogDescription>Fill in details to add a new product.</DialogDescription>
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
              <DialogDescription>Update fields and save changes.</DialogDescription>
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