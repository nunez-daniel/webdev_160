import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getFeeProductId } from "@/lib/config";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { ShoppingCart, Trash2, Search, MapPin } from "lucide-react";
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
import { BASE } from "@/lib/api";
import { fetchSuggestions } from "@/lib/api";


/** Cart summary renders fee/total using local computed subtotal */
function CartSummary() {
  const { items = [], remove, updateQty, checkoutLink } = useCart();

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
            onClick={checkoutLink}
        >
          Proceed to Checkout
        </Button>
      </div>
  );
}

function VirtualCartComponent() {
  const { items = [], remove, updateQty } = useCart();
  const feeId = getFeeProductId();
  if (!Array.isArray(items) || items.length === 0) {
    return (
        <div className="p-4 text-center text-gray-500">Your cart is empty</div>
    );
  }


  return (
      <div className="p-4">
        {items.map((item) => {

          const isFeeProduct = item.id === feeId;
          return (
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
                      disabled={isFeeProduct}
                      title={isFeeProduct ? "Can't change qty for fee" : "Other functions"}
                  >
                    -
                  </Button>
                  <span className="px-2">{item.qty}</span>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      disabled={isFeeProduct}
                      title={isFeeProduct ? "Can't change qty for fee" : "Other functions"}
                  >
                    +
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(item.id)}
                          disabled={isFeeProduct}
                          title={isFeeProduct ? "Can't change qty for fee" : "Other functions"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          );})}
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
  const [active, setActive] = useState(-1);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCust, setIsCust] = useState(false);

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
      if (active >= 0 && suggests[active]) {
        goSearch(suggests[active].name);
      } else {
        goSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggests.length > 0) {
        setActive(Math.min(active + 1, suggests.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (active > 0) {
        setActive(active - 1);
      } else if (active === 0) {
        setActive(-1);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const [recording, setRecording] = useState(false);
  function handleClick(e) {
    if (!("webkitSpeechRecognition" in window)) {
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setValue("");
      setValue(transcript);
    };
    if (!recording) {
      recognition.start();
      setRecording(true);
    } else {
      recognition.stop();
      setRecording(false);
    }
  }

  useEffect(() => {
    if (value.trim().length > 0) {
      setOpen(true);
      setActive(-1);
      fetchSuggestions(value.trim())
          .then((results) => setSuggests(Array.isArray(results) ? results : []))
          .catch(() => setSuggests([]));
    } else {
      setOpen(false);
      setSuggests([]);
      setActive(-1);
    }
  }, [value]);

  // detect if current user has ADMIN role via backend /me endpoint
  useEffect(() => {
    let mounted = true;
    fetch("http://localhost:8080/me", { credentials: "include" })
        .then((res) => res.text())
        .then((text) => {
          if (!mounted) return;
          // backend returns a string containing role or authorities; check for ADMIN
          if (typeof text === "string" && text.toUpperCase().includes("ADMIN")) {
            setIsAdmin(true);
          }
        })
        .catch(() => {
          /* ignore */
        });

    return () => {
      mounted = false;
    };
  }, []);

    useEffect(() => {
    let mounted = true;
    fetch("http://localhost:8080/me", { credentials: "include" })
        .then((res) => res.text())
        .then((text) => {
          if (!mounted) return;
          // backend returns a string containing role or authorities; check for ADMIN
          if (typeof text === "string" && text.toUpperCase().includes("CUSTOMER")) {
            setIsCust(true);
          }
        })
        .catch(() => {
          /* ignore */
        });

    return () => {
      mounted = false;
    };
  }, []);

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
                <Popover
                    open={open && suggests.length > 0}
                    onOpenChange={setOpen}
                >
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
                      <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-black bg-white hover:bg-white h-5 w-5"
                          onClick={handleClick}
                      >
                        {recording ? (
                            <svg
                                fill="currentColor"
                                className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2"
                                viewBox="0 0 19 19"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M6.5 5A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5z" />
                              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                            </svg>
                        ) : (
                            <svg
                                fill="currentColor"
                                className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2"
                                viewBox="0 0 19 19"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M11.665 7.915v1.31a5.257 5.257 0 0 1-1.514 3.694 5.174 5.174 0 0 1-1.641 1.126 5.04 5.04 0 0 1-1.456.384v1.899h2.312a.554.554 0 0 1 0 1.108H3.634a.554.554 0 0 1 0-1.108h2.312v-1.899a5.045 5.045 0 0 1-1.456-.384 5.174 5.174 0 0 1-1.641-1.126 5.257 5.257 0 0 1-1.514-3.695v-1.31a.554.554 0 1 1 1.109 0v1.31a4.131 4.131 0 0 0 1.195 2.917 3.989 3.989 0 0 0 5.722 0 4.133 4.133 0 0 0 1.195-2.917v-1.31a.554.554 0 1 1 1.109 0zM3.77 10.37a2.875 2.875 0 0 1-.233-1.146V4.738A2.905 2.905 0 0 1 3.77 3.58a3 3 0 0 1 1.59-1.59 2.902 2.902 0 0 1 1.158-.233 2.865 2.865 0 0 1 1.152.233 2.977 2.977 0 0 1 1.793 2.748l-.012 4.487a2.958 2.958 0 0 1-.856 2.09 3.025 3.025 0 0 1-.937.634 2.865 2.865 0 0 1-1.152.233 2.905 2.905 0 0 1-1.158-.233A2.957 2.957 0 0 1 3.77 10.37z" />
                            </svg>
                        )}
                      </button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                      className="p-0 w-[--radix-popover-trigger-width]"
                      align="start"
                      sideOffset={4}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                      avoidCollisions={false}
                  >
                    <Command shouldFilter={false} value="" defaultValue="">
                      <CommandList>
                        <CommandEmpty>No matches</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                          {suggests.map((s, idx) => (
                              <CommandItem
                                  key={s.id}
                                  value={s.name}
                                  onMouseEnter={() => setActive(idx)}
                                  onMouseLeave={() => setActive(-1)}
                                  onSelect={() => goSearch(s.name)}
                                  className={`${
                                      active >= 0 && idx === active ? "bg-green-50" : ""
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
                      className="relative text-green-600 bg-white hover:text-white hover:bg-green-600 transition-colors"
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

              {/* Map/Robot Tracking (mobile only) remains as a separate button for small screens */}

              {/* Three-dash menu for extra actions */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white text-green-600 hover:bg-green-600 hover:text-white"
                  >
                    {/* simple three-dash icon */}
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="3" y="4" width="14" height="2" rx="1"></rect>
                      <rect x="3" y="9" width="14" height="2" rx="1"></rect>
                      <rect x="3" y="14" width="14" height="2" rx="1"></rect>
                    </svg>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 bg-white text-gray-800">
                  <div className="flex flex-col">
                    {(isCust || isAdmin) && (
                    <Button
                        variant="ghost"
                        size="default"
                        className="justify-start bg-white text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={() => navigate("/order-history")}
                    >
                      Orders
                    </Button>)}
                    {(isCust || isAdmin) && (
                    <Button
                        variant="ghost"
                        size="default"
                        className="justify-start bg-white text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={() => navigate("/map")}
                    >
                      Track Delivery
                    </Button>)}
                    {isAdmin && (
                        <Button
                            variant="ghost"
                            size="default"
                            className="justify-start bg-white text-green-600 hover:bg-green-600 hover:text-white"
                            onClick={() => navigate("/admin")}
                        >
                          Admin Dashboard
                        </Button>
                    )}
                    <Separator />
                    {isCust && (
                    <Button
                        variant="ghost"
                        size="default"
                        className="justify-start bg-white text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={async () => {
                          try {
                            // Call backend logout endpoint to invalidate server session
                            await fetch(`${BASE}/logout`, {
                              method: "POST",
                              credentials: "include",
                              headers: { "X-Requested-With": "XMLHttpRequest" },
                            });

                            // Clear local client state (cart, flags)
                            try {
                              const cart = useCart.getState();
                              if (cart && typeof cart.reset === "function") cart.reset();
                            } catch (e) {
                              console.warn("Failed to reset cart state locally", e);
                            }

                            // Redirect to login page (app's login is at `/`)
                            window.location.href = "/";
                          } catch (e) {
                            // If backend call fails, still clear local state and send to login
                            try {
                              const cart = useCart.getState();
                              if (cart && typeof cart.reset === "function") cart.reset();
                            } catch (er) {
                              /* ignore */
                            }
                            window.location.href = "/";
                          }
                        }}
                    >
                      Sign out
                    </Button>)}
                    {!isCust && !isAdmin && (
                    <Button
                        variant="ghost"
                        size="default"
                        className="justify-start bg-white text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={async () => {
                            window.location.href = "/";
                          }
                        }
                    >
                      Sign In
                    </Button>)}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>
  );
}