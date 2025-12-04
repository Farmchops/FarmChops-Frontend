import React from "react";
import { Target, Users, Award } from "lucide-react";

const AboutUs: React.FC = () => {
    return (
        <section className="bg-white">
            {/* About Us Introduction - Hero Style */}
            <div className="relative bg-gradient-to-b from-green-50 to-white py-20 md:py-28">
                <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-2 bg-[#1D7B3C]/10 text-[#1D7B3C] text-sm font-semibold rounded-full mb-6">
                            About FarmChops
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Where Freshness Meets Convenience
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                            We're passionate about bringing you the healthiest, farm-fresh produce straight from our dedicated farmers to your table.
                        </p>
                    </div>
                </div>
            </div>

            {/* Story Section */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                            <p>
                                At <span className="font-semibold text-[#1D7B3C]">FarmChops</span>, we understand that in today's fast-paced world, finding time to shop for fresh ingredients can be a challenge. That's why we've made it our mission to make healthy eating easy and accessible for everyone.
                            </p>
                            <p>
                                With just a few clicks, you can have a variety of fresh produce delivered right to your doorstep, helping you make nutritious choices without the hassle.
                            </p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl p-8 md:p-12">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#1D7B3C] rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Farm Fresh Quality</h3>
                                    <p className="text-gray-600">Everything picked at its peak, packed with flavor and nourishment</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#1D7B3C] rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Supporting Local Farmers</h3>
                                    <p className="text-gray-600">Giving back to communities and promoting sustainable practices</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#1D7B3C] rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Convenient Delivery</h3>
                                    <p className="text-gray-600">Fresh produce delivered straight to your doorstep</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision, Mission, Values - Modern Cards */}
            <div className="bg-gray-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What Drives Us
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our commitment to excellence, sustainability, and community
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Vision Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1D7B3C] to-[#20571E] rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                            <p className="text-gray-600 leading-relaxed">
                                To revolutionize the food supply chain by bridging the gap between local farmers and communities. We envision a future where sustainable agriculture thrives, and every table is filled with fresh, responsibly sourced produce.
                            </p>
                        </div>

                        {/* Mission Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1D7B3C] to-[#20571E] rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                            <p className="text-gray-600 mb-4">
                                To promote sustainable living and strengthen local economies by delivering premium, responsibly sourced products.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-gray-600">
                                    <span className="text-[#1D7B3C] mt-1 font-bold">•</span>
                                    <span className="text-sm">Providing organic produce at competitive prices</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-600">
                                    <span className="text-[#1D7B3C] mt-1 font-bold">•</span>
                                    <span className="text-sm">Ensuring quality and traceability</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-600">
                                    <span className="text-[#1D7B3C] mt-1 font-bold">•</span>
                                    <span className="text-sm">Supporting local agricultural initiatives</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-600">
                                    <span className="text-[#1D7B3C] mt-1 font-bold">•</span>
                                    <span className="text-sm">Fostering farmer growth and sustainability</span>
                                </li>
                            </ul>
                        </div>

                        {/* Quality Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1D7B3C] to-[#20571E] rounded-xl flex items-center justify-center mb-6">
                                <Award className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality & Sourcing</h3>
                            <p className="text-gray-600 leading-relaxed">
                                <span className="font-semibold text-gray-900">Carefully sourced.</span> We partner with vetted local growers and manage handling end-to-end so you receive the best produce, responsibly grown and packed with care.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-[#1D7B3C] to-[#20571E] py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Join the FarmChops Family
                    </h2>
                    <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                        Let's celebrate health, convenience, and the incredible farmers who make it all possible. Welcome to a better way of eating.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
