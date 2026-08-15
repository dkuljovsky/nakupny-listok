import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prihlásenie zlyhalo.");
    }
  };

  return (
    <main className="login-wrapper">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Nákupný lístok</h1>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Heslo" required />
        <button type="submit" disabled={isLoading}>
          Prihlásiť sa
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
