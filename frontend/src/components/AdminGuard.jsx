import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// Simple guard that checks /me endpoint for ADMIN authority before rendering children.
// If not admin (or not authenticated), redirects to login (root).
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

  if (loading) return null; // or a spinner
  if (!allowed) return <Navigate to="/" replace />;
  return children;
}
