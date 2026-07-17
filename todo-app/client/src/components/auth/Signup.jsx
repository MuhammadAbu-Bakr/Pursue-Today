import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Alert, Paper, Link } from "@mui/material";
import { useAuth } from "../../context/auth-context.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const data = await signup(name, email, password);
      setMessage(data.message);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box 
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        background: 'linear-gradient(135deg, #ece9e6 0%, #ffffff 100%)',
        p: 2
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 4, md: 5 }, 
          width: '100%', 
          maxWidth: 420, 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="700" textAlign="center" color="primary.main" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={4}>
          Join us and start pursuing today
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column">
          <TextField
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 8 characters"
            required
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={submitting}
            sx={{ 
              mt: 2, 
              mb: 1,
              py: 1.5, 
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.05rem'
            }}
          >
            {submitting ? "Creating account..." : "Sign Up"}
          </Button>
        </Box>
        
        <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight="600" color="primary.main" underline="hover">
            Log in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
