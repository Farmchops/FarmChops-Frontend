import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import cartnav from "../assets/cartnav.png";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar when a route is clicked
    const handleClose = () => setIsOpen(false);

    return (
        <nav className="shadow-md relative z-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
                    {/* Left - Logo */}
                    <div className="py-3">
                        <Link to="/" onClick={handleClose}>
                            <img src={logo} alt="Farm Chops logo" className="w-18 sm:w-24 md:w-30" />
                        </Link>
                    </div>

                    {/* Middle - Navigation Links (Desktop) */}
                    <div className="hidden md:flex space-x-8">
                        <Link to="/" className="hover:text-[#20571E]">Home</Link>
                        <Link to="/about" className="hover:text-[#20571E]">About Us</Link>
                        <Link to="/products" className="hover:text-[#20571E]">Products</Link>
                        <Link to="/contact" className="hover:text-[#20571E]">Contact Us</Link>
                    </div>

                    {/* Right - Cart & Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4 text-[16px]">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative flex items-center gap-4 p-2 rounded-md hover:bg-green-100 hover:text-[#20571E] transition"
                        >
                            <div className="relative">
                                <img src={cartnav} alt="" />
                                <span className="absolute -top-2 -right-2 bg-[#20571E] text-white text-xs font-light rounded-full px-1">
                                    0
                                </span>
                            </div>
                            <span className="font-base text-[#20571E]">My Cart</span>
                        </Link>

                        {/* Auth Buttons */}
                        <Link
                            to="/login"
                            className="px-3 py-1 rounded-md border border-[#1D7B3C] text-[#1D7B3C] hover:bg-[#20571E] hover:text-white transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-3 py-1 rounded-md bg-[#1D7B3C] text-white hover:bg-[#20571E] transition"
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Pay Section (Always visible under nav) */}
            <div className="bg-[#1D7B3C] text-white flex justify-end gap-8 py-2 text-xs md:text-[16px] pr-8">
                <p>Pay for me</p>
                <p>Pay later</p>
                <p>info@farm-chops.com</p>
            </div>

            {/* Sidebar (Mobile Navigation) */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={handleClose}
            />

            <aside
                className={`fixed top-0 right-0 h-full w-4/5 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <img src={logo} alt="Farm Chops logo" className="w-18 sm:w-24 md:w-30" />
                    <button onClick={handleClose} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col space-y-6 p-6 text-lg">
                    <Link to="/" onClick={handleClose} className="hover:text-[#20571E] text-[25px] font-medium text-[#121212] border-b-[0.5px] border-[#D9DBE9]">Home</Link>
                    <Link to="/about" onClick={handleClose} className="hover:text-[#20571E] text-[25px] font-medium text-[#121212] border-b-[0.5px] border-[#D9DBE9]">About Us</Link>
                    <Link to="/products" onClick={handleClose} className="hover:text-[#20571E] text-[25px] font-medium text-[#121212] border-b-[0.5px] border-[#D9DBE9]">Products</Link>
                    <Link to="/contact" onClick={handleClose} className="hover:text-[#20571E] text-[25px] font-medium text-[#121212] border-b-[0.5px] border-[#D9DBE9]">Contact Us</Link>

                    {/* Cart */}
                    <Link
                        to="/cart"
                        onClick={handleClose}
                        className="relative flex items-center gap-4 p-2 rounded-md hover:bg-green-100 hover:text-[#20571E] transition"
                    >
                        <div className="relative">
                            <img src={cartnav} alt="" />
                            <span className="absolute -top-2 -right-2 bg-[#1D7B3C] text-white text-xs font-light rounded-full px-1">
                                0
                            </span>
                        </div>
                        <span className="text-[#1D7B3C]">My Cart</span>
                    </Link>

                    {/* Auth Buttons */}
                    <div className="flex space-x-3">
                        <Link
                            to="/login"
                            onClick={handleClose}
                            className="flex-1 text-center text-[#1D7B3C] px-3 py-2 rounded-md border border-[#1D7B3C] hover:bg-[#20571E] hover:text-white transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            onClick={handleClose}
                            className="flex-1 text-center px-3 py-2 rounded-md bg-[#1D7B3C] text-white hover:bg-[#1a4718] transition"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </aside>
        </nav>
    );
};

export default Navbar;
