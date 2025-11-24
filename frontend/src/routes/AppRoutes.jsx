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

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "catalog", element: <CatalogPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      {
        path: "admin",
        element: (
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        ),
      },
      { path: "cart", element: <CartPage /> },
      { path: "order-history", element: <UserSettings /> },
      { path: "map", element: <Map /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
