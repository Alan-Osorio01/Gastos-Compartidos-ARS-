import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Inicio de sesión exitoso ✅");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);    
        localStorage.setItem("userEmail", data.user.email); 
        localStorage.setItem("userName", data.user.name);  
        navigate("/client-dashboard");
        }
         else {
        alert(data.message || data.msg || "Credenciales inválidas ❌");
      }
    } catch (err) {
      alert("Error del servidor");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Iniciar Sesión
        </h2>

        {/* Formulario */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Correo */}
          <div>
            <label className="block text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "🙉" : "🙈"}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Link a registro */}
        <p className="text-center text-gray-600 mt-4">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
