import React, { useState } from "react";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/redux/api/authApi";
import type { RootState } from "@/redux/store";
import { EyeOff, Eye, Download, Trash2 } from "lucide-react";


const ProfileSettings = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showResetInputs, setShowResetInputs] = useState(false);

  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [forgotPassword, { isLoading: sendingCode }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resettingPassword }] = useResetPasswordMutation();

  // Send Reset Code
  const handleSendResetCode = async () => {
    if (!user?.email) {
      setMessage(" No email found. Please log in again.");
      return;
    }

    try {
      const res = await forgotPassword({ email: user.email }).unwrap();
      if (res.success) {
        setMessage("Reset code sent to your email.");
        setShowResetInputs(true);
      } else {
        setMessage(res.message || "Failed to send reset code.");
      }
    } catch (err: any) {
      setMessage(err?.data?.message || "Something went wrong. Try again.");
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode) return setMessage("Enter your reset code.");
    if (newPassword.length < 6)
      return setMessage("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return setMessage("Passwords do not match.");

    try {
      const result = await resetPassword({
        email: user?.email ?? "",
        resetCode: Number(resetCode),
        newPassword,
      }).unwrap();

      if (result.success) {
        setMessage("🎉 Password updated successfully!");
        setShowResetInputs(false);
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(result.message || "Password reset failed.");
      }
    } catch (err: any) {
      setMessage(err?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="md:py-10 min-h-screen mb-16">
      {/* Header */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200"></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Welcome back, {user?.firstName || "User"}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-4 text-gray-800">
          Account Settings
        </h3>

        {/* Change Password */}
        <div className="bg-gray-50 p-5 rounded-lg border mb-8">
          <h4 className="font-medium text-gray-800 mb-4">Change Password</h4>

          {!showResetInputs && (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Click below to send a password reset code to{" "}
                <span className="font-semibold text-green-700">{user?.email}</span>
              </p>
              <button
                onClick={handleSendResetCode}
                disabled={sendingCode}
                className="bg-[#1D7B3C] hover:bg-green-800 text-white px-4 py-2 rounded-lg "
              >
                {sendingCode ? <LoadingSpinner size="sm" /> : "Send Reset Code"}
              </button>
            </div>
          )}

          {showResetInputs && (
            <form onSubmit={handleResetPassword} className="space-y-3 mt-4">
              {/* Reset Code */}
              <input
                type="text"
                placeholder="Enter Reset Code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none"
              />

              {/* New Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {message && (
                <p
                  className={`text-sm text-center ${message.includes("✅") || message.includes("🎉")
                    ? "text-green-600"
                    : "text-red-500"
                    }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={resettingPassword}
                className="bg-[#1D7B3C] hover:bg-green-800 text-white w-full py-2 rounded-lg flex items-center justify-center mt-3"
              >
                {resettingPassword ? <LoadingSpinner size="sm" /> : "Reset Password"}
              </button>

              <p
                onClick={() => setShowResetInputs(false)}
                className="text-sm text-green-700 text-center mt-4 cursor-pointer hover:underline"
              >
                Didn’t get code? Send again
              </p>
            </form>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-50 p-5 rounded-lg border mb-8">
          <h4 className="font-medium text-gray-800 mb-4">Privacy Settings</h4>
          <div className="flex flex-col gap-3">
            <Toggle label="Profile Visibility" description="Make your profile visible to other users" />
            <Toggle label="Order History Visibility" description="Allow others to view your order history" />
            <Toggle label="Wishlist Visibility" description="Show your wishlist publicly" />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-gray-50 p-5 rounded-lg border mb-8">
          <h4 className="font-medium text-gray-800 mb-4">Notification Preferences</h4>
          <div className="flex flex-col gap-3">
            <Toggle label="Order Updates" description="Get notified when your order status changes" />
            <Toggle label="Promotional Emails" description="Receive special offers and updates" />
            <Toggle label="Product Alerts" description="Get notified about new product launches" />
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-gray-50 p-5 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4">Data Management</h4>
          <div className="flex justify-between items-center border border-gray-300 rounded-md px-4 py-3 mb-4">
            <p className="text-gray-700">Download your data</p>
            <button className="flex items-center gap-1 text-green-700 font-medium">
              <Download size={16} /> Download
            </button>
          </div>

          <div className="border border-red-200 bg-red-50 rounded-md px-4 py-3 flex flex-col items-start">
            <p className="text-gray-700 mb-2">Danger Zone</p>
            <p className="text-sm text-gray-600 mb-3">
              Deleting your account will permanently remove all data.
            </p>
            <button className="flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm">
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Switch Component
const Toggle = ({
  label,
  description,
}: {
  label: string;
  description?: string;
}) => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-800 font-medium">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${enabled ? "bg-green-600" : "bg-gray-300"
          }`}
      >
        <span
          className={`w-4 h-4 bg-white rounded-full transform transition-transform ${enabled ? "translate-x-5" : "translate-x-1"
            }`}
        ></span>
      </button>
    </div>
  );
};

export default ProfileSettings;
