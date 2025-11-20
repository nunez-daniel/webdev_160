import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProductForm({ initial = null, onSubmit, onCancel, layout = "inline" }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    // Use empty strings for new items so placeholders are visible instead of 0
    cost: initial?.cost ?? "",
    stock: initial?.stock ?? "",
    imageUrl: initial?.imageUrl || "",
    weight: initial?.weight ?? "",
  });

  const submitting = false;

  const nameRef = useRef(null);
  useEffect(() => {
    // focus first field when shown in dialog (stack layout)
    if (layout === "stack" && nameRef.current) nameRef.current.focus();
  }, [layout]);

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
      className={
        layout === "stack"
          ? "flex flex-col gap-3"
          : "flex gap-2 items-center flex-wrap"
      }
    >
      <Input
        ref={nameRef}
        className={layout === "stack" ? "w-full" : "max-w-xs"}
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        className={layout === "stack" ? "w-full" : "w-28"}
        placeholder="Cost"
        type="number"
        value={form.cost}
        step="0.01"
        onChange={(e) => setForm({ ...form, cost: e.target.value })}
      />
      <Input
        className={layout === "stack" ? "w-full" : "w-20"}
        placeholder="Stock"
        type="number"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />
      <Input
        className={layout === "stack" ? "w-full" : "w-48"}
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
      />
      <Input
        className={layout === "stack" ? "w-full" : "w-28"}
        placeholder="Weight"
        type="number"
        step="0.01"
        value={form.weight}
        onChange={(e) => setForm({ ...form, weight: e.target.value })}
      />
      {/* If there are additional attributes later (brand, category, description) add inputs here. */}
      <div className={layout === "stack" ? "flex gap-2 pt-2" : undefined}>
        <Button type="submit" disabled={submitting}>
          {initial ? "Save" : "Create"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
