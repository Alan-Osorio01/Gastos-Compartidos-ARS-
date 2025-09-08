import React, { useState, useEffect } from "react";
import ClientSummary from "./ClientSummary";
import GroupsManager from "./GroupsManager";
import ExpenseForm from "./ExpenseForm";
import {
  FaUsers,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaCreditCard,
  FaChartPie,
  FaCog,
  FaTachometerAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const ClientDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [activeModule, setActiveModule] = useState("welcome");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const token = localStorage.getItem("token");

    if (token) {
      setUserEmail(localStorage.getItem("userEmail") || "cliente@ejemplo.com");
      setUserName(localStorage.getItem("userName") || "Cliente");
      setUserId(localStorage.getItem("userId") || "");
    }
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm("¿Seguro que quieres cerrar sesión?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "¡Buenos días!";
    if (hour < 18) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) =>
    date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const renderContent = () => {
    switch (activeModule) {
      case "welcome":
        return (
          <div className="bg-white shadow-md rounded-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-indigo-700 mb-3">
              {getGreeting()}
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              ¡Bienvenido, {userName}!
            </p>
            <p className="text-gray-500">
              {formatDate(currentTime)} – {formatTime(currentTime)}
            </p>
          </div>
        );
      case "summary":
        return (
          <div className="bg-white shadow-md rounded-xl p-6">
            <ClientSummary
              userId={userId}
              token={localStorage.getItem("token")}
            />
          </div>
        );
      case "groups":
        return (
          <div className="bg-white shadow-md rounded-xl p-6">
            <GroupsManager
              userId={userId}
              token={localStorage.getItem("token")}
            />
          </div>
        );
      case "expenses":
        return (
          <div className="bg-white shadow-md rounded-xl p-6">
            <ExpenseForm
              userId={userId}
              token={localStorage.getItem("token")}
            />
          </div>
        );
      default:
        return (
          <div className="bg-white shadow-md rounded-xl p-6">
            <ClientSummary
              userId={userId}
              token={localStorage.getItem("token")}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Mi Panel</h2>
        <nav className="flex-1">
          <ul className="space-y-3">
            {[
              { key: "summary", icon: <FaTachometerAlt />, label: "Inicio" },
              { key: "groups", icon: <FaUsers />, label: "Grupos" },
              { key: "expenses", icon: <FaFileInvoiceDollar />, label: "Gastos" },
              { key: "invoices", icon: <FaFileAlt />, label: "Facturas" },
              { key: "payments", icon: <FaCreditCard />, label: "Pagos" },
              { key: "reports", icon: <FaChartPie />, label: "Reportes" },
              { key: "settings", icon: <FaCog />, label: "Configuración" },
            ].map((item) => (
              <li
                key={item.key}
                onClick={() => setActiveModule(item.key)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                  activeModule === item.key
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-500/80"
                }`}
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white mt-6"
        >
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-10 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default ClientDashboard;
