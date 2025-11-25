
import { useState, useEffect } from "react";

const authUtil = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        setIsAuthenticated(false); 

        fetch("http://localhost:8080/me", { credentials: "include" })
            .then((res) => {
                if (!res.ok) {

                    throw new Error("Auth check failed");
                }
                return res.text();
            })
            .then((text) => {
                if (!mounted) return;
                
                const roleText = text.toUpperCase();


                if (roleText.includes("CUSTOMER") || roleText.includes("ADMIN")) {
                    setIsAuthenticated(true); 
                }
            })
            .catch(() => {

                setIsAuthenticated(false);
            })
            .finally(() => {
                if (mounted) {
                    setIsLoading(false); 
                }
            });

        return () => {
          mounted = false;
        };
    }, []); 

    return { isAuthenticated, isLoading };
};

export default authUtil;