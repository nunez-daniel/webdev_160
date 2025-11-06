// src/lib/mock.js
const IMG = (label) =>
  `https://placehold.co/600x400?text=${encodeURIComponent(label)}`;

const MOCK_PRODUCTS = [
  {
    id: "p1",
    name: "Margherita Pizza",
    description: "Classic tomatoes, mozzarella, basil.",
    price: 9.99,
    imageUrl: IMG("Margherita"),
    brand: "Foodly Kitchen",
    category: "Pizza",
    rating: 4.6,
    reviewsCount: 238,
    inStock: true,
  },
  {
    id: "p2",
    name: "Veggie Burger",
    description: "Grilled patty, lettuce, tomato, special sauce.",
    price: 8.49,
    imageUrl: IMG("Veggie Burger"),
    brand: "Green Bite",
    category: "Burgers",
    rating: 4.3,
    reviewsCount: 121,
    inStock: true,
  },
  {
    id: "p3",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice, chicken, saffron, spices.",
    price: 12.99,
    imageUrl: IMG("Biryani"),
    brand: "Spice Route",
    category: "Rice",
    rating: 4.7,
    reviewsCount: 412,
    inStock: true,
  },
  {
    id: "p4",
    name: "Penne Alfredo",
    description: "Creamy parmesan sauce, garlic, parsley.",
    price: 10.5,
    imageUrl: IMG("Alfredo"),
    brand: "Pasta Lab",
    category: "Pasta",
    rating: 4.2,
    reviewsCount: 88,
    inStock: false,
  },
  {
    id: "p5",
    name: "Sushi Platter (12pc)",
    description: "Assorted nigiri & rolls, soy, ginger, wasabi.",
    price: 15.99,
    imageUrl: IMG("Sushi"),
    brand: "Ocean Roll",
    category: "Sushi",
    rating: 4.8,
    reviewsCount: 359,
    inStock: true,
  },
  {
    id: "p6",
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons, caesar dressing.",
    price: 7.25,
    imageUrl: IMG("Caesar"),
    brand: "Leafy",
    category: "Salad",
    rating: 4.1,
    reviewsCount: 64,
    inStock: true,
  },
  {
    id: "p7",
    name: "Chocolate Milkshake",
    description: "Rich cocoa, ice cream, whipped cream.",
    price: 5.75,
    imageUrl: IMG("Milkshake"),
    brand: "Sweet Spot",
    category: "Drinks",
    rating: 4.4,
    reviewsCount: 97,
    inStock: true,
  },
  {
    id: "p8",
    name: "Tacos (3pc)",
    description: "Corn tortillas, beef/chicken, pico, lime.",
    price: 9.25,
    imageUrl: IMG("Tacos"),
    brand: "La Calle",
    category: "Tacos",
    rating: 4.5,
    reviewsCount: 173,
    inStock: true,
  },
];

// make the list feel “big” for paging
const expanded = Array.from({ length: 32 }).map((_, i) => {
  const base = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
  return { ...base, id: `${base.id}-${i + 1}`, name: `${base.name} #${i + 1}` };
});

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** @param {{page?:number, limit?:number, search?:string}} params */
export async function fetchProductsMock(params = {}) {
  const { page = 1, limit = 12, search = "" } = params;
  await delay(250);
  const filtered = search
    ? expanded.filter((p) =>
        (p.name + p.brand + p.category)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : expanded;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return { items, total: filtered.length };
}

/** @param {string} id */
export async function fetchProductByIdMock(id) {
  await delay(200);
  const found = expanded.find((p) => p.id === id);
  if (!found) throw new Error("Product not found");
  return found;
}

export { fetchUserByCredentials, signupUser } from "./mockUsers";
