import React from "react";
import { Button } from "@/components/ui/button";

export default function ProductRow({ product, onEdit, onDelete }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3 align-top">{product.id}</td>
      <td className="p-3 align-top">{product.name}</td>
      <td className="p-3 align-top">${Number(product.cost ?? 0).toFixed(2)}</td>
      <td className="p-3 align-top">{product.stock ?? 0}</td>
      <td className="p-3 align-top">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Delete product?")) onDelete(product.id);
            }}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
