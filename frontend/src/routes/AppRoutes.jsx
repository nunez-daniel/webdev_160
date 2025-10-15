import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CatalogPage from "@/pages/CatalogPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import CartPage from "@/pages/CartPage";
import AppLayout from "@/layouts/AppLayout";
import Map from '@/pages/Map'

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "catalog", element: <CatalogPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      {path:'map',element:<Map/>},
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}