import React, { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  Upload as UploadIcon,
  File,
  CheckCircle,
  AlertCircle,
  BookOpen,
  User as UserIcon,
  Library,
  ChevronRight,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";

export default function Upload() {
  const { user, authHeader } = useAuth();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    semester: "",
    subject_code: "",
    unit: "",
    professor_name: ""
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a file first");

    setLoading(true);
    setMsg("");

    const data = new FormData();
    data.append("file", file);
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resources/upload`, {
        method: "POST",
        headers: { ...authHeader() },
        body: data
      });

      const result = await res.json();
      if (res.ok) {
        setMsg(user.role === 'Student' ? "Uploaded! Pending approval from faculty." : "Uploaded successfully!");
        setFile(null);
        setFormData({ title: "", semester: "", subject_code: "", unit: "", professor_name: "" });
      } else {
        setMsg(result.message || "Upload failed");
      }
    } catch (err) {
      setMsg("Server error during upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="tb" style={{ borderRadius: '16px', marginBottom: '24px', background: 'var(--s2)' }}>
        <div style={{ paddingLeft: '8px' }}>
          <div className="tb-ttl">Upload Resource</div>
          <div className="tb-sub">Share notes, textbooks, or handwritten snapshots</div>
        </div>
        <div className="tb-right">
          <div className="ib"><Bell size={18} /></div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} className="panel" style={{ overflow: 'hidden' }}>
          <div className="ph" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="ph-title">Resource Details</span>
          </div>

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {msg && (
              <div className="err-box" style={{
                background: msg.includes('Uploaded') ? 'rgba(0, 214, 143, 0.08)' : 'rgba(255, 61, 90, 0.08)',
                borderColor: msg.includes('Uploaded') ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 61, 90, 0.2)',
                color: msg.includes('Uploaded') ? 'var(--success)' : 'var(--danger)',
                marginBottom: '10px'
              }}>
                {msg.includes('Uploaded') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{msg}</span>
              </div>
            )}

            <div className="fl-field">
              <Library size={18} className="fl-icon" />
              <input
                className={`fl-input ${formData.title ? 'has-value' : ''}`}
                placeholder=" "
                value={formData.title}
                required
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <label className="fl-label">Resource Title (e.g. Unit 1 DBMS Notes)</label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="fl-field">
                <BookOpen size={18} className="fl-icon" />
                <select
                  className={`fl-input ${formData.semester ? 'has-value' : ''}`}
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  style={{ appearance: 'none' }}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}th Semester</option>)}
                </select>
                <label className="fl-label">Semester</label>
              </div>
              <div className="fl-field">
                <Library size={18} className="fl-icon" />
                <input
                  className={`fl-input ${formData.subject_code ? 'has-value' : ''}`}
                  placeholder=" "
                  value={formData.subject_code}
                  required
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                />
                <label className="fl-label">Subject Code</label>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="fl-field">
                <File size={18} className="fl-icon" />
                <input
                  type="number"
                  className={`fl-input ${formData.unit ? 'has-value' : ''}`}
                  placeholder=" "
                  value={formData.unit}
                  required
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
                <label className="fl-label">Unit (1-5)</label>
              </div>
              <div className="fl-field">
                <UserIcon size={18} className="fl-icon" />
                <input
                  className={`fl-input ${formData.professor_name ? 'has-value' : ''}`}
                  placeholder=" "
                  value={formData.professor_name}
                  onChange={(e) => setFormData({ ...formData, professor_name: e.target.value })}
                />
                <label className="fl-label">Professor Name (Optional)</label>
              </div>
            </div>

            <div className="field-group">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--textD)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Document File
              </label>
              <div
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "16px",
                  padding: "40px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.015)",
                  cursor: "pointer",
                  transition: "all 0.3s var(--ease)",
                  position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                onClick={() => document.getElementById('file-input').click()}
              >
                <UploadIcon size={32} style={{ color: "var(--primary)", marginBottom: "12px", opacity: 0.8 }} />
                <p style={{ fontSize: "0.9rem", color: "var(--textM)", fontWeight: '500' }}>
                  {file ? <strong style={{ color: 'var(--text)' }}>{file.name}</strong> : "Click to select or drag & drop"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--textD)", marginTop: '4px' }}>
                  PDF, PPT, DOC, or Images supported
                </p>
                <input
                  id="file-input"
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
              style={{ marginTop: '10px', height: '56px', background: 'var(--apGrad)' }}
            >
              {loading ? "Processing..." : "Submit for Verification"}
              {!loading && <ChevronRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}