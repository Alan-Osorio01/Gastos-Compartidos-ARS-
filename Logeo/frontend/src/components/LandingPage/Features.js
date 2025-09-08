// frontend/src/components/LandingPage/Features.js
import React from "react";
import { FaUserFriends, FaBell, FaUsers, FaChartPie, FaLock, FaMobileAlt } from "react-icons/fa";

export default function Features() {
  const features = [
    { icon: <FaUserFriends />, title: "Registro y control de gastos", desc: "Lleva un historial detallado de cada gasto compartido." },
    { icon: <FaBell />, title: "Recordatorios automáticos", desc: "Recibe notificaciones de pagos pendientes." },
    { icon: <FaUsers />, title: "Grupos flexibles", desc: "Agrega o elimina miembros temporales fácilmente." },
    { icon: <FaChartPie />, title: "Reportes visuales", desc: "Consulta gráficos claros de tus deudas y pagos." },
    { icon: <FaLock />, title: "Seguridad de datos", desc: "Protección avanzada para tu información financiera." },
    { icon: <FaMobileAlt />, title: "Acceso multiplataforma", desc: "Disponible desde móvil, tablet o computadora." },
  ];

  return (
    <section id="features" className="py-16 bg-gray-100">
      <div className="container mx-auto text-center px-6">
        <h2 className="text-3xl font-bold mb-10">Características principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
              <div className="text-4xl text-indigo-600 mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
