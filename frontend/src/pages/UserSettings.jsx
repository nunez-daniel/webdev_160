import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Package, Calendar, DollarSign } from "lucide-react";

export default function UserSettings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/orders`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }

      // Check if response has content before parsing JSON
      const text = await response.text();

      // If empty response, return empty array
      if (!text || text.trim() === "") {
        setOrders([]);
        return;
      }

      // Try to parse JSON
      try {
        const data = JSON.parse(text);
        setOrders(data || []);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        setOrders([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Order History</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">Loading your orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Order History</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            Error: {error}
            <br />
            <Button onClick={fetchOrderHistory} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-10 py-10 flex flex-col overflow-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Order History</h1>
      </div>

      <div className="flex-1 overflow-auto">
        {orders.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any orders yet. Start shopping to see your
                  order history here.
                </p>
                <Button onClick={() => navigate("/catalog")}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.orderDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />$
                          {Number(order.totalAmount).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Status</div>
                      <div className="text-sm text-muted-foreground">
                        {order.paymentStatus || "Completed"}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {order.items && order.items.length > 0 && (
                  <CardContent>
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {item.product?.name ||
                                item.productName ||
                                "Product"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              $
                              {Number(item.unitPrice * item.quantity).toFixed(
                                2
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${Number(item.unitPrice).toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
