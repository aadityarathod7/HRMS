import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
import { useToast } from "@/hooks/use-toast";
// import { google } from "googleapis";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Retrieve the credential from local storage
        const credential = localStorage.getItem("google_credential");

        if (credential) {
          // Store the Google credential as the token
          localStorage.setItem("token", credential);
          localStorage.removeItem("google_credential");

          toast({
            title: "Google Sign-In successful!",
          });
          navigate("/home");
        } else {
          toast({
            title: "Google Sign-In failed. Please try again.",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Google Sign-In callback error:", error);
        toast({
          title: "Google Sign-In failed. Please try again.",
        });
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default GoogleCallback;
