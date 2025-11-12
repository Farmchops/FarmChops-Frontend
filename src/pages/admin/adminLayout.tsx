// // src/pages/admin/AdminLayout.tsx
// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import {
//     LayoutDashboard,
//     Package,
//     ShoppingCart,
//     TrendingUp,
//     Users,
//     Settings,
//     HelpCircle,
//     LogOut,
//     Menu,
//     X,
//     Shapes
// } from "lucide-react";
// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { RootState } from "../../redux/store";
// import { logout as logoutAction } from "../../redux/features/auth/authSlice";
// import { useLogoutMutation } from "../../redux/api/authApi";
// import logo from "../../assets/logo.png"

// const AdminLayout = () => {
//     const [sidebarOpen, setSidebarOpen] = useState(false);

//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     // auth state
//     const user = useSelector((state: RootState) => state.auth.user);
//     // const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);


//     // logout mutation (uses your authApi logout endpoint)
//     const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
//     console.log(isLoggingOut)

//     const handleLogout = async () => {
//         try {
//             if (user?.email) {
//                 // Try server logout; authApi has onQueryStarted to clear local state on success
//                 await logoutApi({ email: user.email }).unwrap();
//             } else {
//                 // fallback to clearing local state
//                 dispatch(logoutAction());
//             }
//             // setShowProfileMenu(false);
//             navigate("/");
//         } catch (err) {
//             console.error("Logout failed:", err);
//             // Ensure client clears state anyway
//             dispatch(logoutAction());
//             navigate("/");
//         }
//     };

//     const menuItems = [
//         { path: "overview", label: "Overview", icon: LayoutDashboard },
//         { path: "categories", label: "Categories", icon: Shapes },
//         { path: "products", label: "Products", icon: Package },
//         { path: "orders", label: "Orders", icon: ShoppingCart },
//         { path: "sales", label: "Sales", icon: TrendingUp },
//         { path: "users", label: "Users", icon: Users },
//         { path: "settings", label: "Settings", icon: Settings },
//     ];

//     return (
//         <div className="min-h-screen bg-green-100">
//             {/* Top Navigation Bar */}
//             <header className="bg-whiteshadow-sm fixed top-0 left-0 right-0 z-10">
//                 <div className="flex items-center justify-between px-4 py-3">
//                     <div className="flex items-center gap-4">
//                         <button
//                             onClick={() => setSidebarOpen(!sidebarOpen)}
//                             className="lg:hidden text-gray-600 hover:text-gray-900"
//                         >
//                             {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
//                         </button>
//                         {/* <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1> */}
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <span className="text-sm text-gray-600">{user?.firstName || "Admin"}</span>
//                         <div className="w-8 h-8 rounded-full bg-gray-500 text-white  flex items-center justify-center text-sm font-semibold">
//                             {user?.firstName?.charAt(0).toUpperCase() || "A"}
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             <div className="flex pt">

//                 {/* Sidebar */}
//                 <aside
//                     className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
//                         } pt-14 lg:pt-0`}
//                 >
//                     <nav className="min-h-screen flex flex-col p-4">
//                         <div className="flex items-center justify-center">
//                             <img src={logo} alt="Farm Chops logo" className="sm:w-24 md:w-30 " />

//                         </div>
//                         <ul className="flex-1 space-y-1 mt-8">
//                             {menuItems.map((item) => {
//                                 const Icon = item.icon;
//                                 return (
//                                     <li key={item.path}>
//                                         <NavLink
//                                             to={item.path}
//                                             onClick={() => setSidebarOpen(false)}
//                                             className={({ isActive }) =>
//                                                 `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-light text-[#808080] transition-colors- ${isActive ? "text-[#1D7B3C] bg-[#DFF5EB]" : ""
//                                                 }`
//                                             }
//                                         >
//                                             <Icon size={20} className="text-[#121212]" />
//                                             <span className="font-medium">{item.label}</span>
//                                         </NavLink>
//                                     </li>
//                                 );
//                             })}
//                         </ul>
//                         <NavLink
//                             to={"help"}
//                             onClick={() => setSidebarOpen(false)}
//                             className={({ isActive }) =>
//                                 `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-light text-[#808080] transition-colors- ${isActive ? "text-[#1D7B3C] bg-[#DFF5EB]" : ""
//                                 }`
//                             }
//                         >
//                             <HelpCircle size={20} className="text-[#121212]" />
//                             <span className="font-medium">Help</span>
//                         </NavLink>
//                         <button
//                             onClick={handleLogout}
//                             className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#808080]  hover:bg-red-50 transition-colors w-full"
//                         >
//                             <LogOut size={20} className="text-[#121212]" />
//                             <span className="font-medium">Logout</span>
//                         </button>

//                     </nav>
//                 </aside>

//                 {/* Overlay for mobile */}
//                 {sidebarOpen && (
//                     <div
//                         className="fixed inset-0 bg-black/50 z-10 lg:hidden"
//                         onClick={() => setSidebarOpen(false)}
//                     />
//                 )}

//                 {/* Main Content */}
//                 <main className="flex-1 p-6">
//                     <Outlet />
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default AdminLayout;






// src/pages/admin/AdminLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Shapes,
    UserCog,
    Truck,
    Tag
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../assets/logo.png";
import type { RootState } from "@/redux/store";
import { logoutAdmin } from "@/redux/features/auth/adminAuthSlice";

interface MenuItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ size: number; className?: string }>;
    permission: string | null;
}

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Admin auth state
    const user = useSelector((state: RootState) => state.adminAuth.user);
    const isRider = user?.adminRole === "rider";

    const handleLogout = async () => {
        try {
            dispatch(logoutAdmin());
            navigate("/admin/login", { replace: true });
        } catch (err) {
            console.error("Logout failed:", err);
            dispatch(logoutAdmin());
            navigate("/admin/login", { replace: true });
        }
    };

    // Check if user has permission
    const hasPermission = (permission: string | null): boolean => {
        if (!permission) return true; // No permission required
        if (!user?.permissions) {
            console.warn("No user permissions found");
            return false;
        }

        // console.log(`Checking permission: ${permission}, User permissions: ${user.permissions}`);

        // Super admin has all permissions (*)
        if (user.permissions.includes("*")) {
            // console.log(`✓ User has wildcard (*) - granting access to ${permission}`);
            return true;
        }

        // Check specific permission
        const has = user.permissions.includes(permission);
        // console.log(`Permission ${permission}: ${has ? "✓ GRANTED" : "✗ DENIED"}`);
        return has;
    };

    // Menu items with their required permissions
    const menuItems: MenuItem[] = isRider
        ? [
            {
                path: "overview",
                label: "Overview",
                icon: LayoutDashboard,
                permission: null,
            },
            {
                path: "rider/orders",
                label: "Assigned Deliveries",
                icon: Truck,
                permission: null,
            },
            {
                path: "settings",
                label: "Settings",
                icon: Settings,
                permission: null,
            },
        ]
        : [
            {
                path: "overview",
                label: "Overview",
                icon: LayoutDashboard,
                permission: null,
            },
            {
                path: "categories",
                label: "Categories",
                icon: Shapes,
                permission: "manage_categories",
            },
            {
                path: "products",
                label: "Products",
                icon: Package,
                permission: "manage_products",
            },
            {
                path: "orders",
                label: "Orders",
                icon: ShoppingCart,
                permission: "view_orders",
            },
            {
                path: "deals",
                label: "Deals",
                icon: Tag,
                permission: "promotions.deals.manage",
            },
            {
                path: "sales",
                label: "Sales",
                icon: TrendingUp,
                permission: "view_financial_reports",
            },
            {
                path: "users",
                label: "Users",
                icon: Users,
                permission: "view_users",
            },
            {
                path: "vendors",
                label: "Vendors",
                icon: UserCog,
                permission: "manage_vendors",
            },
            {
                path: "admins",
                label: "Admin Management",
                icon: UserCog,
                permission: "manage_admins",
            },
            {
                path: "settings",
                label: "Settings",
                icon: Settings,
                permission: null,
            },
        ];

    // Filter menu items based on user permissions
    const visibleMenuItems = menuItems.filter((item) => {
        const canView = hasPermission(item.permission);
        // console.log(`Menu Item "${item.label}" (permission: ${item.permission}): ${canView ? "VISIBLE" : "HIDDEN"}`);
        return canView;
    });

    // console.log("Visible menu items:", visibleMenuItems.map(m => m.label));

    // Get admin role display name
    const getAdminRoleDisplay = (role: string): string => {
        const roleMap: Record<string, string> = {
            super_admin: "Super Admin",
            finance: "Finance Officer",
            inventory_officer: "Inventory Officer",
            operations_officer: "Operations Officer",
            logistics: "Logistics Manager",
            customer_support: "Customer Support",
            admin: "Admin",
            rider: "Rider",
        };
        return roleMap[role] || role;
    };

    // Get user initials for avatar
    const getUserInitials = (): string => {
        if (!user) return "A";
        const first = user.firstName?.charAt(0).toUpperCase() || "";
        const last = user.lastName?.charAt(0).toUpperCase() || "";
        return (first + last) || "A";
    };

    return (
        <div className="min-h-screen bg-green-50">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="flex items-center justify-between px-6 py-2">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? (
                            <X size={24} className="text-gray-700" />
                        ) : (
                            <Menu size={24} className="text-gray-700" />
                        )}
                    </button>

                    {/* Logo for Mobile */}
                    <div className="lg:hidden">
                        <img src={logo} alt="Farm Chops" className="h-8" />
                    </div>

                    {/* User Info and Avatar */}
                    <div className="flex items-center gap-3 ml-auto">
                        <div className="hidden sm:block text-right mr-3">
                            <p className="text-sm font-medium text-gray-800">
                                {user?.firstName || "Admin"} {user?.lastName || ""}
                            </p>
                            <p className="text-xs text-gray-600">
                                {user?.adminRole ? getAdminRoleDisplay(user.adminRole) : "Admin"}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#1D7B3C] text-white flex items-center justify-center text-sm font-semibold shadow">
                            {getUserInitials()}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-24 lg:pt-20">
                {/* Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                        } pt-24 lg:pt-6 overflow-y-auto`}
                >
                    <nav className="min-h-screen flex flex-col p-4">
                        {/* Logo */}
                        <div className="hidden lg:flex items-center justify-center mb-8">
                            <img
                                src={logo}
                                alt="Farm Chops logo"
                                className="h-12"
                            />
                        </div>

                        {/* Menu Items */}
                        <ul className="flex-1 space-y-1 mt-4 lg:mt-0">
                            {visibleMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                    ? "text-[#1D7B3C] bg-[#DFF5EB] shadow-sm"
                                                    : "text-[#666666] hover:bg-gray-50"
                                                }`
                                            }
                                        >
                                            <Icon size={20} className="flex-shrink-0 text-[#121212]" />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Help Link */}
                        <NavLink
                            to="help"
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? "text-[#1D7B3C] bg-[#DFF5EB] shadow-sm"
                                    : "text-[#666666] hover:bg-gray-50"
                                }`
                            }
                        >
                            <HelpCircle size={20} className="flex-shrink-0" />
                            <span>Help</span>
                        </NavLink>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full mt-2"
                        >
                            <LogOut size={20} className="flex-shrink-0" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>

                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8 pt-4">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;