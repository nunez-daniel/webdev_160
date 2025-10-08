import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CatalogPage from "@/pages/CatalogPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";

const router = createBrowserRouter([
  { path: "/catalog", element: <CatalogPage /> },
  { path: "/products/:id", element: <ProductDetailPage /> },
  { path: "/", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
