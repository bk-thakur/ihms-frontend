import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>IHMS Hospital</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/doctors">Doctors</Link>
        <Link to="/appointment">Appointment</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
}
