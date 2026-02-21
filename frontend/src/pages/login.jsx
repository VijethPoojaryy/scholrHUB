import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogIn,
  User,
  Lock,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Library,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutGrid
} from "lucide-react";
import BackgroundCanvas from "../components/BackgroundCanvas";
import CursorGlow from "../components/CursorGlow";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('Admin');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ usn: email, password: pw });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'Admin', icon: <ShieldCheck size={20} />, title: 'Administrator', desc: 'Full control · Analytics · Approvals', cls: 'ad' },
    { id: 'Faculty', icon: <GraduationCap size={20} />, title: 'Professor', desc: 'Upload · Post notices · Analytics', cls: 'pf' },
    { id: 'Student', icon: <Library size={20} />, title: 'Student', desc: 'Browse resources · Submit · Progress', cls: 'st' },
  ];

  const fillDemo = (roleId) => {
    if (roleId === 'Admin') { setEmail('admin'); setPw('admin123'); }
    else if (roleId === 'Faculty') { setEmail('102'); setPw('123456'); }
    else { setEmail('101'); setPw('123456'); }
  };

  return (
    <div className="login-wrap pg-in">
      <BackgroundCanvas />
      <CursorGlow />
      <div className="grain" />

      <div className="login-shell">
        {/* LEFT PANEL */}
        <div className="lp">
          <div className="lp-glow" />
          <div className="lp-glow2" />

          <div className="brand">
            <div className="logo-sq">
              <LayoutGrid size={22} color="white" weight="bold" />
            </div>
            <div className="brandname">Scholr<em>Hub</em></div>
          </div>

          <div className="eyebrow">Select your workspace</div>

          <div className="role-list">
            {roles.map(rc => (
              <div
                key={rc.id}
                className={`rc ${rc.cls} ${activeRole === rc.id ? 'active' : ''}`}
                onClick={() => setActiveRole(rc.id)}
              >
                <div className="rc-shine" />
                <div className="rc-ico">{rc.icon}</div>
                <div className="rc-info">
                  <div className="rc-t">{rc.title}</div>
                  <div className="rc-d">{rc.desc}</div>
                </div>
                <div className="rc-radio">
                  {activeRole === rc.id && <div className="pill-dot" style={{ width: 10, height: 10, background: 'white' }} />}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="rp">
          <div className="rp-mesh" />

          <div className="role-pill">
            <div className="pill-dot" />
            <div className="pill-txt">Signing in as</div>
            <div className="pill-role">{activeRole === 'Admin' ? 'Administrator' : activeRole === 'Faculty' ? 'Professor' : 'Student'}</div>
          </div>

          <div className="form-head">
            <div className="form-h1">Sign in to<br /><span className="grad">{activeRole === 'Admin' ? 'Admin' : activeRole === 'Faculty' ? 'Professor' : 'Student'} Portal</span></div>
            <div className="form-sub">Enter your credentials to access your workspace</div>
          </div>

          {error && (
            <div className="err-box" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="form-body">
            <div className="fl-wrap">
              <User size={18} className="fl-ico" />
              <input
                className={`fl-inp ${email ? 'hasval' : ''}`}
                type="text"
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label className="fl-lbl">Email address</label>
            </div>

            <div className="fl-wrap">
              <Lock size={18} className="fl-ico" />
              <input
                className={`fl-inp ${pw ? 'hasval' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder=" "
                value={pw}
                onChange={e => setPw(e.target.value)}
                required
              />
              <label className="fl-lbl">Password</label>
              <button
                className="fl-eye"
                type="button"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              className="sub-btn"
              disabled={loading}
            >
              <span>{loading ? "Verifying..." : "Sign In to ScholrHub"}</span>
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="form-foot">
            <div style={{ opacity: 0.5, marginBottom: '8px', fontSize: '0.7rem' }}>🔒 End-to-end encrypted · ScholrHub v3.0</div>
            Don't have an account? <Link to="/signup" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "700" }}>Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
