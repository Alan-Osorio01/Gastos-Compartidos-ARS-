// frontend/src/components/LandingPage/Footer.js
import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const team = [
    { name: "Jefferson Gutiérrez", img: "/jef.jpg" },
    { name: "Ana Maria Amador Leon", img: "/Ana.jpg" },
    { name: "Alan Steven Osorio Zuluaga", img: "/Alan.jpg" },
    { name: "Daniela López Rincón", img: "/dani.jpg" }, // le cambié a dev4 para diferenciarla
  ];

  return (
    <footer id="contact" className="bg-indigo-700 text-white py-16">
      <div className="container mx-auto text-center px-6">
        <h2 className="text-3xl font-bold mb-10">Conoce a nuestro equipo</h2>
        
        {/* CONTENEDOR DEL EQUIPO */}
        <div className="flex justify-center gap-16 flex-nowrap overflow-x-auto pb-4">
          {team.map((m, i) => (
            <div key={i} className="flex flex-col items-center min-w-[150px]">
              <img
                src={m.img}
                alt={m.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-white shadow-lg"
              />
              <p className="font-semibold">{m.name}</p>
            </div>
          ))}
        </div>

        {/* CONTACTO */}
        <div className="mt-10">
          <p className="mb-2">📩 contacto@midominio.com</p>
          <div className="flex justify-center space-x-6 text-2xl">
            <a href="#"><FaGithub /></a>
            <a href="#"><FaLinkedin /></a>
            <a href="mailto:contacto@midominio.com"><FaEnvelope /></a>
          </div>
        </div>

        <p className="text-sm mt-6">© 2025 Compartix. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
