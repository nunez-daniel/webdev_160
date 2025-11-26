import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShoppingCart, Home } from "lucide-react";

export default function StockInsufficientPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Insufficient Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            We're sorry, but one or more items in your order are no longer available in the requested quantity.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Your payment was not processed. Please review your cart and try again with available items.
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => navigate("/cart")}
              className="w-full"
              variant="default"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Button>
            <Button
              onClick={() => navigate("/catalog")}
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

