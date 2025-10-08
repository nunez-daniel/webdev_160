import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function TopNav({ search, onSearch }) {
  const [value, setValue] = useState(search ?? "");
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <a href="/" className="text-xl font-bold">
          OFS Grocery
        </a>
        <div className="ml-auto flex items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch?.(value);
            }}
            className="hidden md:block"
          >
            <Input
              placeholder="Search products…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-[320px]"
            />
          </form>
          <Button className="md:hidden" onClick={() => onSearch?.(value)}>
            Search
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="p-4">
                <h3 className="font-semibold">Your Cart</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Hook this up to your cart store later.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
