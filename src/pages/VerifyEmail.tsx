import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [code, setCode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!code.trim()) {
            setError("Please enter the verification code.");
            return;
        }

        // Simulate verification request
        console.log("Verifying code:", code);
        if (code === "123456") {
            alert("Email verified successfully!");
            navigate("/dashboard"); // redirect after success
        } else {
            setError("Invalid verification code.");
        }
    };

    const handleResend = () => {
        // Simulate resend logic
        console.log("Resend verification code");
        setMessage("A new code has been sent to your email.");
        setTimeout(() => setMessage(""), 4000); // clear message after 4s
    };

    return (
        <section>
            <div className="flex items-center justify-center min-h-[80vh] bg-green-50">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-6">
                        Verify Your Email
                    </h2>

                    <p className="text-sm text-gray-600 text-center mb-4">
                        Enter the 6-digit code sent to your email.
                    </p>

                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCode(e.target.value)
                        }
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md mb-3 outline-none placeholder:text-sm text-center tracking-widest"
                    />

                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

                    <button
                        type="submit"
                        className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 mb-3"
                    >
                        Verify
                    </button>

                    <p className="text-center text-sm">
                        Didn’t receive the code?{" "}
                        <span
                            onClick={handleResend}
                            className="text-green-700 font-semibold cursor-pointer"
                        >
                            Resend
                        </span>
                    </p>
                </form>
            </div>

            <Footer />
        </section>
    );
}
