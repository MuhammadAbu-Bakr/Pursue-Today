import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton() {
  const handleSuccess = async (credentialResponse) => {
    const response = await fetch(
      "https://pursue-today.onrender.com/api/auth/google",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      }
    );

    const data = await response.json();

    console.log(data);
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
    />
  );
}