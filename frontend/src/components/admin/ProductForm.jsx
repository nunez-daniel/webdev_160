import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function ProductForm({ initial = null, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    // Use empty strings for new items so placeholders are visible instead of 0
    cost: initial?.cost ?? "",
    stock: initial?.stock ?? "",
    imageUrl: initial?.imageUrl || "",
    weight: initial?.weight ?? "",
  });

  const submitting = false;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!form.name) return alert("Name is required");
        try {
          // normalize numeric fields: convert empty strings to null so backend can decide default
          const payload = {
            ...form,
            cost: form.cost === "" ? null : form.cost,
            stock: form.stock === "" ? null : Number(form.stock),
            weight: form.weight === "" ? null : form.weight,
          };
          await onSubmit({ ...payload, id: initial?.id });
          setForm({ name: "", cost: "", stock: "", imageUrl: "", weight: "" });
        } catch (err) {
          console.error(err);
          alert("Failed to save product: " + (err.message || err));
        }
      }}
      className="flex gap-2 items-center"
    >
      <Input
        className="max-w-xs"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        className="w-28"
        placeholder="Cost"
        type="number"
        value={form.cost}
        step="0.01"
        onChange={(e) => setForm({ ...form, cost: e.target.value })}
      />
      <Input
        className="w-20"
        placeholder="Stock"
        type="number"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />
      <Input
        className="w-48"
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
      />
      <Input
        className="w-28"
        placeholder="Weight"
        type="number"
        step="0.01"
        value={form.weight}
        onChange={(e) => setForm({ ...form, weight: e.target.value })}
      />
      {/* If there are additional attributes later (brand, category, description) add inputs here. */}
      <div>
        <button
          type="submit"
          className="px-3 py-1 bg-green-600 text-white rounded mr-2"
          disabled={submitting}
        >
          {initial ? "Save" : "Create"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="px-3 py-1 border rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
