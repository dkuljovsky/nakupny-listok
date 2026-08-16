import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export default function GuestRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  if (user) return <Navigate to="/" replace />;

  return children;
}