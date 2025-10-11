import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import cartnav from "../assets/cartnav.png";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store"; // <-- adjust if your store path differs
import { useLogoutMutation } from "../redux/api/authApi"; // <-- adjust if path differs
import { logout as logoutAction } from "../redux/features/auth/authSlice"; // <-- adjust if path differs

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // cart count (keep your original selector logic)
    const cartCount = useSelector((state: RootState) =>
        state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    );

    // auth state
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // logout mutation (uses your authApi logout endpoint)
    const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

    // Defensive display name / initial logic
    const displayName = (user?.firstName || user?.email?.split("@")[0] || "User") as string;
    const avatarLetter = (user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase();

    const handleLogout = async () => {
        try {
            if (user?.email) {
                // Try server logout; authApi has onQueryStarted to clear local state on success
                await logoutApi({ email: user.email }).unwrap();
            } else {
                // fallback to clearing local state
                dispatch(logoutAction());
            }
            setShowProfileMenu(false);
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
            // Ensure client clears state anyway
            dispatch(logoutAction());
            navigate("/");
        }
    };

    const ProfileButton = (
        <div className="relative">
            <button
                onClick={() => setShowProfileMenu((s) => !s)}
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition"
                aria-haspopup="true"
                aria-expanded={showProfileMenu}
            >
                {/* Avatar circle */}
                <div className="w-9 h-9 rounded-full bg-[#20571E] text-white flex items-center justify-center font-medium">
                    {avatarLetter}
                </div>

                {/* Name (hide on very small widths) */}
                <span className="hidden sm:inline text-sm">{displayName}</span>

                <ChevronDown size={18} />
            </button>

            {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50">
                    <Link
                        to="/profile"
                        onClick={() => { setShowProfileMenu(false); setIsOpen(false); }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                    >
                        <User size={16} />
                        <span className="text-sm">Profile</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                        disabled={isLoggingOut}
                    >
                        <LogOut size={16} />
                        <span className="text-sm">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <nav className="shadow-md relative z-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
                    {/* Left - Logo */}
                    <div className="py-3">
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            <img src={logo} alt="Farm Chops logo" className="w-18 sm:w-24 md:w-30" />
                        </Link>
                    </div>

                    {/* Middle - Links */}
                    <div className="hidden md:flex space-x-8 text-[15px]">
                        <Link to="/" className="hover:text-[#20571E]">Home</Link>
                        <Link to="/about" className="hover:text-[#20571E]">About Us</Link>
                        <Link to="/products" className="hover:text-[#20571E]">Products</Link>
                        <Link to="/contact" className="hover:text-[#20571E]">Contact us</Link>
                    </div>

                    {/* Right - Cart & Auth */}
                    <div className="hidden md:flex items-center space-x-4 text-[16px]">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative flex items-center gap-4 p-2 rounded-md hover:bg-green-100 hover:text-[#20571E] transition"
                        >
                            <div className="relative">
                                <img src={cartnav} alt="cart" />
                                <span className="absolute -top-3 -right-3 bg-[#20571E] text-white text-xs font-light rounded-full px-2 py-0.5">
                                    {cartCount}
                                </span>
                            </div>
                            <span className="font-base text-[#20571E]">My Cart</span>
                        </Link>

                        {/* Auth: show Profile if logged in, else Login/SignUp */}
                        {isAuthenticated ? (
                            ProfileButton
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-3 py-1 rounded-md border border-[#1D7B3C] text-[#1D7B3C] hover:bg-[#20571E] hover:text-white transition text-[15px]"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-3 py-1 rounded-md bg-[#1D7B3C] text-white hover:bg-[#20571E] transition font-light text-[15px]"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Green pay bar */}
            <div className="bg-[#1D7B3C] text-white flex justify-end gap-8 py-2 text-xs md:text-[15px] pr-8 font-light">
                <p className="hidden md:block">Deal of the Day</p>
                <p>Pay for me</p>
                <p>Bulk Buying</p>
                <p>Pay later</p>
            </div>

            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full w-4/5 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex justify-between items-center p-4 border-b h-16">
                    <img src={logo} alt="Farm Chops logo" className="w-18 sm:w-24 md:w-30" />
                    <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col space-y-6 p-6 text-lg">
                    <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-[#20571E] text-[25px] font-bold text-[#121212] border-b-[0.5px] border-[#D9DBE9]">Home</Link>
                    <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-[#20571E] text-[25px] font-bold text-[#121212] border-b-[0.5px] border-[#D9DBE9]">About Us</Link>
                    <Link to="/products" onClick={() => setIsOpen(false)} className="hover:text-[#20571E] text-[25px] font-bold text-[#121212] border-b-[0.5px] border-[#D9DBE9]">Products</Link>
                    <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-[#20571E] text-[25px] font-bold text-[#121212] border-b-[0.5px] border-[#D9DBE9]">Contact Us</Link>

                    {/* Cart */}
                    <Link to="/cart" onClick={() => setIsOpen(false)} className="relative flex items-center gap-4 p-2 rounded-md hover:bg-green-100 hover:text-[#20571E] transition">
                        <div className="relative">
                            <img src={cartnav} alt="cart" />
                            <span className="absolute -top-2 -right-2 bg-[#1D7B3C] text-white text-xs rounded-full px-1">
                                {cartCount}
                            </span>
                        </div>
                        <span className="text-[#1D7B3C]">My Cart</span>
                    </Link>

                    {/* Mobile Auth area */}
                    {isAuthenticated ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-12 h-12 rounded-full bg-[#20571E] text-white flex items-center justify-center font-medium">
                                    {avatarLetter}
                                </div>
                                <div>
                                    <div className="font-medium">{displayName}</div>
                                    <div className="text-xs text-gray-500">{user?.email}</div>
                                </div>
                            </div>

                            <Link to="/profile" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-md hover:bg-gray-100">Profile</Link>
                            <button onClick={handleLogout} disabled={isLoggingOut} className="px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex space-x-3">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center text-[#1D7B3C] px-3 py-2 rounded-md border border-[#1D7B3C] hover:bg-[#20571E] hover:text-white transition">Login</Link>
                            <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1 text-center px-3 py-2 rounded-md bg-[#1D7B3C] text-white hover:bg-[#1a4718] transition">Sign Up</Link>
                        </div>
                    )}
                </div>
            </aside>
        </nav>
    );
};

export default Navbar;
