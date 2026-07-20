import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Alert, Box } from "@mui/material";
import { useAuth } from "../../context/auth-context.jsx";

export default function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSuccess(credentialResponse) {
    setError("");
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box display="flex" justifyContent="center" ml="2px" mr="2px" mb="2px">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Google sign-in failed. Please try again.")}
        />
      </Box>
    </Box>
  );
}
