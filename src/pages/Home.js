function Home() {
  return (
    <div>
      <section className="hero">
        <img src="/images/hospital.jpg" alt="Hospital" className="hero-img" />
        <div className="hero-overlay">
          <h1>Advanced Healthcare for a Better Tomorrow</h1>
          <p>Trusted Doctors • 24/7 Emergency • Modern Technology</p>
          <button className="btn-primary">Book Appointment</button>
        </div>
      </section>

      <section className="features">
        <h2>Our Specialities</h2>
        <div className="card-container">
          <div className="card">Cardiology</div>
          <div className="card">Neurology</div>
          <div className="card">Orthopedics</div>
          <div className="card">Pediatrics</div>
        </div>
      </section>
    </div>
  );
}

export default Home;
