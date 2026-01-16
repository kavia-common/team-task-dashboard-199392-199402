import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
export function DashboardHomePage() {
  /** Default authenticated landing page; redirects to Boards. */
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/boards", { replace: true });
  }, [navigate]);

  return null;
}
