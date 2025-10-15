import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render } from "vitest-browser-react";
import ProductCard from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cartStore";
import { userEvent, page } from '@vitest/browser/context';

beforeAll(async () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com"; 

    script.onload = () => {
      console.log('Tailwind CDN script loaded successfully.');
      resolve();
    };
    
    script.onerror = (e) => {
      console.error('Failed to load Tailwind CDN script:', e);
      reject(new Error('Failed to load Tailwind CSS CDN.'));
    };

    document.head.appendChild(script);
  });
}, 10000);

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@/lib/cartStore", () => ({
  useCart: vi.fn(),
}));

describe("ProductCard (browser)", () => {
  const navigate = vi.fn();
  const add = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(navigate);
    useCart.mockReturnValue({ add });
  });

  const product = {
    id: 1,
    name: "Test Product",
    brand: "Test Brand",
    price: 49.99,
    imageUrl: "",
    inStock: true,
    rating: 4.3,
    reviewsCount: 27,
  };


  it("renders product info", async () => {
    render(<ProductCard product={product} />);

    expect(page.getByText("Test Product")).toBeInTheDocument();
    expect(page.getByText("Test Brand")).toBeInTheDocument();

    expect(page.getByText("$49.99")).toBeInTheDocument();
    expect(page.getByText("In stock")).toBeInTheDocument();
  });

  it("navigates to product detail on click", async () => {
    render(<ProductCard product={product} />);

    const card = page.getByRole("button", {
      name: /Test Product/i 
    });
    await userEvent.click(card);

    expect(navigate).toHaveBeenCalledWith("/products/1");
  });

  it("adds to cart and stops propagation", async () => {
    render(<ProductCard product={product} />);

    const button = page.getByRole("button", { name: "Add to Cart", exact: true });
    await userEvent.click(button);

    expect(add).toHaveBeenCalledWith(product, 1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("shows 'Out' badge when not in stock", async () => {
    const outOfStock = { ...product, inStock: false };
    render(<ProductCard product={outOfStock} />);

    expect(page.getByText("Out")).toBeInTheDocument();
  });
});
