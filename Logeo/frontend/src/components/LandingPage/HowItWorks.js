// frontend/src/components/LandingPage/HowItWorks.js
import React from "react";
import { FaUserPlus, FaFileInvoiceDollar, FaBalanceScale, FaCheckCircle } from "react-icons/fa";

export default function HowItWorks() {
  const steps = [
    { icon: <FaUserPlus />, title: "Regístrate", desc: "Crea tu cuenta en segundos y comienza a organizar tus gastos." },
    { icon: <FaFileInvoiceDollar />, title: "Crea un grupo", desc: "Invita a tus amigos o compañeros para gestionar juntos." },
    { icon: <FaBalanceScale />, title: "Agrega gastos", desc: "Registra consumos compartidos con pocos clics." },
    { icon: <FaCheckCircle />, title: "Divide fácilmente", desc: "La app calcula cuánto debe pagar cada miembro." },
  ];

  return (
    <section id="how" className="py-16 bg-white">
      <div className="container mx-auto text-center px-6">
        <h2 className="text-3xl font-bold mb-10">Cómo funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-6 shadow hover:shadow-md transition">
              <div className="text-4xl text-indigo-600 mb-4">{s.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
