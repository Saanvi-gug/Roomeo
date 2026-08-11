import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo/roomeo-logo.png";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/landing", { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="animate-pulse">
        <img
          src={logo}
          alt="Roomeo"
          className="w-52 h-auto object-contain"
        />
      </div>
    </div>
  );
}