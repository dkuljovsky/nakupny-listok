import { useEffect, useState } from "react";

export default function OfflineOverlay() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-overlay" role="status" aria-live="polite">
      <div className="offline-card">
        <h1>Ste offline</h1>
        <p>Znovu sa pripojte k internetu.</p>
      </div>
    </div>
  );
}
