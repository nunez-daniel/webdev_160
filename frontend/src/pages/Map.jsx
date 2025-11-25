import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// Import leaflet-routing-machine - it should attach L.Routing to the global L object
import "leaflet-routing-machine";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Clock,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchOrdersByStatus, fetchAllOrders, fetchCurrentUser, fetchMyOrders, createDeliveryCar, assignOrderToCar, autoAssignOrders, startDelivery, stopDelivery, getRobotCar } from "@/lib/api";

const BASE = "http://localhost:8080";
// Store location: San Jose State University, CA (37.3352° N, 121.8811° W)
// This is the starting point for all delivery routes
const STORE_COORDS = { lat: 37.3352, lng: -121.8811 };
const TOTAL_DELIVERY_MINUTES = 45;

if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  
  // Ensure L.Routing is available (leaflet-routing-machine should attach it)
  if (!L.Routing && window.L && window.L.Routing) {
    L.Routing = window.L.Routing;
  }
}

// Cache for geocoded addresses to avoid repeated API calls
const geocodeCache = new Map();

async function addressToCoordinates(address) {
  // Build address string
  const addressString = [
    address.shippingAddressLine1,
    address.shippingCity,
    address.shippingState,
    address.shippingPostalCode
  ].filter(Boolean).join(", ");

  if (!addressString) {
    return null;
  }

  // Check cache first
  if (geocodeCache.has(addressString)) {
    return geocodeCache.get(addressString);
  }

  try {
    // Use OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`,
      {
        headers: {
          'User-Agent': 'WebDev160-DeliveryApp/1.0' // Required by Nominatim
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      // Cache the result
      geocodeCache.set(addressString, coords);
      return coords;
    }
  } catch (error) {
    console.warn('Geocoding failed for address:', addressString, error);
  }

  // Fallback: return null if geocoding fails
  return null;
}

function calculateETA(orderDate, deliveryCar, distanceMiles = null, deliveryStartTime = null) {
  const now = new Date();
  
  // If delivery has started, calculate from delivery start time
  // Otherwise, calculate from order date
  const startTime = deliveryStartTime ? new Date(deliveryStartTime) : new Date(orderDate);
  const minutesSinceStart = Math.max(0, (now - startTime) / (1000 * 60));

  if (!deliveryCar) {
    return {
      label: "Awaiting assignment",
      minutesRemaining: null,
      elapsedMinutes: 0,
      totalMinutes: TOTAL_DELIVERY_MINUTES,
    };
  }

  let totalMinutes = TOTAL_DELIVERY_MINUTES;
  if (distanceMiles != null && distanceMiles > 0) {
    const averageSpeedMph = 25;
    totalMinutes = (distanceMiles / averageSpeedMph) * 60;
  }

  const clampedElapsed = Math.min(totalMinutes, minutesSinceStart);
  const estimatedMinutes = totalMinutes - minutesSinceStart;
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
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function OrderCard({
  order,
  isExpanded,
  onToggle,
  mapInstance,
  onShowRoute,
  onHideRoute,
  isRouteShown,
  routeDistance,
  coordinates,
  isAdmin,
  deliveryCars,
  onAssignCar,
  assigningOrderId,
  isSelected,
  onSelect,
  isInDelivery,
  deliveryStartTime,
  robotCarId,
}) {
  const products =
    order.items?.map((item) => item.productName || "Product").join(", ") ||
    "No products";
  const deliveryCar = order.deliveryCar;

  const straightLineDistance = coordinates
    ? calculateDistanceMiles(
        STORE_COORDS.lat,
        STORE_COORDS.lng,
        coordinates.lat,
        coordinates.lng
      )
    : null;

  const totalDistanceMiles =
    routeDistance !== undefined ? routeDistance : straightLineDistance;

  const etaData = calculateETA(
    order.orderDate,
    deliveryCar,
    totalDistanceMiles,
    deliveryStartTime
  );

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

  const handleMouseEnter = () => {
    if (coordinates && onShowRoute) {
      onShowRoute(order.id, coordinates);
    }
  };

  const handleMouseLeave = () => {
    if (onHideRoute) {
      onHideRoute(order.id);
    }
  };

  return (
    <Card 
      className="mb-4 border-2 hover:border-green-500 transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isAdmin && (
                (order.paymentStatus === "PAID" && !order.deliveryCar) ||
                (order.paymentStatus === "ASSIGNED" && order.deliveryCar && (!robotCarId || order.deliveryCar.id === robotCarId)) ||
                (order.paymentStatus === "IN_DELIVERY" && order.deliveryCar && (!robotCarId || order.deliveryCar.id === robotCarId))
              ) && (
                <input
                  type="checkbox"
                  checked={isSelected || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (onSelect) onSelect(order.id, e.target.checked);
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
              )}
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{order.id}
              </CardTitle>
            </div>
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
              <div className="font-medium text-muted-foreground mb-1">
                Status
              </div>
              <div>{order.paymentStatus || "PAID"}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground mb-1">
                Total
              </div>
              <div>${Number(order.totalAmount || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground mb-1">
                Order Date
              </div>
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
                <span className="font-medium">
                  Delivery Vehicle #{deliveryCar.id}
                </span>
              </div>
            </div>
          )}

          {isAdmin && !deliveryCar && (
            <div className="border-t pt-4">
              <div className="font-medium text-muted-foreground mb-2">
                Assign to Delivery Car
              </div>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-3 py-2 text-sm border rounded-md"
                  onChange={(e) => {
                    const carId = e.target.value;
                    if (carId && onAssignCar) {
                      onAssignCar(order.id, parseInt(carId));
                    }
                  }}
                  disabled={assigningOrderId === order.id}
                  defaultValue=""
                >
                  <option value="">Select a car...</option>
                  {deliveryCars.map((car) => (
                    <option key={car.id} value={car.id}>
                      Vehicle #{car.id}
                    </option>
                  ))}
                </select>
                {assigningOrderId === order.id && (
                  <span className="text-xs text-muted-foreground self-center">
                    Assigning...
                  </span>
                )}
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
                {order.shippingAddressLine2 && (
                  <div>{order.shippingAddressLine2}</div>
                )}
                <div>
                  {order.shippingCity}, {order.shippingState}{" "}
                  {order.shippingPostalCode}
                </div>
              </div>
              <div className="flex gap-2 mt-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHighlightOnMap}
                >
                  Show on Map
                </Button>
                <span className="text-xs text-muted-foreground">
                  Hover to show route
                </span>
              </div>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="font-medium text-muted-foreground mb-2">
                Items
              </div>
              <div className="space-y-1 text-sm">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>
                      ${Number(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
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
            {isInDelivery && etaData.minutesRemaining !== null
              ? `${Math.ceil(etaData.minutesRemaining)} min left`
              : isInDelivery 
                ? "Calculating..."
                : deliveryCar 
                  ? "Assigned, awaiting delivery start"
                  : "Not yet assigned"}
          </span>
        </div>
        {isInDelivery ? (
          <>
            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-green-500 transition-all"
                style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {totalDistanceMiles != null
                ? `${
                    distanceCoveredMiles?.toFixed(1) ?? "0.0"
                  } mi / ${totalDistanceMiles.toFixed(1)} mi`
                : "Distance data unavailable"}
            </div>
            {deliveryStartTime && (
              <div className="text-xs text-green-600 font-medium mt-1">
                🚚 In Delivery • Started {new Date(deliveryStartTime).toLocaleTimeString()}
              </div>
            )}
          </>
        ) : deliveryCar ? (
          <div className="text-xs text-muted-foreground">
            Order assigned to Vehicle #{deliveryCar.id}. Waiting for delivery to start.
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Order is being prepared. Delivery vehicle will be assigned soon.
          </div>
        )}
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
  const [routeDistances, setRouteDistances] = useState(new Map());
  const [orderCoordinates, setOrderCoordinates] = useState(new Map()); // Store geocoded coordinates
  const [isAdmin, setIsAdmin] = useState(false);
  const [deliveryCars, setDeliveryCars] = useState([]); // Available delivery cars
  const [assigningOrderId, setAssigningOrderId] = useState(null); // Order being assigned
  const [robotCar, setRobotCar] = useState(null); // Robot delivery car
  const [selectedOrders, setSelectedOrders] = useState(new Set()); // Orders selected by admin for manual assignment
  const [deliveryStartTime, setDeliveryStartTime] = useState(new Map()); // Track when delivery started for each order

  const fetchOrders = async () => {
    try {
      // First, check if user is admin
      const user = await fetchCurrentUser();
      const userIsAdmin = user?.role === "ADMIN";
      setIsAdmin(userIsAdmin);

      let allOrders = [];
      if (userIsAdmin) {
        // Admin: Fetch all orders
        try {
          allOrders = await fetchAllOrders();
        } catch (e) {
          try {
            const paidOrders = await fetchOrdersByStatus("PAID");
            const inCarOrders = await fetchOrdersByStatus("In car now");
            allOrders = [...paidOrders, ...inCarOrders];
          } catch (e2) {
            console.error("Failed to fetch all orders:", e2);
            throw e2;
          }
        }
      } else {
        // Regular user: Fetch only their orders
        allOrders = await fetchMyOrders();
      }

      const ordersWithAddresses = allOrders.filter(
        (order) =>
          order.shippingAddressLine1 && order.shippingAddressLine1.trim() !== ""
      );

      setOrders(ordersWithAddresses);
      
      // Geocode all addresses
      const coordinatesMap = new Map();
      await Promise.all(
        ordersWithAddresses.map(async (order) => {
          const coords = await addressToCoordinates(order);
          if (coords) {
            coordinatesMap.set(order.id, coords);
          }
        })
      );
      setOrderCoordinates(coordinatesMap);
      
      // Check for orders in delivery and set start times (for both admin and regular users)
      const inDeliveryOrders = allOrders.filter(o => o.paymentStatus === "IN_DELIVERY");
      if (inDeliveryOrders.length > 0) {
        // If orders are in delivery, we need to track when delivery started
        // For now, use order date as approximation (in real app, you'd store delivery start time)
        const startTimes = new Map();
        inDeliveryOrders.forEach(order => {
          startTimes.set(order.id, order.orderDate);
        });
        setDeliveryStartTime(startTimes);
      }
      
      // If admin, get robot car
      if (userIsAdmin) {
        try {
          const car = await getRobotCar();
          setRobotCar(car);
          setDeliveryCars([car]);
        } catch (error) {
          console.warn("Could not fetch robot car:", error);
        }
      }
      
      setError(null);
    } catch {
      setError("Unable to load delivery orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCar = async (orderId, carId) => {
    setAssigningOrderId(orderId);
    try {
      await assignOrderToCar(orderId, carId);
      // Automatically select the order after assignment
      setSelectedOrders((prev) => new Set([...prev, orderId]));
      // Refresh orders after assignment
      await fetchOrders();
      setAssigningOrderId(null);
    } catch (error) {
      console.error("Failed to assign order:", error);
      setAssigningOrderId(null);
      alert(error.message || "Failed to assign order to car. Please try again.");
    }
  };

  const handleCreateCar = async () => {
    try {
      const newCar = await createDeliveryCar();
      setDeliveryCars((prev) => [...prev, newCar]);
      return newCar;
    } catch (error) {
      console.error("Failed to create car:", error);
      alert("Failed to create delivery car. Please try again.");
      return null;
    }
  };

  const handleAutoAssign = async () => {
    try {
      const assignedOrders = await autoAssignOrders();
      await fetchOrders();
      
      // Get updated robot car
      const updatedCar = await getRobotCar();
      setRobotCar(updatedCar);
      
      // Automatically select all assigned orders
      const assignedOrderIds = new Set(assignedOrders.map(order => order.id));
      setSelectedOrders(assignedOrderIds);
      
      alert(`${assignedOrders.length} order(s) have been automatically assigned to the robot car. You can modify the selection before starting delivery.`);
    } catch (error) {
      console.error("Failed to auto-assign orders:", error);
      alert(error.message || "Failed to auto-assign orders. Please try again.");
    }
  };

  const handleStartDelivery = async () => {
    if (!robotCar) {
      alert("Robot car not found. Please try refreshing the page.");
      return;
    }

    if (selectedOrders.size === 0) {
      alert("Please select at least one order to start delivery.");
      return;
    }

    try {
      const orderIds = Array.from(selectedOrders);
      await startDelivery(robotCar.id, orderIds);
      const startTime = new Date().toISOString();
      const newStartTimes = new Map();
      orderIds.forEach(orderId => {
        newStartTimes.set(orderId, startTime);
      });
      setDeliveryStartTime(newStartTimes);
      setSelectedOrders(new Set()); // Clear selection after starting
      await fetchOrders();
      const updatedCar = await getRobotCar();
      setRobotCar(updatedCar);
      alert(`Delivery started for ${orderIds.length} order(s)! The robot is now en route.`);
    } catch (error) {
      console.error("Failed to start delivery:", error);
      alert(error.message || "Failed to start delivery. Please try again.");
    }
  };

  const handleStopDelivery = async () => {
    if (!robotCar) {
      alert("Robot car not found. Please try refreshing the page.");
      return;
    }

    if (robotCar.status !== "IN_DELIVERY") {
      alert("Delivery is not currently in progress.");
      return;
    }

    if (!confirm("Are you sure you want to stop the current delivery? Orders will be set back to ASSIGNED status.")) {
      return;
    }

    try {
      await stopDelivery(robotCar.id);
      setDeliveryStartTime(new Map()); // Clear delivery start times
      await fetchOrders();
      const updatedCar = await getRobotCar();
      setRobotCar(updatedCar);
      alert("Delivery stopped. Orders have been set back to ASSIGNED status.");
    } catch (error) {
      console.error("Failed to stop delivery:", error);
      alert(error.message || "Failed to stop delivery. Please try again.");
    }
  };

  const handleSelectOrder = (orderId, isSelected) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(orderId);
      } else {
        newSet.delete(orderId);
      }
      return newSet;
    });
  };

  const handleManualAssignSelected = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select at least one order to assign.");
      return;
    }

    if (!robotCar) {
      const car = await getRobotCar();
      setRobotCar(car);
    }

    const carToUse = robotCar || await getRobotCar();
    
    try {
      for (const orderId of selectedOrders) {
        await assignOrderToCar(orderId, carToUse.id);
      }
      setSelectedOrders(new Set());
      await fetchOrders();
      alert(`Successfully assigned ${selectedOrders.size} order(s) to ${carToUse.name || "Robot"}.`);
    } catch (error) {
      console.error("Failed to assign selected orders:", error);
      alert(error.message || "Failed to assign orders. Please try again.");
    }
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [STORE_COORDS.lat, STORE_COORDS.lng],
        12
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
      }).addTo(mapInstanceRef.current);
      
      // Check if L.Routing is available after map initialization
      if (L.Routing) {
        console.log("✅ L.Routing is available");
      } else {
        console.warn("⚠️ L.Routing is not available. Routes will use fallback polylines.");
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    orderMarkersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker);
    });
    orderMarkersRef.current = [];

    if (shownRouteOrderId && !orders.find((o) => o.id === shownRouteOrderId)) {
      routeControlsRef.current.forEach((control) => {
        if (control.remove) {
          control.remove();
        } else if (mapInstanceRef.current.hasLayer(control)) {
          mapInstanceRef.current.removeLayer(control);
        }
      });
      routeControlsRef.current = [];
      setShownRouteOrderId(null);
    }

    orders.forEach((order) => {
      const coords = orderCoordinates.get(order.id);
      if (coords) {
        const marker = L.marker([coords.lat, coords.lng]).addTo(
          mapInstanceRef.current
        );

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <strong>Order #${order.id}</strong><br/>
            ${order.shippingName || "Customer"}<br/>
            ${order.shippingAddressLine1 || ""}<br/>
            ${order.shippingCity || ""}, ${order.shippingState || ""}
            ${
              order.deliveryCar
                ? `<br/><br/><strong>Vehicle #${order.deliveryCar.id}</strong>`
                : ""
            }
          </div>
        `);

        orderMarkersRef.current.push(marker);
      }
    });
  }, [orders, orderCoordinates]);

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleShowRoute = async (orderId, coordinates) => {
    if (!mapInstanceRef.current || !coordinates) return;

    if (shownRouteOrderId === orderId) {
      routeControlsRef.current.forEach((control) => {
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

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Ensure L.Routing is available - try to load it if needed
    if (!L.Routing) {
      try {
        // Try dynamic import as fallback
        await import("leaflet-routing-machine");
      } catch (e) {
        console.warn("Could not dynamically import leaflet-routing-machine:", e);
      }
    }

    // Check if L.Routing is available
    if (!L.Routing) {
      console.error("L.Routing is not available. Make sure leaflet-routing-machine is properly imported.");
      console.log("L object:", L);
      console.log("Available L properties:", Object.keys(L));
      // Fallback to polyline
      const polyline = L.polyline(
        [
          [STORE_COORDS.lat, STORE_COORDS.lng],
          [coordinates.lat, coordinates.lng],
        ],
        {
          color: order.deliveryCar ? "#22c55e" : "#94a3b8",
          opacity: 0.7,
          weight: 4,
        }
      ).addTo(mapInstanceRef.current);
      routeControlsRef.current.push(polyline);
      setShownRouteOrderId(orderId);
      return;
    }
    
    console.log("L.Routing is available, creating route...");

    try {
      const routeControl = L.Routing.control({
        waypoints: [
          L.latLng(STORE_COORDS.lat, STORE_COORDS.lng),
          L.latLng(coordinates.lat, coordinates.lng),
        ],
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "driving",
        }),
        createMarker: function () {
          return null;
        },
        lineOptions: {
          styles: [
            {
              color: order.deliveryCar ? "#22c55e" : "#94a3b8",
              opacity: 0.7,
              weight: 4,
            },
          ],
        },
        addWaypoints: false,
        routeWhileDragging: false,
        showAlternatives: false,
      }).addTo(mapInstanceRef.current);

      routeControl.on("routesfound", function (e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          const distanceMeters = route.summary.totalDistance;
          const distanceMiles = distanceMeters * 0.000621371;
          setRouteDistances((prev) =>
            new Map(prev).set(orderId, distanceMiles)
          );
        }
      });

      routeControlsRef.current.push(routeControl);
      setShownRouteOrderId(orderId);

      mapInstanceRef.current.fitBounds(
        [
          [STORE_COORDS.lat, STORE_COORDS.lng],
          [coordinates.lat, coordinates.lng],
        ],
        { padding: [50, 50] }
      );
    } catch (error) {
      console.warn("Failed to create route for order", orderId, error);
      const polyline = L.polyline(
        [
          [STORE_COORDS.lat, STORE_COORDS.lng],
          [coordinates.lat, coordinates.lng],
        ],
        {
          color: order.deliveryCar ? "#22c55e" : "#94a3b8",
          opacity: 0.7,
          weight: 4,
        }
      ).addTo(mapInstanceRef.current);
      routeControlsRef.current.push(polyline);
      setShownRouteOrderId(orderId);
    }
  };

  const handleHideRoute = (orderId) => {
    if (shownRouteOrderId === orderId) {
      routeControlsRef.current.forEach((control) => {
        if (control.remove) {
          control.remove();
        } else if (mapInstanceRef.current.hasLayer(control)) {
          mapInstanceRef.current.removeLayer(control);
        }
      });
      routeControlsRef.current = [];
      setShownRouteOrderId(null);
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
        {isAdmin && (
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoAssign}
              disabled={robotCar?.status === "IN_DELIVERY"}
            >
              <Truck className="h-4 w-4 mr-2" />
              Auto-Assign Orders
            </Button>
            {selectedOrders.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualAssignSelected}
                disabled={robotCar?.status === "IN_DELIVERY"}
              >
                Assign Selected ({selectedOrders.size})
              </Button>
            )}
            {robotCar?.status === "IN_DELIVERY" ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleStopDelivery}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Stop Delivery
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleStartDelivery}
                disabled={!robotCar || selectedOrders.size === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start Delivery
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
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

        <div className="flex flex-col overflow-hidden">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">
              {isAdmin ? "All Orders" : "My Orders"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin 
                ? "Click to expand order details. Assign cars to unassigned orders."
                : "Click to expand order details. Hover to see delivery route."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading orders...
              </div>
            ) : error ? (
              <Card className="p-8">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    onClick={fetchOrders}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
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
                    <div
                      className="h-full bg-muted-foreground/40"
                      style={{ width: "0%" }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    No distance data
                  </div>
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
                  onHideRoute={handleHideRoute}
                  isRouteShown={shownRouteOrderId === order.id}
                  routeDistance={routeDistances.get(order.id)}
                  coordinates={orderCoordinates.get(order.id)}
                  isAdmin={isAdmin}
                  deliveryCars={deliveryCars}
                  onAssignCar={handleAssignCar}
                  assigningOrderId={assigningOrderId}
                  isSelected={selectedOrders.has(order.id)}
                  onSelect={handleSelectOrder}
                  isInDelivery={order.paymentStatus === "IN_DELIVERY"}
                  deliveryStartTime={deliveryStartTime.get(order.id)}
                  robotCarId={robotCar?.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
