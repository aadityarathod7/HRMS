import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { toast } from "react-toastify";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (userName) {
          localStorage.setItem("username", userName);
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("creatorName", userName);
        localStorage.setItem("roles", JSON.stringify(data.roles || []));
        localStorage.setItem("userProfile", JSON.stringify(data.user || {}));

        navigate("/home");
        setTimeout(() => toast.success("Login successful!"), 50);
      } else {
        const errorMessage = await response.text();
        setErrorMessage(errorMessage);
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/Sanvii Logo Final V1.png"
            alt="Company Logo"
            className="h-20 w-auto mb-3"
          />
        </div>

        {/* Card */}
        <div className="bg-gradient-to-b from-gray-50 to-blue-50 rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-light tracking-tight text-gray-900 text-center mb-8">
            Sign in to your account
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-sm text-gray-600 mb-1.5">Username</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign in
                </>
              )}
            </Button>
          </form>

          {errorMessage && (
            <div className="text-red-500 text-sm mt-4 text-center">{errorMessage}</div>
          )}

          <p className="text-center mt-5 text-sm text-gray-500">
            Forgot Password?{" "}
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-800"
            >
              Reset here
            </Link>
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="mt-5 flex justify-center">
            <GoogleOAuthProvider clientId="968620113133-cn4ccu7fhso7tson5kpg5pfr53qn1b8v.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const credential = credentialResponse.credential;
                  if (credential) {
                    localStorage.setItem("google_credential", credential);
                    window.location.href = "/auth/google/callback";
                  }
                }}
                onError={() => {
                }}
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
