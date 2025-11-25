
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authUtil from "@/lib/authUtil"; 
import ErrorPage from "@/pages/ErrorPage"

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = authUtil(); 

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? (
      children
    ) : (

      <ErrorPage /> 
);
};

export default ProtectedRoute;