import React from "react";
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
            <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-8 relative z-10">

                {/* Logo + social */}
                <div className="md:w-1/4">
                    <img src={logo} alt="Farmchops logo" className=" mb-4" />
                    <p className="text-sm text-green-100 mb-4">
                        Fresh, organic produce delivered straight from local farms to your doorstep.
                    </p>
                    <div className="flex gap-3 text-white">
                        <a href="#"><FaTwitter /></a>
                        <a href="#"><FaFacebookF /></a>
                        <a href="#"><FaInstagram /></a>
                        <a href="#"><FaPinterestP /></a>
                    </div>
                </div>

                {/* Links */}
                <div className=" gap-8 ">
                        <h4 className="font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-green-100 text-sm">
                            <li><a href="#">Service</a></li>
                            <li><a href="#">Resources</a></li>
                            <li><a href="#">About us</a></li>
                        </ul>
                </div>

                <div className=" gap-8 ">
                    <h4 className="font-semibold mb-3">Help</h4>
                    <ul className="space-y-2 text-green-100 text-sm">
                        <li><a href="#">Customer Support</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div className="md:w-1/4">
                    <h4 className="font-semibold mb-3">Subscribe to Newsletter</h4>
                    <form className="flex">
                        <input
                            type="email"
                            placeholder="Enter email address"
                            className="p-2 rounded-l-md w-full bg-white text-black focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-yellow-500 hover:bg-yellow-600 px-4 rounded-r-md text-black font-semibold"
                        >
                            Join
                        </button>
                    </form>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
