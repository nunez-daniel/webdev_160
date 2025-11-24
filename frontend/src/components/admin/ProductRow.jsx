import React from "react";
import { Button } from "@/components/ui/button";

export default function ProductRow({ product, onEdit, onDelete, onRestore }) {

    const rowClassName = product.active
        ? "border-b hover:bg-gray-50"
        : "border-b bg-gray-100 hover:bg-gray-200 text-gray-500 italic";

    const actionButtons = product.active ? (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                Edit
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                    if (confirm(`Archive product ${product.name}?`)) onDelete(product.id);
                }}
            >
                Archive
            </Button>
        </div>
    ) : (
        <div className="flex gap-2">
            <Button
                variant="default"
                size="sm"
                onClick={() => {
                    if (confirm(`Restore product ${product.name}?`)) onRestore(product.id);
                }}
            >
                Restore
            </Button>
        </div>
    );

    return (
        <tr className={rowClassName}>
            <td className="p-3 align-top">{product.id}</td>
            <td className="p-3 align-top">{product.name}</td>
            <td className="p-3 align-top">${Number(product.cost ?? 0).toFixed(2)}</td>
            <td className="p-3 align-top">{product.stock ?? 0}</td>
            <td className="p-3 align-top">
                {actionButtons}
            </td>
        </tr>
    );
}