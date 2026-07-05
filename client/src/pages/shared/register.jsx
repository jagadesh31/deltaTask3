import axios from "axios";
import "../../App.css";
import { useState, useContext, useEffect } from "react";
import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { IoIosEyeOff } from "react-icons/io";
import { FaGoogle } from "react-icons/fa6";
import { SiDash } from "react-icons/si";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authContext } from "../../contexts/authContext";

let BASE_URL = import.meta.env.VITE_AUTH_URL;

const googleLogin = () => {
  const CLIENT_ID = "486170631932-5s4abs9lgv958ptc06ho5705r50i2ccb.apps.googleusercontent.com";
  const REDIRECT_URI = `${BASE_URL}/auth/google/callback`;
  const SCOPE = "openid email profile";
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(
    SCOPE
  )}`;
};

const jauthLogin = () => {
  const CLIENT_ID = import.meta.env.VITE_JAUTH_CLIENT_ID;
  const REDIRECT_URI = `${BASE_URL}/auth/jauth/callback`;
  const ORIGIN_URI = import.meta.env.VITE_CLIENT_BASE_URL;
  const SCOPE = "profile email";
  
  window.location.href = `${import.meta.env.VITE_JAUTH_BASE_URL}/oauth/authorize?response_type=code&scope=${SCOPE}&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&origin_uri=${encodeURIComponent(ORIGIN_URI)}`;
};
function Loader() {
  return (
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6"></div>
  );
}

export function Login() {
  const { user, setUser } = useContext(authContext);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ role: "CLIENT", email: "", password: "" });
  const roles = ["ADMIN", "CLIENT", "DISTRIBUTOR", "EXHIBITOR"];
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/login";
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${BASE_URL}/auth/login`, formData)
      .then((res) => {
        setLoading(false);
        if (res.data.token) {
          if (res.data.user.isSuspended) {
            toast.error("Your account is suspended");
            return;
          }
          setUser(res.data.user);
          localStorage.setItem("token", res.data.token);
          navigate(from === "/" ? "/home" : from, { replace: true });
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response?.data?.message || "Login failed");
      });
  };


  if (user) return <Navigate to={from} replace />;

  return (
    <div className="w-screen h-screen flex justify-center items-center backgroundDiv text-white">
      <div className="bg-black border-2 border-gray-700 w-full max-w-[400px] rounded-2xl p-8 flex flex-col items-center gap-6 transition-all hover:shadow-[0_0_20px_rgba(66,66,250,0.4)]">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-300 text-sm">Login to continue your journey</p>

        <div className="flex justify-center flex-wrap gap-2 w-full border border-gray-500 rounded-xl p-2">
          {roles.map((role) => (
            <span
              key={role}
              className={`px-3 py-1 rounded-lg text-xs md:text-sm font-medium cursor-pointer transition-all ${
                formData.role === role ? "bg-[#4242FA] text-white" : "text-gray-300 hover:bg-[#4242FA]/20"
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, role }))}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          ))}
        </div>

        <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="bg-transparent border border-gray-400 rounded-lg p-2 w-full text-sm focus:outline-none text-white placeholder-gray-400"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            value={formData.email}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="bg-transparent border border-gray-400 rounded-lg p-2 w-full text-sm focus:outline-none text-white placeholder-gray-400 pr-8"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              value={formData.password}
              required
            />
            <span
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoIosEyeOff size={18} /> : <FaRegEye size={18} />}
            </span>
          </div>

          <div className="text-right">
            <Link to="/ForgotPassword" className="text-[#4242FA] text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4242FA] rounded-lg py-2 mt-2 font-semibold hover:bg-[#4242FA]/80 transition-all cursor-pointer flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <Loader /> : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="flex-1 h-[1px] bg-gray-600" /> OR <span className="flex-1 h-[1px] bg-gray-600" />
        </div>

        <div className="flex gap-6">
          <SiDash
            className="bg-white text-black p-2 rounded-full text-4xl cursor-pointer hover:scale-110 transition-all"
            onClick={jauthLogin}
          />
          <FaGoogle
            className="bg-white text-black p-2 rounded-full text-4xl cursor-pointer hover:scale-110 transition-all"
            onClick={googleLogin}
          />
        </div>

        <p className="text-gray-400 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#4242FA] font-semibold hover:underline cursor-pointer">
            Sign up
          </Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(authContext);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ role: "CLIENT", username: "", email: "", password: "" });
  const roles = ["CLIENT", "DISTRIBUTOR", "EXHIBITOR"];
  const location = useLocation();
  const from = location.state?.from || "/";
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) errors.push("Min 6 chars");
    if (!/[a-z]/.test(password)) errors.push("1 lowercase");
    if (!/[A-Z]/.test(password)) errors.push("1 uppercase");
    if (!/\d/.test(password)) errors.push("1 number");
    if (!/[@$!%*?&]/.test(password)) errors.push("1 special char");
    return errors;
  };

  const handleValidation = (e) => {
    e.preventDefault();
    const { email, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Invalid email");
    const errs = validatePassword(password);
    if (errs.length) return toast.error(errs.join(", "));
    handleSubmit(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${BASE_URL}/auth/register`, formData)
      .then((res) => {
        setLoading(false);
        if (res.data.token) {
          setUser(res.data.user);
          localStorage.setItem("token", res.data.token);
          navigate(from === "/" ? "/home" : from, { replace: true });
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response?.data?.message || "Signup failed");
      });
  };

  if (user) return <Navigate to={from} replace />;

  return (
    <div className="w-screen h-screen flex justify-center items-center backgroundDiv text-white">
      <div className="bg-black border-2 border-gray-700 w-full max-w-[400px] rounded-2xl p-8 flex flex-col items-center gap-6 transition-all hover:shadow-[0_0_20px_rgba(66,66,250,0.4)]">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-gray-300 text-sm">Join us today!</p>

        <div className="flex justify-center flex-wrap gap-2 w-full border border-gray-500 rounded-xl p-2">
          {roles.map((role) => (
            <span
              key={role}
              className={`px-3 py-1 rounded-lg text-xs md:text-sm font-medium cursor-pointer transition-all ${
                formData.role === role ? "bg-[#4242FA] text-white" : "text-gray-300 hover:bg-[#4242FA]/20"
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, role }))}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          ))}
        </div>

        <form className="w-full flex flex-col gap-3" onSubmit={handleValidation}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="bg-transparent border border-gray-400 rounded-lg p-2 w-full text-sm text-white placeholder-gray-400 focus:outline-none"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="bg-transparent border border-gray-400 rounded-lg p-2 w-full text-sm text-white placeholder-gray-400 focus:outline-none"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="bg-transparent border border-gray-400 rounded-lg p-2 w-full text-sm text-white placeholder-gray-400 focus:outline-none pr-8"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <span
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoIosEyeOff size={18} /> : <FaRegEye size={18} />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4242FA] rounded-lg py-2 mt-2 font-semibold hover:bg-[#4242FA]/80  transition-all flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <Loader /> : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="flex-1 h-[1px] bg-gray-600" /> OR <span className="flex-1 h-[1px] bg-gray-600" />
        </div>

        <div className="flex gap-6">
          <SiDash
            className="bg-white text-black p-2 rounded-full text-4xl cursor-pointer hover:scale-110 transition-all"
            onClick={jauthLogin}
          />
          <FaGoogle
            className="bg-white text-black p-2 rounded-full text-4xl cursor-pointer hover:scale-110 transition-all"
            onClick={googleLogin}
          />
        </div>

        <p className="text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4242FA] font-semibold hover:underline">
            Login
          </Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}
