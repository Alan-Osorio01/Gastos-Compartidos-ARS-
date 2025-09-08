import React from "react";
import Header from "./Header";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-800">
      <Header />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
}
