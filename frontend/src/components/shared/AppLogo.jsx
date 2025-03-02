import React from "react";
import { useNavigate } from "react-router-dom";

function AppLogo() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Logo */}
      <div
        className="flex cursor-pointer hover:scale-110 transition-transform duration-300"
        onClick={() => navigate("/")}
      >
        <img src="/src/assets/logo/logo.svg" alt="Logo" className="h-12 w-12" />
      </div>
    </div>
  );
}

export default AppLogo;
