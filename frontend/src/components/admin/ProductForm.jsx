import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/use-toast";

export default function ProductForm({
  initial = null,
  onSubmit,
  onCancel,
  layout = "inline",
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    cost: initial?.cost ?? "",
    stock: initial?.stock ?? "",
    imageUrl: initial?.imageUrl || "",
    weight: initial?.weight ?? "",
  });

  const submitting = false;
  const { toast } = useToast();

  const nameRef = useRef(null);
  useEffect(() => {
    if (layout === "stack" && nameRef.current) nameRef.current.focus();
  }, [layout]);

  const validateForm = () => {
    const requiredFields = {
      name: form.name,
      cost: form.cost,
      stock: form.stock,
      weight: form.weight,
      imageUrl: form.imageUrl
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === "" || value === null) {
        toast({
          title: "Validation Error",
          description: `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`,
          variant: "destructive",
        });
        return false;
      }
    }

    const imageUrlRegex = /\.(jpeg|jpg|gif|png|webp|svg)$/i;

    if (!imageUrlRegex.test(form.imageUrl)) {
      toast({
        title: "Validation Error",
        description: "Image URL must be a valid link ending in .jpg, .png, .gif, .webp, or .svg.",
        variant: "destructive",
      });
      return false;
    }

    const weightValue = Number(form.weight);
    if (weightValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Weight must be greater than 0.",
        variant: "destructive",
      });
      return false;
    }

    const stockValue = Number(form.stock);
    if (stockValue < 0) {
      toast({
        title: "Validation Error",
        description: "Stock cannot be negative.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };


  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!validateForm()) {
          return;
        }

        try {
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
        min="0.01"
        onChange={(e) => setForm({ ...form, cost: e.target.value })}
      />
      <Input
        className={layout === "stack" ? "w-full" : "w-20"}
        placeholder="Stock"
        type="number"
        value={form.stock}
        min="0"
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
        min="0.01"
        onChange={(e) => setForm({ ...form, weight: e.target.value })}
      />
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
