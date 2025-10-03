// src/pages/admin/AdminLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FolderTree,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Shapes
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { logout as logoutAction } from "../../redux/features/auth/authSlice";
import { useLogoutMutation } from "../../redux/api/authApi";
import logo from "../../assets/logo.png"

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // auth state
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);


    // logout mutation (uses your authApi logout endpoint)
    const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            if (user?.email) {
                // Try server logout; authApi has onQueryStarted to clear local state on success
                await logoutApi({ email: user.email }).unwrap();
            } else {
                // fallback to clearing local state
                dispatch(logoutAction());
            }
            // setShowProfileMenu(false);
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
            // Ensure client clears state anyway
            dispatch(logoutAction());
            navigate("/");
        }
    };

    const menuItems = [
        { path: "overview", label: "Overview", icon: LayoutDashboard },
        { path: "categories", label: "Categories", icon: Shapes },
        { path: "products", label: "Products", icon: Package },
        { path: "orders", label: "Orders", icon: ShoppingCart },
        { path: "sales", label: "Sales", icon: TrendingUp },
        { path: "users", label: "Users", icon: Users },
        { path: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-green-100">
            {/* Top Navigation Bar */}
            <header className="bg-whiteshadow-sm fixed top-0 left-0 right-0 z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden text-gray-600 hover:text-gray-900"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        {/* <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1> */}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{user?.firstName || "Admin"}</span>
                        <div className="w-8 h-8 rounded-full bg-gray-500 text-white  flex items-center justify-center text-sm font-semibold">
                            {user?.firstName?.charAt(0).toUpperCase() || "A"}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt">

                {/* Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } pt-14 lg:pt-0`}
                >
                    <nav className="min-h-screen flex flex-col p-4">
                        <div className="flex items-center justify-center">
                            <img src={logo} alt="Farm Chops logo" className="sm:w-24 md:w-30 " />

                        </div>
                        <ul className="flex-1 space-y-1 mt-8">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-light text-[#808080] transition-colors- ${isActive ? "text-[#1D7B3C] bg-[#DFF5EB]" : ""
                                                }`
                                            }
                                        >
                                            <Icon size={20} className="text-[#121212]"/>
                                            <span className="font-medium">{item.label}</span>
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                        <NavLink
                            to={"help"}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-light text-[#808080] transition-colors- ${isActive ? "text-[#1D7B3C] bg-[#DFF5EB]" : ""
                                }`
                            }
                        >
                            <HelpCircle size={20} className="text-[#121212]" />
                            <span className="font-medium">Help</span>
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#808080]  hover:bg-red-50 transition-colors w-full"
                        >
                            <LogOut size={20} className="text-[#121212]" />
                            <span className="font-medium">Logout</span>
                        </button>

                    </nav>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-10 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;