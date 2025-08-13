import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

interface RegisterFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

type ErrorMessages = Record<string, string>;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<ErrorMessages>({});

  const validate = (): boolean => {
    const newErrors: ErrorMessages = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.acceptTerms)
      newErrors.acceptTerms = "You must accept terms & conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validate()) return;

    console.log("Register data:", formData);
    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <section>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-6">
          Create Account
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full py-2 px-3  border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm"
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full py-2 px-3  border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm"
        />
        {errors.firstName && (
          <p className="text-red-500 text-xs">{errors.firstName}</p>
        )}

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full py-2 px-3  border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm"
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName}</p>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full py-2 px-3  border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full py-2 px-3  border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
        )}

        <div className="flex items-center mb-3 mt-2">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="mr-2 text-[#666666]"
          />
          <label className="text-sm text-[#666666]">Accept all Terms & Conditions</label>
        </div>
        {errors.acceptTerms && (
          <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
        )}

        <button
          type="submit"
          className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800"
        >
          Create Account
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-700 font-semibold cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>

    <Footer/>      
    </section>

  );
}
