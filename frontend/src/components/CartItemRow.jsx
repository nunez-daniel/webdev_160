import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cartStore";
import { X, Heart } from "lucide-react";

export default function CartItemRow({ item }) {
  const { updateQty, remove, saveForLater } = useCart();

  return (
    <TableRow>
      <TableCell className="w-[96px]">
        <div className="h-20 w-24 overflow-hidden rounded bg-muted">
          {/* eslint-disable-next-line */}
          <img

              // cart shows
              src={item.imageUrl}
              alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      </TableCell>

      <TableCell>
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-muted-foreground">
          {item.brand ? `${item.brand} • ` : ""}
          {item.category ?? "Food"}
        </div>
        <div className="mt-1">
          <Badge variant="secondary">Eligible for delivery</Badge>
        </div>
      </TableCell>

      <TableCell className="w-[140px]">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQty(item.id, item.qty - 1)}
          >
            -
          </Button>
          <Input
            className="w-14 text-center"
            type="number"
            min={1}
            max={99}
            value={item.qty}
            onChange={(e) => {
              const n = parseInt(e.target.value || "1", 10);
              updateQty(item.id, isNaN(n) ? 1 : n);
            }}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQty(item.id, item.qty + 1)}
          >
            +
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => saveForLater(item.id)}
          >
            <Heart className="mr-1 h-4 w-4" /> Save for later
          </Button>
        </div>
      </TableCell>

      <TableCell className="w-[120px] font-semibold">
        ${(item.price * item.qty).toFixed(2)}
      </TableCell>

      <TableCell className="w-[60px] text-right">
        <Button variant="secondary" size="icon" onClick={() => remove(item.id)}>
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
