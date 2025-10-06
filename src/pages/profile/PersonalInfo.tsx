import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { useUpdateProfileMutation } from "../../redux/api/authApi";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const PersonalInfo = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    gender: user?.gender || "",
    phone: user?.phone?.replace("+234", "") || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const avatarLetter =
    user?.firstName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender.trim()) newErrors.gender = "Gender is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await updateProfile({
        ...formData,
        phone: `+234${formData.phone}`
        // address: user?.address, // Provide address from user or empty string
      }).unwrap();

      if (!result.success) setServerError(result.message);
    } catch (error: any) {
      setServerError(error?.data?.message || "Update failed. Try again.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center md:py-10">
      <div className=" w-full max-w-2xl md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700">
            {avatarLetter}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.firstName || "User"}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Personal info</h3>
          <p className="text-sm text-gray-500 mb-6">Your personal info</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-[#1D7B3C]"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-[#1D7B3C]"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Gender & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-[#1D7B3C] bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs">{errors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <span className="bg-gray-100 text-gray-700 text-sm px-3 py-2">+234</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9120000000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 py-2 px-3 text-sm outline-none"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>
            </div>

            {serverError && (
              <p className="text-red-500 text-sm text-center">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-fit px-6 bg-[#1D7B3C] text-white py-2 rounded-md hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PersonalInfo;
