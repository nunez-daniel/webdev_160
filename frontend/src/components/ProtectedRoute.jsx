// ProtectedRoute.js (Your original code, now functional)
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authUtil from "@/lib/authUtil"; 
import ErrorPage from "@/pages/ErrorPage"

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = authUtil(); 

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? (
    <Outlet /> 
) : (
    // Render the unauthorized page directly
    <ErrorPage /> 
);
};

export default ProtectedRoute;