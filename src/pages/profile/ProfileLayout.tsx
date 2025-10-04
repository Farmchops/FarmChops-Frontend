// src/pages/profile/ProfileLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { User, Package, Bell, Settings, CreditCard, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { useLogoutMutation } from "../../redux/api/authApi";
import { logout as logoutAction } from "../../redux/features/auth/authSlice";
const ProfileLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // auth state
    const user = useSelector((state: RootState) => state.auth.user);


    // logout mutation (uses your authApi logout endpoint)
    const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
    console.log(isLoggingOut)
    // Defensive display name / initial logic
    // const displayName = (user?.firstName || user?.email?.split("@")[0] || "User") as string;
    // const avatarLetter = (user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase();

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
        { path: "personal-info", label: "Personal Information", icon: User },
        { path: "orders", label: "Order History", icon: Package },
        { path: "notifications", label: "Notifications", icon: Bell },
        { path: "payment-methods", label: "Payment Methods", icon: CreditCard },
        { path: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                                    {user?.firstName?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{user?.firstName || "User"}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="bg-white rounded-lg shadow-sm">
                            <ul className="py-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.path}>
                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${isActive ? "bg-primary/10 text-primary border-r-4 border-primary" : ""
                                                    }`
                                                }
                                            >
                                                <Icon size={20} />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        </li>
                                    );
                                })}
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;