import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import cartnav from "../assets/cartnav.png"; 


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className=" shadow-md ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Left - Logo */}
                    <div className="py-3">
                        <Link to="/">
                            <img src={logo} alt="Farm Chops logo" className="w-30"/>
                        </Link>
                    </div>

                    {/* Middle - Navigation Links (Desktop) */}
                    <div className="hidden md:flex space-x-8">
                        <Link to="/" className="hover:text-[#20571E]">Home</Link>
                        <Link to="/about" className="hover:text-[#20571E]">About Us</Link>
                        <Link to="/products" className="hover:text-[#20571E]">Products</Link>
                        <Link to="/contact" className="hover:text-[#20571E]" >Contact Us</Link>
                    </div>

                    {/* Right - Cart & Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative flex items-center gap-4 p-2 rounded-md hover:bg-green-100 hover:text-[#20571E] transition"
                        >
                            {/* Icon with Badge */}
                            <div className="relative">
                                <img src={cartnav} alt="" />
                                {/* <ShoppingCart size={22} className="text-[#20571E] font-light" /> */}
                                <span className="absolute -top-2 -right-2 bg-[#20571E] text-white text-xs font-light rounded-full px-1">
                                    0
                                </span>
                            </div>

                            {/* Text */}
                            <span className="font-base text-[#20571E]">My Cart</span>
                        </Link>


                        {/* Auth Buttons */}
                        <Link
                            to="/login"
                            className="px-3 py-1 rounded-md border border-[#20571E] hover:bg-[#20571E] hover:text-white transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-3 py-1 rounded-md bg-[#20571E] text-white font-base hover:bg-[#20571E]  transition"
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden px-4 pb-4 space-y-3">
                    <Link to="/" className="block hover:text-[#20571E]">Home</Link>
                    <Link to="/about" className="block hover:text-[#20571E]">About Us</Link>
                    <Link to="/products" className="block hover:text-[#20571E]">Products</Link>
                    <Link to="/contact" className="block hover:text-[#20571E]">Contact Us</Link>

                    {/* Cart */}
                    <Link
                        to="/cart"
                        className="relative flex items-center gap-4 p-2 rounded-md hover:bg-green-100 hover:text-[#20571E] transition"
                    >
                        {/* Icon with Badge */}
                        <div className="relative">
                            <img src={cartnav} alt="" />
                            <span className="absolute -top-2 -right-2 bg-[#20571E] text-white text-xs font-light rounded-full px-1">
                                0
                            </span>
                        </div>
                        {/* Text */}
                        <span className="text-[#20571E]">My Cart</span>
                    </Link>

                    {/* Auth Buttons */}
                    <div className="flex space-x-2">
                        <Link
                            to="/login"
                            className="flex-1 text-center px-3 py-1 rounded-md border border-[#20571E] hover:bg-[#20571E] hover:text-white transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="flex-1 text-center px-3 py-1 rounded-md bg-[#20571E] text-white font-base hover:bg-[#1a4718] transition"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            )}

        </nav>
    );
};

export default Navbar;
