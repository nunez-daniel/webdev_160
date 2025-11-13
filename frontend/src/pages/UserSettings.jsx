import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Package,
  Calendar,
  DollarSign,
  LogOut,
  User,
  Mail,
  Settings,
} from "lucide-react";

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrderHistory();
    }
  }, [activeTab]);

  const fetchUserData = async () => {};

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/orders", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }

      const text = await response.text();

      if (!text || text.trim() === "") {
        setOrders([]);
        return;
      }

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

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
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

  return (
    <div className="w-full h-full flex flex-col overflow-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "orders" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("orders")}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Order History
                  </Button>
                  <Button
                    variant={activeTab === "account" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("account")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "orders" && (
              <>
                {loading ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      Loading your orders...
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="text-red-600">Error: {error}</div>
                      <Button onClick={fetchOrderHistory} className="mt-4">
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : orders.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        No orders yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't placed any orders yet. Start shopping to see
                        your order history here.
                      </p>
                      <Button onClick={() => navigate("/catalog")}>
                        Browse Products
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
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
                                      {Number(
                                        item.unitPrice * item.quantity
                                      ).toFixed(2)}
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
              </>
            )}

            {activeTab === "account" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">
                          {user?.name || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email Address
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">
                          {user?.email || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Account Type
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">
                          {user?.provider === "google"
                            ? "Google Account"
                            : "Email Account"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      To update your account information, please contact
                      support.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
