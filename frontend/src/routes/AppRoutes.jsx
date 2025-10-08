import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CatalogPage from "@/pages/CatalogPage";
import ProductDetailPage from "@/pages/ProductDetailPage";

const router = createBrowserRouter([
  { path: "/", element: <CatalogPage /> },
  { path: "/products/:id", element: <ProductDetailPage /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
