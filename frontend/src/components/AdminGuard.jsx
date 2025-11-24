import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("http://localhost:8080/me", { credentials: "include" })
      .then((res) => res.text())
      .then((text) => {
        if (!mounted) return;
        if (typeof text === "string" && text.toUpperCase().includes("ADMIN")) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setAllowed(false);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  if (!allowed) return <Navigate to="/" replace />;
  return children;
}
