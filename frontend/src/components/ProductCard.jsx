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
      className="group hover:shadow-lg hover:shadow-green-100 transition-all duration-200 border-0 shadow-sm bg-white overflow-hidden cursor-pointer"
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToDetail();
      }}
    >
      <div className="p-4">
        {/* Product Image */}
        <div className="relative mb-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </div>
          {product.inStock !== false ? (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white border-0">
              In Stock
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-gray-100 text-gray-600"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="min-h-[2.5rem]">
            <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="text-xs text-gray-500">
            <span>{product.brand || "Store Brand"}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="text-yellow-400">★</span>
            <span>{(product.rating ?? 4.2).toFixed(1)}</span>
            <span>({product.reviewsCount ?? 127})</span>
          </div>

          {/* Description snippet if available */}
          {product.description && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Nutrition highlights */}
          <div className="flex flex-wrap gap-1">
            {product.organic && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 border-green-200 text-green-700 bg-green-50"
              >
                Organic
              </Badge>
            )}
            {product.glutenFree && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 border-blue-200 text-blue-700 bg-blue-50"
              >
                Gluten-Free
              </Badge>
            )}
            {product.vegan && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 border-purple-200 text-purple-700 bg-purple-50"
              >
                Vegan
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Price and Add to Cart */}
      <div className="px-4 pb-4">
        <Separator className="mb-4 border-gray-100" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              ${price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > price && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          {product.unit && (
            <span className="text-xs text-gray-500">{product.unit}</span>
          )}
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg py-2.5 font-medium transition-colors"
          disabled={product.inStock === false}
          onClick={(e) => {
            e.stopPropagation();
            add(product, 1);
          }}
        >
          {product.inStock === false ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </Card>
  );
}
