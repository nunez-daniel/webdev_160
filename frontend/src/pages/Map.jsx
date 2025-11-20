import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, ChevronUp, Package, Truck, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchOrdersByStatus, fetchAllOrders } from "@/lib/api";

const BASE = "http://localhost:8080";
const STORE_COORDS = { lat: 37.7749, lng: -122.4194 };
const TOTAL_DELIVERY_MINUTES = 45;

// Fix for default marker icons in Leaflet
// Using CDN URLs for icons to avoid import issues
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Helper function to convert address to coordinates (mock implementation)
// In production, you'd use a geocoding service like Google Maps Geocoding API
function addressToCoordinates(address) {
  // Mock: Generate coordinates based on address hash
  // This creates consistent coordinates for the same address
  let hash = 0;
  const addr = `${address.shippingAddressLine1 || ""} ${address.shippingCity || ""} ${address.shippingState || ""}`.toLowerCase();
  for (let i = 0; i < addr.length; i++) {
    hash = ((hash << 5) - hash) + addr.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Generate coordinates in San Francisco area (37.7749, -122.4194)
  const baseLat = 37.7749;
  const baseLng = -122.4194;
  const lat = baseLat + (hash % 1000) / 10000;
  const lng = baseLng + ((hash >> 10) % 1000) / 10000;
  
  return { lat, lng };
}

// Calculate estimated arrival time (uses route distance if available)
function calculateETA(orderDate, deliveryCar, distanceMiles = null) {
  const orderTime = new Date(orderDate);
  const now = new Date();
  const minutesSinceOrder = Math.max(0, (now - orderTime) / (1000 * 60));

  if (!deliveryCar) {
    return {
      label: "Awaiting assignment",
      minutesRemaining: null,
      elapsedMinutes: 0,
      totalMinutes: TOTAL_DELIVERY_MINUTES,
    };
  }

  // If we have route distance, calculate ETA based on average speed (25 mph for city delivery)
  // Otherwise use the fixed 45 minutes
  let totalMinutes = TOTAL_DELIVERY_MINUTES;
  if (distanceMiles != null && distanceMiles > 0) {
    const averageSpeedMph = 25; // Average city delivery speed
    totalMinutes = (distanceMiles / averageSpeedMph) * 60; // Convert to minutes
  }

  const clampedElapsed = Math.min(totalMinutes, minutesSinceOrder);
  const estimatedMinutes = totalMinutes - minutesSinceOrder;
  let label;

  if (estimatedMinutes <= 0) {
    label = "Arriving soon";
  } else if (estimatedMinutes < 60) {
    label = `~${Math.round(estimatedMinutes)} min`;
  } else {
    const hours = Math.floor(estimatedMinutes / 60);
    const mins = Math.round(estimatedMinutes % 60);
    label = `${hours}h ${mins}m`;
  }

  return {
    label,
    minutesRemaining: Math.max(0, estimatedMinutes),
    elapsedMinutes: clampedElapsed,
    totalMinutes: totalMinutes,
  };
}

function calculateDistanceMiles(lat1, lng1, lat2, lng2) {
  if (
    typeof lat1 !== "number" ||
    typeof lng1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lng2 !== "number"
  ) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function OrderCard({ order, isExpanded, onToggle, mapInstance, onShowRoute, isRouteShown, routeDistance }) {
  const products = order.items?.map(item => item.productName || "Product").join(", ") || "No products";
  const deliveryCar = order.deliveryCar;
  const coordinates = addressToCoordinates(order);
  
  // Use route distance if available, otherwise use straight-line distance
  const straightLineDistance = coordinates
    ? calculateDistanceMiles(
        STORE_COORDS.lat,
        STORE_COORDS.lng,
        coordinates.lat,
        coordinates.lng
      )
    : null;
  
  const totalDistanceMiles = routeDistance !== undefined ? routeDistance : straightLineDistance;
  
  const etaData = calculateETA(order.orderDate, deliveryCar, totalDistanceMiles);

  const progress = etaData.totalMinutes
    ? Math.min(1, etaData.elapsedMinutes / etaData.totalMinutes)
    : 0;

  const distanceCoveredMiles =
    totalDistanceMiles != null
      ? Math.min(totalDistanceMiles, totalDistanceMiles * progress)
      : null;

  const handleHighlightOnMap = () => {
    if (mapInstance && coordinates) {
      mapInstance.setView([coordinates.lat, coordinates.lng], 15);
    }
  };

  const handleShowRoute = (e) => {
    e.stopPropagation(); // Prevent card toggle
    if (onShowRoute) {
      onShowRoute(order.id, coordinates);
    }
  };

  return (
    <Card className="mb-4 border-2 hover:border-green-500 transition-colors">
      <CardHeader 
        className="cursor-pointer" 
        onClick={onToggle}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order.id}
            </CardTitle>
            <div className="mt-2 text-sm text-muted-foreground">
              Products: {products}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={deliveryCar ? "default" : "secondary"}>
              {deliveryCar ? `Vehicle #${deliveryCar.id}` : "Unassigned"}
            </Badge>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground mb-1">Status</div>
              <div>{order.paymentStatus || "PAID"}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground mb-1">Total</div>
              <div>${Number(order.totalAmount || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground mb-1">Order Date</div>
              <div>{new Date(order.orderDate).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Estimated Arrival
              </div>
              <div>{etaData.label || "Not available"}</div>
            </div>
          </div>
          
          {deliveryCar && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4" />
                <span className="font-medium">Delivery Vehicle #{deliveryCar.id}</span>
              </div>
            </div>
          )}
          
          {order.shippingAddressLine1 && (
            <div className="border-t pt-4">
              <div className="font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </div>
              <div className="text-sm">
                <div>{order.shippingName}</div>
                <div>{order.shippingAddressLine1}</div>
                {order.shippingAddressLine2 && <div>{order.shippingAddressLine2}</div>}
                <div>{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleHighlightOnMap}
                >
                  Show on Map
                </Button>
                <Button 
                  variant={isRouteShown ? "default" : "outline"}
                  size="sm" 
                  onClick={handleShowRoute}
                >
                  {isRouteShown ? "Hide Route" : "Show Route"}
                </Button>
              </div>
            </div>
          )}
          
          {order.items && order.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="font-medium text-muted-foreground mb-2">Items</div>
              <div className="space-y-1 text-sm">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>${Number(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
      <CardContent className="border-t pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Delivery Progress</span>
          <span>
            {etaData.minutesRemaining !== null
              ? `${Math.ceil(etaData.minutesRemaining)} min left`
              : "—"}
          </span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-green-500 transition-all"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {totalDistanceMiles != null
            ? `${distanceCoveredMiles?.toFixed(1) ?? "0.0"} mi / ${totalDistanceMiles.toFixed(1)} mi`
            : "Distance data unavailable"}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const orderMarkersRef = useRef([]);
  const routeControlsRef = useRef([]);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [error, setError] = useState(null);
  const [shownRouteOrderId, setShownRouteOrderId] = useState(null);
  const [routeDistances, setRouteDistances] = useState(new Map()); // Store route distances by order ID

  // Fetch orders
  const fetchOrders = async () => {
    try {
      // Try to fetch all orders (works for admin) or fall back to customer's orders
      let allOrders = [];
      try {
        // Try admin endpoint first
        allOrders = await fetchAllOrders();
      } catch (e) {
        // If that fails (not admin), try fetching by status
        try {
          const paidOrders = await fetchOrdersByStatus("PAID");
          const inCarOrders = await fetchOrdersByStatus("In car now");
          allOrders = [...paidOrders, ...inCarOrders];
        } catch (e2) {
          // If that also fails, try customer's own orders
          try {
            const response = await fetch(`${BASE}/orders`, {
              credentials: "include",
              headers: { Accept: "application/json" },
            });
            if (response.ok) {
              const text = await response.text();
              if (text && text.trim() !== "") {
                allOrders = JSON.parse(text);
              }
            }
          } catch (e3) {
            console.error("All order fetch attempts failed:", e3);
            throw e3;
          }
        }
      }
      
      // Filter to only show orders with shipping addresses
      const ordersWithAddresses = allOrders.filter(
        order => order.shippingAddressLine1 && order.shippingAddressLine1.trim() !== ""
      );
      
      setOrders(ordersWithAddresses);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([37.7749, -122.4194], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers and routes when orders change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    orderMarkersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    orderMarkersRef.current = [];

    // Clear existing routes if the shown order is no longer in the list
    if (shownRouteOrderId && !orders.find(o => o.id === shownRouteOrderId)) {
      routeControlsRef.current.forEach(control => {
        if (control.remove) {
          control.remove();
        } else if (mapInstanceRef.current.hasLayer(control)) {
          mapInstanceRef.current.removeLayer(control);
        }
      });
      routeControlsRef.current = [];
      setShownRouteOrderId(null);
    }

    // Add markers for each order (routes are shown on demand via button)
    orders.forEach(order => {
      const coords = addressToCoordinates(order);
      if (coords) {
        // Add marker
        const marker = L.marker([coords.lat, coords.lng])
          .addTo(mapInstanceRef.current);
        
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <strong>Order #${order.id}</strong><br/>
            ${order.shippingName || "Customer"}<br/>
            ${order.shippingAddressLine1 || ""}<br/>
            ${order.shippingCity || ""}, ${order.shippingState || ""}
            ${order.deliveryCar ? `<br/><br/><strong>Vehicle #${order.deliveryCar.id}</strong>` : ""}
          </div>
        `);
        
        orderMarkersRef.current.push(marker);
      }
    });
  }, [orders]);

  // Initial fetch and polling
  useEffect(() => {
    fetchOrders();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Function to show/hide route for a specific order
  const handleShowRoute = (orderId, coordinates) => {
    if (!mapInstanceRef.current || !coordinates) return;

    // If clicking the same order, hide the route
    if (shownRouteOrderId === orderId) {
      // Clear existing route
      routeControlsRef.current.forEach(control => {
        if (control.remove) {
          control.remove();
        } else if (mapInstanceRef.current.hasLayer(control)) {
          mapInstanceRef.current.removeLayer(control);
        }
      });
      routeControlsRef.current = [];
      setShownRouteOrderId(null);
      return;
    }

    // Clear any existing route first
    routeControlsRef.current.forEach(control => {
      if (control.remove) {
        control.remove();
      } else if (mapInstanceRef.current.hasLayer(control)) {
        mapInstanceRef.current.removeLayer(control);
      }
    });
    routeControlsRef.current = [];

    // Find the order to get its details
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Create new route
    try {
      const routeControl = L.Routing.control({
        waypoints: [
          L.latLng(STORE_COORDS.lat, STORE_COORDS.lng),
          L.latLng(coordinates.lat, coordinates.lng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        }),
        createMarker: function() { return null; },
        lineOptions: {
          styles: [
            {
              color: order.deliveryCar ? '#22c55e' : '#94a3b8',
              opacity: 0.7,
              weight: 4
            }
          ]
        },
        addWaypoints: false,
        routeWhileDragging: false,
        showAlternatives: false
      }).addTo(mapInstanceRef.current);

      // Listen for route calculation to get actual distance
      routeControl.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          // Distance is in meters, convert to miles
          const distanceMeters = route.summary.totalDistance;
          const distanceMiles = distanceMeters * 0.000621371;
          setRouteDistances(prev => new Map(prev).set(orderId, distanceMiles));
        }
      });

      routeControlsRef.current.push(routeControl);
      setShownRouteOrderId(orderId);
      
      // Center map on the route
      mapInstanceRef.current.fitBounds([
        [STORE_COORDS.lat, STORE_COORDS.lng],
        [coordinates.lat, coordinates.lng]
      ], { padding: [50, 50] });
    } catch (error) {
      console.warn('Failed to create route for order', orderId, error);
      // Fallback: draw a simple polyline
      const polyline = L.polyline(
        [
          [STORE_COORDS.lat, STORE_COORDS.lng],
          [coordinates.lat, coordinates.lng]
        ],
        {
          color: order.deliveryCar ? '#22c55e' : '#94a3b8',
          opacity: 0.7,
          weight: 4
        }
      ).addTo(mapInstanceRef.current);
      routeControlsRef.current.push(polyline);
      setShownRouteOrderId(orderId);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex items-center gap-4 px-4 py-4 border-b">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
      </div>
      
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Map Section */}
        <div className="flex flex-col">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Order Locations</h2>
            <p className="text-sm text-muted-foreground">
              {orders.length} active order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
      <div
        ref={mapRef}
        style={{
          width: "100%",
              height: "100%",
              minHeight: "400px",
          border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>
        
        {/* Orders List Section */}
        <div className="flex flex-col overflow-hidden">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Active Orders</h2>
            <p className="text-sm text-muted-foreground">
              Click to expand order details
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading orders...
              </div>
            ) : error ? (
              <Card className="p-4">
                <div className="text-center text-red-600">
                  Error: {error}
                  <Button onClick={fetchOrders} className="mt-2" size="sm">
                    Retry
                  </Button>
                </div>
              </Card>
            ) : orders.length === 0 ? (
              <Card className="p-8 space-y-6">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active orders to display</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>Delivery Progress</span>
                    <span>—</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-muted-foreground/40" style={{ width: "0%" }} />
                  </div>
                  <div className="text-xs text-muted-foreground">No distance data</div>
                </div>
              </Card>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrders.has(order.id)}
                  onToggle={() => toggleOrder(order.id)}
                  mapInstance={mapInstanceRef.current}
                  onShowRoute={handleShowRoute}
                  isRouteShown={shownRouteOrderId === order.id}
                  routeDistance={routeDistances.get(order.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
