import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  Calendar,
  User,
  Plus,
  Trash2,
  MessageSquare,
  Clock,
  Send
} from "lucide-react";
import { motion } from "framer-motion";

export default function Notices() {
  const { user, authHeader } = useAuth();
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notices`, { headers: authHeader() });
    const data = await res.json();
    setNotices(data);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notices`, {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setFormData({ title: "", content: "" });
      fetchNotices();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notices/${id}`, {
      method: "DELETE",
      headers: authHeader()
    });
    if (res.ok) fetchNotices();
  };

  const isStaff = user?.role === "Admin" || user?.role === "Faculty";

  return (
    <Layout>
      <div className="tb" style={{ borderRadius: '16px', marginBottom: '24px', background: 'var(--s2)' }}>
        <div style={{ paddingLeft: '8px' }}>
          <div className="tb-ttl">Notice Board</div>
          <div className="tb-sub">Stay updated with the latest departmental announcements</div>
        </div>
        <div className="tb-right">
          <div className="ib"><Bell size={18} /></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isStaff ? "400px 1fr" : "1fr", gap: "24px" }}>
        {isStaff && (
          <div className="panel" style={{ height: 'fit-content' }}>
            <div className="ph" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="ph-title">Create Official Notice</span>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="fl-field">
                <Bell size={18} className="fl-icon" />
                <input
                  className={`fl-input ${formData.title ? 'has-value' : ''}`}
                  placeholder=" "
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <label className="fl-label">Headline / Title</label>
              </div>
              <div className="fl-field">
                <textarea
                  className="fl-input has-value"
                  placeholder="Official announcement content..."
                  style={{ minHeight: '120px', padding: '16px', paddingTop: '16px' }}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? "Posting..." : "Broadcast Notice"}
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        <div className="panel">
          <div className="ph">
            <span className="ph-title">Department Timeline</span>
            <span className="ni-badge" style={{ background: 'var(--apGrad)' }}>{notices.length} Updates</span>
          </div>
          <div className="nl" style={{ padding: '12px' }}>
            {notices.map((notice, i) => {
              const isNew = (new Date() - new Date(notice.created_at)) < 24 * 60 * 60 * 1000;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={notice.id}
                  className="nli"
                  style={{
                    padding: '20px',
                    marginBottom: '10px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`nli-dot ${isNew ? 'new' : 'old'}`}></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--textD)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Broadcasted on {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {isStaff && (
                      <button onClick={() => handleDelete(notice.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>
                    {notice.title}
                    {isNew && <span className="new-badge">NEW</span>}
                  </h3>
                  <p style={{ color: 'var(--textM)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '18px' }}>{notice.content}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--textD)', fontWeight: '600' }}>
                    <div className="uc-av" style={{ width: 20, height: 20, fontSize: 10 }}>{notice.author_name.charAt(0)}</div>
                    {notice.author_name} · Faculty Authority
                  </div>
                </motion.div>
              );
            })}
            {notices.length === 0 && (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--textM)' }}>
                <Bell size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p>No announcements yet. Check back later!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}