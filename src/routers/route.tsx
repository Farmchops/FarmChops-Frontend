// src/routes/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import App from "../App";
import { ProtectedRoute } from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Public pages
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Services = lazy(() => import("../pages/Services"));
const FAQ = lazy(() => import("../pages/FAQ"));
const CustomerSupport = lazy(() => import("../pages/CustomerSupport"));
const TermsAndConditions = lazy(() => import("../pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetail = lazy(() => import("@/components/Product/ProductDetail"));
const Contacts = lazy(() => import("../pages/Contacts"));
const DealOfTheDay = lazy(() => import("../pages/DealOfTheDay"));
const CartPage = lazy(() => import("../pages/CartPage"));
const Checkout = lazy(() => import("../pages/CheckOut"));
const Thanks = lazy(() => import("../pages/ThankYou"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const EmailVerification = lazy(() => import("../pages/auth/EmailVerification"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgetPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const Register = lazy(() => import("../pages/auth/Register"));
const Login = lazy(() => import("../pages/auth/Login"));
const ProfileCompletion = lazy(() => import("../pages/auth/ProfileCompletion"));
const BulkBuyingPage = lazy(() => import("../pages/BulkBuying"));
const Review = lazy(() => import("../pages/Review"));
const BecomeVendor = lazy(() => import("../pages/BecomeVendor"));
const GroupSharing = lazy(() => import("../pages/GroupSharing"));
const GroupDetail = lazy(() => import("../pages/GroupDetail"));
const GroupPaymentCallback = lazy(() => import("../pages/GroupPaymentCallback"));
const MyGroups = lazy(() => import("../pages/profile/MyGroups"));

// Profile Pages
const ProfileLayout = lazy(() => import("../pages/profile/ProfileLayout"));
const PersonalInfo = lazy(() => import("../pages/profile/PersonalInfo"));
const OrderHistory = lazy(() => import("../pages/profile/OrderHistory"));
const Notifications = lazy(() => import("../pages/profile/Notifications"));
const ProfileSettings = lazy(() => import("../pages/profile/ProfileSettings"));
const PaymentMethods = lazy(() => import("../pages/profile/PaymentMethods"));
const Wallet = lazy(() => import("../pages/profile/Wallet"));
const WalletTransactions = lazy(() => import("../pages/profile/WalletTransactions"));
const FundWallet = lazy(() => import("../pages/profile/FundWallet"));
const PaymentLinks = lazy(() => import("../pages/profile/PaymentLinks"));
const CreatePaymentLink = lazy(() => import("../pages/profile/CreatePaymentLink"));

// Public Payment Page
const PayForMe = lazy(() => import("../pages/PayForMe"));

// Admin Pages
const AdminLayout = lazy(() => import("../pages/admin/adminLayout"));
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const Overview = lazy(() => import("../pages/admin/Overview"));
const Categories = lazy(() => import("../pages/admin/Categories"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const Sales = lazy(() => import("../pages/admin/Sales"));
const AdminSettings = lazy(() => import("../pages/admin/AdminSettings"));
const Help = lazy(() => import("../pages/admin/Help"));
const Users = lazy(() => import("../pages/admin/Users"));
const AdminSignup = lazy(() => import("@/pages/admin/AdminSignUp"));
const AdminForgotPassword = lazy(() => import("@/pages/admin/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("@/pages/admin/AdminResetPassword"));
const AdminManagement = lazy(() => import("@/pages/admin/AdminManagement"));
const OrderSuccess = lazy(() => import("@/components/Checkout/OrderSuccess"));
const GroupOrderSuccess = lazy(() => import("@/components/Checkout/GroupOrderSuccess"));
const RiderDashboard = lazy(() => import("@/pages/admin/RiderDashboard"));
const Deals = lazy(() => import("@/pages/admin/Deals"));
const VendorsList = lazy(() => import("../pages/admin/VendorsList"));
const VendorDetail = lazy(() => import("../pages/admin/VendorDetail"));
const AdminGroupOrders = lazy(() => import("../pages/admin/AdminGroupOrders"));
const AdminGroupDetail = lazy(() => import("../pages/admin/AdminGroupDetail"));
const CreateGroupOrder = lazy(() => import("../pages/admin/CreateGroupOrder"));

// Marketing Pages
const MarketersListPage = lazy(() => import("../pages/admin/MarketersListPage"));
const MarketerDetailsPage = lazy(() => import("../pages/admin/MarketerDetailsPage"));
const CouponsListPage = lazy(() => import("../pages/admin/CouponsListPage"));
const CouponDetailsPage = lazy(() => import("../pages/admin/CouponDetailsPage"));

// PayLater Pages
const PayLaterPage = lazy(() => import("../pages/PayLater"));
const PayLaterCart = lazy(() => import("../pages/PayLater/PayLaterCart"));
const PayLaterCheckout = lazy(() => import("../pages/PayLater/PayLaterCheckout"));
const PayLaterApplications = lazy(() => import("../pages/admin/PayLaterApplications"));
const PayLaterUsers = lazy(() => import("../pages/admin/PayLaterUsers"));
const AdminReviews = lazy(() => import("../pages/admin/AdminReviews"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/about", element: <About /> },
            { path: "/services", element: <Services /> },
            { path: "/faq", element: <FAQ /> },
            { path: "/support", element: <CustomerSupport /> },
            { path: "/terms", element: <TermsAndConditions /> },
            { path: "/privacy", element: <PrivacyPolicy /> },
            { path: "/products", element: <Products /> },
            { path: "/deals", element: <DealOfTheDay /> },
            { path: "/contact", element: <Contacts /> },
            { path: "/cart", element: <CartPage /> },
            { path: "/verifyemail", element: <VerifyEmail /> },
            { path: "/products/:slug", element: <ProductDetail /> },

            // Group Sharing
            { path: "/group-sharing", element: <GroupSharing /> },
            { path: "/group/:groupId", element: <GroupDetail /> },
            // Shareable link route - supports both group ID and shareable code
            { path: "/group-buy/:groupId", element: <GroupDetail /> },
            // Group payment callback - handles Paystack redirect after payment
            { path: "/group-payment/callback", element: <GroupPaymentCallback /> },

            // Public Pay-for-Me routes (no auth required)
            { path: "/pay/:code", element: <PayForMe /> },
            { path: "/order/success/pay/:code", element: <PayForMe /> },

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
            { path: "/order/success/wallet", element: <OrderSuccess /> },
            { path: "/order/success/group-buy/:groupId", element: <GroupOrderSuccess /> },
            { path: "/wallet/callback", element: <FundWallet /> },
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
                    // Wallet routes
                    { path: "wallet", element: <Wallet /> },
                    { path: "wallet/transactions", element: <WalletTransactions /> },
                    { path: "wallet/fund", element: <FundWallet /> },
                    // Payment Links routes
                    { path: "payment-links", element: <PaymentLinks /> },
                    { path: "payment-links/create", element: <CreatePaymentLink /> },
                    { path: "notifications", element: <Notifications /> },
                    { path: "settings", element: <ProfileSettings /> },
                    { path: "payment-methods", element: <PaymentMethods /> },
                ],
            },
            { path: "/review", element: <Review /> },
            { path: "/bulk-buying", element: <BulkBuyingPage /> },
            { path: "/become-farmer", element: <BecomeVendor /> },
            { path: "/become-vendor", element: <Navigate to="/become-farmer" replace /> },

            // PayLater routes (Protected)
            {
                path: "/paylater",
                element: (
                    <ProtectedRoute>
                        <PayLaterPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/paylater/shop",
                element: (
                    <ProtectedRoute>
                        <PayLaterPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/paylater/cart",
                element: (
                    <ProtectedRoute>
                        <PayLaterCart />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/paylater/checkout",
                element: (
                    <ProtectedRoute>
                        <PayLaterCheckout />
                    </ProtectedRoute>
                ),
            },
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

            // Marketing - Marketers & Coupons
            {
                path: "marketers",
                element: (
                    <AdminRoute requiredPermission="manage_marketing">
                        <MarketersListPage />
                    </AdminRoute>
                ),
            },
            {
                path: "marketers/:id",
                element: (
                    <AdminRoute requiredPermission="manage_marketing">
                        <MarketerDetailsPage />
                    </AdminRoute>
                ),
            },
            {
                path: "coupons",
                element: (
                    <AdminRoute requiredPermission="manage_marketing">
                        <CouponsListPage />
                    </AdminRoute>
                ),
            },
            {
                path: "coupons/:id",
                element: (
                    <AdminRoute requiredPermission="manage_marketing">
                        <CouponDetailsPage />
                    </AdminRoute>
                ),
            },

            // PayLater Management
            {
                path: "paylater/applications",
                element: (
                    <AdminRoute requiredPermission="manage_paylater">
                        <PayLaterApplications />
                    </AdminRoute>
                ),
            },
            {
                path: "paylater/users",
                element: (
                    <AdminRoute requiredPermission="manage_paylater">
                        <PayLaterUsers />
                    </AdminRoute>
                ),
            },

            // Reviews
            { path: "reviews", element: <AdminReviews /> },

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