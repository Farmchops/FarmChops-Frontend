// src/pages/profile/ProfileLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    User,
    Package,
    Bell,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { useLogoutMutation } from "../../redux/api/authApi";
import { logout as logoutAction } from "../../redux/features/auth/authSlice";
import { useState } from "react";

const ProfileLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);
    const [logoutApi] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            if (user?.email) {
                await logoutApi({ email: user.email }).unwrap();
            } else {
                dispatch(logoutAction());
            }
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
            dispatch(logoutAction());
            navigate("/");
        }
    };

    const menuItems = [
        { path: "personal-info", label: "Personal Information", icon: User },
        { path: "orders", label: "Order History", icon: Package },
        { path: "notifications", label: "Notifications", icon: Bell },
        { path: "payment-methods", label: "Payment Methods", icon: CreditCard },
        { path: "settings", label: "Settings", icon: Settings },
    ];

    const Sidebar = (
        <aside className="w-64 bg-white border-r-2 border-[#CACED8] h-full flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900 px-6 py-5">My Profile</h1>
            <nav>
                <ul className="py-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)} // close sidebar on click (mobile)
                                    className={({ isActive }) =>
                                        `flex items-center text-sm gap-3 px-6 py-3 transition-colors ${isActive
                                            ? "bg-[#E5F7EB] border-[#1D7B3C] border-r-4"
                                            : ""
                                        }`
                                    }
                                >
                                    <Icon size={18} className="text-[#1D7B3C]" />
                                    <span className="text-[#808080]">{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                    <li>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-6 py-3 transition-colors"
                        >
                            <LogOut size={18} className="text-[#1D7B3C]" />
                            <span className="text-[#808080]">Logout</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row relative">
                {/* ===== Mobile Header ===== */}
                <header className="flex md:hidden items-center justify-end bg-white px-4 py-1">
                    {/* <h1 className="text-lg font-semibold text-[#1D7B3C]">My Profile</h1> */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-md border border-gray-200"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </header>

                {/* ===== Sidebar ===== */}
                {/* Desktop */}
                <div className="hidden min-h-screen md:block">{Sidebar}</div>

                {/* Mobile (slide-in) */}
                <div
                    className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
                        }`}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>

                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-white border-r-2 border-[#CACED8] z-50 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    {Sidebar}
                </div>

                {/* ===== Main Content ===== */}
                <main className="flex-1 px-4 md:p-8 ">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProfileLayout;
