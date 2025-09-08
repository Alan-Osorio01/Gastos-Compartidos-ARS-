import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/LandingPage/Header";
import Footer from "./components/LandingPage/Footer";
import Features from "./components/LandingPage/Features";
import Testimonials from "./components/LandingPage/Testimonials";
import Login from "./components/Login";
import Register from "./components/Register";
import HowItWorks from "./components/LandingPage/HowItWorks";
import ClientDashboard from "./components/ClientDashboard";
import GroupDetail from "./components/GroupDetail";
import GroupsManager from "./components/GroupsManager";

function Landing() {
  return (
    <>
      <Header />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </>
  );
}

export default function App() {
  // Obtén el token/usuario de donde corresponda (localStorage, contexto, etc.)
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  return (
    <Router>
      <Routes>
        {/* Página principal (landing) */}
        <Route path="/" element={<Landing />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Otros */}
        <Route path="/client-dashboard" element={<ClientDashboard />} />

        {/* App protegida */}
        <Route
          path="/groups"
          element={
            token ? (
              <GroupsManager token={token} userId={userId} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            token ? (
              <GroupDetail token={token} userId={userId} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 -> a inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
