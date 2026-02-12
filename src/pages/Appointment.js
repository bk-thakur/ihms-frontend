import React, { useState } from "react";

export default function Appointment() {
  const [form, setForm] = useState({ name: "", date: "" });

  return (
    <div className="container">
      <h1>Book Appointment</h1>
      <input
        placeholder="Patient Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="date"
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
      <button className="btn">Submit</button>
    </div>
  );
}
