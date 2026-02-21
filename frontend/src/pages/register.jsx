import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus,
  User,
  Lock,
  BookOpen,
  AlertCircle,
  Briefcase,
  Library
} from "lucide-react";
import BackgroundCanvas from "../components/BackgroundCanvas";
import CursorGlow from "../components/CursorGlow";

export default function Signup() {
  const [formData, setFormData] = useState({
    usn: "",
    name: "",
    semester: "",
    password: "",
    role: "Student"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap pg-in">
      <BackgroundCanvas />
      <CursorGlow />
      <div className="grain" />

      <div className="login-shell" style={{ gridTemplateColumns: 'min(480px, 100%)', justifyContent: 'center', width: 'auto' }}>
        <div className="rp">
          <div className="rp-mesh" />

          <div className="brand" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <div className="logo-wrap">
              <div className="logo-inner">
                <Library size={22} color="white" />
              </div>
              <div className="logo-shine" />
            </div>
            <div className="brandname">Scholar<em>Hub</em></div>
          </div>

          <div className="form-head" style={{ textAlign: 'center' }}>
            <div className="form-h1">Create Account <span style={{ fontSize: '10px', opacity: 0.5 }}>v3.0</span></div>
            <div className="form-sub">Join the departmental knowledge network</div>
          </div>

          {error && (
            <div className="err-box" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="fl-wrap">
                <User size={18} className="fl-ico" />
                <input name="usn" value={formData.usn} className={`fl-inp ${formData.usn ? 'hasval' : ''}`} placeholder=" " onChange={handleChange} required />
                <label className="fl-lbl">USN</label>
              </div>
              <div className="fl-wrap">
                <User size={18} className="fl-ico" />
                <input name="name" value={formData.name} className={`fl-inp ${formData.name ? 'hasval' : ''}`} placeholder=" " onChange={handleChange} required />
                <label className="fl-lbl">Full Name</label>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="fl-wrap">
                <Briefcase size={18} className="fl-ico" />
                <select name="role" value={formData.role} className="fl-inp hasval" onChange={handleChange} style={{ appearance: 'none' }}>
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                </select>
                <label className="fl-lbl">Role</label>
              </div>
              <div className="fl-wrap">
                <BookOpen size={18} className="fl-ico" />
                <input name="semester" value={formData.semester} type="number" className={`fl-inp ${formData.semester ? 'hasval' : ''}`} placeholder=" " onChange={handleChange} />
                <label className="fl-lbl">Semester</label>
              </div>
            </div>

            <div className="fl-wrap">
              <Lock size={18} className="fl-ico" />
              <input name="password" value={formData.password} type="password" className={`fl-inp ${formData.password ? 'hasval' : ''}`} placeholder=" " onChange={handleChange} required />
              <label className="fl-lbl">Password</label>
            </div>

            <button
              type="submit"
              className="sub-btn"
              disabled={loading}
              style={{ background: 'var(--stuGrad)' }}
            >
              {loading ? <div className="ring" /> : <UserPlus size={18} />}
              <span>{loading ? "Registering..." : "Create Scholar Account"}</span>
            </button>
          </form>

          <div className="form-foot">
            Already have an account? <Link to="/" style={{ color: "var(--ap)", textDecoration: "none", fontWeight: "600" }}>Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
