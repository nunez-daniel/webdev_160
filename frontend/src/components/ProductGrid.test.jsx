import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render } from "vitest-browser-react";
import ProductGrid, { ProductGridSkeleton } from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import { page } from '@vitest/browser/context'

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
vi.mock("@/components/ProductCard", () => ({
  default: vi.fn(({ product }) => (
    <div data-testid="product-card">{product.name}</div>
  )),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: vi.fn(({ className }) => (
    <div data-testid="skeleton" className={`bg-gray-200 rounded ${className}`} />
  )),
}));

describe("ProductGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleProducts = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ];

  it("renders a ProductCard for each product", async () => {
    const { container } = render(<ProductGrid products={sampleProducts} />);

    const cardLocator = page.getByTestId("product-card");
    const cards = await cardLocator.all();
    expect(cards).toHaveLength(3); 
    await expect(cardLocator.nth(0)).toHaveTextContent("Item 1");
    await expect(cardLocator.nth(1)).toHaveTextContent("Item 2");
    await expect(cardLocator.nth(2)).toHaveTextContent("Item 3");


    const grid = container.querySelector(".grid");
    expect(grid).toBeTruthy();
  });

  it("renders empty message when no products", async () => {
    render(<ProductGrid products={[]} />);
    expect(page.getByText("No products found.")).toBeInTheDocument();
  });
});

describe("ProductGridSkeleton", () => {
  it("renders 8 skeleton cards visually", async () => {
    render(<ProductGridSkeleton />);
    const skeletonsLocator = page.getByTestId("skeleton");
    const skeletons = await skeletonsLocator.all();
    expect(skeletons).toHaveLength(8 * 4); 
  });
});