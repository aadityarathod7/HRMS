import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [createdBy, setCreatedBy] = useState<string>("");
  const isFormVisible = true;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Logging in with:", { userName, password });
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login response data:", data);

        if (userName) {
          localStorage.setItem("username", userName);
          console.log("Username:", userName);
        } else {
          console.error("Username is undefined in the response data.");
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("creatorName", userName);
        setCreatedBy(userName);

        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        const errorMessage = await response.text();
        setErrorMessage(errorMessage);
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500/80 to-purple-500/80 p-4">
      <style>{`
        .txt_field input:focus,
        .txt_field select:focus {
          outline: none;
          box-shadow: none;
        }

        .txt_field input:-webkit-autofill,
        .txt_field input:-webkit-autofill:hover,
        .txt_field input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px white inset;
        }
      `}</style>
      <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md border-white/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
        {/* Logo Container */}
        <div className="flex justify-center mt-8 mb-4">
          <img
            src="/Sanvii Logo Final V1.png"
            alt="Company Logo"
            className="h-35 w-40 mb-4"
          />
        </div>

        {/* <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-violet-900"></CardTitle>
                </CardHeader> */}
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="txt_field">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <span></span>
              <label>Username</label>
            </div>
            <div className="txt_field">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span></span>
              <label>Password</label>
            </div>
            <div className="mt-12">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white transition-all duration-300"
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
            </div>
          </form>
          {errorMessage && (
            <div className="text-red-500 mt-4">{errorMessage}</div>
          )}
          <div>
            <p className="flex justify-center mt-4 text-gray-600">
              Forgot Password?{" "}
              <Link
                to="/forgot-password"
                className="text-purple-600 ml-1 hover:text-purple-800"
              >
                Reset here
              </Link>
            </p>
          </div>
          <div className="mt-4">
            <GoogleOAuthProvider clientId="968620113133-cn4ccu7fhso7tson5kpg5pfr53qn1b8v.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log(credentialResponse);
                  const credential = credentialResponse.credential;
                  if (credential) {
                    // Store the credential in local storage
                    localStorage.setItem("google_credential", credential);
                    // Redirect to the callback page
                    window.location.href = "/auth/google/callback";
                  }
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </GoogleOAuthProvider>
          </div>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default Login;
