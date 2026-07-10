import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Box, Typography, Alert, Paper, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/auth-context.jsx";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "verifying" : "error"); // verifying | success | error
  const [message, setMessage] = useState(token ? "" : "Missing verification token.");

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
    
  }, [token, verifyEmail]);

  return (
    <Box display="flex" justifyContent="center" mt={8}>
      <Paper sx={{ p: 4, width: 360, textAlign: "center" }} elevation={3}>
        {status === "verifying" && (
          <>
            <CircularProgress size={28} sx={{ mb: 2 }} />
            <Typography>Verifying your email...</Typography>
          </>
        )}
        {status === "success" && (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>
            <Link to="/login">Go to login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
            <Link to="/signup">Back to sign up</Link>
          </>
        )}
      </Paper>
    </Box>
  );
}
