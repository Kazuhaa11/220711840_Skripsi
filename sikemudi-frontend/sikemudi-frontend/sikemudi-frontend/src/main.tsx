import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { FloatingNotificationProvider } from "@/components/feedback/FloatingNotificationProvider";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { router } from "./app/router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <FloatingNotificationProvider>
        <RouterProvider router={router} />
      </FloatingNotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
);
