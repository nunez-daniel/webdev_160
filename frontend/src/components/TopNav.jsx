import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { ShoppingCart, Trash2, Settings, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCart } from "@/lib/cartStore";
import { fetchSuggestions } from "@/lib/api";

/** Cart summary renders fee/total using local computed subtotal */
function CartSummary() {
  const { items = [], remove, updateQty } = useCart();

  const subtotal = Array.isArray(items)
    ? items.reduce(
        (sum, it) => sum + Number(it?.price || 0) * Number(it?.qty || 0),
        0
      )
    : 0;

  const fees = subtotal * 0.08;
  const total = subtotal + fees;

  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Fees & taxes (est.)</span>
        <span className="font-medium">${fees.toFixed(2)}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <Button
        className="w-full mt-4 bg-green-600 hover:bg-green-700"
        onClick={() => navigate("/checkout")}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
}

function VirtualCartComponent() {
  const { items = [], remove, updateQty } = useCart();

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">Your cart is empty</div>
    );
  }

  return (
    <div className="p-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center py-2 border-b"
        >
          <div className="flex-1">
            <h4 className="font-medium text-sm">{item.name}</h4>
            <p className="text-xs text-gray-500">${item.price}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQty(item.id, Math.max(0, item.qty - 1))}
            >
              -
            </Button>
            <span className="px-2">{item.qty}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQty(item.id, item.qty + 1)}
            >
              +
            </Button>
            <Button variant="ghost" size="sm" onClick={() => remove(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <CartSummary />
    </div>
  );
}

export default function TopNav() {
  const { items = [] } = useCart();
  const totalItems = Array.isArray(items)
    ? items.reduce((sum, it) => sum + Number(it?.qty || 0), 0)
    : 0;

  const [cartOpen, setCartOpen] = useState(false);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [suggests, setSuggests] = useState([]);
  const [active, setActive] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function goSearch(term) {
    const finalTerm = term || value;
    if (!finalTerm.trim()) return;

    if (location.pathname !== "/catalog") {
      navigate(`/catalog?q=${encodeURIComponent(finalTerm)}`);
    } else {
      setSearchParams({ q: finalTerm });
    }
    setValue("");
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggests[active]) {
        goSearch(suggests[active].name);
      } else {
        goSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(active + 1, suggests.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(active - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (value.trim()) {
      setOpen(true);
      fetchSuggestions(value.trim())
        .then(setSuggests)
        .catch(() => setSuggests([]));
    } else {
      setOpen(false);
      setSuggests([]);
    }
  }, [value]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="w-full">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/catalog"
            className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            OFSGrocery
          </Link>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goSearch();
              }}
              className="w-full"
            >
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      id="searchProducts"
                      placeholder="Search fresh groceries..."
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={onKeyDown}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-full focus:border-green-500 focus:ring-0 transition-colors"
                      autoComplete="off"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-full" align="start">
                  <Command shouldFilter={false}>
                    <CommandList>
                      <CommandEmpty>No matches</CommandEmpty>
                      <CommandGroup heading="Suggestions">
                        {suggests.map((s, idx) => (
                          <CommandItem
                            key={s.id}
                            value={s.name}
                            onMouseEnter={() => setActive(idx)}
                            onSelect={() => goSearch(s.name)}
                            className={`${
                              idx === active ? "bg-green-50" : ""
                            } hover:bg-green-50`}
                          >
                            {s.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </form>
          </div>

          <div className="flex items-center gap-4">
            <Button className="md:hidden" variant="ghost" onClick={goSearch}>
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile Map Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/map")}
              className="sm:hidden text-gray-600 hover:text-green-600 transition-colors"
              title="Track Delivery Robot"
            >
              <MapPin className="h-4 w-4" />
            </Button>

            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-500 hover:bg-green-600 text-white text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] flex flex-col">
                <SheetHeader className="text-left">
                  <SheetTitle>Cart ({totalItems})</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <VirtualCartComponent />
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/order-history")}
              className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Map/Robot Tracking */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/map")}
              className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
              title="Track Delivery Robot"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
