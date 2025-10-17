import { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cartStore";
import mapIcon from '../assets/mapIcon.svg'

function CartSummary() {
  const { items, totals } = useCart();
  const t = totals();
  const fees = t.subtotal * 0.08; // est. 8% fees/tax (adjust as needed)
  const total = t.subtotal + fees;
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span className="font-medium">${t.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Fees & taxes (est.)</span>
        <span className="font-medium">${fees.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={() => navigate("/cart")}>
          View Cart
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={items.length === 0}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const currentQ = params.get("q") || "";

  // show current query in the input when you're on /catalog
  const [value, setValue] = useState(currentQ);
  useEffect(() => {
    if (location.pathname.startsWith("/catalog") || location.pathname === "/") {
      setValue(currentQ);
    }
  }, [currentQ, location.pathname]);

  const goSearch = () => {
    const q = value.trim();
    const url = q ? `/catalog?q=${encodeURIComponent(q)}` : `/catalog`;
    navigate(url);
  };

  const [recording,setRecording]=useState(false)
  function handleClick(e) {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support voice recognition');
    }
    const recognition=new window.webkitSpeechRecognition()
    recognition.interimResults=false;
    recognition.lang='en-US'
    recognition.onresult=(event)=>{
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      setValue('')
      setValue(transcript); 
    }
    if (!recording) {
    recognition.start()
    setRecording(true)
    } else {
    recognition.stop()
    setRecording(false)
    }
  }

  // cart state
  const { items, remove, updateQty, totals } = useCart();
  const t = totals();
  const count = t.count;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link to="/catalog" className="text-xl font-bold">
          OFSGrocery
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {/* search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goSearch();
            }}
            className="hidden md:block"
          >
            <div className="relative w-[320px]">
            <Input
              id="searchProducts"
              placeholder="Search products…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-[320px]"
            />
             <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-black bg-white hover:bg-white h-5 w-5"
              onClick={handleClick}
            >
              <svg fill="currentColor" className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2" viewBox="0 0 19 19" xmlns="http://www.w3.org/2000/svg" ><path d="M11.665 7.915v1.31a5.257 5.257 0 0 1-1.514 3.694 5.174 5.174 0 0 1-1.641 1.126 5.04 5.04 0 0 1-1.456.384v1.899h2.312a.554.554 0 0 1 0 1.108H3.634a.554.554 0 0 1 0-1.108h2.312v-1.899a5.045 5.045 0 0 1-1.456-.384 5.174 5.174 0 0 1-1.641-1.126 5.257 5.257 0 0 1-1.514-3.695v-1.31a.554.554 0 1 1 1.109 0v1.31a4.131 4.131 0 0 0 1.195 2.917 3.989 3.989 0 0 0 5.722 0 4.133 4.133 0 0 0 1.195-2.917v-1.31a.554.554 0 1 1 1.109 0zM3.77 10.37a2.875 2.875 0 0 1-.233-1.146V4.738A2.905 2.905 0 0 1 3.77 3.58a3 3 0 0 1 1.59-1.59 2.902 2.902 0 0 1 1.158-.233 2.865 2.865 0 0 1 1.152.233 2.977 2.977 0 0 1 1.793 2.748l-.012 4.487a2.958 2.958 0 0 1-.856 2.09 3.025 3.025 0 0 1-.937.634 2.865 2.865 0 0 1-1.152.233 2.905 2.905 0 0 1-1.158-.233A2.957 2.957 0 0 1 3.77 10.37z"/></svg>
            </button>

            </div>
          </form>
          <Button className="md:hidden" onClick={goSearch}>
            Search
          </Button>

          {/* CART SHEET */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart
                {count > 0 && (
                  <span className="absolute -right-2 -top-2">
                    <Badge className="rounded-full px-2">{count}</Badge>
                  </span>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
                <SheetDescription>
                  Review items and update quantities.
                </SheetDescription>
              </SheetHeader>

              <Separator />

              <div className="flex h-[calc(100%-5rem)] flex-col">
                <div className="flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      Start by adding items from the catalog.
                    </div>
                  ) : (
                    items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3 p-4">
                        <div className="h-16 w-20 overflow-hidden rounded bg-white">
                          <img
                            src={
                            // shows in sidebar
                              'http://localhost:8080/products/' + it.id + '/image'
                                  ||
                              `data:image/svg+xml;utf8,${encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='90'>
          <rect width='100%' height='100%' fill='white'/>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Segoe UI, Arial' font-size='32' fill='black'>✕</text>
        </svg>`
                              )}`
                            }
                            alt={it.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // swap to fallback if the image fails to load
                              const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='90'>
        <rect width='100%' height='100%' fill='white'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          font-family='Segoe UI, Arial' font-size='32' fill='black'>✕</text>
      </svg>`;
                              e.currentTarget.onerror = null; // prevent loop
                              e.currentTarget.src = `data:image/svg+xml;base64,${btoa(
                                svg
                              )}`;
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="truncate">
                              <div className="font-medium truncate">
                                {it.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {it.brand || "Food"} • {it.category || "Item"}
                              </div>
                            </div>

                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => remove(it.id)}
                              aria-label={`Remove ${it.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQty(it.id, Math.max(1, it.qty - 1))
                                } // clamp
                              >
                                -
                              </Button>
                              <Input
                                className="w-14 text-center"
                                type="number"
                                min={1}
                                max={99}
                                value={it.qty}
                                onChange={(e) => {
                                  const n = Math.max(
                                    1,
                                    parseInt(e.target.value || "1", 10) || 1
                                  );
                                  updateQty(it.id, n);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQty(it.id, Math.min(99, it.qty + 1))
                                }
                              >
                                +
                              </Button>
                            </div>

                            <div className="font-semibold">
                              ${(Number(it.price || 0) * it.qty).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                {/* summary */}
                <CartSummary />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Link to='/map'><img src={mapIcon} alt="Track robot" title="Track robot" style={{height:50,width:100}}/></Link>
      </div>
    </header>
  );
}
