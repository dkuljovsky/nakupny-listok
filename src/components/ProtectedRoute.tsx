import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  return user ? children : <Navigate to="/" replace />;
}
