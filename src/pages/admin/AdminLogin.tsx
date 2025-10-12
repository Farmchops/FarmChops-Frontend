// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { LoadingSpinner } from "../../components/LoadingSpinner";
// import { useLoginMutation } from "../../redux/api/authApi";
// import type { RootState } from "../../redux/store";
// import { EyeOff, Eye } from "lucide-react";

// import Footer from "../../components/Footer";
// import Navbar from "../../components/Navbar";



// const AdminLogin = () => {
//   const navigate = useNavigate();
//   const [login, { isLoading }] = useLoginMutation();
//   const { isAuthenticated, profileComplete } = useSelector((state: RootState) => state.auth);

//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [remember, setRemember] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     // Redirect if already authenticated
//     if (isAuthenticated) {
//       navigate("/admin");
//     }

//     // Load remembered email
//     const savedEmail = localStorage.getItem("rememberedEmail");
//     if (savedEmail) {
//       setEmail(savedEmail);
//       setRemember(true);
//     }
//   }, [isAuthenticated, profileComplete, navigate]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!email || !password) {
//       setError("Please enter both email and password");
//       return;
//     }

//     try {
//       const result = await login({ email, password }).unwrap();

//       if (result.success) {
//         // Handle remember email
//         if (remember) {
//           localStorage.setItem("rememberedEmail", email);
//         } else {
//           localStorage.removeItem("rememberedEmail");
//         }

//         // Navigation is handled by the Redux state change in useEffect
//       } else {
//         setError(result.message);
//       }
//     } catch (error: any) {
//       setError(error?.data?.message || "Invalid email or password");
//     }
//   };


//   return (
//     <section>
//       <Navbar/>
//         <div className="flex items-center justify-center min-h-[80vh] bg-green-50">
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
//         >
//           <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-6">
//            Admin Login
//           </h2>

//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => {
//               setEmail(e.target.value);
//               setError("");
//             }}
//             disabled={isLoading}
//             className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
//           />

//           {/* <input
//                         type="password"
//                         placeholder="Password"
//                         value={password}
//                         onChange={(e) => {
//                             setPassword(e.target.value);
//                             setError("");
//                         }}
//                         disabled={isLoading}
//                         className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
//                     /> */}



//           <div className="relative mb-3">
//             <input
//               type={showPassword ? "text" : "password"}
//               placeholder="Password"
//               value={password}
//               onChange={(e) => {
//                 setPassword(e.target.value);
//                 setError("");
//               }}
//               disabled={isLoading}
//               className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50 pr-10"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute text-xs right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//             >
//               {showPassword ? <EyeOff className="font-light" /> : <Eye className="font-light" />}
//               {/* You can swap emojis with <Eye /> and <EyeOff /> from lucide-react */}
//             </button>
//           </div>


//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//                 disabled={isLoading}
//                 className="mr-2"
//               />
//               <label className="text-sm text-[#666666]">Remember Email</label>
//             </div>

//             <span
//               onClick={() => !isLoading && navigate("/forgot-password")}
//               className="text-sm text-[#1D7B3C] cursor-pointer hover:underline"
//             >
//               Forgot Password?
//             </span>
//           </div>

//           {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-[#1D7B3C]  text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             {isLoading ? <LoadingSpinner size="sm" /> : "Login"}
//           </button>

//           <p className="mt-4 text-center text-sm">
//             Don't have an account?{" "}
//             <span
//               onClick={() => !isLoading && navigate("/register")}
//               className="text-green-700 font-semibold cursor-pointer hover:underline"
//             >
//               Create Account
//             </span>
//           </p>
//         </form>
//       </div>
//       <Footer />
//     </section>
//   )
// }

// export default AdminLogin;
























// src/pages/admin/AdminLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import type { RootState } from '@/redux/store';
import { useAdminLoginMutation } from '@/redux/api/adminAuthApi';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

interface FormErrors {
  email?: string;
  password?: string;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const { isAuthenticated } = useSelector((state: RootState) => state.adminAuth);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/overview', { replace: true });
    }

    // Load remembered email
    const savedEmail = localStorage.getItem('rememberedAdminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const result = await adminLogin({
        email: email.toLowerCase(),
        password,
      }).unwrap();

      if (result.success) {
        // Handle remember email
        if (remember) {
          localStorage.setItem('rememberedAdminEmail', email);
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }

        // Navigation is handled by useEffect watching isAuthenticated
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Invalid email or password';
      setError(errorMessage);
    }
  };

  return (
    <section className="min-h-screen bg-green-50 flex flex-col">
      <Navbar />
      <div className="flex items-center justify-center flex-1 px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            {/* <img src={logo} alt="Farm Chops" className="h-16 mx-auto mb-4" /> */}
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900">
              Admin Login
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Sign in to your admin account
            </p>
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              disabled={isLoading}
              className="w-full py-2 px-3 border rounded-md outline-none placeholder:text-sm disabled:bg-gray-50 transition-colors "
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                disabled={isLoading}
                className="w-full py-2 px-3 border rounded-md outline-none placeholder:text-sm disabled:bg-gray-50 transition-colors "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-xs right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-[#666666] cursor-pointer"
              >
                Remember Email
              </label>
            </div>

            <button
              type="button"
              onClick={() => !isLoading && navigate('/admin/forgot-password')}
              disabled={isLoading}
              className="text-sm text-[#1D7B3C] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forgot Password?
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => !isLoading && navigate('/admin/signup')}
              disabled={isLoading}
              className="text-green-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
            </button>
          </p>
        </form>
      </div>
      <Footer />
    </section>
  );
};

export default AdminLogin;