import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cartStore";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { add } = useCart();

  const goToDetail = () => navigate(`/products/${product.id}`);
  const price = Number(product.cost ?? 0);

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToDetail();
      }}
    >
      <CardHeader className="p-0">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-muted">
          {/* eslint-disable-next-line */}
          <img
              src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">
            {product.name}
          </CardTitle>
          {product.inStock !== false ? (
            <Badge>In stock</Badge>
          ) : (
            <Badge variant="secondary">Out</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {product.brand || "—"}
        </p>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">${price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">
            {product.rating ?? 0}★ ({product.reviewsCount ?? 0})
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Stop the card click from firing when pressing the button */}
        <Button
          className="w-full"
          disabled={product.inStock === false}
          onClick={(e) => {
            e.stopPropagation();
            add(product, 1);
          }}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
