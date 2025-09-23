// src/routes/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";

// Public pages
import Home from "../pages/Home";
import About from "../pages/About";
import Products from "../pages/Products";
import Contacts from "../pages/Contacts";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CartPage from "../pages/CartPage";
import Checkout from "../pages/CheckOut";
import Thanks from "../pages/ThankYou";
import VerifyEmail from "../pages/VerifyEmail";

// Auth & Admin
// import PrivateRoute from "./PrivateRoute";
// import Orders from "../pages/Orders";
// import AdminRoute from "./AdminRoute";
// import AdminLogin from "../pages/admin/AdminLogin";
// import DashboardLayout from "../pages/admin/DashboardLayout";
// import DashboardHome from "../pages/admin/DashboardHome";
// import AddNewProduct from "../pages/admin/AddNewProduct";
// import ManageProducts from "../pages/admin/ManageProducts";
// import EditProduct from "../pages/admin/EditProduct";
// import SingleProduct from "../pages/SingleProduct";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/about", element: <About /> },
            { path: "/products", element: <Products /> },
            { path: "/contact", element: <Contacts /> },
            { path: "/login", element: <Login /> },
            { path: "/signup", element: <Register /> },
            { path: "/cart", element: <CartPage /> },
            { path: "/verifyemail", element: <VerifyEmail /> },

            {
                path: "/checkout",
                // element: (
                //     <PrivateRoute>
                //         <Checkout />
                //     </PrivateRoute>
                // ),
                element: <Checkout />
            },
            { path: "/products/:id", element: <div>SingleProduct</div> },
            { path: "/thank-you", element: <Thanks /> },
            {
                path: "/orders",
                // element: (
                //     <PrivateRoute>
                //         <Orders />
                //     </PrivateRoute>
                // ),
            },
        ],
    },
    // { path: "/admin", element: <AdminLogin /> },
    // {
    //     path: "/dashboard",
    //     element: (
    //         <AdminRoute>
    //             <DashboardLayout />
    //         </AdminRoute>
    //     ),
    //     children: [
    //         { path: "", element: <DashboardHome /> },
    //         { path: "add-new-product", element: <AddNewProduct /> },
    //         { path: "manage-products", element: <ManageProducts /> },
    //         { path: "edit-product/:id", element: <EditProduct /> },
    //     ],
    // },
]);

export default router;
