// src/routes/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";

// Public pages
import Home from "../pages/Home";
import About from "../pages/About";
import Products from "../pages/Products";
import ProductDetail from "@/components/Product/ProductDetail";
import Contacts from "../pages/Contacts";
import CartPage from "../pages/CartPage";
import Checkout from "../pages/CheckOut";
import Thanks from "../pages/ThankYou";
import VerifyEmail from "../pages/VerifyEmail";
import EmailVerification from "../pages/auth/EmailVerification";
import ForgotPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import ProfileCompletion from "../pages/auth/ProfileCompletion";

// Profile Pages
import ProfileLayout from "../pages/profile/ProfileLayout";
import PersonalInfo from "../pages/profile/PersonalInfo";
import OrderHistory from "../pages/profile/OrderHistory";
import Notifications from "../pages/profile/Notifications";
import ProfileSettings from "../pages/profile/ProfileSettings";
import PaymentMethods from "../pages/profile/PaymentMethods";

// Admin Pages
import AdminRoute from "./AdminRoute";
import AdminLayout from "../pages/admin/adminLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import Overview from "../pages/admin/Overview";
import Categories from "../pages/admin/Categories";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import Sales from "../pages/admin/Sales";
import AdminSettings from "../pages/admin/AdminSettings";
import Help from "../pages/admin/Help";
import Users from "../pages/admin/Users";


const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/about", element: <About /> },
            { path: "/products", element: <Products /> },
            { path: "/contact", element: <Contacts /> },
            { path: "/cart", element: <CartPage /> },
            { path: "/verifyemail", element: <VerifyEmail /> },
            { path: "/products/:slug", element: <ProductDetail /> },

            // Auth routes
            { path: "/register", element: <Register /> },
            { path: "/signup", element: <Navigate to="/register" replace /> },
            { path: "/verify-email", element: <EmailVerification /> },
            { path: "/login", element: <Login /> },
            { path: "/forgot-password", element: <ForgotPassword /> },
            { path: "/reset-password", element: <ResetPassword /> },
            {
                path: "/complete-profile",
                element: (
                    <ProtectedRoute>
                        <ProfileCompletion />
                    </ProtectedRoute>
                ),
            },

            // Protected routes
            { path: "/checkout", element: <Checkout /> },
            { path: "/thank-you", element: <Thanks /> },

            // Profile routes (Protected)
            {
                path: "/profile",
                element: (
                    <ProtectedRoute>
                        <ProfileLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <Navigate to="personal-info" replace /> },
                    { path: "personal-info", element: <PersonalInfo /> },
                    { path: "orders", element: <OrderHistory /> },
                    { path: "notifications", element: <Notifications /> },
                    { path: "settings", element: <ProfileSettings /> },
                    { path: "payment-methods", element: <PaymentMethods /> },
                ],
            },
        ],
    },

    // Admin routes
    { path: "/admin/login", element: <AdminLogin /> },
    {
        path: "/admin",
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            { index: true, element: <Navigate to="overview" replace /> },
            { path: "overview", element: <Overview /> },
            { path: "categories", element: <Categories /> },
            { path: "products", element: <AdminProducts /> },
            { path: "orders", element: <AdminOrders /> },
            { path: "sales", element: <Sales /> },
            { path: "users", element: <Users /> },
            { path: "settings", element: <AdminSettings /> },
            { path: "help", element: <Help /> },
        ],
    },
]);

export default router;