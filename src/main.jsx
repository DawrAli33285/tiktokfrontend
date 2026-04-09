import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./HomePage";
import "./index.css";
import LiveTrends from "./LiveTrends";
import TrendPage from "./TrendPage";
import PricingPage from "./Price";
import AccountPage from "./Settings";
import PastPredictions from "./History";
import SupportPage from "./Support";
import LegalPage from "./Legal";
import AuthPage from "./LoginRegister";
import ChangePasswordPage from "./changepassword";
import ProtectedRoute from "./components/protectedroute";
import AdminLogin from "./admin/adminlogin";
import AdminDashboard from "./admin/admindashboard";
import TrendForm from "./admin/admintrendform";
import ProtectedAdminRoute from "./admin/protectedAdminRoute";
import AdminCategories from "./admin/admincategories";
import AdminPredictions from "./admin/adminpredictions";
import AdminTrendView from "./admin/admintrendpage";
import WhatIsRFCI from "./RFCI";
import ScrollToTop from "./components/scroll";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51SRynCPBwgTANTk6OM3ADMEkOYuyTGcfBfz92xAXVsLmm8O6tH7dCVgcwhG4rmi5OH3URGSa6faVFD2WYbI7E8oA00drLGc9l6");


function Root() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,   
    children: [
      { path: "/signup",          element: <AuthPage /> },
      { path: "/what-is-rfci",    element: <WhatIsRFCI /> },
      { path: "/forget-password", element: <ChangePasswordPage /> },
      { path: "/admin/login",     element: <AdminLogin /> },

      {
        path: "/admin",
        element: (
          <ProtectedAdminRoute>
            <Outlet />
          </ProtectedAdminRoute>
        ),
        children: [
          { path: "dashboard",       element: <AdminDashboard /> },
          { path: "trends/new",      element: <TrendForm /> },
          { path: "trends/edit/:id", element: <TrendForm /> },
          { path: "categories",      element: <AdminCategories /> },
          { path: "predictions",     element: <AdminPredictions /> },
          { path: "trend/:id",       element: <AdminTrendView /> },
        ],
      },

      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          { index: true,          element: <HomePage /> },
          { path: "livetrends",   element: <LiveTrends /> },
          { path: "trends/:slug", element: <TrendPage /> },
          { path: "pricing",      element: <PricingPage /> },
          { path: "account",      element: <AccountPage /> },
          { path: "history",      element: <PastPredictions /> },
          { path: "support",      element: <SupportPage /> },
          { path: "legal",        element: <LegalPage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Elements stripe={stripePromise}>
      <RouterProvider router={router} />
    </Elements>
  </StrictMode>
);