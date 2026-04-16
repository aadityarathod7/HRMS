import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const credential = localStorage.getItem("google_credential");
        if (!credential) {
          toast.error("Google Sign-In failed. No credential found.");
          navigate("/login");
          return;
        }

        // Send Google credential to our backend for verification
        const response = await fetch("http://localhost:5000/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        if (response.ok) {
          const data = await response.json();

          // Store same data as normal login
          localStorage.setItem("token", data.token);
          localStorage.setItem("roles", JSON.stringify(data.roles || []));
          localStorage.setItem("userProfile", JSON.stringify(data.user || {}));
          localStorage.setItem("username", data.user?.firstname || "User");
          localStorage.removeItem("google_credential");

          toast.success("Google Sign-In successful!");
          navigate("/home");
        } else {
          const error = await response.json();
          toast.error(error.message || "Google Sign-In failed.");
          localStorage.removeItem("google_credential");
          navigate("/login");
        }
      } catch (error) {
        toast.error("Google Sign-In failed. Please try again.");
        localStorage.removeItem("google_credential");
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Signing in with Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
