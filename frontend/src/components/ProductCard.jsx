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

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const go = () => navigate(`/products/${product.id}`);

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={go}
    >
      <CardHeader className="p-0">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
          {product.inStock ? (
            <Badge>In stock</Badge>
          ) : (
            <Badge variant="secondary">Out</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {product.brand}
        </p>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">
            {product.rating}★ ({product.reviewsCount})
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            go();
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
