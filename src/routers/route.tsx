// src/routes/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";

// Public pages
import Home from "../pages/Home";
import About from "../pages/About";
import Products from "../pages/Products";
import ProductDetail from "@/components/Product/ProductDetail";
import Contacts from "../pages/Contacts";
import DealOfTheDay from "../pages/DealOfTheDay";
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
import BulkBuyingPage from "../pages/BulkBuying";
import BecomeVendor from "../pages/BecomeVendor";
import GroupSharing from "../pages/GroupSharing";
import GroupDetail from "../pages/GroupDetail";
import MyGroups from "../pages/profile/MyGroups";

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
import AdminSignup from "@/pages/admin/AdminSignUp";
import AdminForgotPassword from "@/pages/admin/AdminForgotPassword";
import AdminResetPassword from "@/pages/admin/AdminResetPassword";
import AdminManagement from "@/pages/admin/AdminManagement";
import OrderSuccess from "@/components/Checkout/OrderSuccess";
import RiderDashboard from "@/pages/admin/RiderDashboard";
import Deals from "@/pages/admin/Deals";
import VendorsList from "../pages/admin/VendorsList";
import VendorDetail from "../pages/admin/VendorDetail";
import AdminGroupOrders from "../pages/admin/AdminGroupOrders";
import AdminGroupDetail from "../pages/admin/AdminGroupDetail";
import CreateGroupOrder from "../pages/admin/CreateGroupOrder";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/about", element: <About /> },
            { path: "/products", element: <Products /> },
            { path: "/deals", element: <DealOfTheDay /> },
            { path: "/contact", element: <Contacts /> },
            { path: "/cart", element: <CartPage /> },
            { path: "/verifyemail", element: <VerifyEmail /> },
            { path: "/products/:slug", element: <ProductDetail /> },

            // Group Sharing
            { path: "/group-sharing", element: <GroupSharing /> },
            { path: "/group/:groupId", element: <GroupDetail /> },

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
            {
                path: "/checkout",
                element: (
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                ),
            },
            { path: "/thank-you", element: <Thanks /> },
            { path: "/order/success", element: <OrderSuccess /> },
            // { path: "/orders/:orderId", element: <OrderDetails /> },

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
                    { path: "groups", element: <MyGroups /> },
                    { path: "notifications", element: <Notifications /> },
                    { path: "settings", element: <ProfileSettings /> },
                    { path: "payment-methods", element: <PaymentMethods /> },
                ],
            },
            { path: "/bulk-buying", element: <BulkBuyingPage /> },
            { path: "/become-vendor", element: <BecomeVendor /> },
        ],
    },

    // Admin Auth Routes (No protection needed)
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/signup", element: <AdminSignup /> },
    { path: "/admin/forgot-password", element: <AdminForgotPassword /> },
    { path: "/admin/reset-password", element: <AdminResetPassword /> },

    // Admin Protected Routes
    {
        path: "/admin",
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            { index: true, element: <Navigate to="overview" replace /> },

            // Overview - accessible to all authenticated admins
            { path: "overview", element: <Overview /> },

            // Categories - requires manage_categories permission
            {
                path: "categories",
                element: (
                    <AdminRoute requiredPermission="manage_categories">
                        <Categories />
                    </AdminRoute>
                ),
            },

            // Products - requires manage_products permission
            {
                path: "products",
                element: (
                    <AdminRoute requiredPermission="manage_products">
                        <AdminProducts />
                    </AdminRoute>
                ),
            },

            // Orders - requires view_orders permission
            {
                path: "orders",
                element: (
                    <AdminRoute requiredPermission="view_orders">
                        <AdminOrders />
                    </AdminRoute>
                ),
            },

            // Group Orders - requires view_orders permission
            {
                path: "group-orders",
                element: (
                    <AdminRoute requiredPermission="view_orders">
                        <AdminGroupOrders />
                    </AdminRoute>
                ),
            },
            {
                path: "group-orders/create",
                element: (
                    <AdminRoute requiredPermission="view_orders">
                        <CreateGroupOrder />
                    </AdminRoute>
                ),
            },
            {
                path: "group-orders/:groupId",
                element: (
                    <AdminRoute requiredPermission="view_orders">
                        <AdminGroupDetail />
                    </AdminRoute>
                ),
            },

            {
                path: "deals",
                element: (
                    <AdminRoute requiredPermission="promotions.deals.manage">
                        <Deals />
                    </AdminRoute>
                ),
            },
            {
                path: "rider/orders",
                element: (
                    <AdminRoute allowedRoles={["rider", "super_admin"]}>
                        <RiderDashboard />
                    </AdminRoute>
                ),
            },

            // Sales - requires view_financial_reports permission
            {
                path: "sales",
                element: (
                    <AdminRoute requiredPermission="view_financial_reports">
                        <Sales />
                    </AdminRoute>
                ),
            },

            // Users - requires view_users permission
            {
                path: "users",
                element: (
                    <AdminRoute requiredPermission="view_users">
                        <Users />
                    </AdminRoute>
                ),
            },

            // Admin Management - requires super admin (*)
            {
                path: "admins",
                element: (
                    <AdminRoute requiredPermission="manage_admins">
                        <AdminManagement />
                    </AdminRoute>
                ),
            },

            // Vendors - requires manage_vendors permission
            {
                path: "vendors",
                element: (
                    <AdminRoute requiredPermission="manage_vendors">
                        <VendorsList />
                    </AdminRoute>
                ),
            },
            {
                path: "vendors/:id",
                element: (
                    <AdminRoute requiredPermission="manage_vendors">
                        <VendorDetail />
                    </AdminRoute>
                ),
            },

            // Settings - accessible to all authenticated admins
            { path: "settings", element: <AdminSettings /> },

            // Help - accessible to all authenticated admins
            { path: "help", element: <Help /> },
        ],
    },

    // Catch-all redirect
    // { path: "*", element: <Navigate to="/" replace /> },
    {
        path: "*",
        element: <div className="text-center py-20">
            <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>
            <a href="/" className="text-blue-500 underline mt-4 block">Go Home</a>
        </div>,
    },

]);

export default router;