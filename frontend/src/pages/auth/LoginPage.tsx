import { useState } from "react";
import AuthCard from "../../components/AuthCard";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { loginUser } from "../../services/authService";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const data = await loginUser({
        username,
        password,
      });

      localStorage.setItem(
        "accessToken",
        data.access
      );

      localStorage.setItem(
        "refreshToken",
        data.refresh
      );

      alert("Login successful!");

      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <AuthCard>
        <h1 className="text-3xl font-bold text-white text-center">
          DevFlow
        </h1>

        <p className="text-slate-400 text-center mt-2">
          Sign in to continue
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit">
            Sign In
          </Button>

          <p className="text-center text-slate-400 mt-4">
            Don't have an account?
            <a
              href="/register"
              className="text-blue-500 ml-1"
            >
              Register
            </a>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}

export default LoginPage;