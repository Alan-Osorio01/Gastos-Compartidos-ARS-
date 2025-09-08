import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      {/* NAVBAR */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center px-3 py-1">
          {/* Logo + Nombre */} 
          <div className="flex items-center space-x-2">
            {/* Imagen del logo */}
            <img
              src="/aa.png" // pon tu imagen en /public/logo.png
              alt="Logo"
              className="w-15 h-28"
            />
            <h1 className="text-3xl font-bold text-indigo-600">Compartix</h1>
          </div>

          {/* Links */}
          <ul className="flex space-x-6 text-gray-700 font-medium">
            <li><a href="#features" className="hover:text-indigo-600">Características</a></li>
            <li><a href="#how" className="hover:text-indigo-600">Cómo funciona</a></li>
            <li><a href="#testimonials" className="hover:text-indigo-600">Testimonios</a></li>
            <li><a href="#contact" className="hover:text-indigo-600">Contacto</a></li>
          </ul>

          {/* Botones */}
          <div className="space-x-3">
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Registrarse gratis
            </Link>
            <Link
              to="/login"
              className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-indigo-600 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center px-6 py-16">
          {/* Texto */}
          <div className="flex-1 text-center mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Gestiona tus gastos compartidos de forma fácil y justa
            </h2>
            <p className="text-lg md:text-xl">
                Haz que compartir cuentas sea simple, transparente y sin discusiones.
            </p>
            </div>


          {/* Imagen */}
          <div className="flex-1 flex justify-center">
            <img
              src="/6617.jpg" // tu ilustración
              alt="App ilustración"
              className="max-w-xl w-full rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
