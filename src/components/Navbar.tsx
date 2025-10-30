import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, User, Home, ShoppingBag, Info, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import cartnav from "../assets/cartnav.png";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store"; // <-- adjust if your store path differs
import { useLogoutMutation } from "../redux/api/authApi"; // <-- adjust if path differs
import { logout as logoutAction } from "../redux/features/auth/authSlice"; // <-- adjust if path differs
import { useGetCartQuery } from "@/redux/api/cartApi";

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get cart count from API
    const { data: cartData } = useGetCartQuery();
    const cartCount = cartData?.cart?.totalItems || 0;

    // auth state
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // logout mutation
    const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

    // Display name / initial logic
    const displayName = (user?.firstName || user?.email?.split("@")[0] || "User") as string;
    const avatarLetter = (user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase();

    const handleLogout = async () => {
        try {
            if (user?.email) {
                await logoutApi({ email: user.email }).unwrap();
            } else {
                dispatch(logoutAction());
            }
            setShowProfileMenu(false);
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
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
                        onClick={() => {
                            setShowProfileMenu(false);
                            setIsOpen(false);
                        }}
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
                        <span className="text-sm">
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </span>
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
                            <img
                                src={logo}
                                alt="Farm Chops logo"
                                className="w-18 sm:w-24 md:w-30"
                            />
                        </Link>
                    </div>

                    {/* Middle - Links */}
                    <div className="hidden md:flex space-x-8 text-[15px]">
                        <Link to="/" className="hover:text-[#20571E]">
                            Home
                        </Link>
                        <Link to="/about" className="hover:text-[#20571E]">
                            About Us
                        </Link>
                        <Link to="/products" className="hover:text-[#20571E]">
                            Products
                        </Link>
                        <Link to="/contact" className="hover:text-[#20571E]">
                            Contact us
                        </Link>
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
                                {cartCount > 0 && (
                                    <span className="absolute -top-3 -right-3 bg-[#20571E] text-white text-xs font-light rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                        {cartCount}
                                    </span>
                                )}
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

                    {/* Mobile menu and cart */}
                    <div className="md:hidden flex items-center gap-3">
                        <Link 
                            to="/cart" 
                            className="relative p-2 -mr-1 text-gray-600 hover:text-[#1D7B3C]"
                        >
                            <ShoppingBag size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#1D7B3C] text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button 
                            onClick={() => setIsOpen(!isOpen)} 
                            className="p-1 -mr-1 text-gray-600 hover:text-[#1D7B3C]"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Green pay bar */}
            <div className="bg-[#1D7B3C] text-white flex justify-end gap-8 py-2 text-xs md:text-[15px] pr-8 font-light">
                <p className="hidden md:block">Deal of the Day</p>
                <p>Pay Later</p>
                <p>Bulk Buying</p>
                <p>Become a vendor</p>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <aside
                className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Mobile Menu Header */}
                <div className="flex justify-between items-center p-4 border-b h-16">
                    <Link to="/" onClick={() => setIsOpen(false)}>
                        <img src={logo} alt="Farm Chops" className="h-8" />
                    </Link>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-1 -mr-1 text-gray-500 hover:text-gray-700"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Mobile Menu Items */}
                <nav className="py-2 overflow-y-auto h-[calc(100%-4rem)]">
                    <ul className="space-y-1">
                        <li>
                            <Link
                                to="/"
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <Home size={18} className="mr-3 text-gray-500" />
                                <span>Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/products"
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <ShoppingBag size={18} className="mr-3 text-gray-500" />
                                <span>Products</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <Info size={18} className="mr-3 text-gray-500" />
                                <span>About Us</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contact"
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <Phone size={18} className="mr-3 text-gray-500" />
                                <span>Contact</span>
                            </Link>
                        </li>

                        {/* Auth Section */}
                        {isAuthenticated ? (
                            <>
                                <li className="border-t border-gray-100 my-2" />
                                <li>
                                    <div className="flex items-center px-4 py-3">
                                        <div className="w-9 h-9 rounded-full bg-[#20571E] text-white flex items-center justify-center font-medium mr-3">
                                            {avatarLetter}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{displayName}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <User size={18} className="mr-3 text-gray-500" />
                                        <span>My Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left flex items-center px-4 py-3 text-red-600 hover:bg-red-50"
                                        disabled={isLoggingOut}
                                    >
                                        <LogOut size={18} className="mr-3" />
                                        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="border-t border-gray-100 my-2" />
                                <li className="px-4 py-2">
                                    <Link
                                        to="/login"
                                        className="block w-full text-center py-2.5 px-4 rounded-md bg-[#1D7B3C] text-white hover:bg-[#1a6b34] transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li className="px-4 pb-4">
                                    <Link
                                        to="/signup"
                                        className="block w-full text-center py-2.5 px-4 rounded-md border border-[#1D7B3C] text-[#1D7B3C] hover:bg-gray-50 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Create Account
                                    </Link>
                                </li>
                            </>
                        )}
                        
                        {/* Cart Button - Fixed at bottom */}
                        <li className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3">
                            <Link
                                to="/cart"
                                className="flex items-center justify-center gap-2 w-full bg-[#1D7B3C] text-white py-2.5 px-4 rounded-md font-medium text-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <ShoppingBag size={18} />
                                <span>View Cart</span>
                                {cartCount > 0 && (
                                    <span className="bg-white text-[#1D7B3C] text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ml-1">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
        </nav>
    );
};

export default Navbar;