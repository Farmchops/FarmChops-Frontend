import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaFacebookF, FaInstagram, FaPinterestP } from "react-icons/fa";
import foodArtLeft from "../assets/footerfoodart1.png"; // replace with your left food art image
import foodArtRight from "../assets/footerfoodart2.png"; // replace with your right food art image
import logo from "../assets/fotterlogo.png"


const Footer: React.FC = () => {
    return (
        <footer className="relative bg-[#0E5430] text-white py-10 overflow-hidden md:py-16">
            {/* Food art left */}
            <img
                src={foodArtLeft}
                alt="Food art left"
                className="absolute bottom-0 left-0 w-28 sm:w-36 md:w-40 pointer-events-none select-none"
            />

            {/* Food art right */}
            <img
                src={foodArtRight}
                alt="Food art right"
                className="absolute bottom-0 right-0 w-28 sm:w-36 md:w-40 pointer-events-none select-none"
            />

            {/* Footer content */}
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Logo + social */}
                    <div>
                        <img src={logo} alt="Farmchops logo" className="mb-4" />
                        <p className="text-sm text-green-100 mb-4">
                            Fresh, organic produce delivered straight from local farms to your doorstep.
                        </p>
                        <div className="flex gap-3 text-white">
                            <a href="#"><FaTwitter /></a>
                            <a href="#"><FaFacebookF /></a>
                            <a href="https://www.instagram.com/farmchops_ltd?igsh=MWJkdjZpaGJ2OTZyYg==" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                            <a href="#"><FaPinterestP /></a>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-green-100 text-sm">
                            <li><Link to="/services" className="hover:text-white transition-colors">Service</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h4 className="font-semibold mb-3">Help</h4>
                        <ul className="space-y-2 text-green-100 text-sm">
                            <li><Link to="/support" className="hover:text-white transition-colors">Customer Support</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Location */}
                    <div>
                        <h4 className="font-semibold mb-3">Location</h4>
                        <p className="text-sm text-green-100">
                            Abuja, Nigeria
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
