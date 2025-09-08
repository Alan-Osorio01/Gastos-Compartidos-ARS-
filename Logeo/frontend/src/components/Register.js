import React, { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(data.message || data.msg || "Usuario registrado con éxito ✅");
      } else {
        alert(data.message || data.msg || "Error al registrar ❌");
      }
    } catch (err) {
      alert("Error del servidor");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-600 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Crear Cuenta
        </h2>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-gray-700">Nombre completo</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Correo electrónico</label>
            <input
              type="email"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Registrarse
          </button>
        </form>
        <p className="text-sm text-gray-600 text-center mt-4">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-indigo-600 font-semibold">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
