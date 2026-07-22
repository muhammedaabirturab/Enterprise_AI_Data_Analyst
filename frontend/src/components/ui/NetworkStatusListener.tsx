import { useEffect } from "react";

import { useToast } from "../../context/ToastContext";
import { NETWORK_ERROR_EVENT } from "../../services/api";

/**
 * Mounted once at the app root. Shows one toast whenever a request fails
 * because the backend is unreachable, instead of leaving the user staring at
 * raw browser console errors with no idea what happened.
 */
export default function NetworkStatusListener() {
  const { showToast } = useToast();

  useEffect(() => {
    const handler = () => {
      showToast("Can't reach the Veridian server. Make sure the backend is running, then try again.", "error");
    };
    window.addEventListener(NETWORK_ERROR_EVENT, handler);
    return () => window.removeEventListener(NETWORK_ERROR_EVENT, handler);
  }, [showToast]);

  return null;
}
