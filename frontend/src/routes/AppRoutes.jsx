import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CatalogPage from "@/pages/CatalogPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import CartPage from "@/pages/CartPage";
import AppLayout from "@/layouts/AppLayout";
import Map from "@/pages/Map";
import UserSettings from "@/pages/UserSettings";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminGuard from "@/components/AdminGuard";
import ProtectedRoute from "@/components/ProtectedRoute";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "catalog", element: <CatalogPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "cart", element: <CartPage /> },
      { path: "order-history", 
        element: (
          <ProtectedRoute>
            <UserSettings /> 
          </ProtectedRoute>
        ),
      },
      { path: "map", 
        element: (
          <ProtectedRoute>
            <Map /> 
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
