import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  FileText,
  Download,
  User as UserIcon,
  BookOpen,
  Library
} from "lucide-react";
import { motion } from "framer-motion";

export default function Resources() {
  const { user, logout, authHeader } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    semester: "",
    subject_code: "",
    professor_name: ""
  });

  const fetchResources = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resources?${query}`, {
      headers: authHeader()
    });
    const data = await res.json();
    setResources(data);
  };

  useEffect(() => {
    fetchResources();
  }, [filters]);

  return (
    <div className="dash-layout">
      <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="dash-main">
        <Topbar title="Smart Repository" onLogout={logout} />

        <div className="content">
          <div className="pg-in">
            <div className="pbar">
              <span style={{ fontSize: ".75rem", color: "var(--textM)", padding: "0 10px" }}>Accessing verified materials</span>
            </div>

            {/* FILTER BAR */}
            <div className="glass" style={{ padding: "24px", marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div className="fl-wrap">
                <BookOpen size={16} className="fl-ico" />
                <select
                  className="fl-inp hasval"
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  style={{ appearance: 'none' }}
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}th Semester</option>)}
                </select>
                <label className="fl-lbl">Semester</label>
              </div>

              <div className="fl-wrap">
                <Search size={16} className="fl-ico" />
                <input
                  className={`fl-inp ${filters.subject_code ? 'hasval' : ''}`}
                  placeholder=" "
                  onChange={(e) => setFilters({ ...filters, subject_code: e.target.value })}
                />
                <label className="fl-lbl">Subject Code</label>
              </div>

              <div className="fl-wrap">
                <UserIcon size={16} className="fl-ico" />
                <input
                  className={`fl-inp ${filters.professor_name ? 'hasval' : ''}`}
                  placeholder=" "
                  onChange={(e) => setFilters({ ...filters, professor_name: e.target.value })}
                />
                <label className="fl-lbl">Professor Name</label>
              </div>
            </div>

            {/* RESOURCES GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {resources.map((res, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.1 }}
                  key={res.id}
                  className="sc"
                  style={{
                    padding: "24px",
                    background: 'var(--s2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    height: '100%'
                  }}
                >
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div className="sc-ico" style={{ margin: 0, background: 'rgba(0, 229, 255, 0.1)', color: 'var(--ap)' }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: ".95rem", fontWeight: "700", marginBottom: "4px", color: 'var(--text)' }}>{res.title}</h3>
                      <div style={{ fontSize: "0.72rem", color: "var(--textM)", fontWeight: '600', textTransform: 'uppercase' }}>
                        {res.file_type} • Unit {res.unit}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--textM)' }}>
                      <BookOpen size={13} /> <span>{res.subject_code} · {res.semester}th Sem</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--textM)' }}>
                      <UserIcon size={13} /> <span>Prof. {res.professor_name || res.uploader_name}</span>
                    </div>
                  </div>

                  <a
                    href={`${process.env.REACT_APP_API_URL}/${res.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="sub-btn"
                    style={{ width: "100%", textDecoration: "none", marginTop: 'auto', padding: '12px', fontSize: '.85rem' }}
                  >
                    <Download size={15} /> <span>Download Now</span>
                  </a>
                </motion.div>
              ))}

              {resources.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--textM)' }}>
                  <Library size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p style={{ fontSize: '.9rem' }}>No materials found for this criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
