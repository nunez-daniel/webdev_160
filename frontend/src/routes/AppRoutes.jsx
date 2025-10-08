import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CatalogPage from "@/pages/CatalogPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";

const router = createBrowserRouter([
  { path: "/", element: <CatalogPage /> },
  { path: "/products/:id", element: <ProductDetailPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
