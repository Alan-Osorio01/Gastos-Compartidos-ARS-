// frontend/src/components/LandingPage/Testimonials.js
import React from "react";

export default function Testimonials() {
  const testimonials = [
    { name: "Laura Gómez", role: "Estudiante", text: "Dividir gastos con mis roomies ahora es facilísimo.", img: "/lo.jpg", stars: 5 },
    { name: "Carlos Pérez", role: "Freelancer", text: "Perfecto para organizar cuentas en viajes con amigos.", img: "/ami.jpg", stars: 4 },
    { name: "Ana Martínez", role: "Ingeniera", text: "Me evita discusiones sobre quién pagó qué. Excelente.", img: "/ella.avif", stars: 5 },
    { name: "José Ramírez", role: "Empleado", text: "Muy intuitivo y práctico para el día a día.", img: "/sol.jpg", stars: 4 },
  ];

  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="container mx-auto text-center px-6">
        <h2 className="text-3xl font-bold mb-10">Testimonios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white shadow-md rounded-xl p-6">
              <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
              <h3 className="font-semibold">{t.name}</h3>
              <span className="text-sm text-gray-500">{t.role}</span>
              <p className="mt-2 text-gray-600">"{t.text}"</p>
              <div className="mt-3 text-yellow-400">
                {"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
