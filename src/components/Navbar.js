import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <h2 className="logo">IHMS</h2>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/doctors">Doctors</Link>
        <Link to="/appointment">Appointment</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </header>
  );
}

export default Navbar;
